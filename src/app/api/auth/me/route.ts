import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ user: null });

    const db = await getDb();
    const session = await db.collection('sessions').findOne({
      token,
      expiresAt: { $gt: new Date() },
    });
    if (!session) return NextResponse.json({ user: null });

    // Verify user is not banned
    let userIdObj;
    try {
      userIdObj = new ObjectId(session.userId);
    } catch {
      userIdObj = session.userId;
    }
    const user = await db.collection('users').findOne({ _id: userIdObj });
    if (!user || user.isBanned) {
      // Invalidate session
      await db.collection('sessions').deleteOne({ token });
      const res = NextResponse.json({ user: null });
      res.cookies.delete('auth_token');
      return res;
    }

    return NextResponse.json({ user: { name: session.name, email: session.email } });
  } catch {
    return NextResponse.json({ user: null });
  }
}

