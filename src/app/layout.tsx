import type { Metadata } from 'next'
import './globals.css'
import { Hepta_Slab } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'

const heptaSlab = Hepta_Slab({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-hepta-slab',
})

const TITLE = 'TD Stuff'
const DESCRIPTION = 'Generative art learning resources'
const IMAGE = '/static/td-logo-wide.jpg'

export function generateMetadata(): Metadata {
  const isProduction = process.env.VERCEL_ENV === 'production'
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_SITE_URL is not set')
  }

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: TITLE,
      template: `%s | ${TITLE}`,
    },
    description: DESCRIPTION,
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    robots: isProduction ? undefined : { index: false, follow: false },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      images: [
        {
          url: IMAGE,
          width: 1200,
          height: 630,
          alt: TITLE,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: TITLE,
      description: DESCRIPTION,
      images: [IMAGE],
    },
    alternates: {
      types: {
        'application/rss+xml': '/reading/feed.xml',
      },
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${heptaSlab.variable} dark`}>
      <head>
        <link
          rel="preconnect"
          href="https://use.typekit.net"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href="https://use.typekit.net/rlo7jqr.css" />
      </head>
      <body className="font-hepta-slab antialiased">
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
      </body>
    </html>
  )
}
