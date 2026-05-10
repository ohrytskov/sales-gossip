import { useEffect, useState } from 'react'
import { rtdb } from '@/firebase/config'
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database'

export type NotificationType = 'like' | 'comment' | 'comment_like' | 'follow' | string

export type Notification = {
  id: string
  type: NotificationType
  actorUid: string
  actorUsername: string
  actorAvatar: string
  timestamp: string
  read: boolean
  postId?: string
  postTitle?: string
  commentText?: string
}

export type UseNotificationsResult = {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: Error | null
}

/**
 * Hook to fetch notifications for a user in real-time.
 */
export default function useNotifications(
  uid: string | null | undefined,
  limit: number = 50,
): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

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

        const data: Record<string, Notification> = snap.val()
        const notificationsList: Notification[] = Object.values(data)

        notificationsList.sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )

        const unread = notificationsList.filter((n) => !n.read).length

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
