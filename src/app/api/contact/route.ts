import {NextResponse, type NextRequest} from 'next/server'

import {writeClient} from '@/lib/complaints'

/** Contact page inquiry. Stored as a `contactSubmission` document in Sanity. */
const WINDOW_MS = 10 * 60_000
const MAX_PER_WINDOW = 5
const hits = new Map<string, number[]>()

function rateLimited(key: string): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  if (hits.size > 5000) hits.clear()
  hits.set(key, recent)
  return recent.length > MAX_PER_WINDOW
}

const text = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

export async function POST(req: NextRequest) {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json({error: 'The contact form is not configured yet.'}, {status: 503})
  }

  const key = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (rateLimited(key)) {
    return NextResponse.json({error: 'Too many messages. Please try again later.'}, {status: 429})
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (body?.website) return NextResponse.json({ok: true})

  const doc = {
    name: text(body?.name, 100),
    whatsapp: text(body?.whatsapp, 20),
    childAge: text(body?.childAge, 40),
    classInterested: text(body?.classInterested, 60),
    message: text(body?.message, 2000),
  }
  if (!doc.name || !/^[0-9+\-\s]{6,20}$/.test(doc.whatsapp) || !doc.childAge || !doc.classInterested) {
    return NextResponse.json({error: 'Please fill in all required fields.'}, {status: 400})
  }

  await writeClient.create({_type: 'contactSubmission', ...doc, submittedAt: new Date().toISOString()})
  return NextResponse.json({ok: true})
}
