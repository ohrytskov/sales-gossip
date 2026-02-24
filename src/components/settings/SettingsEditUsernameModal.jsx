import FloatingInput from '@/components/FloatingInput'
import { auth } from '@/firebase/config'
import { saveUsername } from '@/firebase/rtdb/usernames'
import { syncUsersToPosts } from '@/firebase/rtdb/syncUsersToPosts'
import { syncUsersToComments } from '@/firebase/rtdb/syncUsersToComments'
import { updateProfile } from 'firebase/auth'

export default function SettingsEditUsernameModal({
  showEditUsername,
  setShowEditUsername,
  user,
  setUser,
  usernameDraft,
  setUsernameDraft,
  usernameTyped,
  setUsernameTyped,
  usernameChecking,
  setUsernameChecking,
  usernameError,
  setUsernameError,
  canSaveUsername,
  validateUsername,
  checkUsernameUnique,
  setToastMessage,
  setShowToast,
}) {
  if (!showEditUsername) return null

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50" onClick={() => setShowEditUsername(false)}>
      <div
        data-layer="Modal"
        className="Modal w-[566px] h-64 relative bg-white rounded-3xl overflow-hidden shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          data-layer="Section title"
          className="SectionTitle left-[24px] top-[24px] absolute justify-start text-[#17183b] text-lg font-semibold font-['Inter'] leading-normal"
        >
          Display name
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
          onClick={() => setShowEditUsername(false)}
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
        <div className="absolute w-[518px] left-[24px] top-[104px]">
          <FloatingInput
            id="settings-username"
            type="text"
            value={usernameDraft}
            onChange={(v) => {
              setUsernameDraft(v)
              setUsernameError('')
              setUsernameChecking(true)
              setUsernameTyped(true)
            }}
            label="Username*"
            className="w-full"
            inputProps={{ autoComplete: 'off', 'aria-label': 'Display name', maxLength: 60 }}
            errorOutlineClass={'outline-[#db0000]'}
            errorLabelClass={'text-[#db0000]'}
            helperErrorClass={'text-[#db0000]'}
            error={Boolean(usernameError)}
            helperText={
              usernameTyped
                ? usernameDraft
                  ? usernameChecking
                    ? 'Checking...'
                    : usernameError
                      ? usernameError
                      : 'Username available'
                  : ''
                : ''
            }
            helperTextType={usernameTyped ? (usernameChecking ? 'info' : usernameError ? 'error' : 'success') : undefined}
            rightElement={
              <div className="inline-flex items-center gap-2">
                {usernameTyped && usernameError ? (
                  <div data-svg-wrapper data-layer="Frame" className="Frame relative">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_407_12941)">
                        <path
                          d="M11.334 2.22725C12.3475 2.81237 13.189 3.65396 13.7742 4.66743C14.3593 5.6809 14.6673 6.83054 14.6673 8.00079C14.6673 9.17104 14.3593 10.3207 13.7741 11.3341C13.189 12.3476 12.3474 13.1892 11.3339 13.7743C10.3204 14.3594 9.1708 14.6674 8.00055 14.6674C6.83029 14.6674 5.68066 14.3593 4.66721 13.7742C3.65375 13.189 2.81218 12.3474 2.22707 11.334C1.64197 10.3205 1.33395 9.17083 1.33398 8.00058L1.33732 7.78458C1.37465 6.63324 1.70968 5.51122 2.30974 4.52791C2.90981 3.5446 3.75442 2.73355 4.76125 2.17383C5.76807 1.61412 6.90275 1.32484 8.05465 1.3342C9.20656 1.34357 10.3364 1.65124 11.334 2.22725ZM8.00065 10.0006C7.82384 10.0006 7.65427 10.0708 7.52925 10.1958C7.40422 10.3209 7.33398 10.4904 7.33398 10.6672V10.6739C7.33398 10.8507 7.40422 11.0203 7.52925 11.1453C7.65427 11.2703 7.82384 11.3406 8.00065 11.3406C8.17746 11.3406 8.34703 11.2703 8.47205 11.1453C8.59708 11.0203 8.66732 10.8507 8.66732 10.6739V10.6672C8.66732 10.4904 8.59708 10.3209 8.47205 10.1958C8.34703 10.0708 8.17746 10.0006 8.00065 10.0006ZM8.00065 5.33391C7.82384 5.33391 7.65427 5.40415 7.52925 5.52918C7.40422 5.6542 7.33398 5.82377 7.33398 6.00058V8.66725C7.33398 8.84406 7.40422 9.01363 7.52925 9.13865C7.65427 9.26367 7.82384 9.33391 8.00065 9.33391C8.17746 9.33391 8.34703 9.26367 8.47205 9.13865C8.59708 9.01363 8.66732 8.84406 8.66732 8.66725V6.00058C8.66732 5.82377 8.59708 5.6542 8.47205 5.52918C8.34703 5.40415 8.17746 5.33391 8.00065 5.33391Z"
                          fill="#DB0000"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_407_12941">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                ) : usernameTyped && !usernameChecking && usernameDraft && !validateUsername(usernameDraft) ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 8C0 3.58281 3.58281 0 8 0C12.4172 0 16 3.58281 16 8C16 12.4172 12.4172 16 8 16C3.58281 16 0 12.4172 0 8Z" fill="#34A853" />
                    <path d="M10.9219 5.51562H10.1891C10.0281 5.51562 9.87813 5.59375 9.78438 5.72344L7.32812 9.12969L6.21562 7.58594C6.12187 7.45469 5.97031 7.37813 5.81094 7.37813H5.07812C4.97656 7.37813 4.91719 7.49375 4.97656 7.57656L6.925 10.2766C6.97099 10.3408 7.03162 10.3931 7.10186 10.4291C7.17211 10.4652 7.24994 10.4841 7.32891 10.4841C7.40787 10.4841 7.48571 10.4652 7.55595 10.4291C7.62619 10.3931 7.68682 10.3408 7.73281 10.2766L11.0234 5.71406C11.0828 5.63125 11.0234 5.51562 10.9219 5.51562Z" fill="white" />
                  </svg>
                ) : null}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <g clipPath="url(#clip0_215_8807)">
                    <path
                      d="M4 12V9C4 8.20435 4.31607 7.44129 4.87868 6.87868C5.44129 6.31607 6.20435 6 7 6H20M20 6L17 3M20 6L17 9"
                      stroke="#10112A"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20 12V15C20 15.7956 19.6839 16.5587 19.1213 17.1213C18.5587 17.6839 17.7956 18 17 18H4M4 18L7 21M4 18L7 15"
                      stroke="#10112A"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_215_8807">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            }
          />
          <div data-layer="count" className="Count text-right justify-start text-[#454662] text-xs font-normal font-['Inter'] leading-none -translate-x-2 translate-y-2">
            {`${(usernameDraft || '').length}/60`}
          </div>
        </div>
        <div
          data-layer="This will change your display name."
          className="ThisWillChangeYourDisplayName w-[468px] left-[24px] top-[64px] absolute justify-start text-[#454662] text-base font-normal font-['Inter'] leading-normal"
        >
          This will change your display name.
        </div>
        <div data-layer="Frame 48097040" className="Frame48097040 w-[566px] h-16 left-0 bottom-0 absolute overflow-hidden">
          <div
            data-layer="Primary Button"
            className={`PrimaryButton h-10 px-5 py-2 left-[469px] bottom-[14px] absolute rounded-[56px] inline-flex justify-center items-center gap-2 ${
              !canSaveUsername ? 'bg-[#e5c0d1]' : 'bg-pink-700 cursor-pointer'
            }`}
            onClick={async () => {
              const trimmed = (usernameDraft || '').trim()
              const uErr = validateUsername(trimmed)
              if (uErr) {
                setUsernameError(uErr)
                return
              }
              setUsernameChecking(true)
              try {
                const unique = await checkUsernameUnique(trimmed)
                if (unique === false) {
                  setUsernameError('This username is already taken')
                  return
                }
                if (unique === null) {
                  setUsernameError('Unable to verify username availability. Please try again.')
                  return
                }

                if (!user || !user.uid) throw new Error('Not authenticated')
                try {
                  await saveUsername(user.uid, trimmed, user.displayName || null)
                } catch (writeErr) {
                  console.error('Failed to write username mapping', writeErr)
                  const code = writeErr && writeErr.code ? writeErr.code : ''
                  if (code === 'PERMISSION_DENIED' || code === 'auth/permission-denied') {
                    setUsernameError('This username is already taken')
                  } else {
                    setUsernameError(writeErr?.message || 'Failed to save username')
                  }
                  return
                }

                try {
                  if (auth && auth.currentUser) {
                    await updateProfile(auth.currentUser, { displayName: trimmed })
                  }
                } catch (e) {
                  console.error('Failed to update Firebase Auth displayName', e)
                }

                try {
                  setUser((prev) => (prev ? { ...prev, displayName: trimmed } : prev))
                } catch (e) {}
                setToastMessage('Username updated')
                setShowToast(true)
                setShowEditUsername(false)
                try {
                  await syncUsersToPosts(user.uid)
                } catch (e) {
                  console.error('Failed to sync posts after username change', e)
                }
                try {
                  await syncUsersToComments(user.uid)
                } catch (e) {
                  console.error('Failed to sync comments after username change', e)
                }
              } catch (e) {
                console.error(e)
                setUsernameError(e?.message || 'Failed to update display name')
              } finally {
                setUsernameChecking(false)
              }
            }}
          >
            <div data-layer="Button" className="Button justify-start text-white text-sm font-semibold font-['Inter']">
              Save
            </div>
          </div>
          <div
            data-layer="Primary Button"
            className="PrimaryButton h-10 px-5 py-2 left-[365px] bottom-[14px] absolute bg-white rounded-[56px] outline outline-1 outline-offset-[-1px] outline-[#b7b7c2] inline-flex justify-center items-center gap-2 cursor-pointer"
            onClick={() => setShowEditUsername(false)}
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

