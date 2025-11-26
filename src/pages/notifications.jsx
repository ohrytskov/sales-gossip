import { useState } from 'react'
import Header from '@/components/Header'
import { useRouter } from 'next/router'
import NotificationMenu from '@/components/NotificationMenu'
import useNotifications from '@/hooks/useNotifications'
import { useAuth } from '@/hooks/useAuth'
import { markAllAsRead, deleteNotification } from '@/firebase/rtdb/notifications'

const DEFAULT_AVATAR = '/figma/d874a685-9eb7-4fc8-b9ab-8bb017889cd6.png'

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

function NotificationItemPage({ item, onDelete }) {
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
      className={`relative overflow-clip ${item.detail ? 'h-[85px]' : 'h-[64px]'}`}
    >
      <div className="absolute left-6 top-4">
        {avatar()}
      </div>
      <div className="absolute left-[68px] top-[21px] max-w-[473px]">
        <p className={`text-[14px] leading-[22px] text-[#10112A] overflow-ellipsis overflow-hidden ${item.detail ? 'h-12 -webkit-box whitespace-pre-wrap' : ''}`}>
          <span className="font-semibold">{item.title}</span>{' '}
          <span className="text-[#64647C]">{item.message}</span>
          {item.detail ? (
            <>
              <span className="text-[#64647C]">{item.type === 'comments' ? `: ` : ''}</span>
              {item.detail}
            </>
          ) : null}
        </p>
      </div>

      <p className="absolute right-[60px] top-[17px] text-[14px] leading-[22px] text-[#10112A] text-right">
        {item.time}
      </p>
      <div className="absolute right-[32px] top-4">
        <NotificationMenu
          onDelete={() => onDelete && onDelete(item.id)}
        />
      </div>
    </div>
  )
}

export default function Notifications() {
  const router = useRouter()
  const { user } = useAuth()
  const { notifications: realNotifications, loading } = useNotifications(user?.uid)

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

  const notifications = transformedNotifications

  return (
    <div className="font-inter relative bg-white min-h-screen">
      <Header />


      <div className="max-w-[1440px] mx-auto w-full px-[142px] mt-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="PrimaryButton w-8 h-8 bg-white rounded-[56px] outline outline-1 outline-offset-[-1px] outline-[#b7b7c2] inline-flex justify-center items-center"
              aria-label="Go back"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_10279_6261)">
                  <path d="M12.6673 7.5C12.9435 7.5 13.1673 7.72386 13.1673 8C13.1673 8.27614 12.9435 8.5 12.6673 8.5H3.33398C3.05784 8.5 2.83398 8.27614 2.83398 8C2.83398 7.72386 3.05784 7.5 3.33398 7.5H12.6673Z" fill="#9B2E60"/>
                  <path d="M2.98043 7.64645C3.17569 7.45118 3.4922 7.45118 3.68746 7.64645L7.68746 11.6464C7.88272 11.8417 7.88272 12.1582 7.68746 12.3535C7.4922 12.5487 7.17569 12.5487 6.98043 12.3535L2.98043 8.35348C2.78517 8.15822 2.78517 7.84171 2.98043 7.64645Z" fill="#9B2E60"/>
                  <path d="M6.98043 3.64645C7.17569 3.45118 7.4922 3.45118 7.68746 3.64645C7.88272 3.84171 7.88272 4.15822 7.68746 4.35348L3.68746 8.35348C3.4922 8.54874 3.17569 8.54874 2.98043 8.35348C2.78517 8.15822 2.78517 7.84171 2.98043 7.64645L6.98043 3.64645Z" fill="#9B2E60"/>
                </g>
                <defs>
                  <clipPath id="clip0_10279_6261">
                    <rect width="16" height="16" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </button>
            <h1 className="text-[24px] font-semibold leading-8 text-[#10112A]">Notifications</h1>
          </div>

          <button
            type="button"
            className="h-8 px-4 rounded-full flex items-center justify-center"
            onClick={handleMarkAllAsRead}
          >
            <span className="text-[12px] font-semibold text-[#AA336A]">Mark all as read</span>
          </button>
        </div>

        <p className="text-[14px] font-medium text-[#64647C] uppercase mb-4 ml-6">Today</p>

        <div className="w-[979px]">
          <div className="space-y-0">
            {notifications.map((item) => (
              <NotificationItemPage
                key={item.id}
                item={item}
                onDelete={handleDeleteNotification}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
