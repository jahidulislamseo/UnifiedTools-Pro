import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { hashPassword, generateToken } from '@/lib/userStore';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });

    const db = await getDb();
    const user = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

    if (user.isBanned)
      return NextResponse.json({ error: 'Your account has been suspended by the administrator.' }, { status: 403 });

    const hash = hashPassword(password, user.salt);
    if (hash !== user.passwordHash)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.collection('sessions').insertOne({
      token,
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: new Date(),
      expiresAt,
    });

    const res = NextResponse.json({
      success: true,
      user: { name: user.name, email: user.email },
    });
    res.cookies.set('auth_token', token, {
      httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax',
    });
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
