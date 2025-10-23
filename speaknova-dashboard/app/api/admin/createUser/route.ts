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
    const { email, password, role } = body as { email: string; password: string; role: 'admin'|'viewer' }

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const userRecord = await adminAuth.createUser({ email, password, emailVerified: false, disabled: false })
    await adminAuth.setCustomUserClaims(userRecord.uid, { role })

    return NextResponse.json({ uid: userRecord.uid, email: userRecord.email, role })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error creating user' }, { status: 500 })
  }
}
