import {NextResponse, type NextRequest} from 'next/server'

import {deleteExpiredComplaints, writeClient} from '@/lib/complaints'

/**
 * Anonymous Complaint Box submission. Stores only topic, complaint and
 * submittedAt. The rate limiter keeps the caller's IP in memory for at most
 * ten minutes and never writes it anywhere.
 */
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

export async function POST(req: NextRequest) {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json({error: 'Complaint box is not configured.'}, {status: 503})
  }

  const key = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (rateLimited(key)) {
    return NextResponse.json({error: 'Too many submissions. Please try again later.'}, {status: 429})
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  // Honeypot: bots fill the hidden field; pretend success and store nothing.
  if (body?.website) return NextResponse.json({ok: true})

  const topic = typeof body?.topic === 'string' ? body.topic.trim() : ''
  const complaint = typeof body?.complaint === 'string' ? body.complaint.trim() : ''
  if (!topic || topic.length > 120 || !complaint || complaint.length > 2000) {
    return NextResponse.json({error: 'Please enter a topic and your complaint.'}, {status: 400})
  }

  await writeClient.create({
    _type: 'complaint',
    topic,
    complaint,
    submittedAt: new Date().toISOString(),
  })
  // Backstop to the daily cron: expired complaints are also purged on each submission.
  await deleteExpiredComplaints().catch(() => 0)

  return NextResponse.json({ok: true})
}
