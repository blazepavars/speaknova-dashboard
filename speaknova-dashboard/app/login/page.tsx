"use client"
import { FormEvent, useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { login, user } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (user) {
    router.replace('/dashboard')
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      router.replace('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="card w-full max-w-md p-6">
        <div className="flex flex-col items-center gap-2 mb-6">
          <Image src="https://speaknova.com/wp-content/uploads/2025/05/Wordmark-White.webp" alt="Speak Nova" width={180} height={30} />
          <p className="text-[#a9bcc2] text-sm">Internal Dashboard</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input className="input w-full" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input className="input w-full" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className="text-red-300 text-sm">{error}</div>}
          <button className="btn btn-primary w-full disabled:opacity-60" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  )
}

