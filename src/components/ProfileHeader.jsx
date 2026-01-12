import { useState, useEffect, useRef } from 'react'
import { useFollow } from '@/hooks/useFollow'
import { useAuth } from '@/hooks/useAuth'
import { sendReport } from '@/firebase/rtdb/reports'
import Toast from '@/components/Toast'

const patternUrl = 'https://www.figma.com/api/mcp/asset/a8c6cee3-3d5c-4b06-94af-c4643078febd'
const defaultAvatar = 'https://www.figma.com/api/mcp/asset/611861d9-214c-4438-8e96-9d33c70f0c4e'
const accentColor = '#79244B'

const defaultStats = {
  posts: 93,
  followers: 88,
  following: 124
}

const defaultFollowExamples = ['david.sdr', 'John doe', 'smith.john']

async function copyTextToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
  }

  if (typeof document === 'undefined') {
    throw new Error('No clipboard support in this environment')
  }

  const fallbackTextarea = document.createElement('textarea')
  fallbackTextarea.value = text
  fallbackTextarea.setAttribute('readonly', '')
  fallbackTextarea.style.position = 'absolute'
  fallbackTextarea.style.left = '-9999px'
  document.body.appendChild(fallbackTextarea)
  fallbackTextarea.select()
  fallbackTextarea.setSelectionRange(0, text.length)
  const successful = document.execCommand('copy')
  document.body.removeChild(fallbackTextarea)

  if (!successful) {
    throw new Error('Fallback copy command failed')
  }
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <g clipPath="url(#clip-plus)">
        <path d="M7.5 12.667V3.334a.5.5 0 0 1 1 0v9.333a.5.5 0 0 1-1 0Z" fill="white" />
        <path d="M12.667 7.5a.5.5 0 0 1 0 1H3.333a.5.5 0 0 1 0-1h9.334Z" fill="white" />
      </g>
      <defs>
        <clipPath id="clip-plus">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function DotMenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <g clipPath="url(#clip-dots)">
        <path d="M2.667 8a.667.667 0 1 0 1.333 0 .667.667 0 0 0-1.333 0Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.333 8a.667.667 0 1 0 1.334 0 .667.667 0 0 0-1.334 0Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 8a.667.667 0 1 0 1.333 0A.667.667 0 0 0 12 8Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <clipPath id="clip-dots">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function ReportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <g clipPath="url(#clip0_339_6607)">
        <path d="M3.33398 3.33372C3.95708 2.72296 4.79481 2.38086 5.66732 2.38086C6.53983 2.38086 7.37755 2.72296 8.00065 3.33372C8.62375 3.94447 9.46147 4.28657 10.334 4.28657C11.2065 4.28657 12.0442 3.94447 12.6673 3.33372V9.33372C12.0442 9.94447 11.2065 10.2866 10.334 10.2866C9.46147 10.2866 8.62375 9.94447 8.00065 9.33372C7.37755 8.72296 6.53983 8.38086 5.66732 8.38086C4.79481 8.38086 3.95708 8.72296 3.33398 9.33372V3.33372Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.33398 14.0007V9.33398" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
        <clipPath id="clip0_339_6607">
          <rect width="16" height="16" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  )
}

function CopyLinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <g clipPath="url(#clip0_339_6613)">
        <path d="M6 10L10 6" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7.33301 3.99955L7.64167 3.64222C8.26688 3.0171 9.1148 2.66595 9.99891 2.66602C10.883 2.66608 11.7309 3.01735 12.356 3.64255C12.9811 4.26776 13.3323 5.11568 13.3322 5.99979C13.3321 6.8839 12.9809 7.73177 12.3557 8.35689L11.9997 8.66622" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.66709 12.0007L8.40242 12.3567C7.76992 12.9821 6.91628 13.3329 6.02675 13.3329C5.13723 13.3329 4.28359 12.9821 3.65109 12.3567C3.33932 12.0484 3.09182 11.6813 2.92289 11.2767C2.75397 10.8722 2.66699 10.4381 2.66699 9.99965C2.66699 9.56122 2.75397 9.12714 2.92289 8.72256C3.09182 8.31797 3.33932 7.95092 3.65109 7.64265L4.00042 7.33398" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
        <clipPath id="clip0_339_6613">
          <rect width="16" height="16" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <g clipPath="url(#clip-calendar)">
        <path d="M3.332 5.833A1.667 1.667 0 0 1 5 4.167h10a1.667 1.667 0 0 1 1.667 1.666v10a1.667 1.667 0 0 1-1.667 1.667H5A1.667 1.667 0 0 1 3.332 15.833v-10Z" stroke="#9495A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.332 2.5v3.333" stroke="#9495A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.668 2.5v3.333" stroke="#9495A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.332 9.167h13.333" stroke="#9495A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <clipPath id="clip-calendar">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5.244 8.244a.833.833 0 0 1 1.179 0L10 11.82l3.577-3.576a.833.833 0 1 1 1.179 1.179l-4.167 4.166a.833.833 0 0 1-1.179 0L5.244 9.423a.833.833 0 0 1 0-1.179Z"
        fill="#0A0A19"
      />
    </svg>
  )
}

