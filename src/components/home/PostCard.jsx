// components/home/PostCard.jsx
export default function PostCard({
    bgImage,
    avatar,
    username,
    likes,
    comments,
    caption,
    sourceLogo,
    sourceName,
  }) {
    return (
      <div className="flex-shrink-0 w-[330px]">
        {/* Image + gradient overlay container */}
        <div
          className="relative w-[330px] h-[186px] rounded-xl overflow-hidden
                     bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          {/* Gradient from transparent (white/0) to black */}
          <div className="hidden absolute inset-0 bg-gradient-to-b from-white/0 to-black" />
  
          {/* Avatar */}
          <img
            src={avatar}
            alt={username}
            className="hidden absolute left-[12px] top-[132px] w-10 h-10 rounded-full border-2 border-white"
          />
  
          {/* Username */}
          <div className="hidden absolute left-[64px] top-[130px]
                          inline-flex items-center gap-3">
            <span className="text-white text-base font-medium font-['Inter']">
              {username}
            </span>
          </div>
  
          {/* Likes • comments */}
          <div className="hidden absolute left-[64px] top-[157px]
                          inline-flex items-center gap-2">
            <span className="text-white text-sm font-normal font-['Inter']">
              {likes}
            </span>
            <div className="w-1 h-1 bg-white rounded-full" />
            <span className="text-white text-sm font-normal font-['Inter']">
              {comments}
            </span>
          </div>
        </div>
  
        {/* Caption & source below */}
        <div className="mt-4">
          <p className="text-slate-900 text-base font-medium font-['Inter'] leading-normal mb-2">
            {caption}
          </p>
          <div className="flex items-center gap-[4px] text-xs text-slate-600 font-['Inter']">
            <img
              src={sourceLogo}
              alt={sourceName}
              className="w-5 h-5 rounded-full border border-zinc-200"
            />
            <span>{sourceName}</span>
          </div>
        </div>
      </div>
    )
  }
  