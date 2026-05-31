import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/mongodb';

async function isAdmin() {
  const store = await cookies();
  return store.get('admin_token')?.value === process.env.ADMIN_PASSWORD;
}

function parseUA(ua: string) {
  const u = ua.toLowerCase();
  // Device
  let device = 'Desktop';
  if (/ipad/.test(u)) device = 'Tablet';
  else if (/mobile|android|iphone/.test(u)) device = 'Mobile';

  // Browser
  let browser = 'Other';
  if (/edg\/|edge\//.test(u)) browser = 'Edge';
  else if (/opr\/|opera/.test(u)) browser = 'Opera';
  else if (/chrome/.test(u)) browser = 'Chrome';
  else if (/firefox/.test(u)) browser = 'Firefox';
  else if (/safari/.test(u)) browser = 'Safari';
  else if (/msie|trident/.test(u)) browser = 'IE';

  // OS
  let os = 'Other';
  if (/android/.test(u)) os = 'Android';
  else if (/iphone|ipad/.test(u)) os = 'iOS';
  else if (/windows/.test(u)) os = 'Windows';
  else if (/mac os|macintosh/.test(u)) os = 'macOS';
  else if (/linux/.test(u)) os = 'Linux';

  return { device, browser, os };
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const days = parseInt(req.nextUrl.searchParams.get('days') || '30');
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const db = await getDb();

    const events = await db.collection('events')
      .find({ timestamp: { $gte: since }, userAgent: { $exists: true, $ne: '' } },
        { projection: { userAgent: 1 } })
      .limit(5000)
      .toArray();

    const devices: Record<string, number> = {};
    const browsers: Record<string, number> = {};
    const oses: Record<string, number> = {};

    events.forEach((e: any) => {
      const { device, browser, os } = parseUA(e.userAgent || '');
      devices[device]  = (devices[device]  || 0) + 1;
      browsers[browser]= (browsers[browser]|| 0) + 1;
      oses[os]         = (oses[os]         || 0) + 1;
    });

    const total = events.length;
    const toArr = (obj: Record<string, number>) =>
      Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }));

    return NextResponse.json({
      total,
      devices:  toArr(devices),
      browsers: toArr(browsers),
      oses:     toArr(oses),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
