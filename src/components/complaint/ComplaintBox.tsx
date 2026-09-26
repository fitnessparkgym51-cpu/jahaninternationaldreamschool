'use client'

import {useState, type FormEvent} from 'react'

/** Reusable anonymous complaint form. Collects only Topic + Complaint. */
export function ComplaintBox() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const topic = String(form.get('topic') ?? '').trim()
    const complaint = String(form.get('complaint') ?? '').trim()
    if (!topic || !complaint) {
      setError('Please enter a topic and your complaint.')
      return
    }
    setError('')
    setStatus('sending')
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({topic, complaint, website: form.get('website')}),
    }).catch(() => null)
    if (res?.ok) {
      setStatus('done')
      return
    }
    const data = (await res?.json().catch(() => null)) as {error?: string} | null
    setError(data?.error ?? 'Something went wrong. Please try again.')
    setStatus('idle')
  }

  if (status === 'done') {
    return (
      <div className="rounded-xl border border-jids-green-line bg-jids-green-tint p-8 text-center" role="status">
        <p className="text-lg font-bold text-jids-green">
          Thank you. Your complaint has been submitted anonymously.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 rounded border-2 border-jids-green px-8 py-2.5 text-sm font-bold text-jids-green transition hover:bg-jids-green hover:text-white"
        >
          Submit another
        </button>
      </div>
    )
  }

  const field =
    'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-jids-green focus:outline-none focus:ring-1 focus:ring-jids-green'

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-6 rounded-xl border border-jids-card-line bg-white p-6 shadow-sm sm:p-8"
    >
      <div>
        <label htmlFor="complaint-topic" className="mb-1.5 block text-xs font-semibold text-gray-700">
          Topic *
        </label>
        <input id="complaint-topic" name="topic" required maxLength={120} className={field} />
      </div>
      <div>
        <label htmlFor="complaint-body" className="mb-1.5 block text-xs font-semibold text-gray-700">
          Complaint *
        </label>
        <textarea id="complaint-body" name="complaint" required maxLength={2000} rows={7} className={field} />
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-lg bg-jids-green px-6 py-3.5 text-sm font-bold text-white shadow transition hover:bg-jids-green-deep disabled:opacity-60"
      >
        {status === 'sending' ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  )
}
