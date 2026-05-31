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

// PATCH - ban or unban (single or bulk)
export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const action: string = body.action;
    if (!['ban', 'unban'].includes(action))
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    // Bulk: userIds array
    const userIds: string[] = body.userIds || (body.userId ? [body.userId] : []);
    if (userIds.length === 0) return NextResponse.json({ error: 'No users specified' }, { status: 400 });

    const db = await getDb();
    const isBanned = action === 'ban';

    await db.collection('users').updateMany(
      { _id: { $in: userIds.map(id => new ObjectId(id)) } },
      { $set: { isBanned } }
    );

    if (isBanned) {
      await db.collection('sessions').deleteMany({ userId: { $in: userIds } });
    }

    return NextResponse.json({ success: true, isBanned, count: userIds.length });
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
