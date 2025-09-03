import { auth } from '@/firebase/config'

const BASE = 'https://us-central1-coldcall-48def.cloudfunctions.net/api'

async function post(path, payload) {
  const token = auth.currentUser ? await auth.currentUser.getIdToken(true) : null;
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export function resetEmail(userId, newEmail) {
  return post('/resetEmail', { userId, newEmail })
}

export function resetPassword(userId, newPassword) {
  return post('/resetPassword', { userId, newPassword })
}

