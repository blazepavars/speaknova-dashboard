"use client"
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Upload, Megaphone, FolderOpen } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function QuickActions() {
  const { role } = useAuth()
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <Link href="/docs" className="block">
        <Button variant="outline" className="w-full flex items-center gap-2"><FolderOpen size={16}/> Browse Docs</Button>
      </Link>
      <Link href="/notices" className="block">
        <Button variant="outline" className="w-full flex items-center gap-2"><Megaphone size={16}/> View Notices</Button>
      </Link>
      {role === 'admin' && (
        <Link href="/admin" className="block">
          <Button className="w-full flex items-center gap-2"><Upload size={16}/> Upload Doc</Button>
        </Link>
      )}
    </div>
  )
}

