import {stegaClean} from 'next-sanity'

import {Reveal} from '@/components/ui/Reveal'
import {SanityImage} from '@/components/ui/SanityImage'
import {editTargetAttr, type EditField} from '@/lib/editing'
import type {FeatureImageSection as FeatureImageSectionData} from '@/sanity/types/home'

/** Frame widths. The value is a CMS choice; the class set is code. */
const WIDTH_CLASSES: Record<string, string> = {
  narrow: 'max-w-2xl',
  medium: 'max-w-4xl',
  wide: 'max-w-6xl',
}

type FeatureImageSectionProps = {
  section: FeatureImageSectionData
  editField: EditField
}

/**
 * One large CMS image in a framed panel â€” the admission brochure here, a
 * prospectus or floor plan elsewhere.
 *
 * The `anchorId` is what lets the hero's "Download Admission Form" button jump
 * straight to the image, so both stay CMS-controlled.
 */
export function FeatureImageSection({section, editField}: FeatureImageSectionProps) {
  if (!section.image) return null

  // `width` is a lookup key, so it must be stega-cleaned.
  const frameWidth = WIDTH_CLASSES[stegaClean(section.width) ?? 'narrow'] ?? WIDTH_CLASSES.narrow

  return (
    <section
      id={section.anchorId || undefined}
      className="scroll-mt-24 bg-white px-4 py-6 sm:px-8"
      {...editTargetAttr}
    >
      <div className={`mx-auto ${frameWidth}`}>
        <Reveal>
          <div
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
            data-sanity={editField('image')}
          >
            {/*
              `SanityImage` always fills its parent, so the box owns the size.
              A brochure is a document scan of unknown proportions, so the frame
              matches the reference's 4:3 panel and `object-contain` guarantees
              nothing is ever cropped.
            */}
            <div className="relative aspect-[4/3] w-full">
              <SanityImage
                image={section.image}
                sizes="(min-width: 1024px) 42rem, 100vw"
                className="object-contain"
                editAttribute={editField('image')}
              />
            </div>
          </div>
        </Reveal>

        {section.caption ? (
          <p
            className="mt-4 text-center text-sm text-gray-500"
            data-sanity={editField('caption')}
          >
            {section.caption}
          </p>
        ) : null}
      </div>
    </section>
  )
}
