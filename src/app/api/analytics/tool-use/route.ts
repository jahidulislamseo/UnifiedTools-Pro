import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getToolInfo } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ ok: false });

    const db = await getDb();
    const session = await db.collection('sessions').findOne({ token, expiresAt: { $gt: new Date() } });
    if (!session) return NextResponse.json({ ok: false });

    const { path } = await req.json();
    if (!path) return NextResponse.json({ ok: false });

    const info = getToolInfo(path);

    await db.collection('user_tool_usage').insertOne({
      userId: session.userId,
      email: session.email,
      name: session.name,
      toolPath: path,
      toolName: info.name,
      category: info.category,
      usedAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
