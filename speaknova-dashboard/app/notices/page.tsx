"use client"
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

export default function NoticesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [notices, setNotices] = useState<Array<{ id: string; title: string; description: string; createdAt?: any; expiresAt?: any }>>([])
  const [showExpired, setShowExpired] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, user, router])

  useEffect(() => {
    const load = async () => {
      if (!user) return
      const idt = await user.getIdToken()
      const res = await fetch('/api/notices/list', { headers: { Authorization: `Bearer ${idt}` } })
      const data = await res.json()
      if (res.ok) setNotices(data.notices || [])
    }
    load()
  }, [user])

  const now = Date.now()
  const filtered = useMemo(() => notices.filter(n => {
    const exp = n.expiresAt ? new Date(n.expiresAt.seconds ? n.expiresAt.seconds*1000 : n.expiresAt).getTime() : null
    const isExpired = exp ? exp < now : false
    return showExpired ? true : !isExpired
  }), [notices, showExpired, now])

  if (!user) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Notices</h1>
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={showExpired} onChange={e=>setShowExpired(e.target.checked)} />
            Show expired
          </label>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-[#a9bcc2]">No notices yet.</div>
            ) : (
              filtered.map(n => (
                <div key={n.id} className="card p-4">
                  <h3 className="font-medium mb-1">{n.title}</h3>
                  <p className="text-sm text-[#c7d5da]">{n.description}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
