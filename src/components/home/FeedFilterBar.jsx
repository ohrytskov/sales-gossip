import { useState } from 'react'

export default function FeedFilterBar() {
    const [selectedView, setSelectedView] = useState('list')

    return (
        <div className="w-[684px] h-16 relative bg-white border border-gray-200 rounded-tl-2xl rounded-tr-2xl">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 h-10 px-4 py-3 rounded-full outline outline-1 outline-offset-[-0.5px] outline-gray-200 inline-flex items-center gap-4">
                <span className="text-slate-900 text-base font-normal font-['Inter'] leading-none">Best</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_484_6807)">
                        <path d="M14.9999 7.5C15.7099 7.5 16.0807 8.32167 15.6524 8.8525L15.589 8.9225L10.589 13.9225C10.4456 14.066 10.2546 14.1522 10.0521 14.1649C9.84959 14.1776 9.64938 14.116 9.48905 13.9917L9.41071 13.9225L4.41071 8.9225L4.34155 8.84417L4.29655 8.78L4.25155 8.7L4.23738 8.67L4.21488 8.61417L4.18821 8.52417L4.17988 8.48L4.17155 8.43L4.16821 8.3825V8.28417L4.17238 8.23583L4.17988 8.18583L4.18821 8.1425L4.21488 8.0525L4.23738 7.99667L4.29571 7.88667L4.34988 7.81167L4.41071 7.74417L4.48905 7.675L4.55321 7.63L4.63321 7.585L4.66321 7.57083L4.71905 7.54833L4.80905 7.52167L4.85321 7.51333L4.90321 7.505L4.95071 7.50167L14.9999 7.5Z" fill="#0A0A19" />
                    </g>
                    <defs>
                        <clipPath id="clip0_484_6807">
                            <rect width="20" height="20" fill="white" />
                        </clipPath>
                    </defs>
                </svg>
            </div>
            <div className="absolute left-[134px] top-1/2 transform -translate-y-1/2 h-10 px-4 py-3 rounded-full outline outline-1 outline-offset-[-0.5px] outline-gray-200 inline-flex items-center gap-2">
                <span className="text-slate-900 text-base font-normal font-['Inter'] leading-none">Filter by tags</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_484_6807)">
                        <path d="M14.9999 7.5C15.7099 7.5 16.0807 8.32167 15.6524 8.8525L15.589 8.9225L10.589 13.9225C10.4456 14.066 10.2546 14.1522 10.0521 14.1649C9.84959 14.1776 9.64938 14.116 9.48905 13.9917L9.41071 13.9225L4.41071 8.9225L4.34155 8.84417L4.29655 8.78L4.25155 8.7L4.23738 8.67L4.21488 8.61417L4.18821 8.52417L4.17988 8.48L4.17155 8.43L4.16821 8.3825V8.28417L4.17238 8.23583L4.17988 8.18583L4.18821 8.1425L4.21488 8.0525L4.23738 7.99667L4.29571 7.88667L4.34988 7.81167L4.41071 7.74417L4.48905 7.675L4.55321 7.63L4.63321 7.585L4.66321 7.57083L4.71905 7.54833L4.80905 7.52167L4.85321 7.51333L4.90321 7.505L4.95071 7.50167L14.9999 7.5Z" fill="#0A0A19" />
                    </g>
                    <defs>
                        <clipPath id="clip0_484_6807">
                            <rect width="20" height="20" fill="white" />
                        </clipPath>
                    </defs>
                </svg>
            </div>
            <button
                onClick={() => setSelectedView('list')}
                className="absolute left-[596px] top-4 flex flex-col items-center"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M3 8C3 7.2 3.3 6.44 3.88 5.88C4.44 5.32 5.2 5 6 5H18C18.8 5 19.56 5.32 20.12 5.88C20.68 6.44 21 7.2 21 8V16C21 16.8 20.68 17.56 20.12 18.12C19.56 18.68 18.8 19 18 19H6C5.2 19 4.44 18.68 3.88 18.12C3.32 17.56 3 16.8 3 16V8Z"
                        fill={selectedView === 'list' ? '#79244B' : 'none'}
                        stroke={selectedView === 'list' ? '#79244B' : '#64647C'}
                        strokeWidth="1.5"
                    />
                    <path
                        d="M3 12H21"
                        stroke={selectedView === 'list' ? 'white' : '#64647C'}
                        strokeWidth="1.5"
                    />
                </svg>
                {selectedView === 'list' && (
                    <div className="w-10 border-b-2 border-[#79244B] mt-5" />
                )}
            </button>
            <button
                onClick={() => setSelectedView('list')}
                className="absolute left-[644px] top-4 flex flex-col items-center"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M3 8C3 7.2 3.3 6.44 3.88 5.88C4.44 5.32 5.2 5 6 5H18C18.8 5 19.56 5.32 20.12 5.88C20.68 6.44 21 7.2 21 8V16C21 16.8 20.68 17.56 20.12 18.12C19.56 18.68 18.8 19 18 19H6C5.2 19 4.44 18.68 3.88 18.12C3.32 17.56 3 16.8 3 16V8Z"
                        stroke="#64647C"
                        strokeWidth="1.5"
                    />
                    <path d="M3 10H21" stroke="#64647C" strokeWidth="1.5" />
                    <path d="M3 14H21" stroke="#64647C" strokeWidth="1.5" />
                </svg>
                {selectedView === 'grid' && (
                    <div className="w-10 border-b-2 border-[#79244B] mt-1" />
                )}
            </button>
        </div>
    )
}
