export default function MediaTab({
  selectedMedia,
  previewUrls,
  activeMediaIndex,
  setActiveMediaIndex,
  onOpenImagesPicker,
  onOpenVideoPicker,
  removeSelectedMedia,
  removeMediaAtIndex,
  handleDragStart,
  handleDropOnIndex,
}) {
  if (!selectedMedia || selectedMedia.length === 0) {
    return (
      <div data-layer="Frame 48097060" className="Frame48097060 size- left-[24px] top-[147px] absolute inline-flex justify-start items-center gap-6">
        <div data-layer="Input field" role="button" onClick={onOpenImagesPicker} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); onOpenImagesPicker() } }} className="InputField w-96 h-16 relative bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#b7b7c2] cursor-pointer">
          <div data-layer="Label-text" className="LabelText left-[56px] top-[22px] absolute justify-start text-[#0a0a19] text-sm font-normal font-['Inter'] leading-tight">Add Images</div>
          <div data-svg-wrapper data-layer="Frame" className="Frame left-[24px] top-[20px] absolute">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_215_1028)">
                <path d="M8.813 11.612C9.27 11.232 9.731 11.232 10.199 11.623L10.307 11.721L15.293 16.707L15.387 16.79C15.5794 16.9391 15.8196 17.013 16.0626 16.9976C16.3056 16.9823 16.5346 16.8789 16.7067 16.7067C16.8789 16.5346 16.9823 16.3056 16.9976 16.0626C17.013 15.8196 16.9391 15.5794 16.79 15.387L16.707 15.293L15.415 14L15.707 13.707L15.813 13.612C16.27 13.232 16.731 13.232 17.199 13.623L17.307 13.721L21.981 18.396C21.8863 19.3483 21.4534 20.235 20.7608 20.8954C20.0681 21.5557 19.1617 21.9459 18.206 21.995L18 22H6C5.00791 21.9999 4.05124 21.6312 3.31576 20.9654C2.58028 20.2996 2.11847 19.3842 2.02 18.397L8.707 11.707L8.813 11.612ZM18 2C19.0262 2 20.0132 2.39444 20.7568 3.10172C21.5004 3.80901 21.9437 4.77504 21.995 5.8L22 6V15.585L18.707 12.293L18.557 12.156C17.301 11.061 15.707 11.059 14.461 12.139L14.307 12.279L14 12.585L11.707 10.293L11.557 10.156C10.301 9.061 8.707 9.059 7.461 10.139L7.307 10.279L2 15.585V6C2 4.97376 2.39444 3.98677 3.10172 3.24319C3.80901 2.4996 4.77504 2.05631 5.8 2.005L6 2H18ZM15.01 7L14.883 7.007C14.64 7.03591 14.4159 7.15296 14.2534 7.33596C14.0909 7.51897 14.0011 7.75524 14.0011 8C14.0011 8.24476 14.0909 8.48103 14.2534 8.66403C14.4159 8.84704 14.64 8.96409 14.883 8.993L15 9L15.127 8.993C15.37 8.96409 15.5941 8.84704 15.7566 8.66403C15.9191 8.48103 16.0089 8.24476 16.0089 8C16.0089 7.75524 15.9191 7.51897 15.7566 7.33596C15.5941 7.15296 15.37 7.03591 15.127 7.007L15.01 7Z" fill="#AA336A" />
              </g>
              <defs>
                <clipPath id="clip0_215_1028">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
        <div data-layer="Input field" role="button" onClick={onOpenVideoPicker} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); onOpenVideoPicker() } }} className="InputField w-96 h-16 relative bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#b7b7c2] cursor-pointer">
          <div data-layer="Label-text" className="LabelText left-[56px] top-[22px] absolute justify-start text-[#0a0a19] text-sm font-normal font-['Inter'] leading-tight">Add video</div>
          <div data-svg-wrapper data-layer="Frame" className="Frame left-[24px] top-[20px] absolute">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_215_1033)">
                <path d="M18 3C18.6566 3 19.3068 3.12933 19.9134 3.3806C20.52 3.63188 21.0712 4.00017 21.5355 4.46447C21.9998 4.92876 22.3681 5.47995 22.6194 6.08658C22.8707 6.69321 23 7.34339 23 8V16C23 16.6566 22.8707 17.3068 22.6194 17.9134C22.3681 18.52 21.9998 19.0712 21.5355 19.5355C21.0712 19.9998 20.52 20.3681 19.9134 20.6194C19.3068 20.8707 18.6566 21 18 21H6C5.34339 21 4.69321 20.8707 4.08658 20.6194C3.47995 20.3681 2.92876 19.9998 2.46447 19.5355C1.52678 18.5979 1 17.3261 1 16V8C1 6.67392 1.52678 5.40215 2.46447 4.46447C3.40215 3.52678 4.67392 3 6 3H18ZM9 9V15C9.00014 15.1768 9.04718 15.3505 9.13631 15.5032C9.22545 15.656 9.35349 15.7823 9.50739 15.8695C9.66129 15.9566 9.83555 16.0013 10.0124 15.9991C10.1892 15.9969 10.3623 15.9479 10.514 15.857L15.514 12.857C15.6619 12.7681 15.7842 12.6425 15.8691 12.4923C15.9541 12.3421 15.9987 12.1725 15.9987 12C15.9987 11.8275 15.9541 11.6579 15.8691 11.5077C15.7842 11.3575 15.6619 11.2319 15.514 11.143L10.514 8.143C10.3623 8.0521 10.1892 8.00306 10.0124 8.00087C9.83555 7.99868 9.66129 8.04342 9.50739 8.13054C9.35349 8.21765 9.22545 8.34402 9.13631 8.49677C9.04718 8.64951 9.00014 8.82315 9 9Z" fill="#AA336A" />
              </g>
              <defs>
                <clipPath id="clip0_215_1033">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div data-layer="Media layout" className="left-[24px] top-[147px] absolute w-[778px] h-72">
      <div className="flex gap-4">
        <div className="w-1/2">
          <div className="relative bg-white rounded-2xl overflow-hidden">
            {(() => {
              const activeFile = selectedMedia && selectedMedia[activeMediaIndex]
              const activeUrl = previewUrls && previewUrls[activeMediaIndex]
              if (activeFile && activeFile.type && activeFile.type.startsWith('video/')) {
                return activeUrl ? (
                  <video src={activeUrl} controls className="w-full h-56 object-cover bg-black" />
                ) : (
                  <div className="w-full h-56 bg-[#f2f2f4]" />
                )
              }

              return activeUrl ? (
                <img src={activeUrl} alt={`preview-${activeMediaIndex}`} className="w-full h-56 object-cover" />
              ) : (
                <div className="w-full h-56 bg-[#f2f2f4]" />
              )
            })()}
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="text-[#454662] text-sm">{`${activeMediaIndex + 1} of ${selectedMedia.length}`}</div>
            <button type="button" onClick={removeSelectedMedia} className="text-sm text-[#454662] hover:text-[#17183b]">
              Remove all
            </button>
          </div>

          <div className="mt-2">
            <button type="button" onClick={onOpenImagesPicker} className="text-sm text-[#0a0a19] inline-flex items-center gap-2">
              Add more photos
            </button>
          </div>
        </div>

        <div className="w-1/2 bg-[#f2f2f4] rounded-tl-xl rounded-bl-xl p-4">
          <div className="text-[#17183b] text-base font-medium">Drag to rearrange the images</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(previewUrls || []).map((url, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropOnIndex(e, idx)}
                className={`relative rounded-lg overflow-hidden ${activeMediaIndex === idx ? 'ring-2 ring-[#79244b]' : ''}`}
              >
                {selectedMedia && selectedMedia[idx] && selectedMedia[idx].type && selectedMedia[idx].type.startsWith('video/') ? (
                  <div className="relative">
                    <video src={url} muted playsInline className="w-full h-24 object-cover cursor-pointer" onClick={() => setActiveMediaIndex(idx)} />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5v14l11-7L8 5z" fill="#fff" opacity="0.9" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <img src={url} alt={`thumb-${idx}`} className="w-full h-24 object-cover cursor-pointer" onClick={() => setActiveMediaIndex(idx)} />
                )}
                <button type="button" onClick={(e) => { e.stopPropagation(); removeMediaAtIndex(idx) }} className="absolute top-2 right-2 bg-white rounded-full p-1">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.5 3.5L3.5 10.5" stroke="#64647C" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3.5 3.5L10.5 10.5" stroke="#64647C" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
