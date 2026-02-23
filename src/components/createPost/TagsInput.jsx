export default function TagsInput({
  tagInput,
  setTagInput,
  tagFocused,
  setTagFocused,
  tags,
  handleTagKeyDown,
  addTag,
  removeTag,
}) {
  return (
    <div
      data-layer="Input field"
      className={`InputField w-[772px] left-[24px] absolute bg-white rounded-2xl flex flex-col ${(tagFocused || tagInput) ? 'shadow-[0px_4px_8px_0px_rgba(10,10,25,0.16)] outline outline-1 outline-offset-[-1px] outline-[#0a0a19]' : 'outline outline-1 outline-offset-[-1px] outline-[#b7b7c2]'}`}
      style={{ top: `573px` }}
    >
      <div className="flex items-center px-4 gap-2 h-12">
        <div className="text-[#454662] text-sm font-normal">#</div>
        <input
          type="text"
          aria-label="Add tag"
          value={tagInput}
          onFocus={() => setTagFocused(true)}
          onBlur={() => setTagFocused(false)}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="Add a tag"
          className={`ml-3 bg-transparent outline-none text-sm flex-1 placeholder:text-[#64647c] ${(tagFocused || tagInput) ? 'text-[#0a0a19]' : 'text-[#151636]'}`}
        />
      </div>

      {tagInput && (
        (() => {
          const SUGGESTIONS = ['MarketingStrategy', 'GrowthStrategy', 'DigitalStrategy', 'SalesStrategy']
          const filtered = SUGGESTIONS.filter(s => s.toLowerCase().includes((tagInput || '').toLowerCase()))
          return (
            <div className="absolute left-0 z-50" style={{ left: 0, bottom: 'calc(100% + 12px)' }}>
              {filtered.length ? (
                <div className="Frame48097064 w-60 h-40 relative bg-white rounded-xl shadow-[0px_0px_12px_0px_rgba(10,10,25,0.24)] overflow-hidden">
                  <div className="p-2">
                    {filtered.map((s) => (
                      <div key={s} onMouseDown={(e) => { e.preventDefault(); addTag(s) }} className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50">
                        <div className="w-4 h-4 rounded-sm border border-[#B7B7C2] flex-shrink-0" />
                        <div className="text-[#10112a] text-sm font-normal">{s}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className="Frame48097063 w-44 h-12 relative bg-white rounded-xl shadow-[0px_0px_12px_0px_rgba(10,10,25,0.24)] overflow-hidden"
                  onMouseDown={(e) => { e.preventDefault(); addTag(tagInput) }}
                  role="button"
                >
                  <div className="LabelText left-[16px] top-1/2 absolute -translate-y-1/2 justify-start flex items-center gap-1">
                    <span className="text-[#9b2e60] text-sm font-normal font-['Inter'] leading-tight">Create tag</span>
                    <span className="text-[#9b2e60] text-sm font-medium font-['Inter'] leading-tight"> “{tagInput}”</span>
                  </div>
                </div>
              )}
            </div>
          )
        })()
      )}

      <div className="px-4 pb-3 mt-4 absolute top-12">
        <div className="flex items-center gap-3 flex-wrap">
          {tags.map((t) => (
            <div key={t} className="Tag h-6 px-3 py-1 bg-[#f2f2f4] rounded-lg inline-flex justify-center items-center gap-1">
              <div className="DropdownText justify-start text-[#10112a] text-xs font-normal font-['Inter'] leading-tight">#{t}</div>
              <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(t) }} aria-label={`Remove ${t}`} className="Frame relative">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.5 3.5L3.5 10.5" stroke="#64647C" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.5 3.5L10.5 10.5" stroke="#64647C" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
