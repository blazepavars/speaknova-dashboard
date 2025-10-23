import { NextRequest, NextResponse } from 'next/server'
import { getAdminApp } from '@/lib/firebaseAdmin'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import crypto from 'node:crypto'

export async function POST(req: NextRequest) {
  try {
    const authz = req.headers.get('authorization') || ''
    const idToken = authz.startsWith('Bearer ')? authz.slice(7): ''
    const adminAuth = getAuth(getAdminApp())
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = await adminAuth.verifyIdToken(idToken)
    const allowedEmail = process.env.ADMIN_AUTO_PROMOTE_EMAIL?.toLowerCase()
    const isEmailAllowed = decoded.email && decoded.email.toLowerCase() === allowedEmail
    const isAdmin = (decoded as any).role === 'admin'
    if (!isAdmin && !isEmailAllowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const form = await req.formData()
    const file = form.get('file') as File | null
    const title = String(form.get('title') || '')
    const category = String(form.get('category') || '') || null
    if (!file) return NextResponse.json({ error: 'Missing file' }, { status: 400 })
    if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 })
    if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: 'Max file size is 25MB' }, { status: 400 })

    const db = getFirestore(getAdminApp())
    const docRef = db.collection('documents').doc()
    const storagePath = `documents/${docRef.id}/${file.name}`

    const storage = getStorage(getAdminApp())
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    if (!bucketName) return NextResponse.json({ error: 'Storage bucket not configured on server' }, { status: 500 })
    const bucket = storage.bucket(bucketName)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    try {
      await bucket.file(storagePath).save(buffer, { contentType: file.type || undefined, resumable: false, validation: false })
    } catch (e: any) {
      if (String(e?.message || '').toLowerCase().includes('does not exist')) {
        return NextResponse.json({ error: 'Storage bucket not initialized. In Firebase Console → Storage, click “Get started” to provision the default bucket.' }, { status: 500 })
      }
      throw e
    }

    // Add a download token so client can access via URL
    const downloadToken = crypto.randomUUID()
    const fileRef = bucket.file(storagePath)
    await fileRef.setMetadata({ metadata: { firebaseStorageDownloadTokens: downloadToken } })
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`

    await docRef.set({
      title,
      category,
      storagePath,
      downloadUrl,
      contentType: file.type || null,
      size: file.size,
      uploadedBy: decoded.uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      isActive: true,
    })

    await db.collection('auditLogs').add({
      actorUid: decoded.uid,
      action: 'upload',
      targetType: 'document',
      targetId: docRef.id,
      timestamp: FieldValue.serverTimestamp(),
      metadata: { title, category },
    })

    return NextResponse.json({ ok: true, id: docRef.id, storagePath })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 })
  }
}
