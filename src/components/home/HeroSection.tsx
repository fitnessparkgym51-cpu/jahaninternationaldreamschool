import type {CSSProperties} from 'react'

import {Icon} from '@/components/ui/Icon'
import {ButtonLink} from '@/components/ui/SmartLink'
import {HeroCarousel, type CarouselSlide} from '@/components/home/HeroCarousel'
import type {EditField} from '@/components/home/HomeSections'
import type {HeroSection as HeroSectionData} from '@/sanity/types/home'

type HeroSectionProps = {
  section: HeroSectionData
  editField: EditField
}

/**
 * Hero banner: a rotating background of classroom photos behind the headline and
 * calls to action.
 *
 * All text, buttons, images and the rotation interval come from Sanity, and
 * every element is a click-to-edit target inside the Presentation Tool.
 */
export function HeroSection({section, editField}: HeroSectionProps) {
  if (!section.heading) return null

  const slides: CarouselSlide[] = (section.slides ?? [])
    .filter((slide) => Boolean(slide.image?.asset))
    .map((slide) => ({
      key: slide._key,
      editAttribute: editField('slides', {_key: slide._key}, 'image'),
      image: slide.image as NonNullable<HeroSectionData['slides']>[number]['image'] & object,
    }))

  return (
    // `min-h` rather than a fixed height: the heading, sub-heading and buttons all
    // come from the CMS, so a longer edit must grow the hero rather than be
    // clipped by `overflow-hidden`. At the current copy length this renders
    // exactly as before.
    <section className="relative flex min-h-[600px] items-center justify-center overflow-hidden text-white lg:min-h-[660px]">
      <HeroCarousel slides={slides} autoplaySeconds={section.autoplaySeconds ?? 4.5} />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 text-center">
        {section.eyebrow ? (
          <div
            className="fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/40 px-4 py-1.5 text-xs font-semibold text-yellow-300 shadow backdrop-blur-md sm:text-sm"
            style={{'--fade-delay': '0ms'} as CSSProperties}
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span>{section.eyebrow}</span>
          </div>
        ) : null}

        {/*
          `whitespace-pre-line` honours a line break in the CMS heading, so the
          school name and the tagline can be set as two lines. Same treatment as
          the Branch page hero.
        */}
        <h1
          className="fade-up mb-4 whitespace-pre-line text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl"
          style={{'--fade-delay': '120ms'} as CSSProperties}
        >
          {section.heading}
        </h1>

        {section.description ? (
          <p
            className="fade-up mx-auto mb-9 max-w-2xl text-base font-medium text-gray-100 drop-shadow sm:text-xl"
            style={{'--fade-delay': '240ms'} as CSSProperties}
          >
            {section.description}
          </p>
        ) : null}

        {section.primaryButton || section.secondaryButton ? (
          <div
            className="fade-up mb-10 flex flex-wrap items-center justify-center gap-4"
            style={{'--fade-delay': '360ms'} as CSSProperties}
          >
            <ButtonLink
              button={section.primaryButton}
              className="px-7 py-3 text-sm sm:text-base"
              editAttribute={editField('primaryButton')}
            />
            <ButtonLink
              button={section.secondaryButton}
              className="px-6 py-3 text-sm backdrop-blur-sm sm:text-base"
              icon={<Icon name="play" size={16} className="text-white" />}
              editAttribute={editField('secondaryButton')}
            />
          </div>
        ) : null}

        {section.highlightBadge ? (
          <div
            className="fade-up inline-block rounded-full border border-white/30 bg-white/20 px-6 py-2 text-xs font-medium text-white shadow backdrop-blur-md sm:text-sm"
            style={{'--fade-delay': '480ms'} as CSSProperties}
          >
            {section.highlightBadge}
          </div>
        ) : null}
      </div>
    </section>
  )
}
