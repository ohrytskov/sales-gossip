import React, { useId } from 'react'

export default function ToggleOn({ className }) {
  const id = useId()
  const filterId = `toggle-on-shadow-${id}`

  return (
    <svg className={className} width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden overflow="visible" style={{ overflow: 'visible' }}>
      <defs>
        <filter id={filterId} filterUnits="userSpaceOnUse" x="-20" y="-20" width="80" height="80" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* track */}
      <rect x="0" y="7" width="40" height="18" rx="9" fill="#AA336A" />

      {/* larger knob (intentionally larger than track height) with shadow */}
      <circle cx="30" cy="16" r="12" fill="#ffffff" filter={`url(#${filterId})`} />

      {/* check mark centered inside knob */}
      <g transform="translate(22,8)">
        <path d="M3.3335 8.0013L6.66683 11.3346L13.3335 4.66797" stroke="#AA336A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  )
}
