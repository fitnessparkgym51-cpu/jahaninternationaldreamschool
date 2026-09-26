'use client'

import {useEffect, useState} from 'react'

type Lang = 'en' | 'bn'

const COOKIE = 'googtrans'
const SCRIPT_ID = 'google-translate-script'

function readLang(): Lang {
  return /googtrans=\/en\/bn/.test(document.cookie) ? 'bn' : 'en'
}

function writeLang(lang: Lang) {
  const host = window.location.hostname
  const expire = 'expires=Thu, 01 Jan 1970 00:00:00 GMT'
  // Clear on both the bare host and the parent domain — Google may set either.
  for (const domain of ['', `; domain=${host}`, `; domain=.${host}`]) {
    document.cookie = `${COOKIE}=; path=/; ${expire}${domain}`
  }
  if (lang === 'bn') document.cookie = `${COOKIE}=/en/bn; path=/`
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    google?: {translate: {TranslateElement: new (opts: object, id: string) => unknown}}
  }
}

/**
 * English ⇄ Bangla switch. Machine-translates whatever Sanity rendered, so no
 * content is duplicated in code. Disabled inside the Presentation Tool iframe:
 * translation rewrites text nodes and would strip the stega encoding that
 * click-to-edit relies on.
 */
export function LanguageToggle() {
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
    if (current !== 'bn' || document.getElementById(SCRIPT_ID)) return

    window.googleTranslateElementInit = () => {
      new window.google!.translate.TranslateElement(
        {pageLanguage: 'en', includedLanguages: 'bn', autoDisplay: false},
        'google_translate_element',
      )
    }
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    script.async = true
    document.body.appendChild(script)
  }, [])

  if (inIframe) return null

  const toggle = () => {
    writeLang(lang === 'bn' ? 'en' : 'bn')
    window.location.reload()
  }

  return (
    <>
      <div id="google_translate_element" hidden />
      <button
        type="button"
        onClick={toggle}
        translate="no"
        className="notranslate rounded-full border border-white/40 px-3 py-0.5 text-xs font-semibold transition-colors hover:bg-white hover:text-jids-green-top"
        aria-label={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
      >
        {lang === 'bn' ? 'English' : 'বাংলা'}
      </button>
    </>
  )
}
