'use client'

import {useCallback, useEffect, useRef, useState} from 'react'

import {Icon} from '@/components/ui/Icon'
import {SanityImage} from '@/components/ui/SanityImage'
import type {HeroSlide} from '@/sanity/types/home'

export type CarouselSlide = {
  /** Stable key for React. */
  key: string
  /** `data-sanity` value for this slide's image field. */
  editAttribute: string | undefined
  image: NonNullable<HeroSlide['image']>
}

type HeroCarouselProps = {
  slides: CarouselSlide[]
  /** Seconds between automatic slide changes. 0 stops the rotation. */
  autoplaySeconds: number
}

/**
 * The rotating background of the hero banner.
 *
 * A client component because it owns the current-slide and pause state. It is
 * deliberately the *only* interactive part of the hero: all content and all
 * click-to-edit metadata is built by the server component that renders it, and
 * passed in as plain serialisable values.
 */
export function HeroCarousel({slides, autoplaySeconds}: HeroCarouselProps) {
  const total = slides.length
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<number | null>(null)

  const goTo = useCallback(
    (next: number) => {
      if (total === 0) return
      setIndex(((next % total) + total) % total)
    },
    [total],
  )

  useEffect(() => {
    if (total < 2 || autoplaySeconds <= 0 || paused) return

    intervalRef.current = window.setInterval(() => {
      setIndex((current) => (current + 1) % total)
    }, autoplaySeconds * 1000)

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [total, autoplaySeconds, paused])

  if (total === 0) return null

  return (
    <>
      <div
        className="absolute inset-0 z-0 overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.key}
            className={`hero-slide ${slideIndex === index ? 'is-active' : ''}`.trim()}
            aria-hidden={slideIndex !== index}
          >
            <SanityImage
              image={slide.image}
              sourceWidth={1920}
              sizes="100vw"
              priority={slideIndex === 0}
              className="object-cover object-center"
              editAttribute={slide.editAttribute}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/40" />
          </div>
        ))}
      </div>

      {total > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(index - 1)}
            className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/80 backdrop-blur-md transition hover:bg-black/60 hover:text-white sm:left-8"
          >
            <Icon name="chevron-left" size={24} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(index + 1)}
            className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/80 backdrop-blur-md transition hover:bg-black/60 hover:text-white sm:right-8"
          >
            <Icon name="chevron-right" size={24} strokeWidth={2.5} />
          </button>

          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5">
            {slides.map((slide, dotIndex) => (
              <button
                key={`dot-${slide.key}`}
                type="button"
                aria-label={`Slide ${dotIndex + 1}`}
                aria-current={dotIndex === index}
                onClick={() => goTo(dotIndex)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  dotIndex === index ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </>
  )
}
