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

  const users = await col
    .aggregate([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: '$sessionId',
          totalEvents: { $sum: 1 },
          tools: { $addToSet: '$toolName' },
          country: { $first: '$country' },
          countryName: { $first: '$countryName' },
          city: { $first: '$city' },
          ip: { $first: '$ip' },
          firstSeen: { $min: '$timestamp' },
          lastSeen: { $max: '$timestamp' },
        },
      },
      { $sort: { lastSeen: -1 } },
      { $limit: 200 },
    ])
    .toArray();

  return Response.json({ users });
}
