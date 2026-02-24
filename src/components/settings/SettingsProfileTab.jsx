import AvatarWithEdit from '@/components/AvatarWithEdit'
import BannerEditModal from '@/components/BannerEditModal'
import SettingsEditDescriptionModal from '@/components/settings/SettingsEditDescriptionModal'
import SettingsEditUsernameModal from '@/components/settings/SettingsEditUsernameModal'
import { auth } from '@/firebase/config'
import { uploadAvatar } from '@/firebase/storage/avatars'
import { uploadBanner } from '@/firebase/storage/banners'
import { updateUserPublic } from '@/firebase/rtdb/users'
import { syncUsersToPosts } from '@/firebase/rtdb/syncUsersToPosts'
import { syncUsersToComments } from '@/firebase/rtdb/syncUsersToComments'
import { updateProfile } from 'firebase/auth'

export default function SettingsProfileTab({
  user,
  setUser,
  rtdbAvatarUrl,
  rtdbDescription,
  setRtdbDescription,
  setToastMessage,
  setShowToast,
  showEditBanner,
  setShowEditBanner,
  showEditUsername,
  setShowEditUsername,
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
  showEditDescription,
  setShowEditDescription,
  descriptionDraft,
  setDescriptionDraft,
  descriptionSaving,
  setDescriptionSaving,
}) {
  return (
    <div id="panel-profile" role="tabpanel" aria-labelledby="tab-profile">
      <div data-svg-wrapper data-layer="Frame" className="Frame left-[142px] top-[240px] absolute">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_profile_username_icon)">
            <path
              d="M3 7C3 6.46957 3.21071 5.96086 3.58579 5.58579C3.96086 5.21071 4.46957 5 5 5H19C19.5304 5 20.0391 5.21071 20.4142 5.58579C20.7893 5.96086 21 6.46957 21 7V17C21 17.5304 20.7893 18.0391 20.4142 18.4142C20.0391 18.7893 19.5304 19 19 19H5C4.46957 19 3.96086 18.7893 3.58579 18.4142C3.21071 18.0391 3 17.5304 3 17V7Z"
              stroke="#10112A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M3 7L12 13L21 7" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <defs>
            <clipPath id="clip0_profile_username_icon">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <div
        data-layer="Username*"
        className="Username left-[182px] top-[240px] absolute justify-start text-slate-900 text-base font-medium font-['Inter'] leading-normal"
      >
        Username*
      </div>
      <div data-svg-wrapper data-layer="Frame" className="Frame left-[142px] top-[338px] absolute">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_profile_avatar_icon)">
            <path
              d="M5 13C5 12.4696 5.21071 11.9609 5.58579 11.5858C5.96086 11.2107 6.46957 11 7 11H17C17.5304 11 18.0391 11.2107 18.4142 11.5858C18.7893 11.9609 19 12.4696 19 13V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V13Z"
              stroke="#10112A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 11V7C8 5.93913 8.42143 4.92172 9.17157 4.17157C9.92172 3.42143 10.9391 3 12 3C13.0609 3 14.0783 3.42143 14.8284 4.17157C15.5786 4.92172 16 5.93913 16 7V11"
              stroke="#10112A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M15 16H15.01" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12.0098 16H12.0198" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.01953 16H9.02953" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <defs>
            <clipPath id="clip0_profile_avatar_icon">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <div data-layer="Avatar" className="Avatar left-[182px] top-[338px] absolute justify-start text-slate-900 text-base font-medium font-['Inter'] leading-normal">
        Avatar
      </div>
      <div
        data-layer="Profile banner"
        className="ProfileBanner left-[182px] top-[458px] absolute justify-start text-slate-900 text-base font-medium font-['Inter'] leading-normal"
      >
        Profile banner
      </div>
      <div
        data-layer="This will be your display name."
        className="ThisWillBeYourDisplayName w-80 left-[182px] top-[268px] absolute justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug"
      >
        This will be your display name.
      </div>
      <div
        data-layer="This image will appear next to your posts and comments. Choose a clear photo that represents you."
        className="ThisImageWillAppearNextToYourPostsAndCommentsChooseAClearPhotoThatRepresentsYou w-96 left-[182px] top-[366px] absolute justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug"
      >
        This image will appear next to your posts and comments. Choose a clear photo that represents you.
      </div>
      <div
        data-layer="Add a banner to personalize your profile. This will appear at the top of your profile page."
        className="AddABannerToPersonalizeYourProfileThisWillAppearAtTheTopOfYourProfilePage w-80 left-[182px] top-[486px] absolute justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug"
      >
        Add a banner to personalize your profile. This will appear at the top of your profile page.
      </div>
      <div
        data-layer="Description"
        className="Description left-[182px] top-[578px] absolute justify-start text-slate-900 text-base font-medium font-['Inter'] leading-normal"
      >
        Description
      </div>
      <div
        data-layer="Optional description helper"
        className="OptionalDescriptionHelper w-[465px] left-[182px] top-[606px] absolute justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug"
      >
        Optional: Feel free to add up to 250 characters to further describe your profile.
      </div>

      <div className="absolute right-[142px] top-[573px] w-[360px] flex items-center justify-end gap-1">
        <div className="text-gray-600 text-sm font-normal font-['Inter'] leading-snug truncate max-w-[260px] text-right">
          {rtdbDescription}
        </div>
        <div
          data-layer="Primary Button"
          className="PrimaryButton h-8 px-4 py-2 rounded-[56px] inline-flex justify-center items-center gap-2 cursor-pointer"
          onClick={() => {
            setDescriptionDraft((rtdbDescription || '').slice(0, 250))
            setShowEditDescription(true)
          }}
        >
          <div data-layer="Button" className="Button justify-start text-pink-700 text-xs font-semibold font-['Inter']">
            Edit
          </div>
        </div>
      </div>

      <div className="absolute right-[142px] top-[235px] w-[360px] flex h-full items-center justify-end gap-1">
        <div className="text-gray-600 text-sm font-normal font-['Inter'] leading-snug truncate max-w-[260px] text-right">
          {(user && user.displayName) || 'Johndoe'}
        </div>
        <div
          data-layer="Primary Button"
          className="PrimaryButton h-8 px-4 py-2 rounded-[56px] inline-flex justify-center items-center gap-2 cursor-pointer"
          onClick={() => {
            setUsernameDraft((user && user.displayName) || '')
            setUsernameTyped(false)
            setShowEditUsername(true)
          }}
        >
          <div data-layer="Button" className="Button justify-start text-pink-700 text-xs font-semibold font-['Inter']">
            Edit
          </div>
        </div>
      </div>

      <div data-layer="AvatarPreview" className="left-[1243px] top-[342px] absolute">
        <AvatarWithEdit
          avatarUrl={(user && user.photoURL) || rtdbAvatarUrl}
          onSave={async (fileOrNull) => {
            if (!setUser) return
            try {
              // Removal of avatars is disabled in this build; ignore null values.
              if (fileOrNull === null) {
                return
              }

              if (fileOrNull instanceof File) {
                // Upload avatar to Firebase Storage, update RTDB public record and Auth profile
                setToastMessage('Uploading avatar...')
                setShowToast(true)
                const { url, path } = await uploadAvatar(fileOrNull, user.uid)
                await updateUserPublic(user.uid, { avatarUrl: url, avatarRef: path, avatarUpdatedAt: Date.now() })
                if (auth && auth.currentUser) await updateProfile(auth.currentUser, { photoURL: url })
                setUser((prev) => (prev ? { ...prev, photoURL: url } : prev))
                setToastMessage('Your avatar has been updated')
                setShowToast(true)
                try {
                  await syncUsersToPosts(user.uid)
                } catch (e) {
                  console.error('Failed to sync posts after avatar update', e)
                }
                try {
                  await syncUsersToComments(user.uid)
                } catch (e) {
                  console.error('Failed to sync comments after avatar update', e)
                }
                return
              }
            } catch (e) {
              console.error('Failed to save avatar', e)
              setToastMessage('Failed to update avatar')
              setShowToast(true)
              throw e
            }
          }}
        />
      </div>

      <div
        data-layer="Primary Button"
        className="PrimaryButton h-8 px-4 py-2 left-[1243px] top-[458px] absolute rounded-[56px] inline-flex justify-center items-center gap-2"
      >
        <button type="button" onClick={() => setShowEditBanner(true)} className="inline-flex items-center justify-center">
          <div data-layer="Button" className="Button justify-start text-pink-700 text-xs font-semibold font-['Inter']">
            Edit
          </div>
        </button>
      </div>

      {showEditBanner && (
        <BannerEditModal
          open={showEditBanner}
          onClose={() => setShowEditBanner(false)}
          currentBanner={user && user.bannerURL}
          onSave={async (fileOrNull) => {
            if (!setUser) return
            try {
              if (fileOrNull === null) {
                // remove banner
                setUser((prev) => (prev ? { ...prev, bannerURL: null } : prev))
                setToastMessage('Banner removed')
                setShowToast(true)
                return
              }

              if (fileOrNull instanceof File) {
                // Upload banner to Firebase Storage and update RTDB public record
                setToastMessage('Uploading banner...')
                setShowToast(true)
                const { url, path } = await uploadBanner(fileOrNull, user.uid)
                await updateUserPublic(user.uid, { bannerUrl: url, bannerRef: path, bannerUpdatedAt: Date.now() })
                setUser((prev) => (prev ? { ...prev, bannerURL: url } : prev))
                setToastMessage('Your banner has been updated')
                setShowToast(true)
                return
              }
            } catch (e) {
              console.error('Failed to save banner', e)
              setToastMessage('Failed to update banner')
              setShowToast(true)
              throw e
            }
          }}
        />
      )}

      <SettingsEditUsernameModal
        showEditUsername={showEditUsername}
        setShowEditUsername={setShowEditUsername}
        user={user}
        setUser={setUser}
        usernameDraft={usernameDraft}
        setUsernameDraft={setUsernameDraft}
        usernameTyped={usernameTyped}
        setUsernameTyped={setUsernameTyped}
        usernameChecking={usernameChecking}
        setUsernameChecking={setUsernameChecking}
        usernameError={usernameError}
        setUsernameError={setUsernameError}
        canSaveUsername={canSaveUsername}
        validateUsername={validateUsername}
        checkUsernameUnique={checkUsernameUnique}
        setToastMessage={setToastMessage}
        setShowToast={setShowToast}
      />

      <SettingsEditDescriptionModal
        showEditDescription={showEditDescription}
        setShowEditDescription={setShowEditDescription}
        user={user}
        descriptionDraft={descriptionDraft}
        setDescriptionDraft={setDescriptionDraft}
        descriptionSaving={descriptionSaving}
        setDescriptionSaving={setDescriptionSaving}
        setRtdbDescription={setRtdbDescription}
        setToastMessage={setToastMessage}
        setShowToast={setShowToast}
      />

      <div data-layer="Line 2" className="Line2 w-[1156px] h-0 left-[142px] top-[314px] absolute outline outline-1 outline-offset-[-0.50px] outline-gray-200" />
      <div data-layer="Line 5" className="Line5 w-[1156px] h-0 left-[142px] top-[434px] absolute outline outline-1 outline-offset-[-0.50px] outline-gray-200" />
    </div>
  )
}
