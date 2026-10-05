'use client'

import {useCallback, useEffect, useState} from 'react'

import {Icon} from '@/components/ui/Icon'

export type Lang = 'en' | 'bn'

const COOKIE = 'googtrans'
const SCRIPT_ID = 'google-translate-script'

function readLang(): Lang {
  if (typeof document === 'undefined') return 'en'
  return /googtrans=\/(en|auto)\/bn/i.test(document.cookie) ? 'bn' : 'en'
}

function writeLang(lang: Lang) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return
  const host = window.location.hostname
  const expire = 'expires=Thu, 01 Jan 1970 00:00:00 GMT'

  const domains = ['', `; domain=${host}`, `; domain=.${host}`]
  const parts = host.split('.')
  if (parts.length > 2) {
    domains.push(`; domain=.${parts.slice(-2).join('.')}`)
  }

  for (const domain of domains) {
    document.cookie = `${COOKIE}=; path=/; ${expire}${domain}`
    document.cookie = `${COOKIE}=; path=/; ${expire}`
  }

  if (lang === 'bn') {
    document.cookie = `${COOKIE}=/en/bn; path=/`
    document.cookie = `${COOKIE}=/auto/bn; path=/`
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      document.cookie = `${COOKIE}=/en/bn; path=/; domain=.${host}`
      document.cookie = `${COOKIE}=/auto/bn; path=/; domain=.${host}`
    }
  } else {
    document.cookie = `${COOKIE}=/en/en; path=/`
  }
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    google?: {
      translate: {
        TranslateElement: new (
          opts: {
            pageLanguage: string
            includedLanguages?: string
            autoDisplay?: boolean
          },
          elementId: string,
        ) => unknown
      }
    }
  }
}

function ensureGoogleTranslateMount() {
  if (typeof document === 'undefined') return
  if (!document.getElementById('google_translate_element')) {
    const el = document.createElement('div')
    el.id = 'google_translate_element'
    el.className = 'notranslate pointer-events-none fixed -top-[9999px] left-0 h-px w-px overflow-hidden opacity-0'
    el.setAttribute('aria-hidden', 'true')
    document.body.appendChild(el)
  }
}

function initGoogleTranslate() {
  if (typeof document === 'undefined' || document.getElementById(SCRIPT_ID)) return
  ensureGoogleTranslateMount()

  window.googleTranslateElementInit = () => {
    try {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'bn,en',
            autoDisplay: false,
          },
          'google_translate_element',
        )
      }
    } catch {
      // Ignore if blocked or network error
    }
  }

  const script = document.createElement('script')
  script.id = SCRIPT_ID
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
  script.async = true
  document.body.appendChild(script)
}

type LanguageToggleProps = {
  /**
   * - 'topbar': Sleek pill button for desktop top announcement strip.
   * - 'phone': Converting button for mobile sticky header.
   * - 'drawer': Button inside mobile navigation drawer.
   */
  variant?: 'topbar' | 'phone' | 'drawer'
  className?: string
}

/**
 * English <-> Bangla switch.
 * Machine-translates whatever Sanity rendered, so no content is duplicated in code.
 * Disabled inside the Presentation Tool iframe to protect click-to-edit stega metadata.
 */
export function LanguageToggle({variant = 'topbar', className = ''}: LanguageToggleProps) {
  const [lang, setLang] = useState<Lang>('en')
  const [inIframe, setInIframe] = useState(false)

  useEffect(() => {
    if (window.self !== window.top) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- only knowable after mount
      setInIframe(true)
      return
    }

    const current = readLang()
    setLang(current)

    if (current === 'bn') {
      initGoogleTranslate()
    }

    const handleSync = () => setLang(readLang())
    window.addEventListener('jids-lang-change', handleSync)
    return () => window.removeEventListener('jids-lang-change', handleSync)
  }, [])

  const toggle = useCallback(() => {
    const nextLang: Lang = lang === 'bn' ? 'en' : 'bn'
    writeLang(nextLang)
    setLang(nextLang)
    window.dispatchEvent(new CustomEvent('jids-lang-change'))

    const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo')
    if (combo) {
      combo.value = nextLang === 'bn' ? 'bn' : ''
      combo.dispatchEvent(new Event('change'))
    }

    window.location.reload()
  }, [lang])

  if (inIframe) return null

  if (variant === 'phone') {
    return (
      <button
        type="button"
        onClick={toggle}
        translate="no"
        className={`notranslate flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-all shadow-xs ${
          lang === 'bn'
            ? 'border border-jids-green bg-jids-green text-white hover:bg-jids-green-deep'
            : 'border border-jids-green/25 bg-jids-green-soft text-jids-green hover:bg-jids-green hover:text-white'
        } ${className}`.trim()}
        aria-label={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
        title={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
      >
        <Icon name="globe" size={13} className="shrink-0" />
        <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
      </button>
    )
  }

  if (variant === 'drawer') {
    return (
      <button
        type="button"
        onClick={toggle}
        translate="no"
        className={`notranslate flex items-center gap-1.5 rounded-full border border-jids-green/20 bg-jids-green-soft px-3.5 py-1 text-xs font-bold text-jids-green transition-all hover:bg-jids-green hover:text-white ${className}`.trim()}
        aria-label={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
      >
        <Icon name="globe" size={13} className="shrink-0" />
        <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
      </button>
    )
  }

  return (
    <>
      <div
        id="google_translate_element"
        className="notranslate pointer-events-none fixed -top-[9999px] left-0 h-px w-px overflow-hidden opacity-0"
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={toggle}
        translate="no"
        className={`notranslate flex items-center gap-1 rounded-full border border-white/40 bg-white/10 px-3 py-0.5 text-xs font-semibold text-white transition-all hover:bg-white hover:text-jids-green-top ${className}`.trim()}
        aria-label={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
      >
        <Icon name="globe" size={13} className="shrink-0 text-white/80" />
        <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
      </button>
    </>
  )
}
