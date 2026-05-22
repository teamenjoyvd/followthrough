'use client'

import * as React from 'react'

interface UserAvatarProps {
  avatarUrl: string | null
  name: string
  className?: string
}

export function UserAvatar({ avatarUrl, name, className = 'w-10 h-10' }: UserAvatarProps) {
  const trimmedName = name.trim() || 'User'
  const initial = trimmedName.charAt(0).toUpperCase()

  if (avatarUrl) {
    return (
      <img
        alt="User Profile"
        className={`${className} rounded-full border-2 border-[#c8e8d0] shadow-sm object-cover`}
        src={avatarUrl}
      />
    )
  }

  return (
    <div
      className={`${className} rounded-full border-2 border-[#c8e8d0] shadow-sm bg-[#4a7c59] flex items-center justify-center`}
      role="img"
      aria-label={trimmedName}
    >
      <span className="text-white text-sm font-bold font-headline">
        {initial}
      </span>
    </div>
  )
}
