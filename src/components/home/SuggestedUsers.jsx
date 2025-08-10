//import SuggestionItem from './SuggestionItem'

function SuggestionItem({ avatar, username, posts, followers }) {
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
      <button className="text-pink-600 font-medium flex justify-center items-center gap-2">
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
        Follow
      </button>
    </div>
  )
}

import useRtdbDataKey from '@/hooks/useRtdbData'

export default function SuggestedUsers() {
  const { data: suggestedUsers } = useRtdbDataKey('suggestedUsers')
  const users = suggestedUsers || []

  return (
    <div className="w-96 bg-indigo-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 overflow-hidden p-4 space-y-4">
      <div className="text-gray-600 text-base font-medium uppercase">
        Suggested for you
      </div>
      {[...users, ...users, ...users].map((user, i) => (
        <SuggestionItem key={`${user?.id ?? 'u'}-${i}`} {...user} />
      ))}
      <div className="justify-start text-slate-900 text-sm font-semibold font-['Inter'] leading-none mb-[-40px]">View all gossipers</div>
    </div>
  )
}
