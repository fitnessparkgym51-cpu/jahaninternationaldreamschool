import {createClient} from 'next-sanity'

import {apiVersion, dataset, projectId} from '@/sanity/env'

/**
 * Server-only client with write access. Imported only by API route handlers,
 * so `SANITY_API_WRITE_TOKEN` (no NEXT_PUBLIC_ prefix) never reaches the browser.
 */
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

export const RETENTION_DAYS = 30

/** Deletes complaints older than 30 days. Scoped to `_type == "complaint"` only. */
export async function deleteExpiredComplaints(): Promise<number> {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 86_400_000).toISOString()
  const ids = await writeClient.fetch<string[]>(
    `*[_type == "complaint" && defined(submittedAt) && submittedAt < $cutoff]._id`,
    {cutoff},
  )
  if (!ids.length) return 0
  const tx = writeClient.transaction()
  ids.forEach((id) => tx.delete(id))
  await tx.commit({visibility: 'async'})
  return ids.length
}
