import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/mongodb';

async function isAdmin() {
  const store = await cookies();
  return store.get('admin_token')?.value === process.env.ADMIN_PASSWORD;
}

// GET - fetch announcements (public, for banner display)
export async function GET() {
  try {
    const db = await getDb();
    const announcements = await db.collection('announcements')
      .find({ active: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    return NextResponse.json({
      announcements: announcements.map(a => ({
        _id: String(a._id),
        message: a.message,
        type: a.type || 'info',
        createdAt: a.createdAt?.toISOString?.() || '',
      })),
    });
  } catch {
    return NextResponse.json({ announcements: [] });
  }
}

// POST - create announcement (admin only)
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { message, type } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    const db = await getDb();
    const result = await db.collection('announcements').insertOne({
      message: message.trim(),
      type: type || 'info',
      active: true,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, _id: String(result.insertedId) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// DELETE - deactivate an announcement (admin only)
export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { ObjectId } = await import('mongodb');
    const db = await getDb();
    await db.collection('announcements').updateOne(
      { _id: new ObjectId(id) },
      { $set: { active: false } }
    );
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
