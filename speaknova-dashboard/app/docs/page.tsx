"use client"
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import InlineViewer from '@/components/InlineViewer'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

type DocItem = {
  id: string
  title: string
  category?: string | null
  contentType?: string | null
  downloadUrl?: string | null
  storagePath?: string | null
}

export default function DocsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selected, setSelected] = useState<DocItem | null>(null)
  const [docs, setDocs] = useState<DocItem[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, user, router])

  useEffect(() => {
    const load = async () => {
      try {
        if (!user) return
        setErr(null)
        const idt = await user.getIdToken()
        const res = await fetch('/api/docs/list', { headers: { Authorization: `Bearer ${idt}` } })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load documents')
        setDocs(data.docs || [])
      } catch (e: any) {
        setErr(e?.message || 'Failed to load documents')
      }
    }
    load()
  }, [user])

  const categories = useMemo(() => Array.from(new Set(docs.map(d => (d.category || '').trim()).filter(Boolean))), [docs])
  const filtered = useMemo(() => {
    return docs.filter(d => {
      const matchesSearch = !search || d.title.toLowerCase().includes(search.toLowerCase())
      const matchesCat = !category || (d.category || '') === category
      return matchesSearch && matchesCat
    })
  }, [docs, search, category])

  if (!user) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Documents</h1>
          <div className="flex gap-2">
            <Input placeholder="Search title…" value={search} onChange={e=>setSearch(e.target.value)} />
            <Select value={category} onChange={e=>setCategory(e.target.value)}>
              <option value="">All categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {err && <div className="text-red-300 text-sm">{err}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.length === 0 ? (
              <div className="text-[#a9bcc2]">No documents yet.</div>
            ) : (
              filtered.map((d) => (
                <div key={d.id} className="card p-0 overflow-hidden">
                  <div className="aspect-[4/3] bg-[#0b1f25] border-b border-[#123239]">
                    {d.contentType?.includes('pdf') && d.downloadUrl ? (
                      <iframe src={`${d.downloadUrl}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[#a9bcc2] text-sm">No preview</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium truncate" title={d.title}>{d.title}</h3>
                        {d.category && <span className="badge mt-1">{d.category}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={() => setSelected(d)}>View</Button>
                      {d.downloadUrl && (
                        <a className="btn btn-outline" href={d.downloadUrl} target="_blank" rel="noreferrer">Download</a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      {selected && (
        <InlineViewer item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
