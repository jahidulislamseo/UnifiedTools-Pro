import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { generateToken } from '@/lib/userStore';

// Mock Google OAuth - in production replace with real Google OAuth flow
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mock = searchParams.get('mock');

  if (mock === '1') {
    // Mock mode: simulate a Google-authenticated user for local dev
    const db = await getDb();
    const mockEmail = 'google.user@example.com';
    const mockName = 'Google User';

    let user = await db.collection('users').findOne({ email: mockEmail });
    if (!user) {
      const result = await db.collection('users').insertOne({
        name: mockName,
        email: mockEmail,
        googleId: 'mock_google_id',
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
      httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax',
    });
    return res;
  }

  // Production: redirect to real Google OAuth
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'Google OAuth not configured. Use ?mock=1 for local dev.' }, { status: 503 });
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const redirectUri = `${siteUrl}/api/auth/google/callback`;
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`;
  return NextResponse.redirect(url);
}
