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
    const topUsers = await db.collection('user_tool_usage').aggregate([
      {
        $group: {
          _id: '$email',
          name: { $first: '$name' },
          totalUses: { $sum: 1 },
          uniqueTools: { $addToSet: '$toolName' },
          lastUsed: { $max: '$usedAt' },
        },
      },
      { $sort: { totalUses: -1 } },
      { $limit: 20 },
    ]).toArray();

    return Response.json({
      users: topUsers.map(u => ({
        email: u._id,
        name: u.name,
        totalUses: u.totalUses,
        uniqueTools: u.uniqueTools.length,
        lastUsed: u.lastUsed?.toISOString?.() || '',
      })),
    });
  } catch {
    return Response.json({ users: [] });
  }
}
