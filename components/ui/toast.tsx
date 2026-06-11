'use client'

import React, { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

type ToastListener = (toast: ToastMessage) => void
const listeners = new Set<ToastListener>()

export const toast = (message: string, type: ToastType = 'success') => {
  let id: string
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    id = crypto.randomUUID()
  } else {
    id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
  }
  listeners.forEach((listener) => listener({ id, message, type }))
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const timeoutsRef = React.useRef<Map<string, any>>(new Map())

  useEffect(() => {
    const handleToast = (newToast: ToastMessage) => {
      setToasts((prev) => [...prev, newToast])
      const timeoutId = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id))
        timeoutsRef.current.delete(newToast.id)
      }, 4000)
      timeoutsRef.current.set(newToast.id, timeoutId)
    }

    listeners.add(handleToast)
    return () => {
      listeners.delete(handleToast)
      timeoutsRef.current.forEach((tid) => clearTimeout(tid))
      timeoutsRef.current.clear()
    }
  }, [])

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id))
    const tid = timeoutsRef.current.get(id)
    if (tid) {
      clearTimeout(tid)
      timeoutsRef.current.delete(id)
    }
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-[calc(100%-32px)] sm:max-w-sm pointer-events-none">
      {toasts.map((t) => {
        const Icon = t.type === 'error' ? AlertCircle : t.type === 'info' ? Info : CheckCircle
        const bgColor = t.type === 'error' ? 'bg-[#b83230]' : 'bg-[#4a7c59]'

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg text-white ${bgColor} animate-in slide-in-from-bottom-5 fade-in duration-250 font-body text-xs font-semibold`}
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 shrink-0" />
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => handleDismiss(t.id)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
