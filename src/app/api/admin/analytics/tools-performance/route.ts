import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/mongodb';

async function isAdmin() {
  const store = await cookies();
  return store.get('admin_token')?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const days = parseInt(req.nextUrl.searchParams.get('days') || '30');
    const since     = new Date(Date.now() - days       * 24 * 60 * 60 * 1000);
    const prevSince = new Date(Date.now() - days * 2   * 24 * 60 * 60 * 1000);
    const db = await getDb();

    const [ratings, favorites, thisPeriod, prevPeriod] = await Promise.all([
      // Average rating per tool
      db.collection('ratings').aggregate([
        { $group: {
          _id: '$toolPath',
          avg: { $avg: '$rating' },
          count: { $sum: 1 },
        }},
        { $sort: { avg: -1 } },
        { $limit: 20 }
      ]).toArray(),

      // Most favorited tools (count how many users favorited each path)
      db.collection('users').aggregate([
        { $match: { favorites: { $exists: true, $ne: [] } } },
        { $unwind: '$favorites' },
        { $group: { _id: '$favorites', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray(),

      // This period: views per tool
      db.collection('events').aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: { _id: '$path', toolName: { $first: '$toolName' }, count: { $sum: 1 } } }
      ]).toArray(),

      // Previous period: views per tool (for trend)
      db.collection('events').aggregate([
        { $match: { timestamp: { $gte: prevSince, $lt: since } } },
        { $group: { _id: '$path', count: { $sum: 1 } } }
      ]).toArray(),
    ]);

    // Build trend data
    const prevMap: Record<string, number> = {};
    prevPeriod.forEach((t: any) => { prevMap[t._id] = t.count; });

    const trendData = thisPeriod
      .map((t: any) => {
        const prev = prevMap[t._id] || 0;
        const change = prev > 0 ? Math.round(((t.count - prev) / prev) * 100) : 100;
        return { path: t._id, toolName: t.toolName, current: t.count, previous: prev, change };
      })
      .sort((a: any, b: any) => b.change - a.change)
      .slice(0, 10);

    return NextResponse.json({
      ratings: ratings.map((r: any) => ({
        toolPath: r._id,
        avg: Math.round(r.avg * 10) / 10,
        count: r.count,
      })),
      favorites: favorites.map((f: any) => ({ toolPath: f._id, count: f.count })),
      trendData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
