import { storage } from '@/firebase/config'
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

export async function uploadAvatar(file, uid, onProgress = () => {}) {
  if (!file) throw new Error('Missing file')
  if (!uid) throw new Error('Missing uid')

  const ext = (file.name && file.name.split('.').pop()) || 'jpg'
  const path = `avatars/${uid}/avatar.${ext}`
  const ref = storageRef(storage, path)
  const metadata = { contentType: file.type || 'image/jpeg', cacheControl: 'public,max-age=3600' }

  const task = uploadBytesResumable(ref, file, metadata)

  return new Promise((resolve, reject) => {
    task.on('state_changed', (snapshot) => {
      try {
        const pct = snapshot.totalBytes ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100) : 0
        onProgress(pct)
      } catch (_) {}
    }, reject, async () => {
      try {
        const url = await getDownloadURL(ref)
        resolve({ url, path })
      } catch (e) {
        reject(e)
      }
    })
  })
}

