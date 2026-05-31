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
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const db = await getDb();

    const [dailySignups, totalUsers, guestSessions, topUsers, retentionData] = await Promise.all([
      // Daily new registrations
      db.collection('users').aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ]).toArray(),

      // Total registered users
      db.collection('users').countDocuments({}),

      // Total unique guest sessions (from events, not in users)
      db.collection('events').distinct('sessionId', { timestamp: { $gte: since } }),

      // Top 10 most active registered users
      db.collection('user_tool_usage').aggregate([
        { $group: { _id: '$email', name: { $first: '$name' }, count: { $sum: 1 }, tools: { $addToSet: '$toolName' } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray(),

      // Retention: users who used tools on multiple days
      db.collection('user_tool_usage').aggregate([
        { $group: {
          _id: { user: '$userId', day: { $dateToString: { format: '%Y-%m-%d', date: '$usedAt' } } }
        }},
        { $group: { _id: '$_id.user', activeDays: { $sum: 1 } } },
        { $group: {
          _id: null,
          oneDay:    { $sum: { $cond: [{ $eq: ['$activeDays', 1] }, 1, 0] } },
          twoPlusDays: { $sum: { $cond: [{ $gte: ['$activeDays', 2] }, 1, 0] } },
        }}
      ]).toArray(),
    ]);

    // Build daily signups map (fill missing days with 0)
    const signupMap: Record<string, number> = {};
    dailySignups.forEach((d: any) => { signupMap[d._id] = d.count; });
    const dailyData = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dailyData.push({ date: key, signups: signupMap[key] || 0 });
    }

    const retention = retentionData[0] || { oneDay: 0, twoPlusDays: 0 };
    const totalRegistered = retention.oneDay + retention.twoPlusDays;
    const retentionRate = totalRegistered > 0 ? Math.round((retention.twoPlusDays / totalRegistered) * 100) : 0;

    return NextResponse.json({
      dailySignups: dailyData,
      totalUsers,
      guestSessions: guestSessions.length,
      conversionRate: guestSessions.length > 0
        ? Math.round((totalUsers / guestSessions.length) * 100)
        : 0,
      retentionRate,
      oneTimeUsers: retention.oneDay,
      returningUsers: retention.twoPlusDays,
      topUsers: topUsers.map((u: any) => ({
        email: u._id, name: u.name, count: u.count, uniqueTools: u.tools.length
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
