"use client"
import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useState } from 'react'
import RecentDocs from '@/components/dashboard/RecentDocs'
import LatestNotices from '@/components/dashboard/LatestNotices'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [recentDocs, setRecentDocs] = useState<any[]>([])
  const [latestNotices, setLatestNotices] = useState<any[]>([])

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, user, router])

  useEffect(() => {
    const load = async () => {
      if (!user) return
      const idt = await user.getIdToken()
      const [docsRes, noticesRes] = await Promise.all([
        fetch('/api/docs/list', { headers: { Authorization: `Bearer ${idt}` } }),
        fetch('/api/notices/list', { headers: { Authorization: `Bearer ${idt}` } }),
      ])
      const docsData = await docsRes.json()
      const noticesData = await noticesRes.json()
      if (docsRes.ok) setRecentDocs((docsData.docs || []).slice(0, 6))
      if (noticesRes.ok) setLatestNotices((noticesData.notices || []).slice(0, 5))
    }
    load()
  }, [user])

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl border border-[#123239] glass">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-pink/20 rounded-full blur-3xl animate-float" />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold gradient-text">Welcome back</h1>
              <p className="text-[#a9bcc2]">Quick access to documents and notices.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/docs"><button className="btn btn-primary">Browse Docs</button></Link>
              <Link href="/notices"><button className="btn btn-outline">View Notices</button></Link>
            </div>
          </div>
        </div>
      </div>
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Latest Notices</h2>
            <Link className="text-primary text-sm" href="/notices">See all</Link>
          </div>
          <LatestNotices />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Recent Documents</h2>
            <Link className="text-primary text-sm" href="/docs">Browse</Link>
          </div>
          <RecentDocs limit={16} gridClassName="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
        </CardContent>
      </Card>
    </div>
  )
}
