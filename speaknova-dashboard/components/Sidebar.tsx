"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { useAuth } from '@/lib/auth'
import { LayoutDashboard, FileText, Megaphone, Shield } from 'lucide-react'

export default function Sidebar() {
  const { user, role } = useAuth()
  const pathname = usePathname()
  if (!user) return null

  const Item = ({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) => (
    <Link href={href} className={clsx(
      'flex items-center gap-2 px-3 py-2 rounded-md transition-colors',
      pathname.startsWith(href)
        ? 'bg-[#112a31] text-primary border border-primary/30'
        : 'text-[#b7c7cc] hover:text-[var(--text)] hover:bg-[#0f2730] border border-transparent'
    )}>
      <span className="w-4 h-4">{icon}</span>
      <span>{label}</span>
    </Link>
  )

  return (
    <aside className="hidden md:block w-56 shrink-0">
      <div className="sticky top-6 space-y-2 glass p-3 rounded-lg border border-[#123239]">
        <Item href="/dashboard" label="Dashboard" icon={<LayoutDashboard size={16} />} />
        <Item href="/docs" label="Documents" icon={<FileText size={16} />} />
        <Item href="/notices" label="Notices" icon={<Megaphone size={16} />} />
        {role === 'admin' && <Item href="/admin" label="Admin" icon={<Shield size={16} />} />}
      </div>
    </aside>
  )
}
