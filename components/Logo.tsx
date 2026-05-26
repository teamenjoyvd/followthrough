import Image from 'next/image'
import { branding } from '@/config/branding'

interface LogoProps {
  className?: string
  iconOnly?: boolean
}

export function Logo({ className = '', iconOnly = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 font-semibold select-none group ${className}`}>
      {/* Logo container — aspect matches brand mark (~1.83:1) */}
      <div className="relative flex items-center justify-center h-7 w-[52px] transition-all duration-300 group-hover:scale-105">
        <Image
          src={branding.logoPath}
          alt={branding.appName}
          width={52}
          height={28}
          className="h-7 w-auto object-contain transition-all duration-300"
          priority
        />
      </div>

      {!iconOnly && (
        <span className="font-headline text-lg tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary">
          {branding.appName}
        </span>
      )}
    </div>
  )
}
