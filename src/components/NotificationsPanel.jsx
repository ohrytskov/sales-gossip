import React, { useState, useEffect } from 'react'
import ToggleOn from './icons/ToggleOn'
import ToggleOff from './icons/ToggleOff'
import BellIcon from './icons/BellIcon'
import { useAuth } from '@/hooks/useAuth'
import { getNotifications, setNotifications, NOTIFICATION_KEYS } from '@/firebase/rtdb/preferences'

export default function NotificationsPanel() {
  const defaultItems = [
    'Mentions of username',
    'Likes on your posts',
    'Comments on your posts',
    'Replies to your comments',
    'New followers',
    'Trending gossips',
  ]

  // maintain booleans for each toggle (true = on)
  const defaultStates = defaultItems.map((_, i) => i < 2)
  const [states, setStates] = useState(() => defaultStates)
  const { user } = useAuth()

  // Load saved preferences when user logs in. UseEffect is sufficient; while
  // loading we'll render nothing to avoid a default->loaded blink.
  const [loadingPrefs, setLoadingPrefs] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!user || !user.uid) {
        setStates(defaultStates)
        setLoadingPrefs(false)
        return
      }
      setLoadingPrefs(true)
      try {
        const activity = await getNotifications(user.uid)
        if (!mounted) return
        if (!activity) {
          setStates(defaultStates)
        } else {
          const next = NOTIFICATION_KEYS.map((k, i) => Boolean(activity[k] ?? defaultStates[i]))
          setStates(next)
        }
      } catch (e) {
        console.error('Failed to load notification preferences', e)
        setStates(defaultStates)
      } finally {
        if (mounted) setLoadingPrefs(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [user])

  const toggle = async (idx) => {
    // compute next state locally so we can persist consistently
    const copy = [...states]
    copy[idx] = !copy[idx]
    setStates(copy)

    // persist the change (best-effort)
    try {
      if (!user || !user.uid) return
      const next = NOTIFICATION_KEYS.reduce((acc, k, i) => {
        acc[k] = !!copy[i]
        return acc
      }, {})
      await setNotifications(user.uid, next)
    } catch (e) {
      console.error('Failed to save notification preferences', e)
    }
  }

  return (
    // If we're loading prefs, render nothing to avoid showing defaults first
    loadingPrefs ? null : (
    <div data-layer="Settings - Notifications" className="w-[1156px] py-6 px-0 bg-white">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6"><BellIcon /></div>
        <div>
          <div className="text-base font-medium text-[#10112a]">Activity</div>
          <div className="text-sm text-[#454662]">You can view these notifications only in your SalesGossip inbox.</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {defaultItems.map((label, i) => (
          <div key={label} className="flex items-center justify-between border-b border-[#e8e8eb] pb-4">
            <div className="text-sm text-[#10112a]">{label}</div>
            <div className="ml-4">
              <button
                type="button"
                role="switch"
                aria-checked={states[i]}
                onClick={() => toggle(i)}
                className="focus:outline-none"
                title={states[i] ? 'Turn off' : 'Turn on'}
              >
                {states[i] ? <ToggleOn className="cursor-pointer" /> : <ToggleOff className="cursor-pointer" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    )
  )
}
