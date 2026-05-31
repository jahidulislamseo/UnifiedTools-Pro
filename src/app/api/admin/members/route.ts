import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

async function isAdmin() {
  const store = await cookies();
  return store.get('admin_token')?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = await getDb();
    const members = await db.collection('users')
      .find({}, { projection: { passwordHash: 0, salt: 0 } })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    return NextResponse.json({
      members: members.map(m => ({
        _id: String(m._id),
        name: m.name,
        email: m.email,
        createdAt: m.createdAt?.toISOString?.() || '',
        isBanned: !!m.isBanned,
      })),
    });
  } catch {
    return NextResponse.json({ members: [] });
  }
}

// PATCH - ban or unban a user
export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { userId, action } = await req.json();
    if (!userId || !['ban', 'unban'].includes(action))
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    const db = await getDb();
    const isBanned = action === 'ban';
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { isBanned } }
    );

    // If banning: delete all active sessions so they're logged out immediately
    if (isBanned) {
      const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
      if (user) await db.collection('sessions').deleteMany({ userId: String(user._id) });
    }

    return NextResponse.json({ success: true, isBanned });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// DELETE - permanently delete a user
export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const db = await getDb();
    await db.collection('users').deleteOne({ _id: new ObjectId(userId) });
    await db.collection('sessions').deleteMany({ userId });
    await db.collection('passwordResets').deleteMany({ email: { $exists: true } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
