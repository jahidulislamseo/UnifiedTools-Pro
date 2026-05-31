import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { generateToken } from '@/lib/userStore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mock = searchParams.get('mock');

  if (mock === '1') {
    const db = await getDb();
    const mockEmail = 'github.user@example.com';
    const mockName = 'GitHub User';

    let user = await db.collection('users').findOne({ email: mockEmail });
    if (!user) {
      const result = await db.collection('users').insertOne({
        name: mockName,
        email: mockEmail,
        githubId: 'mock_github_id',
        passwordHash: '',
        salt: '',
        createdAt: new Date(),
        isBanned: false,
      });
      user = { _id: result.insertedId, name: mockName, email: mockEmail };
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

  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'GitHub OAuth not configured. Use ?mock=1 for local dev.' }, { status: 503 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const redirectUri = `${siteUrl}/api/auth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20user:email`;

  return NextResponse.redirect(url);
}
