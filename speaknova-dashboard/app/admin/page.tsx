"use client"
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { db } from '@/lib/firebaseClient'
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore'

type TabKey = 'documents' | 'notices' | 'users'

export default function AdminPage() {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<TabKey>('documents')
  const { push } = useToast()

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/login')
      else if (role !== 'admin') router.replace('/dashboard')
    }
  }, [loading, user, role, router])

  if (!user || role !== 'admin') return null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <div className="flex gap-2">
        <Button variant={tab==='documents'?'primary':'outline'} onClick={()=>setTab('documents')}>Documents</Button>
        <Button variant={tab==='notices'?'primary':'outline'} onClick={()=>setTab('notices')}>Notices</Button>
        <Button variant={tab==='users'?'primary':'outline'} onClick={()=>setTab('users')}>Users</Button>
      </div>
      {tab === 'documents' && <DocumentsAdmin />}
      {tab === 'notices' && <NoticesAdmin />}
      {tab === 'users' && <UsersAdmin />}
    </div>
  )
}

function DocumentsAdmin() {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadDocs = async () => {
    try {
      if (!user) return
      setLoading(true); setErr(null)
      const idt = await user.getIdToken()
      const res = await fetch('/api/docs/list', { headers: { Authorization: `Bearer ${idt}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load documents')
      setDocs(data.docs || [])
    } catch (e: any) {
      setErr(e?.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDocs() }, [user])

  const onUpload = async () => {
    setErr(null); setOk(null)
    try {
      if (!file) throw new Error('Choose a file')
      if (!title) throw new Error('Enter a title')
      if (!user) throw new Error('Not authenticated')
      if (file.size > 25 * 1024 * 1024) throw new Error('Max file size is 25MB')

      setBusy(true)
      const token = await user.getIdToken()
      const fd = new FormData()
      fd.append('file', file)
      fd.append('title', title)
      fd.append('category', category)
      const res = await fetch('/api/admin/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setOk('Upload complete')
      setTitle(''); setCategory(''); setFile(null)
      loadDocs()
    } catch (e: any) {
      setErr(e?.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  const deleteDocItem = async (id: string) => {
    try {
      if (!user) return
      const idt = await user.getIdToken()
      const res = await fetch('/api/admin/documents/delete', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idt}` }, body: JSON.stringify({ id }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      setDocs(prev => prev.filter(d => d.id !== id))
    } catch (e: any) {
      setErr(e?.message || 'Delete failed')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="font-medium">Upload Documents</div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 md:grid-cols-3">
          <Input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
          <Input placeholder="Category (optional)" value={category} onChange={e=>setCategory(e.target.value)} />
          <Input type="file" accept=".pdf,.doc,.docx,.md,.markdown" onChange={e=>setFile(e.target.files?.[0] || null)} />
        </div>
        <Button className="mt-3" disabled={busy} onClick={onUpload}>{busy? 'Uploading…':'Upload'}</Button>
        {err && <div className="text-red-300 text-sm mt-2">{err}</div>}
        {ok && <div className="text-green-300 text-sm mt-2">{ok}</div>}

        <h3 className="font-medium mt-6 mb-2">Existing Documents</h3>
        <div className="space-y-2">
          {docs.map(d => (
            <div key={d.id} className="border border-[#123239] rounded p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{d.title}</div>
                <div className="text-xs text-[#a9bcc2] truncate">{d.category || 'Uncategorized'} • {d.contentType || ''}</div>
              </div>
              <div className="flex items-center gap-2">
                <a className="btn btn-outline" href={d.downloadUrl || '#'} target="_blank" rel="noreferrer">View</a>
                <Button variant="outline" onClick={()=>deleteDocItem(d.id)}>Delete</Button>
              </div>
            </div>
          ))}
          {docs.length === 0 && !loading && <div className="text-[#a9bcc2] text-sm">No documents yet.</div>}
        </div>
      </CardContent>
    </Card>
  )
}

function NoticesAdmin() {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [expires, setExpires] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [list, setList] = useState<any[]>([])

  const load = async () => {
    if (!user) return
    const idt = await user.getIdToken()
    const res = await fetch('/api/notices/list', { headers: { Authorization: `Bearer ${idt}` } })
    const data = await res.json()
    if (res.ok) setList(data.notices || [])
  }

  useEffect(() => { load() }, [user])

  const publish = async () => {
    setErr(null); setOk(null)
    try {
      if (!title) throw new Error('Title required')
      if (!user) throw new Error('Not authenticated')
      setBusy(true)
      const idt = await user.getIdToken()
      const expiresAt = expires ? new Date(expires + 'T23:59:59Z').toISOString() : null
      const res = await fetch('/api/notices/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idt}` },
        body: JSON.stringify({ title, description: desc, expiresAt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Publish failed')
      setTitle(''); setDesc(''); setExpires(''); setOk('Notice published')
      load()
    } catch (e: any) {
      setErr(e?.message || 'Publish failed')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: string) => {
    setErr(null)
    try {
      if (!user) return
      const idt = await user.getIdToken()
      const res = await fetch('/api/notices/delete', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idt}` }, body: JSON.stringify({ id }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      setList(prev => prev.filter(n => n.id !== id))
    } catch (e: any) {
      setErr(e?.message || 'Delete failed')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="font-medium">Manage Notices</div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <Input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
          <textarea className="bg-[#0d2126] border border-[#123239] rounded-md px-3 py-2 text-[var(--text)] placeholder:text-[#6e7d82] min-h-32 focus:outline-none focus:ring-2 focus:ring-[#8888f2]/50" placeholder="Description (markdown supported)" value={desc} onChange={e=>setDesc(e.target.value)} />
          <div className="flex items-center gap-3">
            <label className="text-sm">Expires (optional)</label>
            <Input type="date" value={expires} onChange={e=>setExpires(e.target.value)} />
          </div>
          <Button className="w-fit" disabled={busy} onClick={publish}>{busy? 'Publishing…':'Publish'}</Button>
          {err && <div className="text-red-300 text-sm">{err}</div>}
          {ok && <div className="text-green-300 text-sm">{ok}</div>}
        </div>

        <h3 className="font-medium mt-6 mb-2">Existing Notices</h3>
        <div className="space-y-2">
          {list.map(n => (
            <div key={n.id} className="border border-[#123239] rounded p-3 flex items-start justify-between">
              <div>
                <div className="font-medium">{n.title}</div>
                <div className="text-sm text-[#a9bcc2]">{n.description}</div>
              </div>
              <Button variant="outline" onClick={()=>remove(n.id)}>Delete</Button>
            </div>
          ))}
          {list.length === 0 && <div className="text-[#a9bcc2] text-sm">No notices yet.</div>}
        </div>
      </CardContent>
    </Card>
  )
}

function UsersAdmin() {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'viewer'|'admin'>('viewer')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const [users, setUsers] = useState<Array<{ uid: string; email: string; role: 'viewer'|'admin'; disabled: boolean }>>([])
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [loadingUsers, setLoadingUsers] = useState(false)

  const getToken = async () => {
    const t = await user?.getIdToken()
    if (!t) throw new Error('Not authenticated')
    return t
  }

  const fetchUsers = async (pageToken?: string | null) => {
    setLoadingUsers(true)
    setErr(null)
    try {
      const token = await getToken()
      const q = pageToken ? `?nextPageToken=${encodeURIComponent(pageToken)}` : ''
      const res = await fetch(`/api/admin/users${q}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load users')
      setUsers(prev => pageToken ? [...prev, ...data.users] : data.users)
      setNextPageToken(data.nextPageToken)
    } catch (e: any) {
      setErr(e?.message || 'Error loading users')
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const createUser = async () => {
    setBusy(true)
    setErr(null)
    setOk(null)
    try {
      if (!email || !password) throw new Error('Email and temp password required')
      const token = await getToken()
      const res = await fetch('/api/admin/createUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email, password, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create user')
      setOk(`Created ${data.email} (${data.uid}) as ${role}`)
      setEmail(''); setPassword(''); setRole('viewer')
      // Refresh list
      fetchUsers()
    } catch (e: any) {
      setErr(e?.message || 'Create user failed')
    } finally {
      setBusy(false)
    }
  }

  const setUserRole = async (uid: string, newRole: 'viewer'|'admin') => {
    setErr(null)
    try {
      const token = await getToken()
      const res = await fetch('/api/admin/setRole', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ uid, role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to set role')
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u))
    } catch (e: any) {
      setErr(e?.message || 'Set role failed')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="font-medium">Manage Users</div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 md:grid-cols-3">
          <Input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <Input placeholder="Temp password" value={password} onChange={e=>setPassword(e.target.value)} />
          <Select value={role} onChange={e=>setRole(e.target.value as 'viewer'|'admin')}>
            <option value="viewer">viewer</option>
            <option value="admin">admin</option>
          </Select>
        </div>
        <Button className="mt-3" disabled={busy} onClick={createUser}>{busy? 'Creating…':'Create User'}</Button>
        {err && <div className="text-red-300 text-sm mt-2">{err}</div>}
        {ok && <div className="text-green-300 text-sm mt-2">{ok}</div>}

        <h3 className="font-medium mt-6 mb-2">Existing Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#a9bcc2]">
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.uid} className="border-t border-[#123239]">
                  <td className="py-2 pr-3">{u.email}</td>
                  <td className="py-2 pr-3">
                    <Select value={u.role} onChange={e=>setUserRole(u.uid, e.target.value as 'viewer'|'admin')}>
                      <option value="viewer">viewer</option>
                      <option value="admin">admin</option>
                    </Select>
                  </td>
                  <td className="py-2 pr-3">
                    <Badge>{u.disabled ? 'disabled' : 'active'}</Badge>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loadingUsers && (
                <tr><td colSpan={3} className="py-4 text-[#a9bcc2]">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {nextPageToken && (
          <Button variant="outline" className="mt-3" onClick={()=>fetchUsers(nextPageToken)} disabled={loadingUsers}>{loadingUsers? 'Loading…':'Load more'}</Button>
        )}
      </CardContent>
    </Card>
  )
}
