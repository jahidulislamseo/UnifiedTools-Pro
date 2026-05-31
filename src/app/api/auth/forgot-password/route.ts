import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const db = await getDb();
    const user = await db.collection('users').findOne({ email: email.toLowerCase().trim() });

    // Always return success to prevent email enumeration
    if (!user) return NextResponse.json({ success: true });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.collection('passwordResets').insertOne({
      email: user.email,
      token,
      expiresAt,
      used: false,
      createdAt: new Date(),
    });

    // Log to console since we have no SMTP configured
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    console.log('\n🔑 PASSWORD RESET LINK (no SMTP configured — dev only):');
    console.log(`   Email: ${user.email}`);
    console.log(`   Link:  ${resetLink}`);
    console.log(`   Expires: ${expiresAt.toISOString()}\n`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
