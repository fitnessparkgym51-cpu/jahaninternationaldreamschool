import Link from 'next/link'
import {stegaClean} from 'next-sanity'
import type {ReactNode} from 'react'

import type {UiButton} from '@/components/ui/types'

const EXTERNAL_PREFIXES = ['http://', 'https://', 'tel:', 'mailto:', '//']

export function isExternalUrl(url: string): boolean {
  return EXTERNAL_PREFIXES.some((prefix) => url.startsWith(prefix))
}

type SmartLinkProps = {
  /**
   * Destination. Typed as nullable because a GROQ projection of a CMS `url`
   * field is `string | null` even when the schema marks it required — a document
   * written before the rule was added can still hold null. An empty value
   * renders nothing, so a half-finished link never becomes a broken anchor.
   */
  url?: string | null
  newTab?: boolean | null
  className?: string
  children: ReactNode
  onClick?: () => void
  /**
   * `data-sanity` value pointing at a specific field, used for click-to-edit.
   * The *label* is normally stega-encoded and therefore already click-to-edit;
   * this is what makes the rest of the link (its URL) clickable.
   */
  editAttribute?: string
  'aria-label'?: string
}

/**
 * Renders a CMS link: `next/link` for internal routes, `<a>` for everything else.
 *
 * The URL is stega-cleaned before it reaches the DOM ï¿½?" invisible characters in
 * an `href` would break navigation and can leak into analytics and referrers.
 * The visible label is left encoded, because that is what makes the label
 * click-to-edit inside the Presentation Tool.
 */
export function SmartLink({
  url,
  newTab,
  className,
  children,
  editAttribute,
  ...rest
}: SmartLinkProps) {
  const raw = url?.trim()
  if (!raw) return null

  const href = stegaClean(raw)
  if (!href) return null

  const dataSanity = editAttribute ? {'data-sanity': editAttribute} : {}

  if (isExternalUrl(href) || newTab) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        {...dataSanity}
        {...rest}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className} {...dataSanity} {...rest}>
      {children}
    </Link>
  )
}

const VARIANT_CLASSES: Record<string, string> = {
  primary:
    'bg-jids-orange hover:bg-jids-orange-dark text-white shadow-md hover:shadow-lg',
  green: 'bg-jids-green hover:bg-jids-green-deep text-white shadow-md hover:shadow-lg',
  outline:
    'border-2 border-jids-green text-jids-green hover:bg-jids-green hover:text-white',
  light: 'border-2 border-white/80 hover:bg-white/10 text-white',
  // Solid white border that fills on hover, used on the coloured closing band.
  invert: 'border-2 border-white text-white hover:bg-white hover:text-jids-orange',
  white: 'bg-white text-gray-900 hover:bg-gray-100 shadow',
  link: 'px-1 py-1 text-jids-green underline-offset-4 hover:underline',
}

type VariantName = keyof typeof VARIANT_CLASSES

export type ButtonLinkProps = {
  button?: UiButton | null
  /**
   * `data-sanity` value for the button's URL field. The label stays stega-encoded
   * so clicking the text edits the label, while clicking the button itself edits
   * the URL. Pass the whole button object to open label, URL and style together.
   */
  editAttribute?: string
  /** Overrides the style chosen in Sanity. */
  variant?: VariantName
  className?: string
  children?: ReactNode
  icon?: ReactNode
}

/** Renders a CMS button. Falls back to a plain link when the style is unknown. */
export function ButtonLink({
  button,
  editAttribute,
  variant,
  className = '',
  children,
  icon,
}: ButtonLinkProps) {
  if (!button?.label || !button.url) return null

  // stega encodes the style value too, and it is used as a lookup key here.
  const style = variant ?? (stegaClean(button.variant) as VariantName | null) ?? 'primary'
  const classes = [
    'btn-shine btn-press inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition duration-200',
    VARIANT_CLASSES[style] ?? VARIANT_CLASSES.primary,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <SmartLink
      url={button.url}
      newTab={button.newTab}
      editAttribute={editAttribute}
      className={classes}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      {children ?? button.label}
    </SmartLink>
  )
}
