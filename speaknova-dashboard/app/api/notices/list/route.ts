import { NextRequest, NextResponse } from 'next/server'
import { getAdminApp } from '@/lib/firebaseAdmin'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

export async function GET(req: NextRequest) {
  try {
    const authz = req.headers.get('authorization') || ''
    const idToken = authz.startsWith('Bearer ')? authz.slice(7): ''
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const adminAuth = getAuth(getAdminApp())
    const decoded = await adminAuth.verifyIdToken(idToken)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = getFirestore(getAdminApp())
    const snap = await db.collection('notices').orderBy('createdAt', 'desc').limit(200).get()
    const notices = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ notices })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to list notices' }, { status: 500 })
  }
}

