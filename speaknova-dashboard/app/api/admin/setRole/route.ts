import { NextRequest, NextResponse } from 'next/server'
import { getAdminApp } from '@/lib/firebaseAdmin'
import { getAuth } from 'firebase-admin/auth'

export async function POST(req: NextRequest) {
  try {
    const authz = req.headers.get('authorization') || ''
    const token = authz.startsWith('Bearer ')? authz.slice(7): ''
    const adminAuth = getAuth(getAdminApp())
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = await adminAuth.verifyIdToken(token)
    const allowedEmail = process.env.ADMIN_AUTO_PROMOTE_EMAIL?.toLowerCase()
    const isEmailAllowed = decoded.email && decoded.email.toLowerCase() === allowedEmail
    if (decoded.role !== 'admin' && !isEmailAllowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const { uid, role } = body as { uid: string; role: 'admin'|'viewer' }
    if (!uid || !role) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    await adminAuth.setCustomUserClaims(uid, { role })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error setting role' }, { status: 500 })
  }
}
