import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/mongodb';
import DashboardClient from './DashboardClient';

async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const token = store.get('admin_token');
  return token?.value === process.env.ADMIN_PASSWORD;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  if (!(await isAdmin())) {
    redirect('/admin/login');
  }

  const params = await searchParams;
  const days = parseInt(params.days || '30');
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const db = await getDb();
    const col = db.collection('events');

    await col.createIndex({ timestamp: -1 }, { background: true }).catch(() => {});
    await col.createIndex({ sessionId: 1 }, { background: true }).catch(() => {});
    await col.createIndex({ country: 1 }, { background: true }).catch(() => {});

    const [totalEvents, allSessions, byTool, byCountry, dailyTrend, recentEvents] =
      await Promise.all([
        col.countDocuments({ timestamp: { $gte: since } }),

        col.distinct('sessionId', { timestamp: { $gte: since } }),

        col
          .aggregate([
            { $match: { timestamp: { $gte: since } } },
            {
              $group: {
                _id: '$path',
                toolName: { $first: '$toolName' },
                category: { $first: '$category' },
                count: { $sum: 1 },
                sessions: { $addToSet: '$sessionId' },
                lastUsed: { $max: '$timestamp' },
              },
            },
            {
              $project: {
                toolName: 1,
                category: 1,
                count: 1,
                uniqueUsers: { $size: '$sessions' },
                lastUsed: 1,
              },
            },
            { $sort: { count: -1 } },
            { $limit: 50 },
          ])
          .toArray(),

        col
          .aggregate([
            { $match: { timestamp: { $gte: since } } },
            {
              $group: {
                _id: '$country',
                countryName: { $first: '$countryName' },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 20 },
          ])
          .toArray(),

        col
          .aggregate([
            { $match: { timestamp: { $gte: since } } },
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
                },
                count: { $sum: 1 },
                sessions: { $addToSet: '$sessionId' },
              },
            },
            {
              $project: {
                date: '$_id',
                count: 1,
                uniqueUsers: { $size: '$sessions' },
              },
            },
            { $sort: { _id: 1 } },
          ])
          .toArray(),

        col
          .find(
            { timestamp: { $gte: since } },
            {
              sort: { timestamp: -1 },
              limit: 100,
              projection: {
                _id: 0,
                path: 1,
                toolName: 1,
                category: 1,
                country: 1,
                countryName: 1,
                city: 1,
                sessionId: 1,
                timestamp: 1,
              },
            }
          )
          .toArray(),
      ]);

    const [registeredUsers, activeSessions] = await Promise.all([
      db.collection('users').countDocuments({}),
      db.collection('sessions').countDocuments({ expiresAt: { $gt: new Date() } }),
    ]);

    const stats = {
      totalEvents,
      uniqueUsers: allSessions.length,
      registeredUsers,
      activeSessions,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      byTool: byTool.map((t: any) => ({ ...t, _id: String(t._id), lastUsed: t.lastUsed?.toISOString?.() || '' })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      byCountry: byCountry.map((c: any) => ({ ...c, _id: String(c._id) })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dailyTrend: dailyTrend.map((d: any) => ({ ...d, _id: String(d._id) })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recentEvents: recentEvents.map((e: any) => ({
        ...e,
        timestamp: e.timestamp?.toISOString?.() || '',
      })),
    };

    return <DashboardClient stats={stats} days={days} />;
  } catch (err) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Database Error</h2>
          <p className="text-gray-400 text-sm">
            Could not connect to MongoDB. Check your MONGODB_URI env var.
          </p>
          <p className="text-gray-600 text-xs mt-2 font-mono">{String(err)}</p>
        </div>
      </div>
    );
  }
}
