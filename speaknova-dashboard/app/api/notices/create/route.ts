import { NextRequest, NextResponse } from 'next/server'
import { getAdminApp } from '@/lib/firebaseAdmin'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

export async function POST(req: NextRequest) {
  try {
    const authz = req.headers.get('authorization') || ''
    const idToken = authz.startsWith('Bearer ')? authz.slice(7): ''
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const adminAuth = getAuth(getAdminApp())
    const decoded = await adminAuth.verifyIdToken(idToken)
    const allowedEmail = process.env.ADMIN_AUTO_PROMOTE_EMAIL?.toLowerCase()
    const isEmailAllowed = decoded.email && decoded.email.toLowerCase() === allowedEmail
    const isAdmin = (decoded as any).role === 'admin'
    if (!isAdmin && !isEmailAllowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { title, description, expiresAt } = await req.json() as { title: string; description: string; expiresAt?: string | null }
    if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 })
    let exp: Date | null = null
    if (expiresAt) {
      const d = new Date(expiresAt)
      if (!isNaN(d.getTime())) exp = d
    }

    const db = getFirestore(getAdminApp())
    const docRef = await db.collection('notices').add({
      title,
      description: description || '',
      createdBy: decoded.uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      expiresAt: exp,
      isPinned: false,
    })
    return NextResponse.json({ ok: true, id: docRef.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create notice' }, { status: 500 })
  }
}

