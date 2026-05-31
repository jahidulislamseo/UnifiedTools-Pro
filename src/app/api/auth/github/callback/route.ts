import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { generateToken } from '@/lib/userStore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'GitHub OAuth not configured' }, { status: 503 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const redirectUri = `${siteUrl}/api/auth/github/callback`;

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    return NextResponse.json({ error: tokenData.error || 'Failed to obtain GitHub access token' }, { status: 502 });
  }

  const profileRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'UnifiedTools Pro',
    },
  });
  const profile = await profileRes.json();
  if (!profile || !profile.id) {
    return NextResponse.json({ error: 'Unable to read GitHub profile' }, { status: 502 });
  }

  let email = profile.email;
  if (!email) {
    const emailsRes = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'UnifiedTools Pro',
      },
    });
    const emails = await emailsRes.json();
    if (Array.isArray(emails)) {
      const primary = emails.find((item: any) => item.primary && item.verified && item.email);
      email = primary?.email || emails.find((item: any) => item.verified && item.email)?.email;
    }
  }

  if (!email) {
    return NextResponse.json({ error: 'Email access is required from GitHub' }, { status: 400 });
  }

  const db = await getDb();
  const users = db.collection('users');
  const normalizedEmail = email.toLowerCase().trim();
  let user = await users.findOne({ $or: [{ githubId: profile.id.toString() }, { email: normalizedEmail }] });

  if (!user) {
    const result = await users.insertOne({
      name: profile.name || profile.login || 'GitHub User',
      email: normalizedEmail,
      githubId: profile.id.toString(),
      passwordHash: '',
      salt: '',
      createdAt: new Date(),
      isBanned: false,
    });
    user = { _id: result.insertedId, name: profile.name || profile.login || 'GitHub User', email: normalizedEmail };
  } else if (!user.githubId) {
    await users.updateOne({ _id: user._id }, { $set: { githubId: profile.id.toString() } });
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
