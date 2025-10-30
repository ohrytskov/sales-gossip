import { useEffect, useRef } from 'react'

export default function CommentDropdown({ isOpen, onClose, onReport, onDelete }) {
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-[#e8e8eb] -translate-y-2.5"
    >
      {/* Report Option */}
      <button
        onClick={() => {
          onReport()
          onClose()
        }}
        className="w-full px-4 py-2 text-left hover:bg-[#f5f5f7] transition-colors flex items-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_332_5703)">
            <path d="M3.33398 3.33323C3.95708 2.72247 4.79481 2.38037 5.66732 2.38037C6.53983 2.38037 7.37755 2.72247 8.00065 3.33323C8.62375 3.94398 9.46147 4.28609 10.334 4.28609C11.2065 4.28609 12.0442 3.94398 12.6673 3.33323V9.33323C12.0442 9.94398 11.2065 10.2861 10.334 10.2861C9.46147 10.2861 8.62375 9.94398 8.00065 9.33323C7.37755 8.72247 6.53983 8.38037 5.66732 8.38037C4.79481 8.38037 3.95708 8.72247 3.33398 9.33323V3.33323Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.33398 14.0002V9.3335" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <defs>
            <clipPath id="clip0_332_5703">
              <rect width="16" height="16" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <span className="text-[#10112a] text-sm font-medium font-['Inter']">Report</span>
      </button>

      {/* Delete Option */}
      <button
        onClick={() => {
          onDelete()
          onClose()
        }}
        className="w-full px-4 py-2 text-left hover:bg-[#f5f5f7] transition-colors flex items-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_332_5721)">
            <path d="M2.66602 4.6665H13.3327" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.66602 7.3335V11.3335" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.33398 7.3335V11.3335" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.33398 4.6665L4.00065 12.6665C4.00065 13.0201 4.14113 13.3593 4.39118 13.6093C4.64122 13.8594 4.98036 13.9998 5.33398 13.9998H10.6673C11.0209 13.9998 11.3601 13.8594 11.6101 13.6093C11.8602 13.3593 12.0007 13.0201 12.0007 12.6665L12.6673 4.6665" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 4.66667V2.66667C6 2.48986 6.07024 2.32029 6.19526 2.19526C6.32029 2.07024 6.48986 2 6.66667 2H9.33333C9.51014 2 9.67971 2.07024 9.80474 2.19526C9.92976 2.32029 10 2.48986 10 2.66667V4.66667" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <defs>
            <clipPath id="clip0_332_5721">
              <rect width="16" height="16" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <span className="text-[#10112a] text-sm font-medium font-['Inter']">Delete</span>
      </button>
    </div>
  )
}
