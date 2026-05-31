import { cookies } from 'next/headers';
import { getDb } from '@/lib/mongodb';

async function isAdmin() {
  const store = await cookies();
  return store.get('admin_token')?.value === process.env.ADMIN_PASSWORD;
}

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = await getDb();
    const logs = await db.collection('admin_login_log')
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    return Response.json({
      logs: logs.map(l => ({
        _id: String(l._id),
        success: l.success,
        ip: l.ip,
        userAgent: l.userAgent,
        timestamp: l.timestamp?.toISOString?.() || '',
      })),
    });
  } catch {
    return Response.json({ logs: [] });
  }
}
