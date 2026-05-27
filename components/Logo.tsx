import { GitBranch } from 'lucide-react'
import { branding } from '@/config/branding'

interface LogoProps {
  className?: string
  iconOnly?: boolean
}

export function Logo({ className = '', iconOnly = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 font-semibold select-none group ${className}`}>
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-105"
        style={{ background: branding.primaryColor }}
      >
        <GitBranch size={16} color="white" strokeWidth={2.5} />
      </div>

      {!iconOnly && (
        <span className="font-headline text-lg tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary">
          {branding.appName}
        </span>
      )}
    </div>
  )
}
