import { storage } from '@/firebase/config'
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

export async function uploadMedia(file, postId, index = 0, onProgress = () => {}) {
  if (!file) throw new Error('Missing file')
  if (!postId) throw new Error('Missing postId')

  const ext = (file.name && file.name.split('.').pop()) || 'bin'
  const path = `posts/${postId}/${Date.now()}-${index}.${ext}`
  const ref = storageRef(storage, path)
  const metadata = { contentType: file.type || 'application/octet-stream', cacheControl: 'public,max-age=3600' }

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

