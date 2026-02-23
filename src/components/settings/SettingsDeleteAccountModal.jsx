import FloatingInput from '@/components/FloatingInput'

export default function SettingsDeleteAccountModal({
  showDeleteAccount,
  setShowDeleteAccount,
  deletePassword,
  setDeletePassword,
  deleteReason,
  setDeleteReason,
  deletePasswordError,
  setDeletePasswordError,
  deleteSaving,
  handleDeleteAccount,
  validatePassword,
}) {
  if (!showDeleteAccount) return null

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50"
      onClick={() => (setShowDeleteAccount(false), setDeletePassword(''), setDeleteReason(''))}
    >
      <div
        data-layer="Modal"
        className="Modal w-[566px] h-[516px] relative bg-white rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          data-layer="Section title"
          className="SectionTitle left-[24px] top-[24px] absolute justify-start text-[#17183b] text-lg font-semibold font-['Inter'] leading-normal"
        >
          Delete account
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
          onClick={() => (setShowDeleteAccount(false), setDeletePassword(''), setDeleteReason(''))}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_407_12769)">
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
              <clipPath id="clip0_407_12769">
                <rect width="19.2" height="19.2" fill="white" transform="translate(0.398438 0.400391)" />
              </clipPath>
            </defs>
          </svg>
        </div>
        <div
          data-layer="WeReSorryToSeeYouLeave"
          className="WeReSorryToSeeYouLeave left-[24px] top-[64px] absolute justify-start text-[#10112a] text-base font-medium font-['Inter'] leading-normal"
        >
          We&apos;re sorry to see you leave.
        </div>
        <div
          data-layer="OnceYouDeleteYourAccount..."
          className="OnceYouDeleteYourAccountYourProfileAndUsernameWillBePermanentlyRemovedFromCorporateGossipYourPostsCommentsAndMessagesWillNoLongerBeLinkedToYourAccountButTheyWonTBeDeletedUnlessYouRemoveThemYourselfBeforehand w-[465px] left-[24px] top-[96px] absolute justify-start text-[#454662] text-sm font-normal font-['Inter'] leading-snug"
        >
          Once you delete your account, your profile and username will be permanently removed from CorporateGossip. Your
          posts, comments, and messages will no longer be linked to your account, but they won&apos;t be deleted unless you
          remove them yourself beforehand.
        </div>
        <div className="absolute w-[518px] left-[24px] top-[208px]">
          <FloatingInput
            id="settings-delete-password"
            type="password"
            value={deletePassword}
            onChange={(v) => {
              setDeletePassword(v)
              setDeletePasswordError('')
            }}
            label="Current password*"
            className="w-full"
            inputProps={{ autoComplete: 'off', name: 'settings-delete-password' }}
            error={Boolean(deletePasswordError)}
            helperText={deletePasswordError}
          />
        </div>
        <div className="absolute w-[518px] left-[24px] top-[288px]">
          <FloatingInput
            id="settings-delete-reason"
            multiline
            value={deleteReason}
            onChange={(v) => setDeleteReason(v)}
            label="Reason for leaving (optional)"
            className="w-full h-28"
            inputProps={{ autoComplete: 'off', name: 'settings-delete-reason' }}
          />
        </div>
        <div data-layer="Frame 48097040" className="Frame48097040 w-[566px] h-16 left-0 top-[448px] absolute overflow-hidden">
          <div
            data-layer="Primary Button"
            className={`PrimaryButton h-10 px-5 py-2 left-[399px] top-[14px] absolute ${deleteSaving ? 'bg-[#e5c0d1]' : deletePassword && !validatePassword(deletePassword) ? 'bg-[#aa336a] cursor-pointer' : 'bg-[#e5c0d1]'} rounded-[56px] inline-flex justify-center items-center gap-2`}
            onClick={deleteSaving ? undefined : deletePassword && !validatePassword(deletePassword) ? handleDeleteAccount : undefined}
          >
            <div data-layer="Button" className="Button justify-start text-white text-sm font-semibold font-['Inter']">
              {deleteSaving ? 'Deleting...' : 'Delete account'}
            </div>
          </div>
          <div
            data-layer="Primary Button"
            className="PrimaryButton h-10 px-5 py-2 left-[295px] top-[14px] absolute bg-white rounded-[56px] outline outline-1 outline-offset-[-1px] outline-[#b7b7c2] inline-flex justify-center items-center gap-2 cursor-pointer"
            onClick={() => setShowDeleteAccount(false)}
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

