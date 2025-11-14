const patternUrl = 'https://www.figma.com/api/mcp/asset/a8c6cee3-3d5c-4b06-94af-c4643078febd'
const defaultAvatar = 'https://www.figma.com/api/mcp/asset/611861d9-214c-4438-8e96-9d33c70f0c4e'
const accentColor = '#79244B'

const defaultStats = {
  posts: 93,
  followers: 88,
  following: 124
}

const defaultFollowExamples = ['david.sdr', 'John doe', 'smith.john']

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
  bio = '10 yrs in B2B SaaS',
  avatar = defaultAvatar,
  stats = defaultStats,
  joined = 'Joined February 2025',
  followExamples = defaultFollowExamples,
  bannerUrl = ''
}) {
  const hasBanner = Boolean(bannerUrl)
  return (
    <section className="w-[741px] font-inter">
      <div className="relative overflow-hidden bg-white shadow-[0_24px_48px_-24px_rgba(16,17,42,0.24)]">
        <div className="h-[186px] w-full" aria-hidden="true">
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
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-[0_12px_24px_rgba(16,17,42,0.12)]">
                <img
                  src={avatar}
                  alt={`${name} avatar`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="flex-1 pt-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-semibold leading-tight text-[#10112A]">{name}</h1>
                  <p className="mt-2 text-base font-medium text-[#64647C]">{bio}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Stat value={stats.posts} label="Posts" />
                    <Divider />
                    <Stat value={stats.followers} label="Followers" />
                    <Divider />
                    <Stat value={stats.following} label="Following" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-pink-700 px-5 py-2 text-xs font-semibold text-white shadow-[0_12px_24px_-12px_rgba(170,51,106,0.7)]"
                  >
                    <PlusIcon />
                    Follow
                  </button>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white"
                    aria-label="Open profile actions"
                  >
                    <DotMenuIcon />
                  </button>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                <CalendarIcon />
                <span>{joined}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
