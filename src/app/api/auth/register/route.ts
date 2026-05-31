import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { hashPassword, generateSalt, generateToken } from '@/lib/userStore';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password)
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    if (!/\S+@\S+\.\S+/.test(email))
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });

    const db = await getDb();
    const users = db.collection('users');

    const existing = await users.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    const salt = generateSalt();
    const user = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: hashPassword(password, salt),
      salt,
      createdAt: new Date(),
    };
    const result = await users.insertOne(user);

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.collection('sessions').insertOne({
      token,
      userId: result.insertedId.toString(),
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
