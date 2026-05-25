import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/mongodb';

export const runtime = 'nodejs';

async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const token = store.get('admin_token');
  return token?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const days = parseInt(url.searchParams.get('days') || '30');
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const db = await getDb();
  const col = db.collection('events');

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

  return Response.json({
    totalEvents,
    uniqueUsers: allSessions.length,
    byTool,
    byCountry,
    dailyTrend,
    recentEvents,
  });
}
