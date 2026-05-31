import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ usage: [] });

    const db = await getDb();
    const session = await db.collection('sessions').findOne({ token, expiresAt: { $gt: new Date() } });
    if (!session) return NextResponse.json({ usage: [] });

    const usage = await db.collection('user_tool_usage')
      .find({ userId: session.userId })
      .sort({ usedAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ usage });
  } catch {
    return NextResponse.json({ usage: [] });
  }
}
