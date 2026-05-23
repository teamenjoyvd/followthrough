'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect, useTransition } from 'react'

interface SearchInputProps {
  defaultValue: string
}

export function SearchInput({
  defaultValue,
}: SearchInputProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [value, setValue] = useState(defaultValue)
  const [isPending, startTransition] = useTransition()

  // Sync internal input value if external defaultValue changes (e.g. from general reset)
  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  useEffect(() => {
    if (value === defaultValue) return

    const timer = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        const trimmed = value.trim()
        if (trimmed) {
          params.set('q', trimmed)
        } else {
          params.delete('q')
        }
        params.delete('page') // Reset page index back to 1 when search query changes

        const qs = params.toString()
        router.replace(qs ? `${pathname}?${qs}` : pathname)
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [value, defaultValue, searchParams, pathname, router])

  return (
    <div className="relative w-full md:max-w-sm">
      <input
        id="contact-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search contacts…"
        className="w-full px-3.5 py-2 text-sm border border-[#e4e0d8] rounded-xl bg-[#f5f1ea] placeholder-[#74796e] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all"
      />
      {isPending && (
        <span className="absolute right-3.5 top-2.5 flex h-4 w-4 animate-spin rounded-full border-2 border-[#4a7c59] border-t-transparent" />
      )}
    </div>
  )
}
