import React, { useEffect } from 'react'
import Header from '@/components/Header'
import EmailIcon from '@/components/icons/Email'
import FloatingInput from '@/components/FloatingInput'
import PasswordIcon from '@/components/icons/Password'
import DeleteIcon from '@/components/icons/Delete'
import { useAuth } from '@/hooks/useAuth'
import { auth } from '@/firebase/config'
import Toast from '@/components/Toast'
export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState('account')
  const [showEditEmail, setShowEditEmail] = React.useState(false)
  const [showChangePassword, setShowChangePassword] = React.useState(false)
  const [cpCurrent, setCpCurrent] = React.useState('')
  const [cpNew, setCpNew] = React.useState('')
  const [cpConfirm, setCpConfirm] = React.useState('')
  const [cpErrors, setCpErrors] = React.useState({})
  const [cpSaving, setCpSaving] = React.useState(false)
  const [logoutOtherApps, setLogoutOtherApps] = React.useState(false)
  const [cpTouched, setCpTouched] = React.useState({ current: false, new: false, confirm: false })
  const [newEmail, setNewEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const { user, setUser } = useAuth()
  const [emailError, setEmailError] = React.useState('')
  const [passwordError, setPasswordError] = React.useState('')
  const [saving, setSaving] = React.useState(false)
    const [newEmailTyped, setNewEmailTyped] = React.useState(false)
  const [passwordTyped, setPasswordTyped] = React.useState(false)
  const canSaveVisual = Boolean(user && (newEmail || '').trim() && password && (newEmailTyped || passwordTyped))
  const [isGoogleAccount, setIsGoogleAccount] = React.useState(false)
  const [emailEditStep, setEmailEditStep] = React.useState('form')
  const [showToast, setShowToast] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState('')
  useEffect(() => {
    try {
      const cu = auth.currentUser
      const google = !!(cu && cu.providerData && cu.providerData.some(p => p.providerId === 'google.com'))
      setIsGoogleAccount(google)
    } catch (e) {
      setIsGoogleAccount(false)
    }
  }, [user])

  const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || '').trim())
  const handleSave = async () => {
    setEmailError('')
    setPasswordError('')
    const emailTrim = (newEmail || '').trim()
    if (!user) {
      setEmailError('Not authenticated')
      return
    }
    if (!emailTrim || !isValidEmail(emailTrim)) {
      setEmailError('Please enter a valid email address.')
      return
    }
    if (!password || password.length < 8) {
      setPasswordError('Please use at least 8 characters')
      return
    }
    if (emailTrim === user.email) {
      setEmailError('New email must be different from current email')
      return
    }
    setSaving(true)
    try {
      // mock update: simulate async save without calling Firebase
      await new Promise(resolve => setTimeout(resolve, 500))
      // update local user mock so UI reflects the new email
      try {
        setUser(prev => prev ? { ...prev, email: emailTrim } : prev)
      } catch (e) {
        // ignore if setUser not available
      }
      // show final "check email" screen and a small toast (mock)
      setEmailEditStep('check')
      setToastMessage('Email updated')
      setShowToast(true)
    } catch (e) {
      setEmailError(e?.message || 'Failed to update email.')
    } finally {
      setSaving(false)
    }
  }
  const canSavePassword = Boolean(cpCurrent && cpNew && cpConfirm && cpNew === cpConfirm && cpNew.length >= 8)
  const handleSavePassword = async () => {
    // clear any server-side errors
    setCpErrors({})
    // mark fields as touched to reveal client-side validation
    setCpTouched({ current: true, new: true, confirm: true })
    // basic client validation (user will see messages without submitting)
    if (!cpCurrent || cpCurrent.length < 8) {
      return
    }
    if (!cpNew || cpNew.length < 8) {
      return
    }
    if (cpNew !== cpConfirm) {
      return
    }
    if (cpNew === cpCurrent) {
      return
    }
    setCpSaving(true)
    try {
      // mock update: simulate async save without calling backend
      await new Promise(resolve => setTimeout(resolve, 500))
      setShowChangePassword(false)
      setCpCurrent('')
      setCpNew('')
      setCpConfirm('')
      setLogoutOtherApps(false)
      setToastMessage('Password updated')
      setShowToast(true)
    } catch (e) {
      setCpErrors(prev => ({ ...prev, general: e?.message || 'Failed to update password' }))
    } finally {
      setCpSaving(false)
    }
  }
  const cpNewMasked = cpNew ? '*'.repeat(cpNew.length) : '***************'
  const cpConfirmMasked = cpConfirm ? '*'.repeat(cpConfirm.length) : '***************'
  const cpCurrentMasked = cpCurrent ? '*'.repeat(cpCurrent.length) : '***********'
  const cpHasTyped = Boolean((cpCurrent || '').length > 0 || (cpNew || '').length > 0 || (cpConfirm || '').length > 0)
  const validationErrors = {
    current: '',
    new: '',
    confirm: '',
  }
  if (cpTouched.current && cpCurrent && cpCurrent.length > 0 && cpCurrent.length < 8) validationErrors.current = 'Please use at least 8 characters'
  if (cpTouched.new && cpNew && cpNew.length > 0 && cpNew.length < 8) validationErrors.new = 'Please use at least 8 characters'
  if (cpTouched.confirm && cpConfirm && cpNew !== cpConfirm) validationErrors.confirm = 'Passwords do not match'
  if (cpTouched.new && cpTouched.current && cpNew && cpCurrent && cpNew === cpCurrent) validationErrors.new = 'New password must be different'
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
          <div data-layer="We&apos;ll send a verification email to the email address you provide to confirm that it&apos;s really you." className="WeLlSendAVerificationEmailToTheEmailAddressYouProvideToConfirmThatItSReallyYou w-[340px] left-[182px] top-[268px] absolute justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug">We&apos;ll send a verification email to the email address you provide to confirm that it&apos;s really you. </div>
          <div data-layer="Change your password at any time." className="ChangeYourPasswordAtAnyTime w-[340px] left-[182px] top-[388px] absolute justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug">Change your password at any time.</div>
          <div data-layer="If you deactivate your account, your display name and profile won&apos;t be visible anymore." className="IfYouDeactivateYourAccountYourDisplayNameAndProfileWonTBeVisibleAnymore w-[340px] left-[182px] top-[494px] absolute justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug">If you deactivate your account, your display name and profile won&apos;t be visible anymore.</div>
          <div data-layer="user-email" className="JohndoeGmailCom left-[1109px] top-[240px] absolute text-right justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug">{(user && user.email) || 'johndoe@gmail.com'}</div>
          <div data-layer="***************" className="left-[1138px] top-[365px] absolute text-right justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug">***************</div>
          <EmailIcon className="size-6 left-[142px] top-[240px] absolute overflow-hidden" />
          <DeleteIcon className="size-6 left-[142px] top-[466px] absolute overflow-hidden" />
          <div data-layer="Primary Button" className={`PrimaryButton h-8 px-4 py-2 left-[1243px] top-[235px] absolute rounded-[56px] inline-flex justify-center items-center gap-2 ${isGoogleAccount ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} onClick={isGoogleAccount ? undefined : () => ( setNewEmail(''), setPassword(''), setEmailError(''), setPasswordError(''), setNewEmailTyped(false), setPasswordTyped(false), setEmailEditStep('form'), setShowEditEmail(true) )} title={isGoogleAccount ? 'Google accounts cannot change email here' : undefined}>
            <div data-layer="Button" className="Button justify-start text-pink-700 text-xs font-semibold font-['Inter']">Edit</div>
          </div>
          <div data-layer="Primary Button" className="PrimaryButton h-8 px-4 py-2 left-[1243px] top-[360px] absolute rounded-[56px] inline-flex justify-center items-center gap-2 cursor-pointer" onClick={() => ( setCpCurrent(''), setCpNew(''), setCpConfirm(''), setCpErrors({}), setLogoutOtherApps(false), setShowChangePassword(true) )}>
            <div data-layer="Button" className="Button justify-start text-pink-700 text-xs font-semibold font-['Inter']">Edit</div>
          </div>
          <div data-layer="Primary Button" className="PrimaryButton h-8 px-4 py-2 left-[1203px] top-[466px] absolute rounded-[56px] inline-flex justify-center items-center gap-2 cursor-pointer">
            <div data-layer="Button" className="Button justify-start text-red-700 text-xs font-semibold font-['Inter']">Deactivate</div>
          </div>
          <div data-layer="Line 2" className="Line2 w-[1156px] h-0 left-[142px] top-[336px] absolute outline outline-1 outline-offset-[-0.50px] outline-gray-200"></div>
          <div data-layer="Line 5" className="Line5 w-[1156px] h-0 left-[142px] top-[442px] absolute outline outline-1 outline-offset-[-0.50px] outline-gray-200"></div>
        </div>
      )}
      {showEditEmail && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50" onClick={() => ( setNewEmail('') , setPassword('') , setEmailError('') , setPasswordError('') , setNewEmailTyped(false) , setPasswordTyped(false) , setShowEditEmail(false) , setEmailEditStep('form') )}>
          <div data-layer="Modal" className={`Modal w-[566px] ${emailEditStep === 'check' ? 'h-80' : 'h-96'} relative bg-white rounded-3xl overflow-hidden`} onClick={e => e.stopPropagation()}>
            {emailEditStep === 'form' ? (
              <>
                <div data-layer="Section title" className="SectionTitle left-[24px] top-[24px] absolute justify-start text-indigo-950 text-lg font-semibold font-['Inter'] leading-normal">Email address</div>
                <div data-svg-wrapper data-layer="Ellipse 11" className="Ellipse11 left-[510px] top-[20px] absolute">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="16" fill="#F2F2F4"/>
                  </svg>
                </div>
                <div data-svg-wrapper data-layer="Frame" className="Frame left-[516.40px] top-[26.40px] absolute cursor-pointer" onClick={() => ( setNewEmail('') , setPassword('') , setEmailError('') , setPasswordError('') , setNewEmailTyped(false) , setPasswordTyped(false) , setShowEditEmail(false) , setEmailEditStep('form') )}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_407_12074)">
                      <path d="M14.7953 5.20117L5.19531 14.8012" stroke="#17183B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5.19531 5.20117L14.7953 14.8012" stroke="#17183B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_407_12074">
                        <rect width="19.2" height="19.2" fill="white" transform="translate(0.398438 0.400391)"/>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div className="absolute w-[518px] left-[24px] top-[216px]">
                  <FloatingInput
                    id="settings-new-email"
                    type="email"
                    value={newEmail}
                    onChange={(v) => { setNewEmail(v); setEmailError(''); setNewEmailTyped(true) }}
                    label="New email address*"
                    className="w-full"
                    inputProps={{ autoComplete: 'off', name: 'settings-new-email' }}
                    error={Boolean(emailError)}
                    helperText={emailError}
                  />
                </div>
                <div className="absolute w-[518px] left-[24px] top-[136px]">
                  <FloatingInput
                    id="settings-password"
                    type="password"
                    value={password}
                    onChange={(v) => { setPassword(v); setPasswordError(''); setPasswordTyped(true) }}
                    label="Password*"
                    className="w-full"
                    inputProps={{ autoComplete: 'off', name: 'settings-password' }}
                    error={Boolean(passwordError)}
                    helperText={passwordError}
                  />
                </div>
                <div data-layer="We&apos;ll send a verification email to the email address you provide to confirm that it&apos;s really you." className="WeLlSendAVerificationEmailToTheEmailAddressYouProvideToConfirmThatItSReallyYou w-[468px] left-[24px] top-[64px] absolute justify-start text-gray-600 text-base font-normal font-['Inter'] leading-normal">We&apos;ll send a verification email to the email address you provide to confirm that it&apos;s really you. </div>
                <div data-layer="Frame 48097040" className="Frame48097040 w-[566px] h-16 left-0 top-[312px] absolute overflow-hidden">
                  <div data-layer="Primary Button" className={`PrimaryButton h-10 px-5 py-2 left-[469px] top-[14px] absolute rounded-[56px] inline-flex justify-center items-center gap-2 ${canSaveVisual ? 'bg-pink-700 cursor-pointer' : 'bg-[#e5c0d1]'}`} onClick={handleSave}>
                    <div data-layer="Button" className="Button justify-start text-white text-sm font-semibold font-['Inter']">{saving ? 'Saving...' : 'Save'}</div>
                  </div>
                  <div data-layer="Primary Button" className="PrimaryButton h-10 px-5 py-2 left-[365px] top-[14px] absolute bg-white rounded-[56px] outline outline-1 outline-offset-[-1px] outline-gray-400 inline-flex justify-center items-center gap-2 cursor-pointer" onClick={() => ( setNewEmail('') , setPassword('') , setEmailError('') , setPasswordError('') , setNewEmailTyped(false) , setPasswordTyped(false) , setShowEditEmail(false) , setEmailEditStep('form') )}>
                    <div data-layer="Button" className="Button justify-start text-pink-700 text-sm font-semibold font-['Inter']">Cancel</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div data-layer="Section title" className="SectionTitle left-[24px] top-[100px] absolute justify-start text-[#17183b] text-lg font-semibold font-['Inter'] leading-normal">Check your email</div>
                <div data-svg-wrapper data-layer="Ellipse 11" className="Ellipse11 left-[510px] top-[20px] absolute">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="16" fill="#F2F2F4"/>
                  </svg>
                </div>
                <div data-svg-wrapper data-layer="Frame" className="Frame left-[516.40px] top-[26.40px] absolute cursor-pointer" onClick={() => ( setNewEmail('') , setPassword('') , setShowEditEmail(false) , setEmailEditStep('form') )}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_407_12122)">
                      <path d="M14.7953 5.20117L5.19531 14.8012" stroke="#17183B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5.19531 5.20117L14.7953 14.8012" stroke="#17183B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_407_12122">
                        <rect width="19.2" height="19.2" fill="white" transform="translate(0.398438 0.400391)"/>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div data-layer="Sales gossip sent a confirmation email to john12@gmail.com. Click the verify link the email to secure your sales gossip account." className="SalesGossipSentAConfirmationEmailToJohn12GmailComClickTheVerifyLinkTheEmailToSecureYourSalesGossipAccount w-96 left-[24px] top-[140px] absolute justify-start"><span className="text-[#454662] text-base font-normal font-['Inter'] leading-normal">Sales gossip sent a confirmation email to </span><span className="text-[#10112a] text-base font-semibold font-['Inter'] leading-normal">{newEmail}</span><span className="text-[#454662] text-base font-normal font-['Inter'] leading-normal">. Click the verify link the email to secure your sales gossip account.</span></div>
                <div data-layer="Frame 48097040" className="Frame48097040 w-[566px] h-16 left-0 top-[252px] absolute overflow-hidden">
                  <div data-layer="Primary Button" className="PrimaryButton h-10 px-5 py-2 left-[465px] top-[14px] absolute bg-[#aa336a] rounded-[56px] inline-flex justify-center items-center gap-2 cursor-pointer" onClick={() => ( setNewEmail('') , setPassword('') , setShowEditEmail(false) , setEmailEditStep('form') )}>
                    <div data-layer="Button" className="Button justify-start text-white text-sm font-semibold font-['Inter']">Got it</div>
                  </div>
                </div>
                <div data-svg-wrapper data-layer="email-action-download--Streamline-Freehand" className="EmailActionDownloadStreamlineFreehand left-[24px] top-[20px] absolute">
                  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.496 36.6732L5 50.4706L53 51L32.0217 36.3901C29.1305 34.3766 25.2624 34.4916 22.496 36.6732Z" fill="#FFE0E0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M53.0598 21.7709C51.9398 20.8376 46.0598 16.3342 41.6732 13.2309C41.5215 13.1195 41.3319 13.0729 41.1459 13.1013C40.9599 13.1298 40.7929 13.2309 40.6815 13.3826C40.5701 13.5342 40.5235 13.7238 40.5519 13.9098C40.5804 14.0958 40.6815 14.2628 40.8332 14.3742C42.7932 15.8676 44.7065 17.3842 46.3865 18.7376C52.6865 23.7776 52.1498 23.0776 52.4998 25.5276C48.4947 26.7751 44.5938 28.3354 40.8332 30.1942C36.6565 32.2476 33.8332 34.0909 30.8932 35.7009C29.4033 34.7037 27.7295 34.0136 25.9698 33.6709C24.4328 33.9389 22.9745 34.5446 21.6998 35.4442C20.3932 34.4176 18.6665 33.1109 16.7765 31.6176C12.9532 28.8996 8.90136 26.5185 4.66649 24.5009C4.89982 22.7976 5.17982 23.0776 4.99315 22.9376C6.99982 21.0009 11.0365 17.5009 15.2132 14.3042C15.3833 14.1805 15.4974 13.9942 15.5302 13.7863C15.563 13.5785 15.5119 13.3661 15.3882 13.1959C15.2644 13.0257 15.0781 12.9117 14.8702 12.8789C14.6624 12.846 14.45 12.8971 14.2798 13.0209C10.9432 15.3542 5.97315 18.8776 3.14982 21.3042C0.723154 23.3342 0.676487 46.8542 1.49315 52.4076C1.51652 52.5894 1.61026 52.7547 1.75423 52.8682C1.89821 52.9816 2.08093 53.0341 2.26315 53.0142C2.26315 53.0142 3.82649 52.1742 3.87315 52.1509C9.6387 46.7656 15.9494 41.9955 22.7032 37.9176C25.8998 36.0509 25.6665 35.9809 28.5832 37.5676C36.1243 42.1943 43.4146 47.218 50.4232 52.6176C50.4232 53.2942 51.0998 53.1776 45.4998 53.2942C39.8998 53.4109 7.16315 53.5042 3.98982 53.2942C3.79983 53.3267 3.62744 53.4253 3.50316 53.5726C3.37887 53.72 3.3107 53.9065 3.3107 54.0992C3.3107 54.292 3.37887 54.4785 3.50316 54.6258C3.62744 54.7731 3.79983 54.8718 3.98982 54.9042C7.90982 55.1376 49.8398 56.6076 51.9165 55.4876C52.2089 55.3297 52.4452 55.0851 52.5932 54.7876C54.0165 52.0576 56.9332 24.9909 53.0598 21.7709ZM2.84649 50.8909C2.84649 45.1276 4.40982 26.5309 4.43315 26.3442C9.36689 30.1205 14.5771 33.5211 20.0198 36.5176C13.8159 40.7048 8.06097 45.5215 2.84649 50.8909ZM50.7265 51.0076C44.917 45.9136 38.8168 41.1611 32.4565 36.7742C44.6598 32.1076 49.3265 28.3509 52.6632 27.0909C52.7848 35.1067 52.1362 43.1157 50.7265 51.0076Z" fill="#10112A"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M15.3772 19.4368C16.1939 22.8668 24.5705 30.7301 28.5605 31.1035C32.5505 31.4768 39.6672 20.5568 39.3172 18.3401C38.9672 16.1235 36.2139 16.3335 34.1372 15.8435H33.2738C32.3732 10.674 31.1655 5.5627 29.6572 0.536805C29.586 0.338777 29.4391 0.17713 29.2487 0.0874248C29.0584 -0.00228009 28.8402 -0.0126949 28.6422 0.0584715C28.4442 0.129638 28.2825 0.276556 28.1928 0.466905C28.1031 0.657255 28.0927 0.875443 28.1638 1.07347C29.7972 5.90347 31.1038 16.1701 31.4072 16.8468C31.8972 17.9201 33.1105 17.8501 33.7405 17.9901C34.6505 18.2235 36.2138 18.3168 36.9138 18.5501C36.7738 18.7368 36.7505 19.2501 36.5405 19.6468C35.0005 22.7035 30.3338 28.5601 28.7938 28.4201C25.9239 28.1635 18.6672 21.1168 18.0139 19.2501C18.2169 19.1199 18.4367 19.0178 18.6672 18.9468C23.9172 17.6168 23.9872 18.8068 24.7572 14.2801C24.7572 14.0935 26.6938 0.910138 26.6472 0.723472C26.3905 -0.209862 25.5038 0.0234715 25.2005 0.583472C24.8972 1.14347 24.7105 3.10347 23.6838 9.33347C22.5172 16.5668 22.2839 15.4701 22.1438 16.0768C18.9705 16.7068 14.6539 16.4501 15.3772 19.4368Z" fill="#AA336A"/>
                  </svg>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {showChangePassword && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50" onClick={() => ( setShowChangePassword(false), setCpCurrent(''), setCpNew(''), setCpConfirm(''), setCpErrors({}), setLogoutOtherApps(false) )}>
          <div data-layer="Modal" className="Modal w-[566px] h-[456px] relative bg-white rounded-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div data-layer="Section title" className="SectionTitle left-[24px] top-[24px] absolute justify-start text-[#17183b] text-lg font-semibold font-['Inter'] leading-normal">Password</div>
            <div data-svg-wrapper data-layer="Ellipse 11" className="Ellipse11 left-[510px] top-[20px] absolute">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="#F2F2F4"/>
              </svg>
            </div>
            <div data-svg-wrapper data-layer="Frame" className="Frame left-[516.40px] top-[26.40px] absolute cursor-pointer" onClick={() => ( setShowChangePassword(false), setCpCurrent(''), setCpNew(''), setCpConfirm(''), setCpErrors({}), setLogoutOtherApps(false) )}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_407_12718)">
                  <path d="M14.7953 5.20117L5.19531 14.8012" stroke="#17183B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5.19531 5.20117L14.7953 14.8012" stroke="#17183B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <defs>
                  <clipPath id="clip0_407_12718">
                    <rect width="19.2" height="19.2" fill="white" transform="translate(0.398438 0.400391)"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
            {cpErrors.current ? (
              <>
                <div data-layer="Input field" data-count="False" data-property-1="Filled" data-size="Medium" className="InputField w-[518px] h-14 left-[24px] top-[144px] absolute bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#b7b7c2]">
                  <div data-layer="Label-text" className="LabelText w-56 left-[16px] top-[9px] absolute justify-start text-[#9495a5] text-xs font-normal font-['Inter'] leading-none">New password*</div>
                  <div data-layer="Frame 48097001" className="Frame48097001 size- left-[16px] top-[25px] absolute inline-flex justify-start items-center gap-1">
                    <div data-layer="Label-text" className="LabelText justify-start text-[#10112a] text-base font-medium font-['Inter'] leading-snug">{cpNewMasked}</div>
                  </div>
                </div>
                <div data-layer="Input field" data-count="False" data-property-1="Filled" data-size="Medium" className="InputField w-[518px] h-14 left-[24px] top-[224px] absolute bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#b7b7c2]">
                  <div data-layer="Label-text" className="LabelText w-56 left-[16px] top-[9px] absolute justify-start text-[#9495a5] text-xs font-normal font-['Inter'] leading-none">Confirm new password*</div>
                  <div data-layer="Frame 48097001" className="Frame48097001 size- left-[16px] top-[25px] absolute inline-flex justify-start items-center gap-1">
                    <div data-layer="Label-text" className="LabelText justify-start text-[#10112a] text-base font-medium font-['Inter'] leading-snug">{cpConfirmMasked}</div>
                  </div>
                </div>
                <div data-layer="Input field" data-count="False" data-property-1="Error" data-size="Medium" className="InputField w-[518px] h-14 left-[24px] top-[64px] absolute bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#db0000]">
                  <div data-layer="Label-text" className="LabelText w-56 left-[16px] top-[9px] absolute justify-start text-[#db0000] text-xs font-normal font-['Inter'] leading-none">Current password*</div>
                  <div data-layer="Error Text" className="ErrorText left-[15.70px] top-[60px] absolute justify-start text-[#db0000] text-xs font-normal font-['Inter'] leading-none">{cpErrors.current}</div>
                  <div data-layer="Frame 48097000" className="Frame48097000 size- left-[16px] top-[25px] absolute inline-flex justify-start items-center gap-1">
                    <div data-layer="Label-text" className="LabelText justify-start text-[#10112a] text-base font-medium font-['Inter'] leading-snug">{cpCurrentMasked}</div>
                  </div>
                  <div data-svg-wrapper data-layer="Frame" className="Frame left-[486px] top-[20px] absolute">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_10066_4739)">
                        <path d="M11.333 2.22725C12.3465 2.81237 13.1881 3.65396 13.7732 4.66743C14.3583 5.6809 14.6663 6.83054 14.6663 8.00079C14.6663 9.17104 14.3583 10.3207 13.7731 11.3341C13.188 12.3476 12.3464 13.1892 11.3329 13.7743C10.3195 14.3594 9.16982 14.6674 7.99957 14.6674C6.82932 14.6674 5.67969 14.3593 4.66623 13.7742C3.65277 13.189 2.8112 12.3474 2.2261 11.334C1.64099 10.3205 1.33298 9.17083 1.33301 8.00058L1.33634 7.78458C1.37368 6.63324 1.70871 5.51122 2.30877 4.52791C2.90883 3.5446 3.75344 2.73355 4.76027 2.17383C5.76709 1.61412 6.90177 1.32484 8.05368 1.3342C9.20558 1.34357 10.3354 1.65124 11.333 2.22725ZM7.99967 10.0006C7.82286 10.0006 7.65329 10.0708 7.52827 10.1958C7.40325 10.3209 7.33301 10.4904 7.33301 10.6672V10.6739C7.33301 10.8507 7.40325 11.0203 7.52827 11.1453C7.65329 11.2703 7.82286 11.3406 7.99967 11.3406C8.17649 11.3406 8.34605 11.2703 8.47108 11.1453C8.5961 11.0203 8.66634 10.8507 8.66634 10.6739V10.6672C8.66634 10.4904 8.5961 10.3209 8.47108 10.1958C8.34605 10.0708 8.17649 10.0006 7.99967 10.0006ZM7.99967 5.33391C7.82286 5.33391 7.65329 5.40415 7.52827 5.52918C7.40325 5.6542 7.33301 5.82377 7.33301 6.00058V8.66725C7.33301 8.84406 7.40325 9.01363 7.52827 9.13865C7.65329 9.26367 7.82286 9.33391 7.99967 9.33391C8.17649 9.33391 8.34605 9.26367 8.47108 9.13865C8.5961 9.01363 8.66634 8.84406 8.66634 8.66725V6.00058C8.66634 5.82377 8.5961 5.6542 8.47108 5.52918C8.34605 5.40415 8.17649 5.33391 7.99967 5.33391Z" fill="#DB0000"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_10066_4739">
                          <rect width="16" height="16" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div data-layer="Frame 48097040" className="Frame48097040 w-[566px] h-16 left-0 top-[388px] absolute overflow-hidden">
                  <div data-layer="Primary Button" className="PrimaryButton h-10 px-5 py-2 left-[469px] top-[14px] absolute bg-[#e5c0d1] rounded-[56px] inline-flex justify-center items-center gap-2">
                    <div data-layer="Button" className="Button justify-start text-white text-sm font-semibold font-['Inter']">Save</div>
                  </div>
                  <div data-layer="Primary Button" className="PrimaryButton h-10 px-5 py-2 left-[365px] top-[14px] absolute bg-white rounded-[56px] outline outline-1 outline-offset-[-1px] outline-[#b7b7c2] inline-flex justify-center items-center gap-2">
                    <div data-layer="Button" className="Button justify-start text-[#aa336a] text-sm font-semibold font-['Inter']">Cancel</div>
                  </div>
                </div>
                <div data-layer="*Checkbox*" data-check="True" data-label="True" data-state="Default" className="Checkbox size- left-[24px] top-[304px] absolute inline-flex justify-start items-start gap-2">
                  <div data-layer="Checkbox Wrapper" className="CheckboxWrapper size- py-[3px] flex justify-start items-start gap-2">
                    <div data-svg-wrapper data-layer="Checkbox/Active/Default" className="CheckboxActiveDefault relative">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 4C0 1.79086 1.79086 0 4 0H12C14.2091 0 16 1.79086 16 4V12C16 14.2091 14.2091 16 12 16H4C1.79086 16 0 14.2091 0 12V4Z" fill="#AA336A"/>
                        <path d="M12.4688 3.84961C12.6699 3.84961 12.789 4.0837 12.6602 4.24414L12.6592 4.24316L6.9375 11.4961H6.93652C6.7256 11.7609 6.32265 11.7619 6.1123 11.4961L2.90234 7.42969C2.77666 7.27029 2.89024 7.0353 3.09375 7.03516H3.91309L4.03027 7.04883C4.06878 7.05769 4.10681 7.07051 4.14258 7.08789C4.21376 7.12255 4.2762 7.17315 4.3252 7.23535L6.52344 10.0215L11.2383 4.0498C11.3373 3.92341 11.4895 3.84973 11.6494 3.84961H12.4688Z" fill="white" stroke="white" strokeWidth="0.3"/>
                      </svg>
                    </div>
                  </div>
                  <div data-layer="Checkbox" className="Checkbox justify-start text-[#10112a] text-sm font-normal font-['Inter'] leading-snug">Changing your password logs you out of all browsers on your device(s). <br/>Checking this box also logs you out of all apps you have authorized. </div>
                </div>
              </>
            ) : (
              <>
                <div className="absolute w-[518px] left-[24px] top-[64px]">
                  <FloatingInput
                    id="settings-current-password"
                    type="password"
                    value={cpCurrent}
                    onChange={(v) => { setCpCurrent(v); setCpErrors(prev => ({ ...prev, current: '' })); setCpTouched(prev => ({ ...prev, current: true })) }}
                    label="Current password*"
                    className="w-full"
                    inputProps={{ autoComplete: 'off', name: 'settings-current-password' }}
                    error={Boolean(cpErrors.current || validationErrors.current)}
                    helperText={cpErrors.current || validationErrors.current}
                  />
                </div>
                <div className="absolute w-[518px] left-[24px] top-[144px]">
                  <FloatingInput
                    id="settings-new-password"
                    type="password"
                    value={cpNew}
                    onChange={(v) => { setCpNew(v); setCpErrors(prev => ({ ...prev, new: '' })); setCpTouched(prev => ({ ...prev, new: true })) }}
                    label="New password*"
                    className="w-full"
                    inputProps={{ autoComplete: 'off', name: 'settings-new-password' }}
                    error={Boolean(cpErrors.new || validationErrors.new)}
                    helperText={cpErrors.new || validationErrors.new}
                  />
                </div>
                <div className="absolute w-[518px] left-[24px] top-[224px]">
                  <FloatingInput
                    id="settings-confirm-password"
                    type="password"
                    value={cpConfirm}
                    onChange={(v) => { setCpConfirm(v); setCpErrors(prev => ({ ...prev, confirm: '' })); setCpTouched(prev => ({ ...prev, confirm: true })) }}
                    label="Confirm new password*"
                    className="w-full"
                    inputProps={{ autoComplete: 'off', name: 'settings-confirm-password' }}
                    error={Boolean(cpErrors.confirm || validationErrors.confirm)}
                    helperText={cpErrors.confirm || validationErrors.confirm}
                  />
                </div>
                <div data-layer="*Checkbox*" data-check="False" data-label="True" data-state="Default" className="Checkbox size- left-[24px] top-[304px] absolute inline-flex justify-start items-start gap-2">
                  <div data-layer="Checkbox Wrapper" className="CheckboxWrapper size- py-[3px] flex justify-start items-start gap-2">
                    <div className="relative">
                      <input id="logout-other-apps" type="checkbox" checked={logoutOtherApps} onChange={e => setLogoutOtherApps(e.target.checked)} className="w-4 h-4 rounded outline outline-1 outline-[#b7b7c2] bg-white" />
                    </div>
                  </div>
                  <div data-layer="Checkbox" className="Checkbox justify-start text-[#10112a] text-sm font-normal font-['Inter'] leading-snug">Changing your password logs you out of all browsers on your device(s). <br/>Checking this box also logs you out of all apps you have authorized. </div>
                </div>
                <div data-layer="Frame 48097040" className="Frame48097040 w-[566px] h-16 left-0 top-[388px] absolute overflow-hidden">
                  <div data-layer="Primary Button" className={`PrimaryButton h-10 px-5 py-2 left-[469px] top-[14px] absolute ${cpSaving ? 'bg-[#e5c0d1]' : (cpHasTyped ? 'bg-pink-700' : 'bg-[#e5c0d1]')} rounded-[56px] inline-flex justify-center items-center gap-2 ${canSavePassword ? '' : 'opacity-60 cursor-not-allowed'}`} onClick={canSavePassword && !cpSaving ? handleSavePassword : undefined}>
                    <div data-layer="Button" className="Button justify-start text-white text-sm font-semibold font-['Inter']">{cpSaving ? 'Saving...' : 'Save'}</div>
                  </div>
                  <div data-layer="Primary Button" className="PrimaryButton h-10 px-5 py-2 left-[365px] top-[14px] absolute bg-white rounded-[56px] outline outline-1 outline-offset-[-1px] outline-[#b7b7c2] inline-flex justify-center items-center gap-2 cursor-pointer" onClick={() => ( setShowChangePassword(false), setCpCurrent(''), setCpNew(''), setCpConfirm(''), setCpErrors({}), setLogoutOtherApps(false) )}>
                    <div data-layer="Button" className="Button justify-start text-[#aa336a] text-sm font-semibold font-['Inter']">Cancel</div>
                  </div>
                </div>
                {cpErrors.general ? <div className="absolute left-4 top-[360px] text-red-700 text-sm">{cpErrors.general}</div> : null}
              </>
            )}
          </div>
        </div>
      )}
      <Toast show={showToast} message={toastMessage} onClose={() => setShowToast(false)} />
      {activeTab === 'profile' && (
        <div id="panel-profile" role="tabpanel" aria-labelledby="tab-profile" className="left-[182px] top-[240px] absolute"></div>
      )}
      {activeTab === 'notifications' && (
        <div id="panel-notifications" role="tabpanel" aria-labelledby="tab-notifications" className="left-[182px] top-[240px] absolute"></div>
      )}
    </div>
  )
}
