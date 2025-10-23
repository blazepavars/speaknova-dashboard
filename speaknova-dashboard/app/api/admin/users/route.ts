import { NextRequest, NextResponse } from 'next/server'
import { getAdminApp } from '@/lib/firebaseAdmin'
import { getAuth } from 'firebase-admin/auth'

export async function GET(req: NextRequest) {
  try {
    const authz = req.headers.get('authorization') || ''
    const token = authz.startsWith('Bearer ')? authz.slice(7): ''
    const adminAuth = getAuth(getAdminApp())
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = await adminAuth.verifyIdToken(token)
    const allowedEmail = process.env.ADMIN_AUTO_PROMOTE_EMAIL?.toLowerCase()
    const isEmailAllowed = decoded.email && decoded.email.toLowerCase() === allowedEmail
    if (decoded.role !== 'admin' && !isEmailAllowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const nextPageToken = searchParams.get('nextPageToken') || undefined
    const limitParam = searchParams.get('limit')
    const maxResults = Math.min(Math.max(Number(limitParam || 50), 1), 1000)

    const list = await adminAuth.listUsers(maxResults, nextPageToken)
    const users = list.users.map(u => ({
      uid: u.uid,
      email: u.email || '',
      displayName: u.displayName || '',
      disabled: u.disabled,
      role: (u.customClaims?.role as 'admin'|'viewer'|undefined) || 'viewer',
      createdAt: u.metadata.creationTime,
      lastLoginAt: u.metadata.lastSignInTime,
    }))
    return NextResponse.json({ users, nextPageToken: list.pageToken || null })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error listing users' }, { status: 500 })
  }
}
