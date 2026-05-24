'use client'

import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-[#faf6f0] group-[.toaster]:text-[#2e3230] group-[.toaster]:border-[#e4e0d8] group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl',
          description: 'group-[.toast]:text-[#74796e]',
          actionButton:
            'group-[.toast]:bg-[#4a7c59] group-[.toast]:text-white group-[.toast]:text-xs group-[.toast]:font-bold group-[.toast]:rounded-lg',
          cancelButton:
            'group-[.toast]:bg-[#eae6de] group-[.toast]:text-[#74796e] group-[.toast]:rounded-lg',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
