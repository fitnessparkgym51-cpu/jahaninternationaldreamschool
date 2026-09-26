import {NextResponse, type NextRequest} from 'next/server'

import {deleteExpiredComplaints} from '@/lib/complaints'

/**
 * Deletes complaints older than 30 days. Called daily by Vercel Cron
 * (`vercel.json`), which sends `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }
  const deleted = await deleteExpiredComplaints()
  return NextResponse.json({deleted})
}
