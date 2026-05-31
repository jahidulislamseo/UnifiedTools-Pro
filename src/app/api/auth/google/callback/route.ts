import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { generateToken } from '@/lib/userStore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 503 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const redirectUri = `${siteUrl}/api/auth/google/callback`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    return NextResponse.json({ error: tokenData.error || 'Failed to obtain Google access token' }, { status: 502 });
  }

  const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const profile = await userRes.json();

  if (!profile?.email) {
    return NextResponse.json({ error: 'Unable to read Google profile email' }, { status: 502 });
  }

  if (profile.email_verified === false) {
    return NextResponse.json({ error: 'Google account email must be verified' }, { status: 400 });
  }

  const db = await getDb();
  const users = db.collection('users');
  const normalizedEmail = profile.email.toLowerCase().trim();
  let user = await users.findOne({ $or: [{ googleId: profile.sub }, { email: normalizedEmail }] });

  if (!user) {
    const result = await users.insertOne({
      name: profile.name || normalizedEmail,
      email: normalizedEmail,
      googleId: profile.sub,
      passwordHash: '',
      salt: '',
      createdAt: new Date(),
      isBanned: false,
    });
    user = { _id: result.insertedId, name: profile.name || normalizedEmail, email: normalizedEmail };
  } else if (!user.googleId) {
    await users.updateOne({ _id: user._id }, { $set: { googleId: profile.sub } });
  }

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

  const res = NextResponse.redirect(new URL('/dashboard', req.url));
  res.cookies.set('auth_token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  });
  return res;
}
