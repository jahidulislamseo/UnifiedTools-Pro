import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/mongodb';

async function isAdmin() {
  const store = await cookies();
  return store.get('admin_token')?.value === process.env.ADMIN_PASSWORD;
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = await getDb();
    const col = db.collection('events');
    const now = new Date();
    const last5m  = new Date(now.getTime() - 5  * 60 * 1000);
    const last1h  = new Date(now.getTime() - 60 * 60 * 1000);
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [activeSessions, last1hCount, last24hCount, liveFeed, hourlyTrend] = await Promise.all([
      // Unique sessions in last 5 minutes
      col.distinct('sessionId', { timestamp: { $gte: last5m } }),

      // Events in last 1 hour
      col.countDocuments({ timestamp: { $gte: last1h } }),

      // Events in last 24 hours
      col.countDocuments({ timestamp: { $gte: last24h } }),

      // Last 20 events for live feed
      col.find({ timestamp: { $gte: last1h } }, {
        sort: { timestamp: -1 }, limit: 20,
        projection: { _id: 0, toolName: 1, category: 1, country: 1, countryName: 1, city: 1, timestamp: 1 }
      }).toArray(),

      // Hourly event count for last 24h
      col.aggregate([
        { $match: { timestamp: { $gte: last24h } } },
        { $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ]).toArray(),
    ]);

    const hourMap: Record<number, number> = {};
    hourlyTrend.forEach((h: any) => { hourMap[h._id] = h.count; });
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2,'0')}:00`,
      count: hourMap[i] || 0,
    }));

    return NextResponse.json({
      activeNow: activeSessions.length,
      last1hCount,
      last24hCount,
      liveFeed: liveFeed.map((e: any) => ({ ...e, timestamp: e.timestamp?.toISOString?.() || '' })),
      hourlyData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
