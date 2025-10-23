import { NextRequest, NextResponse } from 'next/server'
import { getAdminApp } from '@/lib/firebaseAdmin'
import { getAuth } from 'firebase-admin/auth'

// Secret-protected bootstrap endpoint to set the first admin(s)
// Usage: POST with header `x-admin-secret: <ADMIN_BOOTSTRAP_SECRET>`
// Body: { email: string, role?: 'admin'|'viewer', password?: string }

export async function POST(req: NextRequest) {
  const secret = process.env.ADMIN_BOOTSTRAP_SECRET
  if (!secret) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

  const header = req.headers.get('x-admin-secret') || ''
  if (header !== secret) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { email, role = 'admin', password } = await req.json() as { email: string; role?: 'admin'|'viewer'; password?: string }
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

    const adminAuth = getAuth(getAdminApp())

    let uid: string
    try {
      const existing = await adminAuth.getUserByEmail(email)
      uid = existing.uid
    } catch {
      if (!password) return NextResponse.json({ error: 'User not found. Provide password to create.' }, { status: 400 })
      const created = await adminAuth.createUser({ email, password, emailVerified: false, disabled: false })
      uid = created.uid
    }

    await adminAuth.setCustomUserClaims(uid, { role })
    return NextResponse.json({ ok: true, email, uid, role })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error bootstrapping admin' }, { status: 500 })
  }
}
