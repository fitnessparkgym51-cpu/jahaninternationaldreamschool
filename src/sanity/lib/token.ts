/**
 * Server-only read token.
 *
 * Used to read draft (unpublished) content for the Presentation Tool preview.
 * `read` role is the lowest permission that can see drafts, and the token is
 * never referenced from a client component or a `NEXT_PUBLIC_*` variable.
 */
export const token = process.env.SANITY_API_READ_TOKEN

export const hasReadToken = Boolean(token)
