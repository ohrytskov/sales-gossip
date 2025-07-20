// components/home/PostCarousel.jsx
import { useRef } from 'react'
import PostCard from './PostCard'
//import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

export default function PostCarousel({ posts }) {
    const scrollRef = useRef(null)

    const scroll = (dir) => {
        if (!scrollRef.current) return
        scrollRef.current.scrollBy({
            left: dir === 'left' ? -304 : 304,
            behavior: 'smooth',
        })
    }

    return (
        <section className="relative bg-zinc-100 py-10">
            <div className="mx-auto">
                <h2 className="text-xl font-medium text-slate-900 mb-6 font-['Inter'] leading-7 ml-[142px]">
                    Featured Posts & News
                </h2>

                <div className="relative">
                    {/* Left fade (above cards) */}
                    <div
                        className="pointer-events-none absolute inset-y-0 left-0 w-32
                       bg-gradient-to-r from-zinc-100 to-white/0 z-20"
                    />

                    {/* Right fade (above cards) */}
                    <div
                        className="pointer-events-none absolute inset-y-0 right-0 w-32
                       bg-gradient-to-l from-zinc-100 to-white/0 z-20"
                    />

                    {/* Scrollable cards container */}
                    <div
                        ref={scrollRef}
                        className="relative z-10 flex gap-[24px] overflow-x-auto scrollbar-none px-2"
                    >
                        {posts.map((post) => (
                            <PostCard key={post.id} {...post} />
                        ))}
                    </div>

                    {/* Left nav arrow (above fades) */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute top-1/3 left-[24px] -translate-y-1/2
                       p-0 bg-white rounded-full shadow-lg z-30"
                    >
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="20" transform="matrix(-1 0 0 1 40 0)" fill="white" />
                            <g clipPath="url(#clip0_484_6562)">
                                <path d="M27 20H13" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M19 26L13 20" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M19 14L13 20" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            <defs>
                                <clipPath id="clip0_484_6562">
                                    <rect width="24" height="24" fill="white" transform="matrix(-1 0 0 1 32 8)" />
                                </clipPath>
                            </defs>
                        </svg>
                    </button>

                    {/* Right nav arrow (above fades) */}
                    <button
                        onClick={() => scroll('right')}
                        className="absolute top-1/3 right-[24px] -translate-y-1/2
                       p-0 bg-white rounded-full shadow-lg z-30"
                    >
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="20" fill="white" />
                            <g clipPath="url(#clip0_484_6556)">
                                <path d="M13 20H27" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M21 26L27 20" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M21 14L27 20" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            <defs>
                                <clipPath id="clip0_484_6556">
                                    <rect width="24" height="24" fill="white" transform="translate(8 8)" />
                                </clipPath>
                            </defs>
                        </svg>

                    </button>
                </div>
            </div>
        </section>
    )
}
