import { App, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import fs from 'node:fs'

let adminApp: App | null = null

export function getAdminApp() {
  if (adminApp) return adminApp
  let serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  if (!serviceAccountRaw && serviceAccountPath) {
    try {
      serviceAccountRaw = fs.readFileSync(serviceAccountPath, 'utf8')
    } catch (e: any) {
      throw new Error(`FIREBASE_SERVICE_ACCOUNT_PATH is set but unreadable: ${serviceAccountPath}. On Vercel, set FIREBASE_SERVICE_ACCOUNT to the full JSON instead.`)
    }
  }
  if (!serviceAccountRaw) throw new Error('FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH not set')
  let serviceAccount: any
  try {
    serviceAccount = JSON.parse(serviceAccountRaw)
  } catch {
    // Allow base64-encoded JSON as a convenience
    try {
      const decoded = Buffer.from(serviceAccountRaw, 'base64').toString('utf8')
      serviceAccount = JSON.parse(decoded)
    } catch (e: any) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT is not valid JSON (or base64-encoded JSON). Paste the full Service Account JSON.')
    }
  }
  adminApp = getApps()[0] || initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  })
  // Touch auth to ensure correct import tree-shaking in Next
  getAuth(adminApp)
  return adminApp
}
