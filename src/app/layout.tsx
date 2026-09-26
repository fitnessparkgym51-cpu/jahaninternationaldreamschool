import type {Metadata} from 'next'
import {Geist_Mono, Plus_Jakarta_Sans} from 'next/font/google'

import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Jahan International Dream School',
    template: '%s | Jahan International Dream School',
  },
  description:
    'Jahan International Dream School (J.I.D.S.) — an inclusive bilingual primary school in Mohammadpur, Dhaka.',
}

export default function RootLayout({children}: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakarta.variable} ${geistMono.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  )
}
