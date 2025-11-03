import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import NotificationMenu from './NotificationMenu'
import useNotifications from '@/hooks/useNotifications'
import { useAuth } from '@/hooks/useAuth'
import { markAllAsRead, deleteNotification } from '@/firebase/rtdb/notifications'
import { useOnClickOutside } from '@/utils/useOnClickOutside'

const DEFAULT_AVATAR = '/figma/d874a685-9eb7-4fc8-b9ab-8bb017889cd6.png'
function CloseIcon({ className }) {
  return (
    <svg preserveAspectRatio="none" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g>
        <circle cx="16" cy="16" r="16" fill="#F2F2F4" />
        <g clipPath="url(#clip0_0_20)">
          <path d="M20.7953 11.2012L11.1953 20.8012" stroke="#17183B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11.1953 11.2012L20.7953 20.8012" stroke="#17183B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_0_20">
          <rect width="19.2" height="19.2" fill="white" transform="translate(6.39844 6.40039)" />
        </clipPath>
      </defs>
    </svg>
  )
}


function formatTimeAgo(timestamp) {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}min`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return `${Math.floor(diffDays / 7)}w`
}

function NotificationItem({ item, onClick, onDelete }) {
  const handleKeyDown = (event) => {
    if (!onClick) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick(event)
    }
  }

  const avatar = () => {
    if (item.avatars?.length) {
      if (item.avatars.length > 1) {
        return (
          <div className="relative h-8 w-10">
            {item.avatars.slice(0, 2).map((src, index) => (
              <img
                key={`${item.id}-avatar-${index}`}
                src={src}
                alt=""
                className={`absolute top-0 h-8 w-8 rounded-full object-cover border-2 border-white ${
                  index === 0 ? 'left-0 z-10' : 'left-3'
                }`}
                loading="lazy"
              />
            ))}
          </div>
        )
      }

      return (
        <img
          src={item.avatars[0]}
          alt={item.avatarAlt || ''}
          className="h-8 w-8 rounded-full object-cover"
          loading="lazy"
        />
      )
    }

    const fallback = (item.title || 'U').slice(0, 1).toUpperCase()

    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F2F4] text-[12px] font-semibold text-[#64647C]">
        {fallback}
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-clip ${item.detail ? 'h-[85px]' : 'h-[64px]'} ${
        onClick ? 'cursor-pointer hover:bg-[#F2F2F4]' : ''
      }`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="absolute left-6 top-4">
        {avatar()}
      </div>
      <div className="absolute left-[68px] top-[21px] max-w-[306px]">
        <p className="text-[14px] leading-[22px] text-[#10112A] overflow-ellipsis overflow-hidden">
          <span className="font-semibold">{item.title}</span>{' '}
          <span className="text-[#64647C]">{item.message}</span>
        </p>
        {item.detail ? (
          <p className="text-[14px] leading-[22px] text-[#64647C] overflow-ellipsis overflow-hidden whitespace-pre-wrap">
            {item.type === 'comments' ? `: ` : ''}{item.detail}
          </p>
        ) : null}
      </div>

      <p className="absolute right-[56px] top-[21px] text-[14px] leading-[22px] text-[#10112A] text-right w-[40px]">
        {item.time}
      </p>
      <div className="absolute right-[32px] top-[21px]">
        <NotificationMenu
          onChangeSettings={() => console.log('Change settings for', item.id)}
          onDelete={() => onDelete && onDelete(item.id)}
        />
      </div>
    </div>
  )
}

