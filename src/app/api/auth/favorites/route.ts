import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

async function getSession(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return null;
  const db = await getDb();
  return db.collection('sessions').findOne({ token, expiresAt: { $gt: new Date() } });
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ favorites: [] });
    const db = await getDb();
    const user = await db.collection('users').findOne({ email: session.email }, { projection: { favorites: 1 } });
    return NextResponse.json({ favorites: user?.favorites || [] });
  } catch { return NextResponse.json({ favorites: [] }); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { path, action } = await req.json(); // action: 'add' | 'remove'
    const db = await getDb();
    const update = action === 'add'
      ? { $addToSet: { favorites: path } }
      : { $pull:    { favorites: path } };
    await db.collection('users').updateOne({ email: session.email }, update as any);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
