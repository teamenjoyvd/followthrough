import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="flex flex-col items-center mb-8 gap-4 text-center">
        <Logo className="scale-125 md:scale-150 mb-4 gap-4" />
        <p className="text-muted-foreground max-w-md font-body">
          Contact follow-up, done right. Stay connected with the people who matter most.
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/sign-in"
          className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/95 transition-all duration-200 shadow-sm"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="px-6 py-2.5 border border-border bg-card text-foreground font-semibold rounded-lg hover:bg-muted transition-all duration-200 shadow-sm"
        >
          Sign up
        </Link>
      </div>
    </main>
  )
}

