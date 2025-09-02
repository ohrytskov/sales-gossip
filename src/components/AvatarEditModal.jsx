import React, { useEffect, useRef, useState } from 'react'

export default function AvatarEditModal({ open, onClose, currentAvatar, onSave }) {
  const [preview, setPreview] = useState(currentAvatar || '')
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)
  const modalRef = useRef(null)

  useEffect(() => {
    if (open) {
      setPreview(currentAvatar || '')
      setFile(null)
      setTimeout(() => modalRef.current?.focus(), 0)
    }
  }, [open, currentAvatar])

  useEffect(() => {
    return () => {
      if (preview && typeof preview === 'string' && preview.startsWith && preview.startsWith('blob:')) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function handleFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) return
    if (preview && typeof preview === 'string' && preview.startsWith && preview.startsWith('blob:')) URL.revokeObjectURL(preview)
    const url = URL.createObjectURL(f)
    setPreview(url)
    setFile(f)
  }

  async function handleSave() {
    // only save when a new file is selected
    if (!file) {
      onClose()
      return
    }
    setSaving(true)
    try {
      await onSave(file)
    } catch (err) {
      console.error('Save avatar failed', err)
      try { console.warn('Failed to save avatar') } catch (e) { /* ignore */ }
    } finally {
      setSaving(false)
      onClose()
    }
  }

  if (!open) return null

  const saveEnabled = Boolean(file)
  const PLACEHOLDER = '/images/feed/avatar1.svg'
  const hasRealAvatar = Boolean(currentAvatar && currentAvatar !== PLACEHOLDER)
  const circleOpacity = hasRealAvatar ? 0.35 : 0.8

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Edit avatar"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} aria-hidden="true" />

      <div
        ref={modalRef}
        tabIndex={-1}
        data-layer="Modal"
        className="Modal w-[566px] h-96 relative bg-white rounded-3xl overflow-hidden"
      >
        <div data-layer="Section title" className="SectionTitle left-[24px] top-[24px] absolute justify-start text-[#17183b] text-lg font-semibold font-['Inter'] leading-normal">Avatar</div>

        <div data-svg-wrapper data-layer="Ellipse 11" className="Ellipse11 left-[510px] top-[20px] absolute">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="16" fill="#F2F2F4" />
          </svg>
        </div>

        <div data-svg-wrapper data-layer="Frame" className="Frame left-[516.40px] top-[26.40px] absolute cursor-pointer" onClick={onClose} role="button" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_407_13020)">
              <path d="M14.7953 5.19922L5.19531 14.7992" stroke="#17183B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.19531 5.19922L14.7953 14.7992" stroke="#17183B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <defs>
              <clipPath id="clip0_407_13020">
                <rect width="19.2" height="19.2" fill="white" transform="translate(0.398438 0.398438)" />
              </clipPath>
            </defs>
          </svg>
        </div>

        <div data-layer="Frame 48097040" className="Frame48097040 w-[566px] h-16 left-0 top-[304px] absolute overflow-hidden">
          <button
            type="button"
            onClick={saveEnabled && !saving ? handleSave : undefined}
            data-layer="Primary Button"
            className={`PrimaryButton h-10 px-5 py-2 left-[469px] top-[14px] absolute ${saveEnabled && !saving ? 'bg-[#aa336a]' : 'bg-[#e5c0d1]'} rounded-[56px] inline-flex justify-center items-center gap-2`}
            disabled={!saveEnabled || saving}
          >
            <div data-layer="Button" className="Button justify-start text-white text-sm font-semibold font-['Inter']">Save</div>
          </button>

          <button type="button" onClick={() => onClose()} data-layer="Primary Button" className="PrimaryButton h-10 px-5 py-2 left-[365px] top-[14px] absolute bg-white rounded-[56px] outline outline-1 outline-offset-[-1px] outline-[#b7b7c2] inline-flex justify-center items-center gap-2">
            <div data-layer="Button" className="Button justify-start text-[#aa336a] text-sm font-semibold font-['Inter']">Cancel</div>
          </button>
        </div>

        <div data-layer="Frame 48097137" className="Frame48097137 size-36 left-[24px] top-[112px] absolute w-[132px] h-[132px] rounded-[104px] border border-dashed border-[#b7b7c2] overflow-hidden group relative">
          {/* layer 1 - avatar image or neutral bg */}
          {preview ? (
            <img src={preview} alt="Avatar preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}

          {/* layer 2 - partially transparent dark circle (centered) */}
          <div className={`absolute inset-0 flex items-center justify-center z-10 pointer-events-none`}>
            <div data-svg-wrapper data-layer="Ellipse 13" className="Ellipse13">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="24" fill="#10112A" fillOpacity={circleOpacity} />
              </svg>
            </div>
          </div>

          {/* layer 3 - file click area: sits above circle but below the white-line SVG so clicks open file picker */}
          <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 z-20" aria-label="Change avatar">
            <span className="sr-only">Change avatar</span>
          </button>

          {/* layer 4 - white-line svg (on top of file button, non-interactive) */}
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <div data-svg-wrapper data-layer="Frame" className="Frame ml-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_407_13030)">
                  <path d="M12 20H5C4.46957 20 3.96086 19.7893 3.58579 19.4142C3.21071 19.0391 3 18.5304 3 18V9C3 8.46957 3.21071 7.96086 3.58579 7.58579C3.96086 7.21071 4.46957 7 5 7H6C6.53043 7 7.03914 6.78929 7.41421 6.41421C7.78929 6.03914 8 5.53043 8 5C8 4.73478 8.10536 4.48043 8.29289 4.29289C8.48043 4.10536 8.73478 4 9 4H15C15.2652 4 15.5196 4.10536 15.7071 4.29289C15.8946 4.48043 16 4.73478 16 5C16 5.53043 16.2107 6.03914 16.5858 6.41421C16.9609 6.78929 17.4696 7 18 7H19C19.5304 7 20.0391 7.21071 20.4142 7.58579C20.7893 7.96086 21 8.46957 21 9V12.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 19H22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M19 16V22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 13C9 13.7956 9.31607 14.5587 9.87868 15.1213C10.4413 15.6839 11.2044 16 12 16C12.7956 16 13.5587 15.6839 14.1213 15.1213C14.6839 14.5587 15 13.7956 15 13C15 12.2044 14.6839 11.4413 14.1213 10.8787C13.5587 10.3161 12.7956 10 12 10C11.2044 10 10.4413 10.3161 9.87868 10.8787C9.31607 11.4413 9 12.2044 9 13Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <defs>
                  <clipPath id="clip0_407_13030">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        <div data-layer="This image will appear next to your posts and comments." className="ThisImageWillAppearNextToYourPostsAndComments w-[468px] left-[24px] top-[64px] absolute justify-start text-[#454662] text-base font-normal font-['Inter'] leading-normal">This image will appear next to your posts and comments. </div>
      </div>
    </div>
  )
}
