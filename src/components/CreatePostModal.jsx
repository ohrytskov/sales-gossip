import React, { useEffect, useRef, useState } from 'react'
import Toast from '@/components/Toast'

export default function CreatePostModal({ open, onClose }) {
  const modalRef = useRef(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const handleToolbarClick = (e) => {
    const wrapper = e.target.closest && e.target.closest('[data-svg-wrapper]')
    if (!wrapper) return
    e.stopPropagation()

    // Prefer explicit aria-label if present (e.g., close button)
    const aria = wrapper.getAttribute && wrapper.getAttribute('aria-label')
    if (aria) {
      setToastMessage(aria)
      setShowToast(true)
      return
    }

    const dataLayer = wrapper.dataset?.layer || wrapper.getAttribute('data-layer') || ''

    // Common heuristics: named layers, separators, or generic "Frame" icons
    if (dataLayer.includes('Ellipse')) {
      setToastMessage('Avatar')
      setShowToast(true)
      return
    }
    if (dataLayer.startsWith('Line')) {
      setToastMessage('Separator')
      setShowToast(true)
      return
    }

    // Many toolbar icons use the generic "Frame" layer; inspect left position
    if (dataLayer === 'Frame' || dataLayer === '') {
      const cls = wrapper.className || ''
      const m = cls.match(/left-\[([0-9.]+)px\]/)
      const left = m ? m[1] : null
      const posMap = {
        '16': 'Bold',
        '52': 'Italic',
        '88': 'Strikethrough',
        '124': 'Superscript',
        '176': 'Link',
        '212': 'List',
        '248': 'Numbered List',
        '300': 'Emoji',
        '738': 'Select company',
        '776.40': 'Close',
      }
      const name = (left && posMap[left]) || dataLayer || 'icon'
      setToastMessage(name)
      setShowToast(true)
      return
    }

    // Fallback: show the raw data-layer
    setToastMessage(dataLayer)
    setShowToast(true)
  }

  useEffect(() => {
    if (open) setTimeout(() => modalRef.current?.focus(), 0)
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Create post"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} aria-hidden="true" />

      <div
        ref={modalRef}
        tabIndex={-1}
        data-layer="Modal"
        className="Modal w-[826px] h-[759px] relative bg-white rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div data-layer="Frame 48097039" className="Frame48097039 w-[826px] h-16 left-0 top-0 absolute overflow-hidden">
          <div data-layer="Section title" className="SectionTitle left-[24px] top-[24px] absolute justify-start text-[#17183b] text-lg font-semibold font-['Inter'] leading-normal">Create post </div>
          <div data-svg-wrapper data-layer="Ellipse 11" className="Ellipse11 left-[770px] top-[20px] absolute">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#F2F2F4"/>
            </svg>
          </div>
          <div data-svg-wrapper data-layer="Frame" className="Frame left-[776.40px] top-[26.40px] absolute cursor-pointer" onClick={onClose} role="button" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_215_579)">
                <path d="M14.7953 5.20117L5.19531 14.8012" stroke="#17183B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.19531 5.20117L14.7953 14.8012" stroke="#17183B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs>
                <clipPath id="clip0_215_579">
                  <rect width="19.2" height="19.2" fill="white" transform="translate(0.398438 0.400391)"/>
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>

        <div data-layer="Frame 48097040" className="Frame48097040 w-[826px] h-16 left-0 top-[691px] absolute overflow-hidden">
          <div data-layer="Primary Button" className="PrimaryButton h-10 px-5 py-2 left-[731px] top-[14px] absolute bg-[#e5c0d1] rounded-[56px] inline-flex justify-center items-center gap-2">
            <button type="button" onClick={() => onClose()} className="Button justify-start text-white text-sm font-semibold font-['Inter']">Post</button>
          </div>
        </div>

        <div data-layer="Input field" className="InputField w-[778px] h-48 left-[24px] top-[251px] absolute bg-white rounded-2xl border border-[#b7b7c2]" onClick={handleToolbarClick}>
          <div data-layer="Label-text" className="LabelText w-[640px] left-[16px] top-[68px] absolute justify-start text-[#64647c] text-sm font-normal font-['Inter'] leading-tight">Write your thoughts here. You can also include @mentions.</div>
          <div data-svg-wrapper data-layer="Frame" className="Frame left-[16px] top-[16px] absolute">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_215_589)">
                <path d="M5.82812 4.16797H10.8281C11.6017 4.16797 12.3435 4.47526 12.8905 5.02224C13.4375 5.56922 13.7448 6.31109 13.7448 7.08464C13.7448 7.85818 13.4375 8.60005 12.8905 9.14703C12.3435 9.69401 11.6017 10.0013 10.8281 10.0013H5.82812V4.16797Z" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.8281 10H11.6615C12.435 10 13.1769 10.3073 13.7239 10.8543C14.2708 11.4013 14.5781 12.1431 14.5781 12.9167C14.5781 13.6902 14.2708 14.4321 13.7239 14.9791C13.1769 15.526 12.435 15.8333 11.6615 15.8333H5.82812V10" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs>
                <clipPath id="clip0_215_589">
                  <rect width="20" height="20" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </div>
          <div data-svg-wrapper data-layer="Frame" className="Frame left-[52px] top-[16px] absolute">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_215_593)">
                <path d="M9.17188 4.16797H14.1719" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.82812 15.832H10.8281" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11.6615 4.16797L8.32812 15.8346" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs>
                <clipPath id="clip0_215_593">
                  <rect width="20" height="20" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </div>
          <div data-svg-wrapper data-layer="Frame" className="Frame left-[88px] top-[16px] absolute">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_215_598)">
                <path d="M4.17188 10H15.8385" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.3333 5.41685C13.1444 5.05015 12.7113 4.72656 12.1054 4.49935C11.4995 4.27214 10.757 4.15487 10 4.16685H9.16667C8.39312 4.16685 7.65125 4.47414 7.10427 5.02112C6.55729 5.5681 6.25 6.30997 6.25 7.08352C6.25 7.85706 6.55729 8.59893 7.10427 9.14591C7.65125 9.69289 8.39312 10.0002 9.16667 10.0002H10.8333C11.6069 10.0002 12.3487 10.3075 12.8957 10.8545C13.4427 11.4014 13.75 12.1433 13.75 12.9169C13.75 13.6904 13.4427 14.4323 12.8957 14.9792C12.3487 15.5262 11.6069 15.8335 10.8333 15.8335H9.58333C8.82636 15.8455 8.0838 15.7282 7.47792 15.501C6.87203 15.2738 6.43896 14.9502 6.25 14.5835" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs>
                <clipPath id="clip0_215_598">
                  <rect width="20" height="20" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </div>
          <div data-svg-wrapper data-layer="Frame" className="Frame left-[124px] top-[16px] absolute">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_215_602)">
                <path d="M4.17188 5.83203L10.8385 14.1654M4.17188 14.1654L10.8385 5.83203" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17.5052 9.16662H14.1719L17.0885 5.83329C17.198 5.64178 17.2686 5.43059 17.2964 5.21177C17.3243 4.99296 17.3087 4.77081 17.2507 4.55801C17.1926 4.34521 17.0932 4.14593 16.9582 3.97153C16.8231 3.79714 16.6551 3.65106 16.4635 3.54162C16.0768 3.32061 15.618 3.26229 15.1883 3.3795C14.7585 3.49671 14.3929 3.77985 14.1719 4.16662" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs>
                <clipPath id="clip0_215_602">
                  <rect width="20" height="20" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </div>
          <div data-svg-wrapper data-layer="Frame" className="Frame left-[176px] top-[16px] absolute">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_215_606)">
                <path d="M7.5 12.5L12.5 7.5" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.17188 4.99895L9.55771 4.55229C10.3392 3.77089 11.3991 3.33195 12.5043 3.33203C13.6094 3.33211 14.6692 3.7712 15.4506 4.5527C16.232 5.33421 16.671 6.39411 16.6709 7.49925C16.6708 8.60438 16.2317 9.66423 15.4502 10.4456L15.0052 10.8323" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.8282 15.0013L10.4974 15.4463C9.70678 16.2281 8.63973 16.6666 7.52783 16.6666C6.41592 16.6666 5.34887 16.2281 4.55824 15.4463C4.16854 15.061 3.85916 14.6022 3.648 14.0964C3.43685 13.5907 3.32812 13.0481 3.32812 12.5001C3.32812 11.952 3.43685 11.4094 3.648 10.9037C3.85916 10.398 4.16854 9.93914 4.55824 9.5538L4.99491 9.16797" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs>
                <clipPath id="clip0_215_606">
                  <rect width="20" height="20" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </div>
          <div data-svg-wrapper data-layer="Frame" className="Frame left-[212px] top-[16px] absolute">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_215_611)">
                <path d="M7.5 5H16.6667" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.5 10H16.6667" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.5 15H16.6667" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.17188 5V5.00833" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.17188 10V10.0083" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.17188 15V15.0083" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs>
                <clipPath id="clip0_215_611">
                  <rect width="20" height="20" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </div>
          <div data-svg-wrapper data-layer="Frame" className="Frame left-[248px] top-[16px] absolute">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_215_619)">
                <path d="M9.17188 5H16.6719" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.17188 10H16.6719" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 15H16.6667" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.32812 13.3346C3.32812 12.8926 3.50372 12.4687 3.81628 12.1561C4.12884 11.8436 4.55276 11.668 4.99479 11.668C5.43682 11.668 5.86074 11.8436 6.1733 12.1561C6.48586 12.4687 6.66146 12.8926 6.66146 13.3346C6.66146 13.8271 6.24479 14.168 5.82812 14.5846L3.32812 16.668H6.66146" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.99479 8.33203V3.33203L3.32812 4.9987" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs>
                <clipPath id="clip0_215_619">
                  <rect width="20" height="20" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </div>
          <div className="left-0 right-0 h-px top-[52px] absolute bg-[#b7b7c2]" />
          <div data-svg-wrapper data-layer="Line 8" className="Line8 left-[160px] top-[14px] absolute">
            <svg width="2" height="26" viewBox="0 0 2 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1V25" stroke="#B7B7C2" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div data-svg-wrapper data-layer="Line 9" className="Line9 left-[284px] top-[14px] absolute">
            <svg width="2" height="26" viewBox="0 0 2 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1V25" stroke="#B7B7C2" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div data-svg-wrapper data-layer="Frame" className="Frame left-[300px] top-[16px] absolute">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_215_629)">
                <path d="M2.5 10C2.5 10.9849 2.69399 11.9602 3.0709 12.8701C3.44781 13.7801 4.00026 14.6069 4.6967 15.3033C5.39314 15.9997 6.21993 16.5522 7.12987 16.9291C8.03982 17.306 9.01509 17.5 10 17.5C10.9849 17.5 11.9602 17.306 12.8701 16.9291C13.7801 16.5522 14.6069 15.9997 15.3033 15.3033C15.9997 14.6069 16.5522 13.7801 16.9291 12.8701C17.306 11.9602 17.5 10.9849 17.5 10C17.5 9.01509 17.306 8.03982 16.9291 7.12987C16.5522 6.21993 15.9997 5.39314 15.3033 4.6967C14.6069 4.00026 13.7801 3.44781 12.8701 3.0709C11.9602 2.69399 10.9849 2.5 10 2.5C9.01509 2.5 8.03982 2.69399 7.12987 3.0709C6.21993 3.44781 5.39314 4.00026 4.6967 4.6967C4.00026 5.39314 3.44781 6.21993 3.0709 7.12987C2.69399 8.03982 2.5 9.01509 2.5 10Z" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.5 8.33203H7.50833" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12.5 8.33203H12.5083" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.91406 12.5C8.18563 12.7772 8.50977 12.9974 8.8675 13.1477C9.22523 13.298 9.60936 13.3754 9.9974 13.3754C10.3854 13.3754 10.7696 13.298 11.1273 13.1477C11.485 12.9974 11.8092 12.7772 12.0807 12.5" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs>
                <clipPath id="clip0_215_629">
                  <rect width="20" height="20" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>

        <div data-layer="Input field" className="InputField w-[778px] h-14 left-[24px] top-[139px] absolute bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#b7b7c2]">
          <div data-layer="Label-text" className="LabelText w-[640px] left-[16px] top-[19px] absolute justify-start text-[#64647c] text-sm font-normal font-['Inter'] leading-tight">Title*</div>
          <div data-layer="count" className="Count left-[735px] top-[64px] absolute text-right justify-start text-[#454662] text-xs font-normal font-['Inter'] leading-none">0/300</div>
        </div>

        <div data-layer="Input field" className="InputField w-[778px] h-14 left-[24px] top-[571px] absolute bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#b7b7c2]">
          <div data-layer="Label-text" className="LabelText w-[640px] left-[33px] top-[18px] absolute justify-start text-[#64647c] text-sm font-normal font-['Inter'] leading-tight">Add a tag</div>
          <div data-layer="Label-text" className="LabelText left-[16px] top-[18px] absolute justify-start text-[#454662] text-sm font-normal font-['Inter'] leading-tight">#</div>
        </div>

        <div data-layer="Input field" className="InputField w-[778px] h-14 left-[24px] top-[483px] absolute bg-[#f2f2f4] rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#e8e8eb]">
          <div data-svg-wrapper data-layer="Frame" className="Frame left-[738px] top-[16px] absolute">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_215_642)">
                <path d="M6 9L12 15L18 9" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs>
                <clipPath id="clip0_215_642">
                  <rect width="24" height="24" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </div>
          <div data-svg-wrapper data-layer="Dummy company logo" className="DummyCompanyLogo left-[16px] top-[12px] absolute">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="15.5" fill="#B7B7C2" stroke="#E8E8EB"/>
            </svg>
          </div>
          <div data-layer="Label-text" className="LabelText left-[56px] top-[18px] absolute justify-start text-[#64647c] text-sm font-normal font-['Inter'] leading-tight">Select a company </div>
        </div>

        <div data-layer="Tab bar" className="TabBar size- left-[24px] top-[80px] absolute inline-flex justify-center items-center gap-6">
          <div data-layer="Menu" data-property-1="Selected" className="Menu size- py-2 border-b-[1.50px] border-[#79244b] flex justify-center items-center gap-2">
            <div data-layer="Menu" className="Menu justify-start text-[#79244b] text-base font-medium font-['Inter']">Post details</div>
          </div>
          <div data-layer="Menu" data-property-1="Default" className="Menu size- py-2 flex justify-center items-center gap-2">
            <div data-layer="Menu" className="Menu justify-start text-[#9495a5] text-base font-medium font-['Inter']">Images/video</div>
          </div>
        </div>
      </div>
      <Toast show={showToast} message={toastMessage} onClose={() => setShowToast(false)} />
    </div>
  )
}
