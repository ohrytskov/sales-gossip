import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo
} from 'react'
import { onAuthStateChanged } from 'firebase/auth'

import { auth } from '@/firebase/config'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, fbUser => {
      if (fbUser) {
        const provider = (fbUser.providerData && fbUser.providerData[0]) || {}
        setUser({
          uid: fbUser.uid,
          displayName: fbUser.displayName || provider.displayName || '',
          email: fbUser.email || provider.email || '',
          phoneNumber: fbUser.phoneNumber || provider.phoneNumber || '',
          photoURL: fbUser.photoURL || provider.photoURL || ''
        })
      } else {
        setUser(null)
      }
    })

    // cleanup on unmount
    return unsubscribe
  }, [])

  // Memoize value so consumers only re-render on user change
  const value = useMemo(() => ({ user, setUser }), [user])

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
