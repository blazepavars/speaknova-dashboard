"use client"
import { useAuth } from '@/lib/auth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminUnlockPage() {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  const [msg, setMsg] = useState('Preparing…')

  useEffect(() => {
    const run = async () => {
      if (loading) return
      if (!user) {
        router.replace('/login')
        return
      }
      if (role === 'admin') {
        router.replace('/admin')
        return
      }
      try {
        setMsg('Requesting admin access…')
        const idt = await user.getIdToken()
        const res = await fetch('/api/admin/selfPromote', { method: 'POST', headers: { Authorization: `Bearer ${idt}` } })
        if (!res.ok) {
          const data = await res.json().catch(()=>({}))
          setMsg(`Failed: ${data.error || res.statusText}`)
          return
        }
        setMsg('Granted. Reloading…')
        // Force reload to refresh claims and context
        setTimeout(() => window.location.replace('/admin'), 500)
      } catch (e: any) {
        setMsg(`Error: ${e?.message || 'Unknown'}`)
      }
    }
    run()
  }, [user, role, loading, router])

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="card p-6 text-sm text-[#a9bcc2]">{msg}</div>
    </div>
  )
}

