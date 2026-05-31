import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/mongodb';

async function isAdmin() {
  const store = await cookies();
  return store.get('admin_token')?.value === process.env.ADMIN_PASSWORD;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const days = parseInt(req.nextUrl.searchParams.get('days') || '30');
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const db = await getDb();

    const [hourly, weekday] = await Promise.all([
      // Events by hour of day (0–23)
      db.collection('events').aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: {
          _id: { hour: { $hour: '$timestamp' }, dow: { $dayOfWeek: '$timestamp' } },
          count: { $sum: 1 }
        }}
      ]).toArray(),

      // Total by day of week (for bar chart)
      db.collection('events').aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: { _id: { $dayOfWeek: '$timestamp' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]).toArray(),
    ]);

    // Build 7×24 heatmap matrix [dow][hour]
    const matrix: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
    hourly.forEach((e: any) => {
      const dow  = ((e._id.dow - 1) + 7) % 7; // MongoDB: 1=Sun
      const hour = e._id.hour;
      if (dow >= 0 && dow < 7 && hour >= 0 && hour < 24) {
        matrix[dow][hour] += e.count;
      }
    });

    const heatmap = DAYS.map((day, d) => ({
      day,
      hours: matrix[d].map((count, h) => ({ hour: h, count }))
    }));

    const weekdayMap: Record<number, number> = {};
    weekday.forEach((w: any) => { weekdayMap[w._id] = w.count; });
    const weekdayChart = DAYS.map((day, i) => ({
      day,
      count: weekdayMap[((i + 1) % 7) + 1] || weekdayMap[i + 1] || 0
    }));

    // Busiest hour overall
    const flat = hourly as any[];
    const busiest = flat.sort((a, b) => b.count - a.count)[0];
    const busiestHour = busiest ? `${busiest._id.hour}:00 on ${DAYS[(busiest._id.dow - 1 + 7) % 7]}` : 'N/A';

    return NextResponse.json({ heatmap, weekdayChart, busiestHour });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
