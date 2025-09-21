import { useEffect, useState } from 'react'
import { rtdb } from '@/firebase/config'
import { ref, onValue } from 'firebase/database'
import localData from '@/data/data.json'

// Hook to read a key from Realtime Database, with local JSON fallback.
// Uses a realtime listener so components (eg. Feed) update when data changes
export default function useRtdbDataKey(key) {
  const [data, setData] = useState(localData?.[key] ?? null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    if (!rtdb) {
      // fallback to local JSON if RTDB not available
      setData(localData?.[key] ?? null)
      setLoading(false)
      return () => { mounted = false }
    }

    const dbRef = ref(rtdb, key)
    const unsubscribe = onValue(dbRef, (snap) => {
      if (!mounted) return
      if (snap.exists()) setData(snap.val())
      else setData(localData?.[key] ?? null)
      setLoading(false)
    }, (err) => {
      if (!mounted) return
      setError(err)
      setData(localData?.[key] ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      try { unsubscribe() } catch (e) { /* ignore */ }
    }
  }, [key])

  return { data, loading, error }
}
