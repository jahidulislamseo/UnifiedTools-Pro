import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/mongodb';

async function isAdmin() {
  const store = await cookies();
  return store.get('admin_token')?.value === process.env.ADMIN_PASSWORD;
}

export async function GET() {
  try {
    const db = await getDb();
    const doc = await db.collection('settings').findOne({ _id: 'maintenance' as any });
    return Response.json({ enabled: doc?.enabled === true });
  } catch {
    return Response.json({ enabled: false });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { enabled } = await req.json();
  const db = await getDb();
  await db.collection('settings').updateOne(
    { _id: 'maintenance' as any },
    { $set: { enabled: !!enabled, updatedAt: new Date() } },
    { upsert: true }
  );
  return Response.json({ ok: true, enabled: !!enabled });
}
