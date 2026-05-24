import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Literata, Nunito_Sans } from 'next/font/google'
import { branding } from '@/config/branding'
import { InjectBrandingStyles } from '@/components/InjectBrandingStyles'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'

const literata = Literata({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-literata',
  display: 'swap',
})

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-nunito-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: branding.appName,
  description: 'Contact follow-up, done right.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${literata.variable} ${nunitoSans.variable}`}>
        <head>
          <InjectBrandingStyles />
        </head>
        <body>
          <TooltipProvider delayDuration={300}>
            {children}
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
