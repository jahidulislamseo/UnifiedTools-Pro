import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path');
  if (!path) return NextResponse.json({ avg: 0, count: 0, userRating: 0 });
  try {
    const db = await getDb();
    const token = req.cookies.get('auth_token')?.value;
    const [agg, userDoc] = await Promise.all([
      db.collection('ratings').aggregate([
        { $match: { toolPath: path } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]).toArray(),
      token ? db.collection('sessions').findOne({ token, expiresAt: { $gt: new Date() } }) : null,
    ]);
    let userRating = 0;
    if (userDoc) {
      const r = await db.collection('ratings').findOne({ toolPath: path, userId: userDoc.userId });
      userRating = r?.rating || 0;
    }
    return NextResponse.json({ avg: agg[0]?.avg || 0, count: agg[0]?.count || 0, userRating });
  } catch { return NextResponse.json({ avg: 0, count: 0, userRating: 0 }); }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Login to rate' }, { status: 401 });
    const db = await getDb();
    const session = await db.collection('sessions').findOne({ token, expiresAt: { $gt: new Date() } });
    if (!session) return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    const { path, rating } = await req.json();
    if (!path || rating < 1 || rating > 5) return NextResponse.json({ error: 'Invalid' }, { status: 400 });
    await db.collection('ratings').updateOne(
      { toolPath: path, userId: session.userId },
      { $set: { toolPath: path, userId: session.userId, rating, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
