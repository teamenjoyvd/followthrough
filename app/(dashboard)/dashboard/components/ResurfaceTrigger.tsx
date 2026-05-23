'use client'

import { useEffect } from 'react'
import { checkResurfaced } from '@/lib/actions/snooze'

export default function ResurfaceTrigger() {
  useEffect(() => {
    // Run the resurfacing check in the background after the dashboard paints.
    // This completely removes render-blocking write latency from the server path!
    checkResurfaced().catch((err) => {
      console.error('[ResurfaceTrigger] Background checkResurfaced failed:', err)
    })
  }, [])

  return null
}
