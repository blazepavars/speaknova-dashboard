"use client"
import React, { useEffect } from 'react'
import { Card } from './Card'

type Props = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  widthClass?: string
}

export default function Modal({ open, onClose, children, widthClass='max-w-5xl' }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className={`w-full ${widthClass} max-h-[85vh] overflow-hidden`}>{children}</Card>
    </div>
  )
}

