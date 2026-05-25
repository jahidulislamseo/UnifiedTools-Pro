import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Invalid password' }, { status: 401 });
  }

  const store = await cookies();
  store.set('admin_token', password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return Response.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete('admin_token');
  return Response.json({ ok: true });
}
