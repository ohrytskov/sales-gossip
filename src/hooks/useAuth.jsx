import {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useMemo
} from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { ref, update, onValue } from 'firebase/database'

import { auth, rtdb } from '@/firebase/config'

const AuthContext = createContext()

function isUsernameLike(value) {
  const trimmed = (value || '').toString().trim()
  if (!trimmed) return false
  return /^[A-Za-z0-9_]{3,60}$/.test(trimmed)
}

function getAnonymousDisplayName(publicData) {
  const candidate = (
    publicData?.nickname ||
    publicData?.displayName ||
    publicData?.username ||
    ''
  ).toString().trim()
  return candidate
}

function mapProviderId(providerId) {
  if (!providerId) return 'unknown'
  if (providerId === 'google.com') return 'Google'
  if (providerId === 'github.com') return 'GitHub'
  if (providerId === 'facebook.com') return 'Facebook'
  if (providerId === 'password') return 'password'
  return providerId
}

async function syncAuthUserToRtdb(fbUser) {
  const uid = fbUser?.uid
  if (!uid) return

  const primaryProvider = (fbUser.providerData && fbUser.providerData[0]) || {}
  const providerId = primaryProvider.providerId || ''
  const provider = mapProviderId(providerId)

  const updates = {
    [`users/${uid}/uid`]: uid,
    [`users/${uid}/meta/provider`]: provider,
    [`users/${uid}/meta/lastLoginAt`]: Date.now(),
  }

  if (fbUser.email) {
    updates[`users/${uid}/private/email`] = fbUser.email
    updates[`users/${uid}/private/emailVerified`] = Boolean(fbUser.emailVerified)
  }

  return update(ref(rtdb), updates)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Subscribe to Firebase Auth state. Use an isomorphic layout effect so
  // the Firebase listener is attached before paint on the client which
  // helps avoid a brief "login button -> avatar" flash during hydration.
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

  useIsomorphicLayoutEffect(() => {
    let unsubscribePublic = null

    const stopPublicListener = () => {
      if (!unsubscribePublic) return
      try { unsubscribePublic() } catch (_) {}
      unsubscribePublic = null
    }

    const unsubscribe = onAuthStateChanged(auth, fbUser => {
      stopPublicListener()

      if (fbUser) {
        const provider = (fbUser.providerData && fbUser.providerData[0]) || {}
        const safeDisplayName = isUsernameLike(fbUser.displayName) ? fbUser.displayName : ''
        setUser({
          uid: fbUser.uid,
          displayName: safeDisplayName,
          email: fbUser.email || provider.email || '',
          phoneNumber: fbUser.phoneNumber || provider.phoneNumber || '',
          photoURL: fbUser.photoURL || provider.photoURL || ''
        })

        syncAuthUserToRtdb(fbUser).catch((e) => {
          console.error('Failed to sync user auth fields to RTDB', e)
        })

        unsubscribePublic = onValue(ref(rtdb, `users/${fbUser.uid}/public`), (snap) => {
          if (!snap || !snap.exists()) return
          const next = getAnonymousDisplayName(snap.val())
          if (!next) return
          setUser(prev => {
            if (!prev || prev.uid !== fbUser.uid) return prev
            if (prev.displayName === next) return prev
            return { ...prev, displayName: next }
          })
        }, (e) => {
          console.error('Failed to read user public record from RTDB', e)
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    // cleanup on unmount
    return () => {
      stopPublicListener()
      try { unsubscribe() } catch (_) {}
    }
  }, [])

  // Memoize value so consumers only re-render on user change
  const value = useMemo(() => ({ user, setUser, loading }), [user, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
