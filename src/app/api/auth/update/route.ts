import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { hashPassword, generateSalt } from '@/lib/userStore';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const db = await getDb();
    const session = await db.collection('sessions').findOne({ token, expiresAt: { $gt: new Date() } });
    if (!session) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const { type, name, currentPassword, newPassword } = await req.json();

    if (type === 'profile') {
      if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      await db.collection('users').updateOne({ email: session.email }, { $set: { name: name.trim() } });
      await db.collection('sessions').updateMany({ email: session.email }, { $set: { name: name.trim() } });
      return NextResponse.json({ success: true, name: name.trim() });
    }

    if (type === 'password') {
      if (!currentPassword || !newPassword)
        return NextResponse.json({ error: 'Both passwords required' }, { status: 400 });
      if (newPassword.length < 6)
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });

      const user = await db.collection('users').findOne({ email: session.email });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const currentHash = hashPassword(currentPassword, user.salt);
      if (currentHash !== user.passwordHash)
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });

      const newSalt = generateSalt();
      const newHash = hashPassword(newPassword, newSalt);
      await db.collection('users').updateOne(
        { email: session.email },
        { $set: { passwordHash: newHash, salt: newSalt } }
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
