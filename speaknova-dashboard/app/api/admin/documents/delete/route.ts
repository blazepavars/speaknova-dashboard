import { NextRequest, NextResponse } from 'next/server'
import { getAdminApp } from '@/lib/firebaseAdmin'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

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
    const docRef = db.collection('documents').doc(id)
    const snap = await docRef.get()
    if (!snap.exists) return NextResponse.json({ ok: true })
    const data = snap.data() || {}
    const storagePath: string | undefined = (data as any).storagePath

    const storage = getStorage(app)
    const bucket = storage.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
    // Delete all files under this document's folder
    await bucket.deleteFiles({ prefix: `documents/${id}/` })

    await docRef.delete()
    await db.collection('auditLogs').add({
      actorUid: decoded.uid,
      action: 'delete',
      targetType: 'document',
      targetId: id,
      timestamp: FieldValue.serverTimestamp(),
      metadata: { storagePath: storagePath || null },
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Delete failed' }, { status: 500 })
  }
}

