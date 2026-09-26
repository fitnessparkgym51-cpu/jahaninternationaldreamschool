import {SmartLink} from '@/components/ui/SmartLink'

/**
 * Shown when the Admissions document has not been created, or every one of its
 * sections is switched off.
 *
 * Mirrors `HomeContentMissing` and `AboutContentMissing`: deliberately not filled
 * with placeholder copy, so a missing CMS document is obvious rather than hidden
 * behind filler text.
 */
export function AdmissionsContentMissing() {
  return (
    <section className="bg-gray-50 px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <h1 className="mb-3 text-2xl font-extrabold text-gray-900">
          Admissions page content is empty
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-gray-600">
          The Admissions page is rendered from Sanity and no content has been published yet. Open
          the Studio and add sections to the <strong>Admissions page</strong> document.
        </p>
        <SmartLink
          url="/studio/structure/admissionsPage"
          className="btn-shine inline-block rounded-lg bg-jids-green px-6 py-3 text-sm font-semibold text-white"
        >
          Open the Studio
        </SmartLink>
      </div>
    </section>
  )
}
