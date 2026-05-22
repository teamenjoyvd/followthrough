'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useTransition } from 'react'

interface SearchInputProps {
  defaultValue: string
  currentStatus: string
  currentLastContacted: string
  currentCompany: string
  currentSort: string
  currentDir: string
}

export function SearchInput({
  defaultValue,
  currentStatus,
  currentLastContacted,
  currentCompany,
  currentSort,
  currentDir,
}: SearchInputProps) {
  const router = useRouter()
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
        const params = new URLSearchParams()
        if (value.trim()) params.set('q', value.trim())
        if (currentStatus) params.set('status', currentStatus)
        if (currentLastContacted) params.set('last_contacted', currentLastContacted)
        if (currentCompany) params.set('company', currentCompany)
        if (currentSort) params.set('sort', currentSort)
        if (currentDir) params.set('dir', currentDir)

        const qs = params.toString()
        router.push(qs ? `/contacts?${qs}` : '/contacts')
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [value, defaultValue, currentStatus, currentLastContacted, currentCompany, currentSort, currentDir, router])

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
