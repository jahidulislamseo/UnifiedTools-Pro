import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { hashPassword } from '@/lib/userStore';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) return NextResponse.json({ error: 'Token and password required' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

    const db = await getDb();
    const reset = await db.collection('passwordResets').findOne({ token, used: false });
    if (!reset) return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
    if (new Date() > new Date(reset.expiresAt)) {
      await db.collection('passwordResets').deleteOne({ token });
      return NextResponse.json({ error: 'Reset link has expired. Please request a new one.' }, { status: 400 });
    }

    const user = await db.collection('users').findOne({ email: reset.email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const newHash = hashPassword(password, user.salt);
    await db.collection('users').updateOne({ email: reset.email }, { $set: { passwordHash: newHash } });
    await db.collection('passwordResets').updateOne({ token }, { $set: { used: true } });

    // Invalidate all existing sessions for security
    await db.collection('sessions').deleteMany({ userId: user._id.toString() });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
