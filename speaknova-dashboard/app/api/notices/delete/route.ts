import { NextRequest, NextResponse } from 'next/server'
import { getAdminApp } from '@/lib/firebaseAdmin'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

export async function POST(req: NextRequest) {
  try {
    const authz = req.headers.get('authorization') || ''
    const idToken = authz.startsWith('Bearer ')? authz.slice(7): ''
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const app = getAdminApp()
    const adminAuth = getAuth(app)
    const decoded = await adminAuth.verifyIdToken(idToken)
    const allowedEmail = process.env.ADMIN_AUTO_PROMOTE_EMAIL?.toLowerCase()
    const isEmailAllowed = decoded.email && decoded.email.toLowerCase() === allowedEmail
    const isAdmin = (decoded as any).role === 'admin'
    if (!isAdmin && !isEmailAllowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await req.json() as { id: string }
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const db = getFirestore(app)
    await db.collection('notices').doc(id).delete()
    await db.collection('auditLogs').add({
      actorUid: decoded.uid,
      action: 'delete',
      targetType: 'notice',
      targetId: id,
      timestamp: FieldValue.serverTimestamp(),
    })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete notice' }, { status: 500 })
  }
}

