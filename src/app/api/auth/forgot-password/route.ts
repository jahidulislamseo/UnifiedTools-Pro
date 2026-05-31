import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { generateToken } from '@/lib/userStore';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const db = await getDb();
    const user = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
    // Always return success to prevent email enumeration
    if (!user) return NextResponse.json({ success: true });

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await db.collection('passwordResets').insertOne({
      email: user.email, token, expiresAt, used: false, createdAt: new Date(),
    });

    // In production: send email with reset link
    // For now: store token and return it in dev mode
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    console.log(`[Password Reset] ${user.email} → ${resetUrl}`);

    return NextResponse.json({ success: true, ...(process.env.NODE_ENV === 'development' ? { resetUrl } : {}) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
