import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { branding } from '@/config/branding'

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body selection:bg-primary/10 selection:text-primary">
      {/* Navigation Header */}
      <header className="w-full border-b border-terra-surface-container-highest bg-background px-4 md:px-8 py-4 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              id="nav-sign-in"
              className="text-sm font-semibold text-terra-on-surface-variant hover:text-primary transition-colors duration-200"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              id="nav-sign-up"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] shadow-sm"
            >
              Start tracking
            </Link>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-terra-surface-container-highest bg-terra-surface-container-low px-4 md:px-8 py-8 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <Logo iconOnly={true} className="opacity-80" />
            <p className="text-xs text-terra-outline mt-1 text-center md:text-left">
              © {new Date().getFullYear()} {branding.appName}. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-2">
            <Link href="/privacy" className="text-xs text-terra-outline font-semibold hover:text-primary hover:underline transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-terra-outline font-semibold hover:text-primary hover:underline transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="/cookies" className="text-xs text-terra-outline font-semibold hover:text-primary hover:underline transition-colors">
              Cookie Policy
            </Link>
            <a
              href={branding.supportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-primary hover:underline"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
