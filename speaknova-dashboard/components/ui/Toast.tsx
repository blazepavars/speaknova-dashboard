"use client"
import React, { createContext, useContext, useState } from 'react'

type Toast = { id: number; title?: string; description?: string; variant?: 'default'|'success'|'error' }

const ToastCtx = createContext<{ push: (t: Omit<Toast,'id'>) => void } | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const push = (t: Omit<Toast,'id'>) => {
    const id = Date.now() + Math.random()
    setItems(prev => [...prev, { id, ...t }])
    setTimeout(() => setItems(prev => prev.filter(i => i.id !== id)), 4000)
  }
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {items.map(i => (
          <div key={i.id} className={`rounded-md border px-4 py-3 text-sm shadow-md ${i.variant==='error'?'border-red-400 bg-red-900/30 text-red-200': i.variant==='success'?'border-emerald-400 bg-emerald-900/30 text-emerald-200':'border-[#2b3e44] bg-[#0f2730] text-[var(--text)]'}`}>
            {i.title && <div className="font-medium mb-0.5">{i.title}</div>}
            {i.description && <div className="opacity-80">{i.description}</div>}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('ToastProvider missing')
  return ctx
}

