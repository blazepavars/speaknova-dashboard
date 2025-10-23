import { NextRequest, NextResponse } from 'next/server'
import { getAdminApp } from '@/lib/firebaseAdmin'
import { getAuth } from 'firebase-admin/auth'

export async function POST(req: NextRequest) {
  const targetEmail = process.env.ADMIN_AUTO_PROMOTE_EMAIL?.toLowerCase()
  if (!targetEmail) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

  try {
    const authz = req.headers.get('authorization') || ''
    const token = authz.startsWith('Bearer ')? authz.slice(7): ''
    const adminAuth = getAuth(getAdminApp())
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = await adminAuth.verifyIdToken(token)
    const email = (decoded.email || '').toLowerCase()
    if (email !== targetEmail) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const user = await adminAuth.getUser(decoded.uid)
    const currentRole = (user.customClaims?.role as string) || 'viewer'
    if (currentRole === 'admin') return NextResponse.json({ ok: true, already: true })

    await adminAuth.setCustomUserClaims(decoded.uid, { role: 'admin' })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}
