import { App, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import fs from 'node:fs'

let adminApp: App | null = null

export function getAdminApp() {
  if (adminApp) return adminApp
  let serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  if (!serviceAccountRaw && serviceAccountPath) {
    serviceAccountRaw = fs.readFileSync(serviceAccountPath, 'utf8')
  }
  if (!serviceAccountRaw) throw new Error('FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH not set')
  const serviceAccount = JSON.parse(serviceAccountRaw)
  adminApp = getApps()[0] || initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  })
  // Touch auth to ensure correct import tree-shaking in Next
  getAuth(adminApp)
  return adminApp
}
