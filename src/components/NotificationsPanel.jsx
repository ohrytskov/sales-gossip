import React, { useState } from 'react'
import ToggleOn from './icons/ToggleOn'
import ToggleOff from './icons/ToggleOff'
import BellIcon from './icons/BellIcon'

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
  const [states, setStates] = useState(() => defaultItems.map((_, i) => i < 2))

  const toggle = (idx) => {
    setStates(prev => {
      const copy = [...prev]
      copy[idx] = !copy[idx]
      return copy
    })
  }

  return (
    <div data-layer="Settings - Notifications" className="w-[1156px] p-6 bg-white">
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
}
