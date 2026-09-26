import {SmartLink} from '@/components/ui/SmartLink'

/**
 * Shown when the Home document has not been created or has no sections yet.
 *
 * Deliberately not filled with placeholder copy: the point is to make the
 * missing CMS content obvious instead of hiding a broken integration.
 */
export function HomeContentMissing() {
  return (
    <section className="bg-gray-50 px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <h1 className="mb-3 text-2xl font-extrabold text-gray-900">Home page content is empty</h1>
        <p className="mb-6 text-sm leading-relaxed text-gray-600">
          The Home page is rendered from Sanity and no content has been published yet. Open the
          Studio and add sections to the <strong>Home page</strong> document.
        </p>
        <SmartLink
          url="/studio/structure/homePage"
          className="btn-shine inline-block rounded-lg bg-jids-green px-6 py-3 text-sm font-semibold text-white"
        >
          Open the Studio
        </SmartLink>
      </div>
    </section>
  )
}
