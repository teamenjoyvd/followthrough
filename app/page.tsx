import Link from 'next/link'
import { ArrowRight, Users, History, RefreshCw, CheckCircle2 } from 'lucide-react'
import { MarketingShell } from '@/components/marketing/MarketingShell'
import { branding } from '@/config/branding'

export default function HomePage() {
  return (
    <MarketingShell>
      <div className="flex flex-col px-4 md:px-8 py-12 md:py-20 max-w-7xl mx-auto w-full gap-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-terra-tertiary-container/30 bg-terra-tertiary-fixed/20 text-terra-on-tertiary-container text-xs font-semibold">
              <span>Cozy Relationship Manager</span>
            </div>

            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
              Stay connected with the people who <span className="text-primary italic">matter most</span>.
            </h1>

            <p className="text-base md:text-lg text-terra-on-surface-variant leading-relaxed max-w-xl">
              {branding.appDescription} Followthrough simplifies keeping in touch, tracking outcomes, and maintaining consistent connection patterns.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-terra-on-surface-variant font-medium">
                  <strong>Relationship Health Ring:</strong> Automated intervals prompt you when someone is overdue for a check-in.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-terra-on-surface-variant font-medium">
                  <strong>Smart Interactions Timeline:</strong> Keep chronological logged records of calls, emails, and personal notes.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-terra-on-surface-variant font-medium">
                  <strong>Real-time Google Sync:</strong> Seamlessly aggregate, filter, and resolve your contacts conflict-free.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/sign-up"
                id="hero-cta-signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] shadow-[0_4px_20px_rgba(74,124,89,0.15)] group"
              >
                Get Started for Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/workspace"
                id="hero-cta-workspace"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-terra-surface-container-high text-primary font-semibold hover:bg-terra-surface-container-highest transition-all duration-200 hover:scale-[1.02] shadow-sm"
              >
                Access Workspace
              </Link>
            </div>
          </div>

          {/* Decorative Preview / Hero Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm p-6 rounded-2xl border border-terra-surface-container-highest bg-terra-surface-container-low shadow-[0_8px_30px_rgba(46,50,48,0.06)] space-y-6 hover:scale-[1.01] transition-transform duration-300">
              <div className="flex items-center justify-between border-b border-terra-surface-container-highest pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    JD
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Jane Doe</h3>
                    <p className="text-xs text-terra-outline">Acme Corporation</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-blue-100 text-blue-800 border-blue-200">
                  Lead
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-terra-outline font-semibold uppercase tracking-wider">Relationship Health</span>
                  <span className="text-primary font-bold">Needs attention</span>
                </div>
                <div className="w-full bg-terra-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-destructive h-full w-[35%] rounded-full animate-pulse" />
                </div>
                <p className="text-[11px] text-terra-outline">
                  Last contacted 18 days ago. Follow-up rule interval is 14 days.
                </p>
              </div>

              <div className="pt-2 border-t border-terra-surface-container-highest flex items-center justify-between">
                <span className="text-xs text-terra-on-surface-variant font-semibold">Active Focus List</span>
                <span className="h-4 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">ON</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Value Pillars */}
        <section className="space-y-8 pt-8 border-t border-terra-surface-container-highest">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-headline text-3xl font-bold text-foreground tracking-tight">
              Designed for Intentional Connection
            </h2>
            <p className="text-sm text-terra-outline">
              A beautiful design system built with the warm, organic palette of the Terra theme.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-terra-surface-container-highest bg-terra-surface-container-low shadow-[0_4px_20px_rgba(46,50,48,0.03)] space-y-4 hover:bg-terra-surface-container-high transition-colors duration-200">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-headline text-lg font-bold text-foreground">Relationship Health</h3>
              <p className="text-sm text-terra-on-surface-variant leading-relaxed">
                Color-coded health summaries show you instantly who is in good standing and who is overdue for a check-in based on custom pipeline intervals.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-terra-surface-container-highest bg-terra-surface-container-low shadow-[0_4px_20px_rgba(46,50,48,0.03)] space-y-4 hover:bg-terra-surface-container-high transition-colors duration-200">
              <div className="h-10 w-10 rounded-full bg-terra-tertiary-fixed/30 text-terra-on-tertiary-container flex items-center justify-center shrink-0">
                <History className="h-5 w-5 text-terra-tertiary-container" />
              </div>
              <h3 className="font-headline text-lg font-bold text-foreground">Smart Timelines</h3>
              <p className="text-sm text-terra-on-surface-variant leading-relaxed">
                Keep an interactive chronological record of every interaction. Log detailed email outlines, phone call outcomes, and personal notes.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-terra-surface-container-highest bg-terra-surface-container-low shadow-[0_4px_20px_rgba(46,50,48,0.03)] space-y-4 hover:bg-terra-surface-container-high transition-colors duration-200">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <RefreshCw className="h-5 w-5" />
              </div>
              <h3 className="font-headline text-lg font-bold text-foreground">Google Sync Engine</h3>
              <p className="text-sm text-terra-on-surface-variant leading-relaxed">
                Continuously pulls contacts from Google, identifies field conflicts (such as numbers or job descriptions), and lets you resolve differences dynamically.
              </p>
            </div>
          </div>
        </section>
      </div>
    </MarketingShell>
  )
}
