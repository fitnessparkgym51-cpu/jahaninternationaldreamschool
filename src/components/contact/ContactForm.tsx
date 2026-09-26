'use client'

import {stegaClean} from 'next-sanity'
import {useState, type FormEvent} from 'react'

import type {ContactForm as ContactFormData} from '@/sanity/types/contact'

const field =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-jids-green focus:outline-none focus:ring-1 focus:ring-jids-green'
const label = 'mb-1.5 block text-xs font-semibold text-gray-700'

function Req() {
  return <span className="text-jids-orange"> *</span>
}

/** Inquiry form. All wording comes from the Contact page document. */
export function ContactForm({form}: {form: ContactFormData}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const el = e.currentTarget
    if (!el.checkValidity()) {
      el.reportValidity()
      return
    }
    const data = Object.fromEntries(new FormData(el))
    setError('')
    setStatus('sending')
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data),
    }).catch(() => null)
    if (res?.ok) {
      el.reset()
      setStatus('done')
      return
    }
    const body = (await res?.json().catch(() => null)) as {error?: string} | null
    setError(body?.error ?? 'Something went wrong. Please try again.')
    setStatus('idle')
  }

  if (status === 'done') {
    return (
      <div className="rounded-xl border border-jids-green-line bg-jids-green-tint p-8 text-center" role="status">
        <p className="text-lg font-bold text-jids-green">{form.successMessage}</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="contact-name">
            {form.nameLabel}
            <Req />
          </label>
          <input
            id="contact-name"
            name="name"
            required
            maxLength={100}
            placeholder={stegaClean(form.namePlaceholder) ?? ''}
            className={field}
          />
        </div>
        <div>
          <label className={label} htmlFor="contact-whatsapp">
            {form.whatsappLabel}
            <Req />
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="mr-1.5 text-base" aria-hidden="true">
                🇧🇩
              </span>
              <span className="border-r border-gray-300 pr-2 text-xs font-medium text-gray-500">
                {form.whatsappPrefix}
              </span>
            </div>
            <input
              id="contact-whatsapp"
              name="whatsapp"
              type="tel"
              required
              maxLength={20}
              pattern="[0-9+\-\s]{6,20}"
              placeholder={stegaClean(form.whatsappPlaceholder) ?? ''}
              className={`${field} pl-24`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="contact-age">
            {form.ageLabel}
            <Req />
          </label>
          <select id="contact-age" name="childAge" required defaultValue="" className={`${field} text-gray-600`}>
            <option value="" disabled>
              {stegaClean(form.agePlaceholder)}
            </option>
            {(form.ageOptions ?? []).map((option) => (
              <option key={option} value={stegaClean(option)}>
                {stegaClean(option)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="contact-class">
            {form.classLabel}
            <Req />
          </label>
          <select id="contact-class" name="classInterested" required defaultValue="" className={`${field} text-gray-600`}>
            <option value="" disabled>
              {stegaClean(form.classPlaceholder)}
            </option>
            {(form.classOptions ?? []).map((option) => (
              <option key={option} value={stegaClean(option)}>
                {stegaClean(option)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label} htmlFor="contact-message">
          {form.messageLabel}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          maxLength={2000}
          placeholder={stegaClean(form.messagePlaceholder) ?? ''}
          className={`${field} p-3`}
        />
      </div>

      {/* Honeypot: hidden from people, filled by bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <label className="inline-flex cursor-pointer select-none items-center gap-3 rounded-md border border-gray-300 bg-gray-50/80 p-3.5">
        <input type="checkbox" name="human" required className="h-5 w-5 rounded border-gray-300 accent-jids-green" />
        <span className="text-sm font-medium text-gray-700">{form.robotLabel}</span>
      </label>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-lg bg-jids-green px-6 py-3.5 text-base font-bold text-white shadow transition hover:bg-jids-green-deep disabled:opacity-60"
      >
        {status === 'sending' ? '…' : form.submitLabel}
      </button>
    </form>
  )
}
