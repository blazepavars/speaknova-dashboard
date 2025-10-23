"use client"
import { useAuth } from '@/lib/auth'
import { useEffect, useState } from 'react'
import Skeleton from '@/components/ui/Skeleton'

export default function LatestNotices() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      if (!user) return
      setLoading(true)
      const idt = await user.getIdToken()
      const res = await fetch('/api/notices/list', { headers: { Authorization: `Bearer ${idt}` } })
      const data = await res.json()
      if (res.ok) setItems((data.notices || []).slice(0, 6))
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) return <div className="space-y-2">{Array.from({length:5}).map((_,i)=>(<Skeleton key={i} className="h-10"/>))}</div>

  if (items.length === 0) return <div className="text-[#a9bcc2]">No notices yet.</div>

  return (
    <ul className="space-y-2">
      {items.map((n:any) => (
        <li key={n.id} className="border border-[#123239] rounded p-3">
          <div className="font-medium">{n.title}</div>
          {n.description && <div className="text-sm text-[#a9bcc2] truncate">{n.description}</div>}
        </li>
      ))}
    </ul>
  )
}

