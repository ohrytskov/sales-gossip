import FloatingInput from '@/components/FloatingInput'
import { updateUserPublic } from '@/firebase/rtdb/users'

export default function SettingsEditDescriptionModal({
  showEditDescription,
  setShowEditDescription,
  user,
  descriptionDraft,
  setDescriptionDraft,
  descriptionSaving,
  setDescriptionSaving,
  setRtdbDescription,
  setToastMessage,
  setShowToast,
}) {
  if (!showEditDescription) return null

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50" onClick={() => setShowEditDescription(false)}>
      <div
        data-layer="Modal"
        className="Modal w-[566px] h-80 relative bg-white rounded-3xl overflow-hidden shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          data-layer="Section title"
          className="SectionTitle left-[24px] top-[24px] absolute justify-start text-[#17183b] text-lg font-semibold font-['Inter'] leading-normal"
        >
          Description
        </div>
        <div data-svg-wrapper data-layer="Ellipse 11" className="Ellipse11 left-[510px] top-[20px] absolute">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="16" fill="#F2F2F4" />
          </svg>
        </div>
        <div
          data-svg-wrapper
          data-layer="Frame"
          className="Frame left-[516.40px] top-[26.40px] absolute cursor-pointer"
          onClick={() => setShowEditDescription(false)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_407_12914)">
              <path
                d="M14.7953 5.20117L5.19531 14.8012"
                stroke="#17183B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.19531 5.20117L14.7953 14.8012"
                stroke="#17183B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_407_12914">
                <rect width="19.2" height="19.2" fill="white" transform="translate(0.398438 0.400391)" />
              </clipPath>
            </defs>
          </svg>
        </div>
        <div className="absolute left-[24px] top-[64px] w-[518px] flex flex-col gap-4">
          <div
            data-layer="Description helper"
            className="DescriptionHelper w-full justify-start text-[#454662] text-base font-normal font-['Inter'] leading-normal"
          >
            Optional: Feel free to add up to 250 characters to further describe your profile.
          </div>
          <FloatingInput
            id="settings-description"
            multiline
            value={descriptionDraft}
            onChange={setDescriptionDraft}
            label="Description"
            className="w-full h-28"
            inputProps={{
              autoComplete: 'off',
              'aria-label': 'Profile description',
              maxLength: 250,
              name: 'settings-description',
            }}
            maxLength={250}
            showCount
          />
        </div>
        <div data-layer="Frame 48097040" className="Frame48097040 w-[566px] h-16 left-0 bottom-0 absolute overflow-hidden">
          <div
            data-layer="Primary Button"
            className={`PrimaryButton h-10 px-5 py-2 left-[469px] bottom-[14px] absolute rounded-[56px] inline-flex justify-center items-center gap-2 ${
              descriptionSaving ? 'bg-[#e5c0d1]' : 'bg-pink-700 cursor-pointer'
            }`}
            onClick={
              descriptionSaving
                ? undefined
                : async () => {
                    if (!user || !user.uid) return
                    setDescriptionSaving(true)
                    const trimmed = String(descriptionDraft || '').trim().slice(0, 250)
                    try {
                      await updateUserPublic(user.uid, { bio: trimmed || null, headline: trimmed || null })
                      setRtdbDescription(trimmed)
                      setToastMessage('Description updated')
                      setShowToast(true)
                      setShowEditDescription(false)
                    } catch (e) {
                      console.error('Failed to update description', e)
                      setToastMessage('Failed to update description')
                      setShowToast(true)
                    } finally {
                      setDescriptionSaving(false)
                    }
                  }
            }
          >
            <div data-layer="Button" className="Button justify-start text-white text-sm font-semibold font-['Inter']">
              {descriptionSaving ? 'Saving...' : 'Save'}
            </div>
          </div>
          <div
            data-layer="Primary Button"
            className="PrimaryButton h-10 px-5 py-2 left-[365px] bottom-[14px] absolute bg-white rounded-[56px] outline outline-1 outline-offset-[-1px] outline-[#b7b7c2] inline-flex justify-center items-center gap-2 cursor-pointer"
            onClick={() => setShowEditDescription(false)}
          >
            <div data-layer="Button" className="Button justify-start text-[#aa336a] text-sm font-semibold font-['Inter']">
              Cancel
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

