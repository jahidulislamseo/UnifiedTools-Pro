import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/mongodb';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || '';
  const success = !!password && password === process.env.ADMIN_PASSWORD;

  // Log every login attempt
  try {
    const db = await getDb();
    await db.collection('admin_login_log').insertOne({ success, ip, userAgent, timestamp: new Date() });
  } catch { /* ignore logging errors */ }

  if (!success) {
    return Response.json({ error: 'Invalid password' }, { status: 401 });
  }

  const store = await cookies();
  store.set('admin_token', password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return Response.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete('admin_token');
  return Response.json({ ok: true });
}
