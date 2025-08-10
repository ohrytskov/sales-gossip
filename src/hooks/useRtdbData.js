import { useEffect, useState } from 'react'
import { rtdb } from '@/firebase/config'
import { ref, get } from 'firebase/database'
import localData from '@/data/data.json'

// Hook to read a key from Realtime Database, with local JSON fallback
export default function useRtdbDataKey(key) {
  const [data, setData] = useState(localData?.[key] ?? null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    async function fetchData() {
      setLoading(true)
      try {
        if (!rtdb) throw new Error('Realtime DB not initialized')
        // Read key from the root of the Realtime Database
        const snap = await get(ref(rtdb, key))
        if (snap.exists()) {
          if (mounted) setData(snap.val())
        } else {
          if (mounted) setData(localData?.[key] ?? null)
        }
      } catch (err) {
        if (mounted) {
          setError(err)
          setData(localData?.[key] ?? null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [key])

  return { data, loading, error }
}