function GridIcon({ active }) {
  if (active) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <g clipPath="url(#clip-grid-active)">
          <path
            d="M3 8c0-.796.316-1.559.879-2.121A3 3 0 0 1 6 5h12a3 3 0 0 1 3 3v8a3 3 0 0 1-.879 2.121A3 3 0 0 1 18 19H6a3 3 0 0 1-3-3V8Z"
            fill={accentColor}
            stroke={accentColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M3 12h18" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs>
          <clipPath id="clip-grid-active">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    )
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g clipPath="url(#clip-grid)">
        <path
          d="M3 8c0-.796.316-1.559.879-2.121A3 3 0 0 1 6 5h12a3 3 0 0 1 3 3v8a3 3 0 0 1-.879 2.121A3 3 0 0 1 18 19H6a3 3 0 0 1-3-3V8Z"
          stroke="#64647C"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M3 10h18" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 14h18" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <clipPath id="clip-grid">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function Stat({ value, label }) {
  return (
    <div className="flex items-baseline gap-1 text-base font-medium">
      <span className="text-slate-900">{value}</span>
      <span className="text-zinc-400">{label}</span>
    </div>
  )
}

function Divider() {
  return <span className="h-5 w-px bg-[#B7B7C2]" aria-hidden="true" />
}

export default function ProfileHeader({
  name = 'QuotaCrusher',
  bio = '',
  avatar = defaultAvatar,
  stats = defaultStats,
  joined = 'Joined February 2025',
  followExamples = defaultFollowExamples,
  bannerUrl = '',
  profileUid = null
}) {
  const { user } = useAuth()
  const { isFollowing, isLoadingFollow, toggleFollow } = useFollow()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isReporting, setIsReporting] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const dropdownRef = useRef(null)
  const hasBanner = Boolean(bannerUrl)
  const safeBio = typeof bio === 'string' ? bio.trim() : ''

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const showToastMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
  }

  const handleCopyLink = async () => {
    try {
      await copyTextToClipboard(window.location.href)
      setIsDropdownOpen(false)
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleReport = async () => {
    if (!user) {
      showToastMessage('You must be logged in to report users')
      setIsDropdownOpen(false)
      return
    }

    if (!profileUid) {
      console.error('No profile UID available for reporting')
      setIsDropdownOpen(false)
      return
    }

    setIsReporting(true)

    try {
      const result = await sendReport({
        type: 'user',
        reporterUid: user.uid,
        reporterUsername: user.displayName || 'Anonymous',
        targetId: profileUid,
        targetUsername: name || 'Unknown User',
        reason: 'Reported via profile dropdown',
        details: `User profile reported. Bio: "${safeBio || 'No bio'}"`,
        url: `${window.location.origin}/profile?id=${encodeURIComponent(profileUid)}`
      })

      if (result.success) {
        showToastMessage(`User reported successfully. Sent to ${result.sentCount} moderator(s).`)
      } else {
        showToastMessage('Failed to send report. Please try again later.')
      }
    } catch (error) {
      console.error('Failed to report user:', error)
      showToastMessage('Failed to send report. Please try again later.')
    } finally {
      setIsReporting(false)
      setIsDropdownOpen(false)
    }
  }
  return (
    <section className="w-[741px] font-inter">
      <div className="relative overflow-hidden bg-white border-l border-r border-gray-200">
        <div className="h-[194px] w-full" aria-hidden="true">
          {hasBanner ? (
            <img
              src={bannerUrl}
              alt={`${name} banner`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-[#FFE3EA]" />
          )}
        </div>
        <div className="px-6 pb-8 pt-0">
          <div className="flex flex-wrap items-start gap-6">
            <div className="-mt-16">
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white">
                <img
                  src={avatar}
                  alt={`${name} avatar`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="flex-1 pt-4">
              <div className="flex flex-wrap items-start justify-end gap-4">
                <div className="flex items-center gap-3">
                  {profileUid && (
                    <button
                      type="button"
                      disabled={isLoadingFollow(profileUid)}
                      onClick={async () => {
                        try {
                          const wasFollowing = isFollowing(profileUid)
                          const success = await toggleFollow(profileUid)
                          if (!wasFollowing && success) {
                            showToastMessage(`Successfully followed ${name}`)
                          }
                        } catch (error) {
                          showToastMessage(error.message)
                        }
                      }}
                      className={`inline-flex px-4 py-2 text-xs font-semibold rounded-[56px] ${
                        isFollowing(profileUid)
                          ? 'justify-center items-center bg-white text-[#aa336a] outline outline-1 outline-offset-[-1px] outline-[#b7b7c2] hover:bg-gray-50'
                          : 'items-center gap-2 bg-pink-700 text-white hover:bg-pink-800'
                      } ${isLoadingFollow(profileUid) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isFollowing(profileUid) ? (
                        'Following'
                      ) : (
                        <>
                          <PlusIcon />
                          Follow
                        </>
                      )}
                    </button>
                  )}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white"
                      aria-label="Open profile actions"
                      onClick={() => setIsDropdownOpen((prev) => !prev)}
                    >
                      <DotMenuIcon />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 z-10 w-[190px] rounded-[8px] bg-white px-3 py-2 shadow-[0px_0px_16px_0px_rgba(16,17,42,0.08)] font-inter">
                        <div className="flex flex-col gap-[10px]">
                          {[
                            {
                              id: 'report',
                              label: isReporting ? 'Reporting...' : 'Report',
                              action: handleReport,
                              Icon: ReportIcon,
                              disabled: isReporting
                            },
                            { id: 'copy-link', label: 'Copy link to profile', action: handleCopyLink, Icon: CopyLinkIcon }
                          ].map(({ id, label, action, Icon, disabled }) => (
                            <button
                              key={id}
                              type="button"
                              onClick={action}
                              disabled={disabled}
                              className={`inline-flex w-full items-center gap-2 rounded px-1 py-1 text-[14px] font-medium leading-[22px] ${
                                disabled
                                  ? 'text-gray-500 cursor-not-allowed'
                                  : 'text-[#10112A] hover:bg-[#F3F4F6]'
                              }`}
                            >
                              <Icon />
                              <span>{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold leading-tight text-[#10112A]">{name}</h1>
              {safeBio ? (
                <p className="mt-2 text-base font-medium text-[#64647C]">{safeBio}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Stat value={stats.posts} label="Posts" />
                <Divider />
                <Stat value={stats.followers} label="Followers" />
                <Divider />
                <Stat value={stats.following} label="Following" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
              <CalendarIcon />
              <span>{joined}</span>
            </div>
          </div>
        </div>
      </div>
      <Toast show={showToast} message={toastMessage} onClose={() => setShowToast(false)} />
    </section>
  )
}
