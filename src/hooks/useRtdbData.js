import { useEffect, useState } from 'react'
import { rtdb } from '@/firebase/config'
import { ref, onValue } from 'firebase/database'

// Hook to read a key from Realtime Database.
// Uses a realtime listener so components (eg. Feed) update when data changes
export default function useRtdbDataKey(key) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    if (!rtdb) {
      setError(new Error('Realtime Database not configured'))
      setLoading(false)
      return () => { mounted = false }
    }

    const dbRef = ref(rtdb, key)
    const unsubscribe = onValue(dbRef, (snap) => {
      if (!mounted) return
      setData(snap.exists() ? snap.val() : null)
      setLoading(false)
    }, (err) => {
      if (!mounted) return
      setError(err)
      setData(null)
      setLoading(false)
    })

    return () => {
      mounted = false
      try { unsubscribe() } catch (e) { /* ignore */ }
    }
  }, [key])

  return { data, loading, error }
}
