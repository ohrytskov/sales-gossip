import { auth } from '@/firebase/config'
import { updateUserPublic } from '@/firebase/rtdb/users'
import { syncUsersToComments } from '@/firebase/rtdb/syncUsersToComments'
import { syncUsersToPosts } from '@/firebase/rtdb/syncUsersToPosts'
import { uploadAvatar } from '@/firebase/storage/avatars'
import { uploadBanner } from '@/firebase/storage/banners'
import { updateProfile } from 'firebase/auth'

const safeSync = async (message, fn) => {
  try {
    await fn()
  } catch (e) {
    console.error(message, e)
  }
}

export async function saveAvatar({ user, setUser, showToastMessage, fileOrNull }) {
  if (!user || !setUser) return

  try {
    if (fileOrNull === null) {
      // Removal of avatars is disabled in this build; ignore null values.
      return
    }

    if (!(fileOrNull instanceof File)) return

    showToastMessage('Uploading avatar...')
    const { url, path } = await uploadAvatar(fileOrNull, user.uid)
    await updateUserPublic(user.uid, { avatarUrl: url, avatarRef: path, avatarUpdatedAt: Date.now() })

    if (auth && auth.currentUser) await updateProfile(auth.currentUser, { photoURL: url })

    setUser((prev) => (prev ? { ...prev, photoURL: url } : prev))
    showToastMessage('Your avatar has been updated')

    await safeSync('Failed to sync posts after avatar update', () => syncUsersToPosts(user.uid))
    await safeSync('Failed to sync comments after avatar update', () => syncUsersToComments(user.uid))
  } catch (e) {
    console.error('Failed to save avatar', e)
    showToastMessage('Failed to update avatar')
    throw e
  }
}

export async function saveBanner({ user, setUser, showToastMessage, fileOrNull }) {
  if (!user || !setUser) return

  try {
    if (fileOrNull === null) {
      setUser((prev) => (prev ? { ...prev, bannerURL: null } : prev))
      showToastMessage('Banner removed')
      return
    }

    if (!(fileOrNull instanceof File)) return

    showToastMessage('Uploading banner...')
    const { url, path } = await uploadBanner(fileOrNull, user.uid)
    await updateUserPublic(user.uid, { bannerUrl: url, bannerRef: path, bannerUpdatedAt: Date.now() })
    setUser((prev) => (prev ? { ...prev, bannerURL: url } : prev))

    showToastMessage('Your banner has been updated')
  } catch (e) {
    console.error('Failed to save banner', e)
    showToastMessage('Failed to update banner')
    throw e
  }
}

