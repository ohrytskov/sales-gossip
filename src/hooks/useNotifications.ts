import { useEffect, useState } from 'react'
import { rtdb } from '@/firebase/config'
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database'

/**
 * Hook to fetch notifications for a user in real-time
 * @param {string} uid - User ID
 * @param {number} limit - Max number of notifications to fetch (default: 50)
 * @returns {Object} { notifications, unreadCount, loading, error }
 */
export default function useNotifications(uid, limit = 50) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    if (!uid) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return () => { mounted = false }
    }

    if (!rtdb) {
      setError(new Error('Realtime Database not configured'))
      setLoading(false)
      return () => { mounted = false }
    }

    const notificationsPath = `notifications/${uid}`
    const dbRef = ref(rtdb, notificationsPath)
    const notificationsQuery = query(
      dbRef,
      orderByChild('timestamp'),
      limitToLast(limit)
    )

    const unsubscribe = onValue(
      notificationsQuery,
      (snap) => {
        if (!mounted) return

        if (!snap.exists()) {
          setNotifications([])
          setUnreadCount(0)
          setLoading(false)
          return
        }

        const data = snap.val()
        const notificationsList = Object.values(data)

        // Sort by timestamp descending (newest first)
        notificationsList.sort((a, b) =>
          new Date(b.timestamp) - new Date(a.timestamp)
        )

        // Count unread
        const unread = notificationsList.filter(n => !n.read).length

        setNotifications(notificationsList)
        setUnreadCount(unread)
        setLoading(false)
      },
      (err) => {
        if (!mounted) return
        setError(err)
        setNotifications([])
        setUnreadCount(0)
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      try {
        unsubscribe()
      } catch (e) {
        /* ignore */
      }
    }
  }, [uid, limit])

  return { notifications, unreadCount, loading, error }
}
