import React from 'react'
import AvatarEditModal from './AvatarEditModal'

export default function AvatarWithEdit({ avatarUrl, onSave }) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <div className="relative inline-block group">
        <img
          src={avatarUrl || '/images/feed/avatar1.svg'}
          alt="User avatar"
          className={`w-16 h-16 rounded-full object-cover ${open ? 'border border-dashed border-[#b7b7c2] group-hover:border-[#aa336a]' : ''}`}
        />

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Edit avatar"
          className="absolute -right-2 -bottom-2 w-8 h-8 bg-white rounded-full outline outline-1 outline-[#b7b7c2] flex items-center justify-center"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
              <path d="M2.6665 13.3342H5.33317L12.3332 6.33419C12.5083 6.15909 12.6472 5.95122 12.7419 5.72245C12.8367 5.49367 12.8855 5.24848 12.8855 5.00085C12.8855 4.75323 12.8367 4.50803 12.7419 4.27926C12.6472 4.05048 12.5083 3.84262 12.3332 3.66752C12.1581 3.49242 11.9502 3.35353 11.7214 3.25877C11.4927 3.16401 11.2475 3.11523 10.9998 3.11523C10.7522 3.11523 10.507 3.16401 10.2782 3.25877C10.0495 3.35353 9.8416 3.49242 9.6665 3.66752L2.6665 10.6675V13.3342Z" stroke="#AA336A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 4.33398L11.6667 7.00065" stroke="#AA336A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
          </svg>
        </button>
      </div>

      <AvatarEditModal
        open={open}
        onClose={() => setOpen(false)}
        // pass a visible src to the modal so the avatar shows when opened
        currentAvatar={avatarUrl || '/images/feed/avatar1.svg'}
        onSave={async (fileOrNull) => {
          // bubble up; parent is responsible for persisting
          await onSave(fileOrNull)
          setOpen(false)
        }}
      />
    </>
  )
}
