import { useEffect, useState } from 'react'
import { rtdb } from '@/firebase/config'
import { ref, onValue } from 'firebase/database'

type UseRtdbDataResult<T> = {
  data: T | null
  loading: boolean
  error: Error | null
}

type UseRtdbDataOptions<T> = {
  initialData?: T
}

export default function useRtdbDataKey<T = Record<string, any>>(
  key: string | null | undefined,
  options: UseRtdbDataOptions<T> = {},
): UseRtdbDataResult<T> {
  const hasInitialData = Object.prototype.hasOwnProperty.call(options, 'initialData')
  const [data, setData] = useState<T | null>(hasInitialData ? (options.initialData as T) : null)
  const [loading, setLoading] = useState(!hasInitialData)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true
    if (!key) return () => { mounted = false }
    if (!hasInitialData) setLoading(true)

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
  }, [key, hasInitialData])

  return { data, loading, error }
}
