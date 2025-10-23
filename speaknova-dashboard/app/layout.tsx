import './globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { AuthProvider } from '@/lib/auth'
import { ToastProvider } from '@/components/ui/Toast'
import Sidebar from '@/components/Sidebar'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Speak Nova — Internal Dashboard',
  description: 'Internal docs and notices',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <AuthProvider>
          <ToastProvider>
            <Header />
            <main className="container py-8">
              <div className="flex gap-6">
                <Sidebar />
                <section className="flex-1 min-w-0">{children}</section>
              </div>
            </main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
