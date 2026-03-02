import AvatarWithEdit from '@/components/AvatarWithEdit'
import BannerEditModal from '@/components/BannerEditModal'
import SettingsEditDescriptionModal from '@/components/settings/SettingsEditDescriptionModal'
import SettingsEditUsernameModal from '@/components/settings/SettingsEditUsernameModal'
import { AvatarIcon, UsernameIcon } from '@/components/settings/profile/ProfileIcons'
import { saveAvatar, saveBanner } from '@/components/settings/profile/profileMediaActions'

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
  const showToastMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
  }

  return (
    <div id="panel-profile" role="tabpanel" aria-labelledby="tab-profile">
      <div data-svg-wrapper data-layer="Frame" className="Frame left-[142px] top-[240px] absolute">
        <UsernameIcon />
      </div>
      <div
        data-layer="Username*"
        className="Username left-[182px] top-[240px] absolute justify-start text-slate-900 text-base font-medium font-['Inter'] leading-normal"
      >
        Username*
      </div>
      <div data-svg-wrapper data-layer="Frame" className="Frame left-[142px] top-[338px] absolute">
        <AvatarIcon />
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
          onSave={(fileOrNull) => saveAvatar({ user, setUser, showToastMessage, fileOrNull })}
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
          onSave={(fileOrNull) => saveBanner({ user, setUser, showToastMessage, fileOrNull })}
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
