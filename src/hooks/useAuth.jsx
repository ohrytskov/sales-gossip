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
        setUser({
          uid: fbUser.uid,
          displayName: fbUser.displayName,
          email: fbUser.email,
          phoneNumber: fbUser.phoneNumber,
          photoURL: fbUser.photoURL
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