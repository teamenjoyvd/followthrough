import Image from 'next/image'
import { branding } from '@/config/branding'

interface LogoProps {
  className?: string
  iconOnly?: boolean
}

export function Logo({ className = '', iconOnly = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 font-semibold select-none group ${className}`}>
      {/* Dynamic premium logo container */}
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/20">
        <Image
          src={branding.logoPath}
          alt={branding.appName}
          width={24}
          height={24}
          className="w-6 h-6 object-contain filter transition-all duration-300"
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
