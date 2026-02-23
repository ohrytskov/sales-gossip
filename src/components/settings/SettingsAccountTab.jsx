import EmailIcon from '@/components/icons/Email'
import PasswordIcon from '@/components/icons/Password'
import DeleteIcon from '@/components/icons/Delete'

export default function SettingsAccountTab({
  email,
  isGoogleAccount,
  onOpenEditEmail,
  onOpenChangePassword,
  onOpenDeleteAccount,
}) {
  return (
    <div id="panel-account" role="tabpanel" aria-labelledby="tab-account">
      <div
        data-layer="Email address"
        className="EmailAddress left-[182px] top-[240px] absolute justify-start text-slate-900 text-base font-medium font-['Inter'] leading-normal"
      >
        Email address
      </div>
      <PasswordIcon className="size-6 left-[142px] top-[360px] absolute overflow-hidden" />
      <div data-layer="Password" className="Password left-[182px] top-[360px] absolute justify-start text-slate-900 text-base font-medium font-['Inter'] leading-normal">
        Password
      </div>
      <div
        data-layer="Delete account"
        className="DeleteAccount left-[182px] top-[466px] absolute justify-start text-slate-900 text-base font-medium font-['Inter'] leading-normal"
      >
        Delete account
      </div>
      <div
        data-layer="We&apos;ll send a verification email to the email address you provide to confirm that it&apos;s really you."
        className="WeLlSendAVerificationEmailToTheEmailAddressYouProvideToConfirmThatItSReallyYou w-[340px] left-[182px] top-[268px] absolute justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug"
      >
        We&apos;ll send a verification email to the email address you provide to confirm that it&apos;s really you.
      </div>
      <div
        data-layer="Change your password at any time."
        className="ChangeYourPasswordAtAnyTime w-[340px] left-[182px] top-[388px] absolute justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug"
      >
        Change your password at any time.
      </div>
      <div
        data-layer="If you deactivate your account, your display name and profile won&apos;t be visible anymore."
        className="IfYouDeactivateYourAccountYourDisplayNameAndProfileWonTBeVisibleAnymore w-[340px] left-[182px] top-[494px] absolute justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug"
      >
        If you deactivate your account, your display name and profile won&apos;t be visible anymore.
      </div>
      <div className="absolute right-[142px] top-[235px] w-[360px] flex h-full items-center justify-end gap-1">
        <div className="text-gray-600 text-sm font-normal font-['Inter'] leading-snug truncate max-w-[260px] text-right">
          {email || 'johndoe@gmail.com'}
        </div>
        <div
          data-layer="Primary Button"
          className={`PrimaryButton h-8 px-4 py-2 rounded-[56px] inline-flex justify-center items-center gap-2 ${isGoogleAccount ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={isGoogleAccount ? undefined : onOpenEditEmail}
          title={isGoogleAccount ? 'Google accounts cannot change email here' : undefined}
        >
          <div data-layer="Button" className="Button justify-start text-pink-700 text-xs font-semibold font-['Inter']">
            Edit
          </div>
        </div>
      </div>
      <div
        data-layer="***************"
        className="left-[1138px] top-[365px] absolute text-right justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug"
      >
        ***************
      </div>
      <EmailIcon className="size-6 left-[142px] top-[240px] absolute overflow-hidden" />
      <DeleteIcon className="size-6 left-[142px] top-[466px] absolute overflow-hidden" />
      <div
        data-layer="Primary Button"
        className={`PrimaryButton h-8 px-4 py-2 left-[1243px] top-[360px] absolute rounded-[56px] inline-flex justify-center items-center gap-2 ${isGoogleAccount ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={isGoogleAccount ? undefined : onOpenChangePassword}
        title={isGoogleAccount ? 'Google accounts cannot change password here' : undefined}
      >
        <div data-layer="Button" className="Button justify-start text-pink-700 text-xs font-semibold font-['Inter']">
          Edit
        </div>
      </div>
      <div
        data-layer="Primary Button"
        className="PrimaryButton h-8 px-4 py-2 left-[1203px] top-[466px] absolute rounded-[56px] inline-flex justify-center items-center gap-2 cursor-pointer"
        onClick={onOpenDeleteAccount}
      >
        <div data-layer="Button" className="Button justify-start text-red-700 text-xs font-semibold font-['Inter']">
          Deactivate
        </div>
      </div>
      <div data-layer="Line 2" className="Line2 w-[1156px] h-0 left-[142px] top-[336px] absolute outline outline-1 outline-offset-[-0.50px] outline-gray-200" />
      <div data-layer="Line 5" className="Line5 w-[1156px] h-0 left-[142px] top-[442px] absolute outline outline-1 outline-offset-[-0.50px] outline-gray-200" />
    </div>
  )
}

