import {revalidateTag} from 'next/cache'
import type {NextRequest} from 'next/server'
import {parseBody} from 'next-sanity/webhook'

/**
 * Revalidates cached content when something is published in Sanity.
 *
 * `<SanityLive />` already revalidates the browser that has the preview open, but
 * that only helps someone who is looking at the page. Without this route the
 * public site could serve a cached page long after a publish, because
 * `sanityFetch` deliberately caches for a very long time and relies on
 * on-demand revalidation instead.
 *
 * Point a Sanity webhook at this URL (Project settings → API → Webhooks):
 *
 *   - URL:     https://<your-site>/api/revalidate
 *   - Dataset: production
 *   - Trigger: "All documents"
 *   - HTTP headers: add `sanity-webhook-signature` using the shared secret
 *     below, so the request can be verified.
 *
 * The route is not a public endpoint: it only acts on signed payloads.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) {
    return Response.json(
      {message: 'Missing SANITY_REVALIDATE_SECRET. The webhook is not configured.'},
      {status: 500},
    )
  }

  const {isValidSignature, body} = await parseBody<{_id?: string; _type?: string}>(
    req,
    secret,
    // Wait for the Content Lake to settle so the next request is not stale.
    true,
  )

  if (!isValidSignature) {
    return Response.json({message: 'Invalid signature'}, {status: 401})
  }
  if (!body) {
    return Response.json({message: 'No document in the request body'}, {status: 400})
  }

  const revalidate = async () => {
    // `sanityFetch` tags its cached data with `sanity:<syncTag>` per document it
    // touched. `revalidateTag('sanity', 'max')` invalidates the whole Sanity
    // namespace, which covers every query on the site in one call.
    revalidateTag('sanity', 'max')
  }

  await revalidate()

  return Response.json({revalidated: true, _id: body._id, _type: body._type})
}

/** Convenience so the route can be smoke-tested from a browser. */
export async function GET() {
  return Response.json({
    message:
      'POST a Sanity webhook payload here. See src/app/api/revalidate/route.ts for setup.',
  })
}
