"use client"
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import Skeleton from '@/components/ui/Skeleton'

export default function Stats() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [docsCount, setDocsCount] = useState<number>(0)
  const [noticesCount, setNoticesCount] = useState<number>(0)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      setLoading(true)
      const idt = await user.getIdToken()
      const [dres, nres] = await Promise.all([
        fetch('/api/docs/list', { headers: { Authorization: `Bearer ${idt}` } }),
        fetch('/api/notices/list', { headers: { Authorization: `Bearer ${idt}` } }),
      ])
      const d = await dres.json(); const n = await nres.json()
      if (dres.ok) setDocsCount((d.docs || []).length)
      if (nres.ok) setNoticesCount((n.notices || []).length)
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) return <div className="grid grid-cols-2 gap-2"><Skeleton className="h-16"/><Skeleton className="h-16"/></div>

  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="border border-[#123239] rounded p-3">
        <div className="text-[#a9bcc2]">Documents</div>
        <div className="text-xl font-semibold">{docsCount}</div>
      </div>
      <div className="border border-[#123239] rounded p-3">
        <div className="text-[#a9bcc2]">Notices</div>
        <div className="text-xl font-semibold">{noticesCount}</div>
      </div>
    </div>
  )
}

