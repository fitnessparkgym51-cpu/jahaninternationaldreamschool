import type {SVGProps} from 'react'

import {stegaClean} from 'next-sanity'

/**
 * Inline SVG icon set used across the site.
 *
 * Names come from `@/lib/iconNames` (which also drives the Sanity icon picker),
 * so a value chosen in the Studio always renders here. Anything CMS-managed that
 * needs a custom graphic should be an uploaded image, not an icon name.
 */

const OUTLINE: Partial<Record<string, string[]>> = {
  book: [
    'M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4',
  ],
  'book-open': [
    'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  ],
  'monitor-play': [
    'M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z',
  ],
  'shield-check': [
    'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 0 12 2.944a11.955 11.955 0 0 0-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  ],
  sparkle: [
    'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  ],
  smile: [
    'M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  ],
  users: [
    'M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v2z',
  ],
  user: [
    'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z',
  ],
  'graduation-cap': ['M22 10 12 5 2 10l10 5 10-5z', 'M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5'],
  award: [
    'M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z',
    'M8.2 13.9 7 22l5-3 5 3-1.2-8.1',
  ],
  trophy: [
    'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z',
    'M17 5h2a2 2 0 0 1 0 4h-2M7 5H5a2 2 0 0 0 0 4h2',
  ],
  heart: [
    'M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1l8.8 8.8 8.8-8.8a5 5 0 0 0 0-7.1z',
  ],
  palette: [
    'M12 21a9 9 0 1 1 9-9c0 1.66-1.34 3-3 3h-1.5a2.5 2.5 0 0 0-2.5 2.5c0 1.93-1 3.5-2 3.5z',
    'M7.5 11.5h.01M11 8h.01M15 9.5h.01',
  ],
  camera: [
    'M3 8a2 2 0 0 1 2-2h2.5l1.5-2h6l1.5 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z',
    'M12 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  ],
  lightbulb: ['M9 18h6M10 21h4', 'M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .9 1.6h5.2c.1-.6.4-1.2.9-1.6A6 6 0 0 0 12 3z'],
  headset: [
    'M3 14v-2a9 9 0 0 1 18 0v2',
    'M21 16a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2v1zM3 16a2 2 0 0 0 2 2h1v-5H5a2 2 0 0 0-2 2v1z',
  ],
  'file-text': [
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z',
    'M14 2v6h6M9 13h6M9 17h6',
  ],
  mosque: [
    'M12 2c1.9 1.6 3 3.6 3 5.7 0 1.3-1.3 2.3-3 2.3s-3-1-3-2.3C9 5.6 10.1 3.6 12 2z',
    'M3 21v-7.2c0-1.9 1.5-3.4 3.4-3.4h11.2c1.9 0 3.4 1.5 3.4 3.4V21M3 21h18M8 21v-3.5a1.5 1.5 0 0 1 3 0V21M13 21v-3.5a1.5 1.5 0 0 1 3 0V21',
  ],
  ball: [
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
    'M12 3v18M3.6 7.5h16.8M3.6 16.5h16.8M12 3a13.5 13.5 0 0 1 0 18 13.5 13.5 0 0 1 0-18z',
  ],
  clock: [
    'M12 8v4l3 3',
    'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  ],
  globe: [
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
    'M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z',
  ],
  'message-circle': ['M8 10.5h8M8 14h5', 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'],
  calendar: [
    'M8 7V3m8 4V3M4 11h16',
    'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
  ],
  'alert-triangle': [
    'M12 9v4m0 4h.01M5.07 19h13.86a2 2 0 0 0 1.74-3L13.74 4a2 2 0 0 0-3.48 0l-6.93 12a2 2 0 0 0 1.74 3z',
  ],
  phone: [
    'M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z',
  ],
  mobile: ['M12 18h.01', 'M8 21h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z'],
  mail: [
    'M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z',
  ],
  'map-pin': [
    'M17.657 16.657 13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z',
    'M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  ],
  'chevron-down': ['M19 9l-7 7-7-7'],
  'chevron-left': ['M15 19l-7-7 7-7'],
  'chevron-right': ['M9 5l7 7-7 7'],
  'external-link': ['M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14'],
  star: [
    'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8L12 3.5z',
  ],
  pencil: ['M4 20h4L20 8l-4-4L4 16v4z'],
}

const FILLED: Partial<Record<string, string[]>> = {
  whatsapp: [
    'M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z',
  ],
  facebook: [
    'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  ],
  play: ['M5 3l14 9-14 9V3z'],
  pin: [
    'M5.05 4.05a7 7 0 1 1 9.9 9.9L10 18.9l-4.95-4.95a7 7 0 0 1 0-9.9zM10 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  ],
  star: [
    'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8L12 3.5z',
  ],
}

type IconProps = Omit<SVGProps<SVGSVGElement>, 'name'> & {
  /**
   * Icon name from the CMS icon picker. The value is stega-encoded inside Draft
   * Mode, so it is cleaned before being used as a lookup key.
   */
  name?: string | null
  size?: number
}

export function Icon({name, size = 24, className, ...rest}: IconProps) {
  const key = stegaClean(name) as keyof typeof OUTLINE | undefined
  if (!key) return null

  const filled = FILLED[key]
  const paths = filled ?? OUTLINE[key]
  if (!paths) return null

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={filled ? undefined : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
