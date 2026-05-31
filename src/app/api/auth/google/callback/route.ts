import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { generateToken } from '@/lib/userStore';

export async function GET(req: NextRequest) {
  const siteUrl     = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const clientId    = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret= process.env.GOOGLE_CLIENT_SECRET!;
  const code        = req.nextUrl.searchParams.get('code');

  if (!code) return NextResponse.redirect(`${siteUrl}/auth?error=no_code`);
  if (!clientId || !clientSecret) return NextResponse.redirect(`${siteUrl}/auth?error=not_configured`);

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: clientId, client_secret: clientSecret,
        redirect_uri: `${siteUrl}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) return NextResponse.redirect(`${siteUrl}/auth?error=token_exchange`);

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userRes.json();
    if (!googleUser.email) return NextResponse.redirect(`${siteUrl}/auth?error=no_email`);

    // Upsert user in DB
    const db = await getDb();
    const existing = await db.collection('users').findOne({ email: googleUser.email.toLowerCase() });
    if (!existing) {
      await db.collection('users').insertOne({
        name: googleUser.name || googleUser.email.split('@')[0],
        email: googleUser.email.toLowerCase(),
        passwordHash: '', salt: '',
        googleId: googleUser.id,
        avatar: googleUser.picture || '',
        provider: 'google',
        createdAt: new Date(),
      });
    }

    // Create session
    const token = generateToken();
    await db.collection('sessions').insertOne({
      token,
      userId: (existing || await db.collection('users').findOne({ email: googleUser.email.toLowerCase() }))?._id?.toString() || '',
      email: googleUser.email.toLowerCase(),
      name: googleUser.name || googleUser.email,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const res = NextResponse.redirect(`${siteUrl}/dashboard`);
    res.cookies.set('auth_token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' });
    return res;
  } catch (err: any) {
    return NextResponse.redirect(`${siteUrl}/auth?error=${encodeURIComponent(err.message)}`);
  }
}
