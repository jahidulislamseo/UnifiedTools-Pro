import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (token) {
      const db = await getDb();
      await db.collection('sessions').deleteOne({ token });
    }
  } catch {}

  const res = NextResponse.json({ success: true });
  res.cookies.set('auth_token', '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
