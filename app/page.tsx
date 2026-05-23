import Link from 'next/link'
import { ArrowRight, Users, History, RefreshCw, CheckCircle2 } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { branding } from '@/config/branding'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf6f0] text-[#2e3230] font-body selection:bg-[#4a7c59]/10 selection:text-[#4a7c59]">
      {/* Navigation Header */}
      <header className="w-full border-b border-[#e4e0d8] bg-[#faf6f0] px-4 md:px-8 py-4 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              id="nav-sign-in"
              className="text-sm font-semibold text-[#4a4e4a] hover:text-[#4a7c59] transition-colors duration-200"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              id="nav-sign-up"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#4a7c59] text-white text-sm font-semibold hover:bg-[#3d6b4a] transition-all duration-200 hover:scale-[1.02] shadow-sm"
            >
              Start tracking
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col justify-center px-4 md:px-8 py-12 md:py-20 max-w-7xl mx-auto w-full gap-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#c4a66a]/30 bg-[#f8e0a8]/20 text-[#554020] text-xs font-semibold">
              <span>Cozy Relationship Manager</span>
            </div>
            
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold text-[#2e3230] leading-[1.1] tracking-tight">
              Stay connected with the people who <span className="text-[#4a7c59] italic">matter most</span>.
            </h1>
            
            <p className="text-base md:text-lg text-[#4a4e4a] leading-relaxed max-w-xl">
              {branding.appDescription} Followthrough simplifies keeping in touch, tracking outcomes, and maintaining consistent connection patterns.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-[#4a7c59] shrink-0 mt-0.5" />
                <p className="text-sm text-[#4a4e4a] font-medium">
                  <strong>Relationship Health Ring:</strong> Automated intervals prompt you when someone is overdue for a check-in.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-[#4a7c59] shrink-0 mt-0.5" />
                <p className="text-sm text-[#4a4e4a] font-medium">
                  <strong>Smart Interactions Timeline:</strong> Keep chronological logged records of calls, emails, and personal notes.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-[#4a7c59] shrink-0 mt-0.5" />
                <p className="text-sm text-[#4a4e4a] font-medium">
                  <strong>Real-time Google Sync:</strong> Seamlessly aggregate, filter, and resolve your contacts conflict-free.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/sign-up"
                id="hero-cta-signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#4a7c59] text-white font-semibold hover:bg-[#3d6b4a] transition-all duration-200 hover:scale-[1.02] shadow-[0_4px_20px_rgba(74,124,89,0.15)] group"
              >
                Get Started for Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/dashboard"
                id="hero-cta-dashboard"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#eae6de] text-[#4a7c59] font-semibold hover:bg-[#dedad2] transition-all duration-200 hover:scale-[1.02] shadow-sm"
              >
                Access Dashboard
              </Link>
            </div>
          </div>

          {/* Decorative Preview / Hero Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm p-6 rounded-[20px] border border-[#e4e0d8] bg-[#f5f1ea] shadow-[0_8px_30px_rgba(46,50,48,0.06)] space-y-6 hover:scale-[1.01] transition-transform duration-300">
              <div className="flex items-center justify-between border-b border-[#e4e0d8] pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-[#4a7c59]/10 text-[#4a7c59] flex items-center justify-center font-bold">
                    JD
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#2e3230]">Jane Doe</h3>
                    <p className="text-xs text-[#74796e]">Acme Corporation</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-blue-100 text-blue-800 border-blue-200">
                  Lead
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#74796e] font-semibold uppercase tracking-wider">Relationship Health</span>
                  <span className="text-[#4a7c59] font-bold">Needs attention</span>
                </div>
                {/* Health indicator bar */}
                <div className="w-full bg-[#eae6de] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#b83230] h-full w-[35%] rounded-full animate-pulse" />
                </div>
                <p className="text-[11px] text-[#74796e]">
                  Last contacted 18 days ago. Follow-up rule interval is 14 days.
                </p>
              </div>

              <div className="pt-2 border-t border-[#e4e0d8] flex items-center justify-between">
                <span className="text-xs text-[#4a4e4a] font-semibold">Active Focus List</span>
                <span className="h-4.5 w-8 rounded-full bg-[#4a7c59]/10 text-[#4a7c59] flex items-center justify-center text-[10px] font-bold">ON</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Value Pillars */}
        <section className="space-y-8 pt-8 border-t border-[#e4e0d8]">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-headline text-3xl font-bold text-[#2e3230] tracking-tight">
              Designed for Intentional Connection
            </h2>
            <p className="text-sm text-[#74796e]">
              A beautiful design system built with the warm, organic palette of the Terra theme.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Health Card */}
            <div className="p-6 rounded-[20px] border border-[#e4e0d8] bg-[#f5f1ea] shadow-[0_4px_20px_rgba(46,50,48,0.03)] space-y-4 hover:bg-[#eae6de] transition-colors duration-200">
              <div className="h-10 w-10 rounded-full bg-[#4a7c59]/10 text-[#4a7c59] flex items-center justify-center shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-headline text-lg font-bold text-[#2e3230]">Relationship Health</h3>
              <p className="text-sm text-[#4a4e4a] leading-relaxed">
                Color-coded health summaries show you instantly who is in good standing and who is overdue for a check-in based on custom pipeline intervals.
              </p>
            </div>

            {/* Timeline Card */}
            <div className="p-6 rounded-[20px] border border-[#e4e0d8] bg-[#f5f1ea] shadow-[0_4px_20px_rgba(46,50,48,0.03)] space-y-4 hover:bg-[#eae6de] transition-colors duration-200">
              <div className="h-10 w-10 rounded-full bg-[#f8e0a8]/30 text-[#554020] flex items-center justify-center shrink-0">
                <History className="h-5 w-5 text-[#c4a66a]" />
              </div>
              <h3 className="font-headline text-lg font-bold text-[#2e3230]">Smart Timelines</h3>
              <p className="text-sm text-[#4a4e4a] leading-relaxed">
                Keep an interactive chronological record of every interaction. Log detailed email outlines, phone call outcomes, and personal notes.
              </p>
            </div>

            {/* Sync Card */}
            <div className="p-6 rounded-[20px] border border-[#e4e0d8] bg-[#f5f1ea] shadow-[0_4px_20px_rgba(46,50,48,0.03)] space-y-4 hover:bg-[#eae6de] transition-colors duration-200">
              <div className="h-10 w-10 rounded-full bg-[#4a7c59]/10 text-[#4a7c59] flex items-center justify-center shrink-0">
                <RefreshCw className="h-5 w-5" />
              </div>
              <h3 className="font-headline text-lg font-bold text-[#2e3230]">Google Sync Engine</h3>
              <p className="text-sm text-[#4a4e4a] leading-relaxed">
                Continuously pulls contacts from Google, identifies field conflicts (such as numbers or job descriptions), and lets you resolve differences dynamically.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Branding */}
      <footer className="w-full border-t border-[#e4e0d8] bg-[#f5f1ea] px-4 md:px-8 py-8 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <Logo iconOnly={true} className="opacity-80" />
            <p className="text-xs text-[#74796e] mt-1 text-center md:text-left">
              © {new Date().getFullYear()} {branding.appName}. All rights reserved.
            </p>
          </div>
          <p className="text-xs text-[#74796e] text-center md:text-right">
            Stay connected on <a href={branding.supportUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#4a7c59] hover:underline">GitHub</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
