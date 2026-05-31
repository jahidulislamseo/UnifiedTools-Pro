import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { hashPassword, generateSalt } from '@/lib/userStore';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) return NextResponse.json({ error: 'Token and password required' }, { status: 400 });
    if (newPassword.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

    const db = await getDb();
    const reset = await db.collection('passwordResets').findOne({
      token, used: false, expiresAt: { $gt: new Date() },
    });
    if (!reset) return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });

    const salt = generateSalt();
    const passwordHash = hashPassword(newPassword, salt);
    await db.collection('users').updateOne({ email: reset.email }, { $set: { passwordHash, salt } });
    await db.collection('passwordResets').updateOne({ token }, { $set: { used: true } });
    // Invalidate all sessions
    await db.collection('sessions').deleteMany({ email: reset.email });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
