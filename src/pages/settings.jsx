import React from 'react'
import Header from '@/components/Header'
import EmailIcon from '@/components/icons/Email'
import PasswordIcon from '@/components/icons/Password'
import DeleteIcon from '@/components/icons/Delete'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState('account')

  return (
    <div data-layer="Post detail page" className="PostDetailPage w-[1440px] h-[1013px] relative bg-white overflow-hidden">
      <Header />
      <div data-layer="Settings" className="Settings left-[142px] top-[112px] absolute justify-start text-slate-900 text-2xl font-semibold font-['Inter'] leading-loose">Settings</div>

      <div data-layer="Tab bar" role="tablist" aria-label="Settings tabs" className="TabBar size- left-[142px] top-[168px] absolute inline-flex justify-center items-center gap-6">
        <button
          type="button"
          role="tab"
          id="tab-account"
          aria-selected={activeTab === 'account'}
          aria-controls="panel-account"
          onClick={() => setActiveTab('account')}
          className={`Menu size- py-2 flex justify-center items-center gap-2 ${activeTab === 'account' ? 'border-b-[1.50px] border-pink-900' : ''}`}
        >
          <div data-layer="Menu" className={`Menu justify-start ${activeTab === 'account' ? 'text-pink-900' : 'text-zinc-400'} text-base font-medium font-['Inter']`}>Account</div>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-profile"
          aria-selected={activeTab === 'profile'}
          aria-controls="panel-profile"
          onClick={() => setActiveTab('profile')}
          className={`Menu size- py-2 flex justify-center items-center gap-2 ${activeTab === 'profile' ? 'border-b-[1.50px] border-pink-900' : ''}`}
        >
          <div data-layer="Menu" className={`Menu justify-start ${activeTab === 'profile' ? 'text-pink-900' : 'text-zinc-400'} text-base font-medium font-['Inter']`}>Profile</div>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-notifications"
          aria-selected={activeTab === 'notifications'}
          aria-controls="panel-notifications"
          onClick={() => setActiveTab('notifications')}
          className={`Menu size- py-2 flex justify-center items-center gap-2 ${activeTab === 'notifications' ? 'border-b-[1.50px] border-pink-900' : ''}`}
        >
          <div data-layer="Menu" className={`Menu justify-start ${activeTab === 'notifications' ? 'text-pink-900' : 'text-zinc-400'} text-base font-medium font-['Inter']`}>Notifications</div>
        </button>
      </div>

      {activeTab === 'account' && (
        <div id="panel-account" role="tabpanel" aria-labelledby="tab-account">
          <div data-layer="Email address" className="EmailAddress left-[182px] top-[240px] absolute justify-start text-slate-900 text-base font-medium font-['Inter'] leading-normal">Email address</div>
          <PasswordIcon className="size-6 left-[142px] top-[360px] absolute overflow-hidden" />
          <div data-layer="Password" className="Password left-[182px] top-[360px] absolute justify-start text-slate-900 text-base font-medium font-['Inter'] leading-normal">Password</div>
          <div data-layer="Delete account" className="DeleteAccount left-[182px] top-[466px] absolute justify-start text-slate-900 text-base font-medium font-['Inter'] leading-normal">Delete account</div>
          <div data-layer="We'll send a verification email to the email address you provide to confirm that it's really you." className="WeLlSendAVerificationEmailToTheEmailAddressYouProvideToConfirmThatItSReallyYou w-[340px] left-[182px] top-[268px] absolute justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug">We'll send a verification email to the email address you provide to confirm that it's really you. </div>
          <div data-layer="Change your password at any time." className="ChangeYourPasswordAtAnyTime w-[340px] left-[182px] top-[388px] absolute justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug">Change your password at any time.</div>
          <div data-layer="If you deactivate your account, your display name and profile won't be visible anymore." className="IfYouDeactivateYourAccountYourDisplayNameAndProfileWonTBeVisibleAnymore w-[340px] left-[182px] top-[494px] absolute justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug">If you deactivate your account, your display name and profile won't be visible anymore.</div>
          <div data-layer="johndoe@gmail.com" className="JohndoeGmailCom left-[1109px] top-[240px] absolute text-right justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug">johndoe@gmail.com</div>
          <div data-layer="***************" className="left-[1138px] top-[365px] absolute text-right justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug">***************</div>
          <EmailIcon className="size-6 left-[142px] top-[240px] absolute overflow-hidden" />
          
          <DeleteIcon className="size-6 left-[142px] top-[466px] absolute overflow-hidden" />
          <div data-layer="Primary Button" className="PrimaryButton h-8 px-4 py-2 left-[1243px] top-[235px] absolute rounded-[56px] inline-flex justify-center items-center gap-2 cursor-pointer">
            <div data-layer="Button" className="Button justify-start text-pink-700 text-xs font-semibold font-['Inter']">Edit</div>
          </div>
          <div data-layer="Primary Button" className="PrimaryButton h-8 px-4 py-2 left-[1243px] top-[360px] absolute rounded-[56px] inline-flex justify-center items-center gap-2 cursor-pointer">
            <div data-layer="Button" className="Button justify-start text-pink-700 text-xs font-semibold font-['Inter']">Edit</div>
          </div>
          <div data-layer="Primary Button" className="PrimaryButton h-8 px-4 py-2 left-[1203px] top-[466px] absolute rounded-[56px] inline-flex justify-center items-center gap-2 cursor-pointer">
            <div data-layer="Button" className="Button justify-start text-red-700 text-xs font-semibold font-['Inter']">Deactivate</div>
          </div>
          <div data-layer="Line 2" className="Line2 w-[1156px] h-0 left-[142px] top-[336px] absolute outline outline-1 outline-offset-[-0.50px] outline-gray-200"></div>
          <div data-layer="Line 5" className="Line5 w-[1156px] h-0 left-[142px] top-[442px] absolute outline outline-1 outline-offset-[-0.50px] outline-gray-200"></div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div id="panel-profile" role="tabpanel" aria-labelledby="tab-profile" className="left-[182px] top-[240px] absolute"></div>
      )}

      {activeTab === 'notifications' && (
        <div id="panel-notifications" role="tabpanel" aria-labelledby="tab-notifications" className="left-[182px] top-[240px] absolute"></div>
      )}
    </div>
  )
}
