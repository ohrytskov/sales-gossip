import Link from 'next/link'
import { formatTimeAgo } from '@/utils/formatTimeAgo'

export default function FeedPostHeader({
  authorUid,
  avatarSrc,
  username,
  timestamp,
  onFollow,
  isFollowActionPending,
  isFollowed,
  isProfilePage,
  isLoadingFollow,
  menuRef,
  isMenuOpen,
  onToggleMenu,
  onEditPost,
  onDeletePost,
  canManagePost,
  isDeletingPost,
}) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        {authorUid ? (
          <Link
            href={`/profile?id=${encodeURIComponent(authorUid)}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src={avatarSrc}
              alt={username}
              className="w-12 h-12 rounded-full border border-gray-200"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = '/images/feed/avatar1.svg'
              }}
            />
            <div>
              <div className="text-base font-medium text-slate-900">{username}</div>
              <div className="text-sm text-slate-600">{formatTimeAgo(timestamp)}</div>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <img
              src={avatarSrc}
              alt={username}
              className="w-12 h-12 rounded-full border border-gray-200"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = '/images/feed/avatar1.svg'
              }}
            />
            <div>
              <div className="text-base font-medium text-slate-900">{username}</div>
              <div className="text-sm text-slate-600">{formatTimeAgo(timestamp)}</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onFollow}
          disabled={!authorUid}
          className={`h-8 px-4 py-2 rounded-full inline-flex items-center justify-center gap-2 font-['Inter'] leading-none text-xs font-semibold transition-all ${
            isFollowActionPending
              ? 'bg-gray-300 text-gray-600 opacity-60 cursor-pointer'
              : isFollowed
                ? 'bg-white border border-[#b7b7c2] text-[#aa336a] hover:bg-gray-50 cursor-pointer'
                : 'bg-pink-700 text-white hover:bg-pink-800 cursor-pointer'
          } ${isProfilePage ? 'opacity-0 pointer-events-none' : ''}`}
          title={!authorUid ? 'Author UID missing' : ''}
        >
          {isLoadingFollow ? (
            <div className="flex items-center gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="animate-spin"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
              <span>...</span>
            </div>
          ) : isFollowed ? (
            <div>Following</div>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_9795_1260)">
                  <path
                    d="M7.5 12.6668V3.3335C7.5 3.05735 7.72386 2.8335 8 2.8335C8.27614 2.8335 8.5 3.05735 8.5 3.3335V12.6668C8.5 12.943 8.27614 13.1668 8 13.1668C7.72386 13.1668 7.5 12.943 7.5 12.6668Z"
                    fill="white"
                  />
                  <path
                    d="M12.6666 7.5C12.9427 7.5 13.1666 7.72386 13.1666 8C13.1666 8.27614 12.9427 8.5 12.6666 8.5H3.33325C3.05711 8.5 2.83325 8.27614 2.83325 8C2.83325 7.72386 3.05711 7.5 3.33325 7.5H12.6666Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_9795_1260">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <div>Follow</div>
            </>
          )}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={onToggleMenu}
            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-gray-100 rounded-full"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_484_6574)">
                <path
                  d="M4 12C4 12.2652 4.10536 12.5196 4.29289 12.7071C4.48043 12.8946 4.73478 13 5 13C5.26522 13 5.51957 12.8946 5.70711 12.7071C5.89464 12.5196 6 12.2652 6 12C6 11.7348 5.89464 11.4804 5.70711 11.2929C5.51957 11.1054 5.26522 11 5 11C4.73478 11 4.48043 11.1054 4.29289 11.2929C4.10536 11.4804 4 11.7348 4 12Z"
                  stroke="#10112A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11 12C11 12.2652 11.1054 12.5196 11.2929 12.7071C11.4804 12.8946 11.7348 13 12 13C12.2652 13 12.5196 12.8946 12.7071 12.7071C12.8946 12.5196 13 12.2652 13 12C13 11.7348 12.8946 11.4804 12.7071 11.2929C12.5196 11.1054 12.2652 11 12 11C11.7348 11 11.4804 11.1054 11.2929 11.2929C11.1054 11.4804 11 11.7348 11 12Z"
                  stroke="#10112A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18 12C18 12.2652 18.1054 12.5196 18.2929 12.7071C18.4804 12.8946 18.7348 13 19 13C19.2652 13 19.5196 12.8946 19.7071 12.7071C19.8946 12.5196 20 12.2652 20 12C20 11.7348 19.8946 11.4804 19.7071 11.2929C19.5196 11.1054 19.2652 11 19 11C18.7348 11 18.4804 11.1054 18.2929 11.2929C18.1054 11.4804 18 11.7348 18 12Z"
                  stroke="#10112A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_484_6574">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </button>
          {isMenuOpen && (
            <div
              data-layer="Menu"
              className="Menu size- p-4 absolute right-0 top-full mt-2 bg-white rounded-lg shadow-[0px_0px_16px_0px_rgba(16,17,42,0.08)] inline-flex flex-col justify-center items-start gap-0 z-10 w-[116px] h-[72px]"
              role="menu"
            >
              <button
                type="button"
                onClick={onEditPost}
                className={`Frame48097069 self-stretch inline-flex justify-start items-center gap-2 px-0 py-2 ${!canManagePost ? 'opacity-60' : ''}`}
                aria-disabled={!canManagePost}
              >
                <div data-svg-wrapper data-layer="Frame" className="Frame relative">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_359_18385)">
                      <path
                        d="M2.66602 13.3342H5.33268L12.3327 6.33419C12.5078 6.15909 12.6467 5.95122 12.7414 5.72245C12.8362 5.49367 12.885 5.24848 12.885 5.00085C12.885 4.75323 12.8362 4.50803 12.7414 4.27926C12.6467 4.05048 12.5078 3.84262 12.3327 3.66752C12.1576 3.49242 11.9497 3.35353 11.7209 3.25877C11.4922 3.16401 11.247 3.11523 10.9993 3.11523C10.7517 3.11523 10.5065 3.16401 10.2778 3.25877C10.049 3.35353 9.84111 3.49242 9.66602 3.66752L2.66602 10.6675V13.3342Z"
                        stroke="#10112A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 4.33398L11.6667 7.00065"
                        stroke="#10112A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_359_18385">
                        <rect width="16" height="16" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <span className="Username justify-start text-[#10112a] text-sm font-medium font-['Inter'] leading-[22px] whitespace-nowrap">
                  Edit post
                </span>
              </button>
              <button
                type="button"
                onClick={onDeletePost}
                className={`Frame48097070 self-stretch inline-flex justify-start items-center gap-2 px-0 py-2 ${(!canManagePost || isDeletingPost) ? 'opacity-60' : ''}`}
                aria-disabled={!canManagePost || isDeletingPost}
              >
                <div data-svg-wrapper data-layer="Frame" className="Frame relative">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_359_18391)">
                      <path
                        d="M2.66602 4.66602H13.3327"
                        stroke="#10112A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6.66602 7.33398V11.334"
                        stroke="#10112A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.33398 7.33398V11.334"
                        stroke="#10112A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3.33398 4.66602L4.00065 12.666C4.00065 13.0196 4.14113 13.3588 4.39118 13.6088C4.64122 13.8589 4.98036 13.9993 5.33398 13.9993H10.6673C11.0209 13.9993 11.3601 13.8589 11.6101 13.6088C11.8602 13.3588 12.0007 13.0196 12.0007 12.666L12.6673 4.66602"
                        stroke="#10112A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6 4.66667V2.66667C6 2.48986 6.07024 2.32029 6.19526 2.19526C6.32029 2.07024 6.48986 2 6.66667 2H9.33333C9.51014 2 9.67971 2.07024 9.80474 2.19526C9.92976 2.32029 10 2.48986 10 2.66667V4.66667"
                        stroke="#10112A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_359_18391">
                        <rect width="16" height="16" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <span className="Username justify-start text-[#10112a] text-sm font-medium font-['Inter'] leading-[22px] whitespace-nowrap">
                  {isDeletingPost ? 'Deleting...' : 'Delete'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

