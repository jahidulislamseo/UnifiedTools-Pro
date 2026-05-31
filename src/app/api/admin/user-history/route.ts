import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/mongodb';

async function isAdmin() {
  const store = await cookies();
  return store.get('admin_token')?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return Response.json({ error: 'Missing email' }, { status: 400 });
  try {
    const db = await getDb();
    const history = await db.collection('user_tool_usage')
      .find({ email })
      .sort({ usedAt: -1 })
      .limit(50)
      .toArray();
    return Response.json({
      history: history.map(h => ({
        toolName: h.toolName,
        toolPath: h.toolPath,
        category: h.category,
        usedAt: h.usedAt?.toISOString?.() || '',
      })),
    });
  } catch {
    return Response.json({ history: [] });
  }
}
