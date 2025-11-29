//import SuggestionItem from './SuggestionItem'

function SuggestionItem({ avatar, username, posts, followers, userId, onFollow, isFollowed, isLoadingFollow }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={avatar}
          alt={username}
          className="w-8 h-8 rounded-full"
        />
        <div className="flex flex-col">
          <span className="text-slate-900 text-sm font-medium">
            {username}
          </span>
          <span className="text-gray-500 text-sm">
            {posts} posts • {followers} followers
          </span>
        </div>
      </div>
      <button
        onClick={() => onFollow(userId)}
        disabled={!userId || isLoadingFollow}
        className="text-pink-600 font-medium flex justify-center items-center gap-2 disabled:opacity-50"
        title={!userId ? 'User ID missing' : ''}
      >
        {!isFollowed && (
          <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_325_7310)">
              <path d="M8 3.83203V13.1654" stroke="#AA336A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3.33398 8.5H12.6673" stroke="#AA336A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <defs>
              <clipPath id="clip0_325_7310">
                <rect width="16" height="16" fill="white" transform="translate(0 0.5)" />
              </clipPath>
            </defs>
          </svg>
        )}
        {isFollowed ? 'Following' : 'Follow'}
      </button>
    </div>
  )
}

import useRtdbDataKey from '@/hooks/useRtdbData'
import { useFollow } from '@/hooks/useFollow'

export default function SuggestedUsers({ transparent = false, title = "Suggested for you", footerText, maxUsers = 6 }) {
  const { data: usersData } = useRtdbDataKey('users')
  const users = usersData ? Object.values(usersData) : []
  const { toggleFollow, isFollowing, isLoadingFollow } = useFollow()

  return (
    <div className={`w-96 ${transparent ? 'bg-transparent' : 'bg-indigo-50'} rounded-lg outline outline-1 outline-offset-[-1px] outline-[#b7b7c2] overflow-hidden p-4 space-y-4`}>
      <div className="text-gray-600 text-base font-medium uppercase">
        {title}
      </div>
      <div className="max-h-96 overflow-y-auto space-y-[30px]">
        {users.map((user, i) => (
          <SuggestionItem
            key={user.uid || `user-${i}`}
            userId={user.uid}
            avatar={user.public?.avatarUrl || '/images/feed/avatar1.svg'}
            username={user.public?.username || user.public?.displayName || 'Unknown'}
            posts={user.public?.postsCount || 0}
            followers={user.public?.followersCount || 0}
            onFollow={toggleFollow}
            isFollowed={isFollowing(user.uid)}
            isLoadingFollow={isLoadingFollow(user.uid)}
          />
        ))}
      </div>
      <div className="justify-start text-slate-900 text-sm font-semibold font-['Inter'] leading-none mb-[-40px]">{footerText || (transparent ? 'Show more' : 'View all gossipers')}</div>
    </div>
  )
}
