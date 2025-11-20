import { useState } from 'react'

export default function FeedFilterBar({
  availableTags = [],
  selectedTags = [],
  onChange = () => {},
  sortBy = 'Best',
  onSortChange = () => {},
  width = 684,
  minimal = false,
  viewMode = 'list',
  onViewChange = () => {},
}) {
  const [isTagsOpen, setIsTagsOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const sortOptions = ['Best', 'New', 'Top', 'Rising']

    return (
        <div className={`w-[${width}px] h-16 relative bg-white ${minimal ? 'border border-gray-200' : 'border border-gray-200 rounded-tl-2xl rounded-tr-2xl'}`}>
            <div
                onClick={() => setIsSortOpen((open) => !open)}
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-10 px-4 py-3 rounded-full outline outline-1 outline-offset-[-0.5px] ${isSortOpen ? 'outline-pink-700' : 'outline-gray-200'} inline-flex justify-start items-center gap-2 overflow-hidden cursor-pointer select-none`}
            >
                <div className={`${isSortOpen ? 'text-pink-700' : 'text-slate-900'} text-base font-normal font-['Inter'] leading-none`}>{sortBy}</div>
                <div data-svg-wrapper className="relative">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_484_6807)">
                            <path
                                d="M14.9999 7.5C15.7099 7.5 16.0807 8.32167 15.6524 8.8525L15.589 8.9225L10.589 13.9225C10.4456 14.066 10.2546 14.1522 10.0521 14.1649C9.84959 14.1776 9.64938 14.116 9.48905 13.9917L9.41071 13.9225L4.41071 8.9225L4.34155 8.84417L4.29655 8.78L4.25155 8.7L4.23738 8.67L4.21488 8.61417L4.18821 8.52417L4.17988 8.48L4.17155 8.43L4.16821 8.3825V8.28417L4.17238 8.23583L4.17988 8.18583L4.18821 8.1425L4.21488 8.0525L4.23738 7.99667L4.29571 7.88667L4.34988 7.81167L4.41071 7.74417L4.48905 7.675L4.55321 7.63L4.63321 7.585L4.66321 7.57083L4.71905 7.54833L4.80905 7.52167L4.85321 7.51333L4.90321 7.505L4.95071 7.50167L14.9999 7.5Z"
                                fill={isSortOpen ? '#AA336A' : '#0A0A19'}
                            />
                        </g>
                        <defs>
                            <clipPath id="clip0_484_6807">
                                <rect width="20" height="20" fill="white" />
                            </clipPath>
                        </defs>
                    </svg>
                </div>
            </div>
            {isSortOpen && (
                <div className="absolute left-4 top-full mt-0 w-28 bg-white rounded-lg shadow-[0px_0px_8px_0px_rgba(16,17,42,0.12)] outline outline-1 outline-offset-[-1px] outline-gray-200 overflow-hidden z-10">
                    <div className="px-4 py-3 flex items-center gap-2">
                        <div data-svg-wrapper className="relative">
                            <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#clip0_286_4720)">
                                    <path d="M2 6.50016L4.66667 3.8335M4.66667 3.8335L7.33333 6.50016M4.66667 3.8335V13.1668" stroke="#454662" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M14.0003 10.5002L11.3337 13.1668M11.3337 13.1668L8.66699 10.5002M11.3337 13.1668V3.8335" stroke="#454662" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </g>
                                <defs>
                                    <clipPath id="clip0_286_4720">
                                        <rect width="16" height="16" fill="white" transform="translate(0 0.5)"/>
                                    </clipPath>
                                </defs>
                            </svg>
                        </div>
                        <div className="justify-start text-gray-600 text-sm font-medium font-['Inter']">Sort by</div>
                    </div>
                    <div className="flex flex-col">
                        {sortOptions.map((opt) => {
                            const isSelected = sortBy === opt
                            return (
                                <div
                                    key={opt}
                                    onClick={() => {
                                        onSortChange(opt)
                                        setIsSortOpen(false)
                                    }}
                                    className={
                                        `px-4 h-8 flex items-center justify-between text-slate-900 text-sm font-normal font-['Inter'] cursor-pointer ${
                                            isSelected
                                                ? 'bg-pink-100 hover:bg-pink-100'
                                                : 'hover:bg-gray-100'
                                        }`
                                    }
                                >
                                    <div>{opt}</div>
                                    {isSelected && (
                                        <div data-svg-wrapper>
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <g clip-path="url(#clip0_286_4713)">
                                                    <path d="M3.33301 7.99984L6.66634 11.3332L13.333 4.6665" stroke="#AA336A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_286_4713">
                                                        <rect width="16" height="16" fill="white"/>
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
            <div
                onClick={() => setIsTagsOpen((open) => !open)}
                className={`absolute left-[134px] top-1/2 transform -translate-y-1/2 h-10 px-4 py-3 rounded-full outline outline-1 outline-offset-[-0.5px] ${
                    isTagsOpen ? 'outline-pink-700' : 'outline-gray-200'
                } inline-flex justify-start items-center gap-2 overflow-hidden cursor-pointer select-none`}
            >
                <div className={`${isTagsOpen ? 'text-pink-700' : 'text-slate-900'} text-base font-normal font-['Inter'] leading-none`}>Filter by tags</div>
                <div data-svg-wrapper className="relative">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_484_6807)">
                            <path
                                d="M14.9999 7.5C15.7099 7.5 16.0807 8.32167 15.6524 8.8525L15.589 8.9225L10.589 13.9225C10.4456 14.066 10.2546 14.1522 10.0521 14.1649C9.84959 14.1776 9.64938 14.116 9.48905 13.9917L9.41071 13.9225L4.41071 8.9225L4.34155 8.84417L4.29655 8.78L4.25155 8.7L4.23738 8.67L4.21488 8.61417L4.18821 8.52417L4.17988 8.48L4.17155 8.43L4.16821 8.3825V8.28417L4.17238 8.23583L4.17988 8.18583L4.18821 8.1425L4.21488 8.0525L4.23738 7.99667L4.29571 7.88667L4.34988 7.81167L4.41071 7.74417L4.48905 7.675L4.55321 7.63L4.63321 7.585L4.66321 7.57083L4.71905 7.54833L4.80905 7.52167L4.85321 7.51333L4.90321 7.505L4.95071 7.50167L14.9999 7.5Z"
                                fill={isTagsOpen ? '#AA336A' : '#0A0A19'}
                            />
                        </g>
                        <defs>
                            <clipPath id="clip0_484_6807">
                                <rect width="20" height="20" fill="white" />
                            </clipPath>
                        </defs>
                    </svg>
                </div>
            </div>
            {isTagsOpen && (
                <div className="absolute left-[134px] top-full mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-[0px_0px_8px_0px_rgba(16,17,42,0.12)] outline outline-1 outline-offset-[-1px] outline-gray-200 overflow-hidden z-10">
                    <div className="px-4 py-3 flex items-center gap-2">
                        <div data-svg-wrapper className="relative">
                            <img
                                src="/images/filter-tags.svg"
                                width={16}
                                height={17}
                                alt="Filter by tags"
                            />
                        </div>
                        <div className="justify-start text-gray-600 text-sm font-medium font-['Inter']">
                            Filter by tags
                        </div>
                    </div>
                    <div className="max-h-64 overflow-auto rounded-b-lg">
                        {availableTags.map((tag) => {
                            const isSelected = selectedTags.includes(tag)
                            return (
                                <div
                                    key={tag}
                                    onClick={() =>
                                        onChange(
                                            isSelected
                                                ? selectedTags.filter((t) => t !== tag)
                                                : [...selectedTags, tag]
                                        )
                                    }
                                className={
                                    `px-4 py-2 flex justify-between items-center ${
                                        isSelected
                                            ? 'bg-pink-50 text-pink-900 hover:bg-pink-100'
                                            : 'hover:bg-gray-100'
                                    } cursor-pointer`
                                }
                                >
                                    <div className="justify-start text-slate-900 text-sm font-normal font-['Inter']">{tag}</div>
                                    {isSelected && (
                                        <div data-svg-wrapper className="relative">
                                            <img
                                                src="/images/check-tags.svg"
                                                width={16}
                                                height={16}
                                                alt="Selected"
                                            />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
            <button
                onClick={() => onViewChange('list')}
                className="absolute right-[64px] top-4 flex flex-col items-center"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M3 8C3 7.2 3.3 6.44 3.88 5.88C4.44 5.32 5.2 5 6 5H18C18.8 5 19.56 5.32 20.12 5.88C20.68 6.44 21 7.2 21 8V16C21 16.8 20.68 17.56 20.12 18.12C19.56 18.68 18.8 19 18 19H6C5.2 19 4.44 18.68 3.88 18.12C3.32 17.56 3 16.8 3 16V8Z"
                        fill={viewMode === 'list' ? '#79244B' : 'none'}
                        stroke={viewMode === 'list' ? '#79244B' : '#64647C'}
                        strokeWidth="1.5"
                    />
                    <path
                        d="M3 12H21"
                        stroke={viewMode === 'list' ? 'white' : '#64647C'}
                        strokeWidth="1.5"
                    />
                </svg>
                <div
                    className={`w-9 border-b-2 border-[#79244B] mt-5 ${viewMode === 'list' ? 'opacity-100' : 'opacity-0'
                        }`}
                />
            </button>
            <button
                onClick={() => onViewChange('grid')}
                className="absolute right-4 top-4 flex flex-col items-center"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M3 8C3 7.2 3.3 6.44 3.88 5.88C4.44 5.32 5.2 5 6 5H18C18.8 5 19.56 5.32 20.12 5.88C20.68 6.44 21 7.2 21 8V16C21 16.8 20.68 17.56 20.12 18.12C19.56 18.68 18.8 19 18 19H6C5.2 19 4.44 18.68 3.88 18.12C3.32 17.56 3 16.8 3 16V8Z"
                        fill={viewMode === 'grid' ? '#79244B' : 'none'}
                        stroke={viewMode === 'grid' ? '#79244B' : '#64647C'}
                        strokeWidth="1.5"
                    />
                    <path
                        d="M3 10H21"
                        stroke={viewMode === 'grid' ? 'white' : '#64647C'}
                        strokeWidth="1.5"
                    />
                    <path
                        d="M3 14H21"
                        stroke={viewMode === 'grid' ? 'white' : '#64647C'}
                        strokeWidth="1.5"
                    />
                </svg>
                <div
                    className={`w-9 border-b-2 border-[#79244B] mt-5 ${viewMode === 'grid' ? 'opacity-100' : 'opacity-0'
                        }`}
                />
            </button>
        </div>
    )
}
