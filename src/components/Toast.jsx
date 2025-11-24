import React, { useEffect } from 'react'

export default function Toast({ message, show, onClose, type = 'success' }) {
  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => {
      onClose && onClose()
    }, 3000)
    return () => clearTimeout(t)
  }, [show, onClose])

  if (!show) return null

  const bgColor = type === 'error' ? 'bg-red-50' : 'bg-green-50'
  const borderColor = type === 'error' ? 'outline-red-300' : 'outline-green-300'
  const textColor = type === 'error' ? 'text-red-600' : 'text-green-600'

  return (
    <div className="fixed left-1/2 -translate-x-1/2 top-6 z-50" role="status" aria-live="polite">
      <div className={`inline-flex items-center ${bgColor} rounded-2xl outline outline-1 outline-offset-[-1px] ${borderColor} px-4 py-2 max-w-[80vw]`}>
        <div className={`${textColor} text-base font-medium font-['Inter'] leading-snug`}>{message}</div>
        <button type="button" onClick={() => onClose && onClose()} className="ml-4 p-2" aria-label="Close notification">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_215_8467)">
              <path d="M12 4L4 12" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 4L12 12" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            <defs>
              <clipPath id="clip0_215_8467">
                <rect width="16" height="16" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </button>
      </div>
    </div>
  )
}
