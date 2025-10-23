"use client"
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import Skeleton from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'

import clsx from 'clsx'

export default function RecentDocs({ limit = 9, gridClassName }: { limit?: number, gridClassName?: string }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [docs, setDocs] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      if (!user) return
      setLoading(true)
      const idt = await user.getIdToken()
      const res = await fetch('/api/docs/list', { headers: { Authorization: `Bearer ${idt}` } })
      const data = await res.json()
      if (res.ok) setDocs((data.docs || []).slice(0, limit))
      setLoading(false)
    }
    load()
  }, [user, limit])

  if (loading) return <div className={clsx('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', gridClassName)}>{Array.from({length:limit}).map((_,i)=>(<Skeleton key={i} className="h-40"/>))}</div>

  if (docs.length === 0) return <div className="text-[#a9bcc2]">No recent documents.</div>

  return (
    <div className={clsx('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', gridClassName)}>
      {docs.map((d:any) => (
        <div key={d.id} className="card p-0 overflow-hidden">
          <div className="aspect-[4/3] bg-[#0b1f25] border-b border-[#123239]">
            {d.contentType?.includes('pdf') && d.downloadUrl ? (
              <iframe src={`${d.downloadUrl}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[#a9bcc2] text-sm">No preview</div>
            )}
          </div>
          <div className="p-3">
            <div className="font-medium truncate" title={d.title}>{d.title}</div>
            <div className="text-xs text-[#a9bcc2] truncate">{d.category || 'Uncategorized'}</div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={()=>window.location.href='/docs'}>Open</Button>
              {d.downloadUrl && <a className="btn btn-outline h-8 px-3 text-sm" href={d.downloadUrl} target="_blank" rel="noreferrer">Download</a>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
