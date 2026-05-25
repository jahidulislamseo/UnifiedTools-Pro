import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getToolInfo, getCountryName } from '@/lib/analytics';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, sessionId } = body;

    if (!path || !sessionId) {
      return Response.json({ ok: false }, { status: 400 });
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '0.0.0.0';

    const countryCode = req.headers.get('x-vercel-ip-country') || 'XX';
    const city = req.headers.get('x-vercel-ip-city') || '';
    const userAgent = req.headers.get('user-agent') || '';

    const toolInfo = getToolInfo(path);

    const db = await getDb();
    const col = db.collection('events');

    await col.insertOne({
      path,
      toolName: toolInfo.name,
      category: toolInfo.category,
      timestamp: new Date(),
      ip,
      sessionId,
      country: countryCode,
      countryName: getCountryName(countryCode),
      city,
      userAgent,
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
