export default function FeedPostActions({ onLike, isLoadingLike, isLiked, likes = 0, commentsCount = 0, onToggleComments }) {
  return (
    <div className="flex items-center justify-between px-4 py-6 text-sm text-slate-700">
      <div className="flex items-center gap-4">
        <button
          onClick={onLike}
          disabled={isLoadingLike}
          className={`px-3 py-2 rounded-[40px] inline-flex justify-center items-center gap-2 transition-all ${
            isLiked ? 'bg-red-50 cursor-pointer' : 'bg-red-50 cursor-pointer hover:bg-red-100'
          } ${isLoadingLike ? 'opacity-60' : ''}`}
        >
          <div data-svg-wrapper className="relative">
            {isLoadingLike ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
                <circle cx="12" cy="12" r="10" stroke="#AA336A" strokeWidth="2" fill="none" opacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#AA336A" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_140_642)">
                  <path
                    d="M16.2491 10.4771L9.99911 16.6671L3.74911 10.4771C3.33687 10.0759 3.01215 9.59374 2.7954 9.06092C2.57866 8.52811 2.47458 7.95618 2.48973 7.38117C2.50487 6.80615 2.63891 6.2405 2.88341 5.71984C3.1279 5.19917 3.47756 4.73477 3.91035 4.35587C4.34314 3.97698 4.8497 3.6918 5.39812 3.51829C5.94654 3.34479 6.52495 3.28671 7.09692 3.34773C7.66889 3.40874 8.22203 3.58752 8.72151 3.87281C9.22099 4.1581 9.65598 4.54373 9.99911 5.00539C10.3437 4.54708 10.7792 4.16483 11.2784 3.88256C11.7775 3.6003 12.3295 3.4241 12.8999 3.36499C13.4703 3.30588 14.0467 3.36514 14.5931 3.53905C15.1395 3.71296 15.6441 3.99779 16.0754 4.37569C16.5067 4.7536 16.8553 5.21646 17.0995 5.7353C17.3436 6.25414 17.4781 6.81779 17.4944 7.39098C17.5107 7.96417 17.4085 8.53455 17.1942 9.06643C16.98 9.59831 16.6582 10.0802 16.2491 10.4821"
                    fill={isLiked ? '#AA336A' : 'none'}
                  />
                  <path
                    d="M16.2491 10.4771L9.99911 16.6671L3.74911 10.4771C3.33687 10.0759 3.01215 9.59374 2.7954 9.06092C2.57866 8.52811 2.47458 7.95618 2.48973 7.38117C2.50487 6.80615 2.63891 6.2405 2.88341 5.71984C3.1279 5.19917 3.47756 4.73477 3.91035 4.35587C4.34314 3.97698 4.8497 3.6918 5.39812 3.51829C5.94654 3.34479 6.52495 3.28671 7.09692 3.34773C7.66889 3.40874 8.22203 3.58752 8.72151 3.87281C9.22099 4.1581 9.65599 4.54372 9.99911 5.00539C10.3437 4.54708 10.7792 4.16483 11.2784 3.88256C11.7775 3.6003 12.3295 3.4241 12.8999 3.36499C13.4703 3.30588 14.0467 3.36514 14.5931 3.53905C15.1395 3.71296 15.6441 3.99779 16.0754 4.37569C16.5067 4.7536 16.8553 5.21646 17.0995 5.7353C17.3436 6.25414 17.4781 6.81779 17.4944 7.39098C17.5107 7.96417 17.4085 8.53455 17.1942 9.06643C16.98 9.59831 16.6582 10.0802 16.2491 10.4821"
                    stroke="#AA336A"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_140_642">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            )}
          </div>
          <div className="justify-start text-pink-700 text-sm font-medium font-['Inter']">{likes} likes</div>
        </button>

        <div
          onClick={onToggleComments}
          className="px-3 py-2 bg-red-50 rounded-[40px] outline outline-1 outline-offset-[-1px] outline-red-50 inline-flex justify-center items-center gap-2 cursor-pointer"
        >
          <div data-svg-wrapper className="relative">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_140_647)">
                <path
                  d="M2.5 16.6674L3.58333 13.4174C1.64667 10.5532 2.395 6.85741 5.33333 4.77241C8.27167 2.68825 12.4917 2.85908 15.2042 5.17241C17.9167 7.48658 18.2833 11.2274 16.0617 13.9232C13.84 16.6191 9.71583 17.4357 6.41667 15.8341L2.5 16.6674Z"
                  stroke="#10112A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_140_647">
                  <rect width="20" height="20" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div className="justify-start text-slate-900 text-sm font-medium font-['Inter']">{commentsCount} comments</div>
        </div>

        <div className="px-3 py-2 bg-red-50 rounded-[40px] outline outline-1 outline-offset-[-1px] outline-red-50 inline-flex justify-center items-center gap-2">
          <div data-svg-wrapper className="relative">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_140_652)">
                <path
                  d="M10.8335 3.33398V6.66732C5.35432 7.52398 3.31682 12.324 2.50016 16.6673C2.46932 16.839 6.98682 11.699 10.8335 11.6673V15.0007L17.5002 9.16732L10.8335 3.33398Z"
                  stroke="#10112A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_140_652">
                  <rect width="20" height="20" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div className="justify-start text-slate-900 text-sm font-medium font-['Inter']">Share</div>
        </div>
      </div>
    </div>
  )
}

