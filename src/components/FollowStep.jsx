import { useState } from 'react'
import FloatingInput from './FloatingInput'
import Logo from '@/components/home/Logo'

export default function FollowStep({
  items,
  selected,
  toggle,
  selectedTitle,
  prompt,
  searchLabel,
  onBack,
  onContinue,
  onSkip
}) {
  const [search, setSearch] = useState('')
  const labelLower = ((searchLabel || '') + ' ' + (selectedTitle || '')).toLowerCase()
  const isCompanyPicker = labelLower.includes('company') || labelLower.includes('companies') || labelLower.includes('compan')
  const isPeoplePicker = labelLower.includes('people') || (selectedTitle || '').toLowerCase().includes('people')
  const getId = (it) => {
    if (isPeoplePicker && it && typeof it === 'object') return (it.id || it.username || '').toString()
    return (it || '').toString()
  }
  const getLabel = (it) => {
    if (isPeoplePicker && it && typeof it === 'object') return (it.username || '').toString()
    return (it || '').toString()
  }
  const idToLabel = new Map((items || []).map(it => [getId(it), getLabel(it)]))
  const filtered = (items || []).filter(it => getLabel(it).toLowerCase().includes((search || '').trim().toLowerCase()))

  return (
    <div data-layer="Picker" className="TagsAndTopics w-full min-h-screen relative bg-white overflow-x-hidden">
      <div data-layer="Header" className="w-full h-16 px-6 pt-6 flex items-center gap-2 md:pr-[33.3333%]">
        <Logo />
      </div>

      <button
        type="button"
        aria-label="Back"
        onClick={onBack}
        data-layer="Primary Button"
        className="PrimaryButton size-10 px-3 py-2 absolute left-6 top-[85px] rounded-[56px] inline-flex justify-center items-center gap-2"
      >
        <div data-svg-wrapper data-layer="Back" className="Back relative">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_9890_2233)">
              <path d="M15.8327 9.375C16.1779 9.375 16.4577 9.65482 16.4577 10C16.4577 10.3452 16.1779 10.625 15.8327 10.625H4.16602C3.82084 10.625 3.54102 10.3452 3.54102 10C3.54102 9.65482 3.82084 9.375 4.16602 9.375H15.8327Z" fill="black"/>
              <path d="M3.72407 9.55806C3.96815 9.31398 4.36379 9.31398 4.60786 9.55806L9.60786 14.5581C9.85194 14.8021 9.85194 15.1978 9.60786 15.4418C9.36379 15.6859 8.96815 15.6859 8.72407 15.4418L3.72407 10.4418C3.48 10.1978 3.48 9.80214 3.72407 9.55806Z" fill="black"/>
              <path d="M8.72407 4.55806C8.96815 4.31398 9.36379 4.31398 9.60786 4.55806C9.85194 4.80214 9.85194 5.19777 9.60786 5.44185L4.60786 10.4418C4.36379 10.6859 3.96815 10.6859 3.72407 10.4418C3.48 10.1978 3.48 9.80214 3.72407 9.55806L8.72407 4.55806Z" fill="black"/>
            </g>
            <defs>
              <clipPath id="clip0_9890_2233">
                <rect width="20" height="20" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </div>
      </button>

      <div className="w-full flex">
        <section className="w-full px-6 md:w-2/3 md:pr-6">
          <div className="text-slate-900 text-3xl font-medium font-['Inter'] mt-[141px]">Let’s set up your feed</div>
          <div className="text-slate-900 text-base font-normal font-['Inter'] leading-normal mt-3">{prompt}</div>

          <FloatingInput
            id="picker-search"
            type="text"
            value={search}
            onChange={setSearch}
            label={searchLabel}
            className="w-full mt-6"
            rounded="full"
            rightElement={(
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 14L11.1 11.1M12.6667 7.33333C12.6667 10.2789 10.2789 12.6667 7.33333 12.6667C4.38781 12.6667 2 10.2789 2 7.33333C2 4.38781 4.38781 2 7.33333 2C10.2789 2 12.6667 4.38781 12.6667 7.33333Z" stroke="#10112A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          />

          <div className="text-slate-900 text-xl font-medium font-['Inter'] mt-10 flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_215_7974)">
                <path d="M3 13C3 12.7348 3.10536 12.4804 3.29289 12.2929C3.48043 12.1054 3.73478 12 4 12H8C8.26522 12 8.51957 12.1054 8.70711 12.2929C8.89464 12.4804 9 12.7348 9 13V19C9 19.2652 8.89464 19.5196 8.70711 19.7071C8.51957 19.8946 8.26522 20 8 20H4C3.73478 20 3.48043 19.8946 3.29289 19.7071C3.10536 19.5196 3 19.2652 3 19V13Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 9C9 8.73478 9.10536 8.48043 9.29289 8.29289C9.48043 8.10536 9.73478 8 10 8H14C14.2652 8 14.5196 8.10536 14.7071 8.29289C14.8946 8.48043 15 8.73478 15 9V19C15 19.2652 14.8946 19.5196 14.7071 19.7071C14.5196 19.8946 14.2652 20 14 20H10C9.73478 20 9.48043 19.8946 9.29289 19.7071C9.10536 19.5196 9 19.2652 9 19V9Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 5C15 4.73478 15.1054 4.48043 15.2929 4.29289C15.4804 4.10536 15.7348 4 16 4H20C20.2652 4 20.5196 4.10536 20.7071 4.29289C20.8946 4.48043 21 4.73478 21 5V19C21 19.2652 20.8946 19.5196 20.7071 19.7071C20.5196 19.8946 20.2652 20 20 20H16C15.7348 20 15.4804 19.8946 15.2929 19.7071C15.1054 19.5196 15 19.2652 15 19V5Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 20H18" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs>
                <clipPath id="clip0_215_7974">
                  <rect width="24" height="24" fill="white"/>
                </clipPath>
              </defs>
            </svg>
            Popular
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {filtered.map(item => {
              const id = getId(item)
              const label = getLabel(item)
              const isSelected = (selected || []).includes(id)
              if (isPeoplePicker) {
                const gossips = item && item.gossipsPosted != null ? item.gossipsPosted : 28
                return (
                  <div key={id} className="w-48 h-60 relative bg-zinc-100 rounded-xl overflow-hidden">
                    <img src="/signup-people-avatar.png" alt={label} className="size-20 left-[55px] top-[24px] absolute rounded-full border border-Grays-Gray-5 w-20 h-20" />
                    <div className="left-[46px] top-[128px] absolute justify-start text-slate-900 text-base font-medium font-['Inter']">{label}</div>
                    {isSelected ? (
                      <div data-layer="Primary Button" className="PrimaryButton h-8 px-4 py-2 left-1/2 -translate-x-1/2 top-[188px] absolute rounded-[56px] outline outline-1 outline-offset-[-1px] outline-gray-400 inline-flex justify-center items-center gap-2 cursor-pointer" onClick={() => toggle(id)}>
                        <div data-layer="Button" className="Button justify-start text-pink-700 text-xs font-semibold font-['Inter']">Following</div>
                      </div>
                    ) : (
                      <div data-layer="Primary Button" className="PrimaryButton h-8 px-4 py-2 left-1/2 -translate-x-1/2 top-[188px] absolute bg-pink-700 rounded-[56px] inline-flex justify-center items-center gap-2 cursor-pointer" onClick={() => toggle(id)}>
                        <div data-layer="Button" className="Button justify-start text-white text-xs font-semibold font-['Inter']">Follow</div>
                      </div>
                    )}
                    <div className="left-[38px] top-[155px] absolute justify-start text-gray-600 text-sm font-normal font-['Inter']">{gossips} gossips posted</div>
                  </div>
                )
              }
              return (
                <button
                  key={id}
                  onClick={() => toggle(id)}
                  className={
                    `rounded-[48px] inline-flex items-center gap-2 overflow-hidden ` +
                    (isSelected
                    ? 'GossipsSection pl-4 pr-4 pt-3 pb-3 bg-pink-900 text-white inline-flex justify-center items-center'
                      : 'pl-4 pr-4 pt-3 pb-3 bg-zinc-100 text-slate-900')
                  }
                  data-layer={isSelected ? 'Gossips Section' : undefined}
                >
                  {isSelected
                    ? (
                      <div data-layer={id} className="ServiceHighlighting justify-start text-white text-base font-normal font-['Inter'] inline-flex items-center gap-2">
                        {isCompanyPicker && (
                          <img src="/signup-company-logo.png" alt="company" className="w-6 h-6 rounded-full" />
                        )}
                        {isPeoplePicker && (
                          <img src="/signup-people-avatar.png" alt="avatar" className="w-6 h-6 rounded-full" />
                        )}
                        <span>{label}</span>
                      </div>
                    )
                    : (
                      <span className="text-base font-normal font-['Inter'] inline-flex items-center gap-2">
                        {isCompanyPicker && (
                          <img src="/signup-company-logo.png" alt="company" className="w-6 h-6 rounded-full" />
                        )}
                        <span>{label}</span>
                      </span>
                    )}
                </button>
              )
            })}
          </div>
        </section>

        <div className="w-full md:w-1/3 md:min-w-[530px] bg-red-50 px-6 md:pl-6 md:pr-6 overflow-hidden md:sticky md:top-0 md:h-screen md:-mt-16">
          <div className="text-black text-xl font-medium font-['Inter'] mt-[101px]">{selectedTitle}</div>
          <div className="mt-6">
            {(() => {
              const slots = []
              for (let i = 0; i < 5; i++) {
                const id = selected[i]
                if (id) {
                  const display = idToLabel.get(id) || id
                  slots.push(
                    <div key={id} data-layer="Gossips Section" className="GossipsSection w-auto min-w-[152px] whitespace-nowrap px-4 py-3 bg-red-50 rounded-[48px] outline outline-1 outline-offset-[-1px] outline-slate-900 inline-flex justify-center items-center gap-2 overflow-hidden">
                      <div data-layer={id} className="ServiceHighlighting justify-start text-slate-900 text-base font-normal font-['Inter'] inline-flex items-center gap-2 whitespace-nowrap">
                      {isCompanyPicker && (
                        <img src="/signup-company-logo.png" alt="company" className="w-6 h-6 rounded-full" />
                      )}
                        {isPeoplePicker && (
                          <img src="/signup-people-avatar.png" alt="avatar" className="w-6 h-6 rounded-full" />
                        )}
                      <span>{display}</span>
                      </div>
                      <div data-svg-wrapper data-layer="Close" className="Close relative cursor-pointer" onClick={e => { e.stopPropagation(); toggle(id) }}>
                        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                          <g clipPath="url(#clip0_215_8015)">
                            <path d="M11.6464 4.14645C11.8417 3.95118 12.1582 3.95118 12.3535 4.14645C12.5487 4.34171 12.5487 4.65822 12.3535 4.85348L4.35348 12.8535C4.15822 13.0487 3.84171 13.0487 3.64645 12.8535C3.45118 12.6582 3.45118 12.3417 3.64645 12.1464L11.6464 4.14645Z" fill="black"/>
                            <path d="M3.64645 4.14645C3.84171 3.95118 4.15822 3.95118 4.35348 4.14645L12.3535 12.1464C12.5487 12.3417 12.5487 12.6582 12.3535 12.8535C12.1582 13.0487 11.8417 13.0487 11.6464 12.8535L3.64645 4.85348C3.45118 4.65822 3.45118 4.34171 3.64645 4.14645Z" fill="black"/>
                          </g>
                          <defs>
                            <clipPath id="clip0_215_8015">
                              <rect width="16" height="16" fill="white" transform="translate(0 0.5)"/>
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                    </div>
                  )
                } else {
                  slots.push(
                    <div key={`placeholder-${i}`} data-layer="Gossips Section" className="GossipsSection w-[152px] h-11 px-4 py-3 rounded-[48px] border border-slate-900 border-dashed" />
                  )
                }
              }

              const extras = []
              for (let j = 5; j < (selected || []).length; j++) {
                const id = selected[j]
                if (!id) continue
                const display = idToLabel.get(id) || id
                extras.push(
                  <div key={id} data-layer="Gossips Section" className="GossipsSection w-auto min-w-[152px] whitespace-nowrap px-4 py-3 bg-red-50 rounded-[48px] outline outline-1 outline-offset-[-1px] outline-slate-900 inline-flex justify-center items-center gap-2 overflow-hidden">
                    <div data-layer={id} className="ServiceHighlighting justify-start text-slate-900 text-base font-normal font-['Inter'] inline-flex items-center gap-2 whitespace-nowrap">
                      {isCompanyPicker && (
                        <img src="/signup-company-logo.png" alt="company" className="w-6 h-6 rounded-full" />
                      )}
                      {isPeoplePicker && (
                        <img src="/signup-people-avatar.png" alt="avatar" className="w-6 h-6 rounded-full" />
                      )}
                      <span>{display}</span>
                    </div>
                    <div data-svg-wrapper data-layer="Close" className="Close relative cursor-pointer" onClick={e => { e.stopPropagation(); toggle(id) }}>
                      <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <g clipPath="url(#clip0_215_8015)">
                          <path d="M11.6464 4.14645C11.8417 3.95118 12.1582 3.95118 12.3535 4.14645C12.5487 4.34171 12.5487 4.65822 12.3535 4.85348L4.35348 12.8535C4.15822 13.0487 3.84171 13.0487 3.64645 12.8535C3.45118 12.6582 3.45118 12.3417 3.64645 12.1464L11.6464 4.14645Z" fill="black"/>
                          <path d="M3.64645 4.14645C3.84171 3.95118 4.15822 3.95118 4.35348 4.14645L12.3535 12.1464C12.5487 12.3417 12.5487 12.6582 12.3535 12.8535C12.1582 13.0487 11.8417 13.0487 11.6464 12.8535L3.64645 4.85348C3.45118 4.65822 3.45118 4.34171 3.64645 4.14645Z" fill="black"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_215_8015">
                            <rect width="16" height="16" fill="white" transform="translate(0 0.5)"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                  </div>
                )
              }

              return (
                <div className={extras.length === 0 ? 'mb-16' : ''}>
                  <div className="flex flex-wrap gap-2">{slots}</div>
                  {extras.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{extras}</div>}
                </div>
              )
            })()}
          </div>

          <div
            className={`w-full h-10 px-5 py-2 mt-10 rounded-[56px] inline-flex justify-center items-center gap-2 ${selected.length > 0 ? 'bg-pink-700 cursor-pointer' : 'bg-[#E5C0D1] cursor-not-allowed'}`}
            onClick={() => selected.length > 0 && onContinue()}
            aria-disabled={selected.length === 0}
          >
            <div className="text-white text-sm font-semibold font-['Inter']">Continue</div>
          </div>

          <div
            className="w-full h-10 px-5 py-2 mt-4 rounded-[56px] outline outline-1 outline-offset-[-1px] outline-gray-400 inline-flex justify-center items-center gap-2 cursor-pointer"
            onClick={onSkip}
          >
            <div className="text-pink-700 text-sm font-semibold font-['Inter']">Skip</div>
          </div>
        </div>
      </div>
    </div>
  )
}
