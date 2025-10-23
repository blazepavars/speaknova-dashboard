import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const svcRaw = process.env.FIREBASE_SERVICE_ACCOUNT
if (!svcRaw) {
  console.error('FIREBASE_SERVICE_ACCOUNT is not set in env')
  process.exit(1)
}

let serviceAccount
try {
  serviceAccount = JSON.parse(svcRaw)
} catch (e) {
  console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', e?.message)
  process.exit(1)
}

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) })
}

const [,, email, role] = process.argv
if (!email || !role || !['admin','viewer'].includes(role)) {
  console.log('Usage: node scripts/bootstrap-admin.mjs <email> <admin|viewer>')
  process.exit(1)
}

const auth = getAuth()
try {
  const user = await auth.getUserByEmail(email)
  await auth.setCustomUserClaims(user.uid, { role })
  console.log(`Set role for ${email} (${user.uid}) -> ${role}`)
  process.exit(0)
} catch (e) {
  console.error('Error:', e?.message || e)
  process.exit(1)
}

