import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const algo = String(body.algorithm || 'sha256').toLowerCase()
    const text = String(body.text || '')
    const allowed = new Set(['md5','sha1','sha256'])
    if (!allowed.has(algo)) return new Response(JSON.stringify({ error: 'Unsupported algorithm' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

    const hash = crypto.createHash(algo).update(text, 'utf8').digest('hex')
    return new Response(JSON.stringify({ hash }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'invalid request' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }
}
