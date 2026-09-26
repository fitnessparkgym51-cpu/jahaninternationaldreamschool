'use client'

import {useEffect, useRef, type CSSProperties, type ElementType, type ReactNode} from 'react'

type RevealProps = {
  children: ReactNode
  as?: ElementType
  /** Animation delay in milliseconds, used to stagger grids. */
  delay?: number
  /** Direction the element travels in before appearing. */
  direction?: 'up' | 'left' | 'right' | 'zoom'
  className?: string
  style?: CSSProperties
  /**
   * `data-sanity` value, making the revealed element a click-to-edit target
   * inside the Presentation Tool.
   */
  editAttribute?: string
}

/**
 * Scroll-reveal wrapper mirroring the reference motion layer.
 *
 * An IntersectionObserver adds `is-revealed` when the element enters the
 * viewport. The class is toggled on the DOM node directly — no React state — so
 * a long page of reveals does not trigger extra renders. A failsafe timer
 * reveals everything after 4 seconds, and reduced-motion users see it
 * immediately.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  direction = 'up',
  className = '',
  style,
  editAttribute,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const reveal = () => node.classList.add('is-revealed')

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      reveal()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          reveal()
          observer.disconnect()
        }
      },
      {rootMargin: '0px 0px -70px 0px', threshold: 0.08},
    )

    observer.observe(node)
    const failsafe = window.setTimeout(reveal, 4000)

    return () => {
      observer.disconnect()
      window.clearTimeout(failsafe)
    }
  }, [])

  return (
    <Tag
      ref={ref}
      data-reveal={direction === 'up' ? undefined : direction}
      data-sanity={editAttribute}
      className={`reveal ${className}`.trim()}
      style={{'--reveal-delay': `${delay}ms`, ...style} as CSSProperties}
    >
      {children}
    </Tag>
  )
}
