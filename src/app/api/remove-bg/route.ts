import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 });

    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Remove.bg API key not configured. Add REMOVE_BG_API_KEY to .env.local' }, { status: 503 });

    const fd = new FormData();
    fd.append('image_file', file);
    fd.append('size', 'auto');

    const res = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: fd,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: (err as any)?.errors?.[0]?.title || 'Remove.bg API error' }, { status: res.status });
    }

    const buffer = await res.arrayBuffer();
    return new Response(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'inline; filename="no-bg.png"',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
