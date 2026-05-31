import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/mongodb';

async function isAdmin() {
  const store = await cookies();
  return store.get('admin_token')?.value === process.env.ADMIN_PASSWORD;
}

function toCSV(rows: Record<string, any>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map(r => headers.map(h => {
      const v = r[h] ?? '';
      const s = String(v).replace(/"/g, '""');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
    }).join(','))
  ];
  return lines.join('\n');
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const type = req.nextUrl.searchParams.get('type') || 'events';
    const days = parseInt(req.nextUrl.searchParams.get('days') || '30');
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const db = await getDb();

    let rows: Record<string, any>[] = [];
    let filename = '';

    if (type === 'events') {
      const data = await db.collection('events')
        .find({ timestamp: { $gte: since } }, {
          sort: { timestamp: -1 }, limit: 10000,
          projection: { _id: 0, path: 1, toolName: 1, category: 1, country: 1, countryName: 1, city: 1, sessionId: 1, timestamp: 1 }
        }).toArray();
      rows = data.map((e: any) => ({
        timestamp: e.timestamp?.toISOString?.() || '',
        toolName: e.toolName,
        category: e.category,
        country: e.countryName || e.country,
        city: e.city || '',
        sessionId: e.sessionId,
        path: e.path,
      }));
      filename = `events-last-${days}days.csv`;
    }

    else if (type === 'users') {
      const data = await db.collection('users')
        .find({}, { projection: { _id: 1, name: 1, email: 1, createdAt: 1, isBanned: 1 }, sort: { createdAt: -1 } })
        .toArray();
      rows = data.map((u: any) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        joinedAt: u.createdAt?.toISOString?.() || '',
        banned: u.isBanned ? 'Yes' : 'No',
      }));
      filename = 'all-users.csv';
    }

    else if (type === 'tool-usage') {
      const data = await db.collection('user_tool_usage')
        .find({ usedAt: { $gte: since } }, { sort: { usedAt: -1 }, limit: 10000 })
        .toArray();
      rows = data.map((u: any) => ({
        usedAt: u.usedAt?.toISOString?.() || '',
        email: u.email,
        name: u.name,
        toolName: u.toolName,
        category: u.category,
        toolPath: u.toolPath,
      }));
      filename = `tool-usage-last-${days}days.csv`;
    }

    else if (type === 'ratings') {
      const data = await db.collection('ratings')
        .aggregate([
          { $group: {
            _id: '$toolPath',
            avg: { $avg: '$rating' },
            count: { $sum: 1 },
          }},
          { $sort: { avg: -1 } }
        ]).toArray();
      rows = data.map((r: any) => ({
        toolPath: r._id,
        averageRating: Math.round(r.avg * 10) / 10,
        totalRatings: r.count,
      }));
      filename = 'tool-ratings.csv';
    }

    const csv = toCSV(rows);
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
