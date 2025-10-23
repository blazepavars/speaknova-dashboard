"use client"
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

export default function Header() {
  const { user, logout, role } = useAuth()
  const pathname = usePathname()
  const isActive = (href: string) => pathname.startsWith(href)
  return (
    <header className="border-b border-[#123239] bg-[#0b1d22]/70 backdrop-blur-md sticky top-0 z-40">
      <div className="container flex items-center justify-between py-3">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image src="https://speaknova.com/wp-content/uploads/2025/05/Wordmark-White.webp" alt="Speak Nova" width={140} height={24} />
        </Link>
        {user ? (
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-4 text-sm md:hidden">
              <Link href="/dashboard" className={clsx(isActive('/dashboard') && 'text-primary')}>Dashboard</Link>
              <Link href="/docs" className={clsx(isActive('/docs') && 'text-primary')}>Docs</Link>
              <Link href="/notices" className={clsx(isActive('/notices') && 'text-primary')}>Notices</Link>
              {role === 'admin' && <Link href="/admin" className={clsx(isActive('/admin') && 'text-primary')}>Admin</Link>}
            </nav>
            <button onClick={logout} className="btn btn-outline">Logout</button>
          </div>
        ) : (
          <nav className="text-sm"><Link href="/login" className="hover:underline">Login</Link></nav>
        )}
      </div>
    </header>
  )
}
