"use client"
import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { auth } from './firebaseClient'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth'

type Role = 'admin' | 'viewer' | null

type AuthContextType = {
  user: User | null
  role: Role
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const token = await u.getIdTokenResult(true)
        const r = (token.claims as any)?.role as Role
        setRole((r === 'admin' || r === 'viewer') ? r : 'viewer')
        try {
          const auto = process.env.NEXT_PUBLIC_ADMIN_AUTO_PROMOTE_EMAIL?.toLowerCase()
          if (auto && u.email && u.email.toLowerCase() === auto && r !== 'admin') {
            const idt = await u.getIdToken()
            await fetch('/api/admin/selfPromote', { method: 'POST', headers: { Authorization: `Bearer ${idt}` } })
            const refreshed = await u.getIdTokenResult(true)
            const nr = (refreshed.claims as any)?.role as Role
            setRole((nr === 'admin' || nr === 'viewer') ? nr : 'viewer')
          }
        } catch {
          // ignore auto-promote errors
        }
      } else {
        setRole(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