export default function Notifications({ open, onClose, bellButtonRef }) {
  const ref = useRef(null)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('all')
  const { user } = useAuth()
  const { notifications: realNotifications, loading } = useNotifications(user?.uid)

  useOnClickOutside(ref, () => {
    if (onClose) onClose()
  })

  const handleNotificationClick = () => {
    router.push('/notifications')
    if (onClose) onClose()
  }

  const handleMarkAllAsRead = async () => {
    if (!user?.uid) return
    try {
      await markAllAsRead(user.uid)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleDeleteNotification = async (notificationId) => {
    if (!user?.uid || !notificationId) return
    try {
      await deleteNotification(user.uid, notificationId)
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  if (!open) return null

  // Transform real notifications to match the expected format
  const transformedNotifications = realNotifications.map((notification) => {
    let message = ''
    let detail = null

    switch (notification.type) {
      case 'like':
        message = 'has liked your post.'
        break
      case 'comment':
        message = 'has commented on your post'
        detail = notification.commentText
        break
      case 'follow':
        message = 'has started following you'
        break
      default:
        message = ''
    }

    return {
      id: notification.id,
      type: notification.type === 'follow' ? 'follows' : `${notification.type}s`,
      title: notification.actorUsername,
      message,
      detail,
      time: formatTimeAgo(notification.timestamp),
      avatars: notification.actorAvatar ? [notification.actorAvatar] : [DEFAULT_AVATAR],
      postId: notification.postId,
      read: notification.read
    }
  })

  const baseItems = transformedNotifications

  const normalizedItems = baseItems.map((entry, index) => {
    const rawType = entry.type ? String(entry.type).toLowerCase() : ''
    let normalizedType = 'all'

    if (rawType.startsWith('comment')) normalizedType = 'comments'
    else if (rawType.startsWith('like')) normalizedType = 'likes'
    else if (rawType.startsWith('follow')) normalizedType = 'follows'
    else if (rawType) normalizedType = rawType

    return {
      ...entry,
      id: entry.id ?? `notification-${index}`,
      title: entry.title ?? entry.name ?? '',
      message: entry.message ?? entry.description ?? '',
      detail: entry.detail ?? entry.comment ?? entry.body ?? null,
      time: entry.time ?? '',
      avatars: entry.avatars ?? (entry.avatar ? [entry.avatar] : undefined),
      type: normalizedType,
    }
  })

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'comments', label: 'Comments' },
    { key: 'likes', label: 'Likes' },
    { key: 'follows', label: 'Follows' },
  ]

  const visibleItems = normalizedItems.filter((entry) =>
    activeTab === 'all' ? true : entry.type === activeTab
  )

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="pointer-events-auto fixed top-[80px] right-[142px] h-[376px] w-[507px]">
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          className="font-inter h-full w-full overflow-hidden rounded-[24px] bg-white shadow-[0px_0px_8px_0px_rgba(16,17,42,0.12)]"
        >
          <div className="flex h-full flex-col">
            <div className="absolute border-b border-[#E8E8EB] border-l-0 border-r-0 border-solid border-t-0 h-[99px] left-0 top-0 w-[507px]">
              <div className="flex items-center justify-between gap-6 px-6 pt-6">
                <h2 className="text-[18px] font-semibold leading-[24px] text-[#17183B]">Notifications</h2>
                <button
                  type="button"
                  aria-label="Close notifications"
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#F7EBF0]"
                  onClick={onClose}
                >
                  <CloseIcon className="h-6 w-6" aria-hidden />
                </button>
              </div>
              <div className="absolute left-6 top-[64px] flex gap-6">
                <nav className="flex gap-6" aria-label="Notification tabs">
                  {tabs.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setActiveTab(t.key)}
                      className={`box-border content-stretch flex gap-2 items-center justify-center px-0 py-2 text-[16px] font-medium leading-normal ${
                        activeTab === t.key
                          ? 'border-b-[1.5px] border-[#79244B] text-[#79244B]'
                          : 'text-[#9495A5]'
                      }`}
                      aria-current={activeTab === t.key ? 'page' : undefined}
                    >
                      {t.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            <div className="absolute left-[324px] top-[115px] flex items-center gap-1">
              <button
                type="button"
                aria-label="Mark all as read"
                className="box-border flex h-8 w-auto items-center justify-center gap-2 rounded-[56px] px-4 text-[12px] font-semibold text-[#AA336A] whitespace-nowrap"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
              <div className="h-6 w-px bg-[#E8E8EB]" aria-hidden="true" />
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#F2F2F4]"
                aria-label="Notification settings"
                onClick={() => {
                  router.push('/settings?tab=notifications')
                  if (onClose) onClose()
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <g clipPath="url(#clip0_10279_5552)">
                    <path d="M6.88333 2.878C7.16733 1.70733 8.83267 1.70733 9.11667 2.878C9.15928 3.05387 9.24281 3.21719 9.36047 3.35467C9.47813 3.49215 9.62659 3.5999 9.79377 3.66916C9.96094 3.73843 10.1421 3.76723 10.3225 3.75325C10.5029 3.73926 10.6775 3.68287 10.832 3.58867C11.8607 2.962 13.0387 4.13933 12.412 5.16867C12.3179 5.3231 12.2616 5.49756 12.2477 5.67785C12.2337 5.85814 12.2625 6.03918 12.3317 6.20625C12.4009 6.37333 12.5085 6.52172 12.6458 6.63937C12.7831 6.75702 12.9463 6.8406 13.122 6.88333C14.2927 7.16733 14.2927 8.83267 13.122 9.11667C12.9461 9.15928 12.7828 9.24281 12.6453 9.36047C12.5079 9.47813 12.4001 9.62659 12.3308 9.79377C12.2616 9.96094 12.2328 10.1421 12.2468 10.3225C12.2607 10.5029 12.3171 10.6775 12.4113 10.832C13.038 11.8607 11.8607 13.0387 10.8313 12.412C10.6769 12.3179 10.5024 12.2616 10.3222 12.2477C10.1419 12.2337 9.96082 12.2625 9.79375 12.3317C9.62667 12.4009 9.47828 12.5085 9.36063 12.6458C9.24298 12.7831 9.1594 12.9463 9.11667 13.122C8.83267 14.2927 7.16733 14.2927 6.88333 13.122C6.84072 12.9461 6.75719 12.7828 6.63953 12.6453C6.52187 12.5079 6.37341 12.4001 6.20623 12.3308C6.03906 12.2616 5.85789 12.2328 5.67748 12.2468C5.49706 12.2607 5.3225 12.3171 5.168 12.4113C4.13933 13.038 2.96133 11.8607 3.588 10.8313C3.68207 10.6769 3.73837 10.5024 3.75232 10.3222C3.76628 10.1419 3.7375 9.96082 3.66831 9.79375C3.59913 9.62667 3.49151 9.47828 3.35418 9.36063C3.21686 9.24298 3.05371 9.1594 2.878 9.11667C1.70733 8.83267 1.70733 7.16733 2.878 6.88333C3.05387 6.84072 3.21719 6.75719 3.35467 6.63953C3.49215 6.52187 3.5999 6.37341 3.66916 6.20623C3.73843 6.03906 3.76723 5.85789 3.75325 5.67748C3.73926 5.49706 3.68287 5.3225 3.58867 5.168C2.962 4.13933 4.13933 2.96133 5.16867 3.588C5.83533 3.99333 6.69933 3.63467 6.88333 2.878Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 8C6 8.53043 6.21071 9.03914 6.58579 9.41421C6.96086 9.78929 7.46957 10 8 10C8.53043 10 9.03914 9.78929 9.41421 9.41421C9.78929 9.03914 10 8.53043 10 8C10 7.46957 9.78929 6.96086 9.41421 6.58579C9.03914 6.21071 8.53043 6 8 6C7.46957 6 6.96086 6.21071 6.58579 6.58579C6.21071 6.96086 6 7.46957 6 8Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  <defs>
                    <clipPath id="clip0_10279_5552">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </button>
            </div>

            <div className="absolute left-6 top-[122px] flex items-center justify-between">
              <p className="text-[14px] font-medium uppercase leading-normal text-[#64647C]">Today</p>
            </div>

            <div className="absolute left-6 top-[119px] flex h-0 w-0 items-center justify-center rotate-90">
              <div className="h-0 w-[24px] border-t border-[#E8E8EB]" />
            </div>

            <div className="absolute left-0 top-[155px] w-[507px] h-[221px] overflow-y-auto pr-2">
              <div className="space-y-0 pr-4">
                {visibleItems.map((item) => (
                  <NotificationItem
                    key={item.id}
                    item={item}
                    onClick={handleNotificationClick}
                    onDelete={handleDeleteNotification}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
