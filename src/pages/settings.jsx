import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import EmailIcon from '@/components/icons/Email'
import FloatingInput from '@/components/FloatingInput'
import PasswordIcon from '@/components/icons/Password'
import DeleteIcon from '@/components/icons/Delete'
import { useAuth } from '@/hooks/useAuth'
import { auth, rtdb } from '@/firebase/config'
import { ref, get } from 'firebase/database'
import { uploadAvatar } from '@/firebase/storage/avatars'
import { uploadBanner } from '@/firebase/storage/banners'
import { resetEmail, resetPassword } from '@/firebase/adminApi'
import { updateUserPublic, getUser as getUserRecord } from '@/firebase/rtdb/users'
import { updateProfile, signOut } from 'firebase/auth'
import { useRouter } from 'next/router'
import { saveUsername } from '@/firebase/rtdb/usernames'
import Toast from '@/components/Toast'
import NotificationsPanel from '@/components/NotificationsPanel'
import AvatarWithEdit from '@/components/AvatarWithEdit'
import BannerEditModal from '@/components/BannerEditModal'
export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('account')

  // Sync activeTab with URL query parameter
  useEffect(() => {
    if (router.isReady) {
      const tab = router.query.tab || 'account'
      setActiveTab(tab)
    }
  }, [router.isReady, router.query])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    router.push(`/settings${tab === 'account' ? '' : `?tab=${tab}`}`)
  }
  const [showEditEmail, setShowEditEmail] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [cpCurrent, setCpCurrent] = useState('')
  const [cpNew, setCpNew] = useState('')
  const [cpConfirm, setCpConfirm] = useState('')
  const [cpErrors, setCpErrors] = useState({})
  const [cpSaving, setCpSaving] = useState(false)
  const [logoutOtherApps, setLogoutOtherApps] = useState(false)
  const [cpTouched, setCpTouched] = useState({ current: false, new: false, confirm: false })
  const [newEmail, setNewEmail] = useState('')
  const [password, setPassword] = useState('')
  const { user, setUser } = useAuth()
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [saving, setSaving] = useState(false)
    const [newEmailTyped, setNewEmailTyped] = useState(false)
  const [passwordTyped, setPasswordTyped] = useState(false)
  const canSaveVisual = Boolean(user && (newEmail || '').trim() && password && (newEmailTyped || passwordTyped))
  const [isGoogleAccount, setIsGoogleAccount] = useState(false)
  const [emailEditStep, setEmailEditStep] = useState('form')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  // delete account modal state
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteReason, setDeleteReason] = useState('')
  const [deletePasswordError, setDeletePasswordError] = useState('')
  const [deleteSaving, setDeleteSaving] = useState(false)
  // edit username modal state
  const [showEditUsername, setShowEditUsername] = useState(false)
  // edit profile banner modal state
  const [showEditBanner, setShowEditBanner] = useState(false)
  const [usernameDraft, setUsernameDraft] = useState('')
  const [usernameTyped, setUsernameTyped] = useState(false)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [rtdbAvatarUrl, setRtdbAvatarUrl] = useState(null)
  useEffect(() => {
    try {
      const cu = auth.currentUser
      const google = !!(cu && cu.providerData && cu.providerData.some(p => p.providerId === 'google.com'))
      setIsGoogleAccount(google)
    } catch (e) {
      setIsGoogleAccount(false)
    }
  }, [])

  // Load RTDB public avatarUrl (fall back to Auth photoURL)
  useEffect(() => {
    let mounted = true
    const uid = user && user.uid
    if (!uid) {
      setRtdbAvatarUrl(null)
      return
    }
    ;(async () => {
      try {
        const rec = await getUserRecord(uid)
        if (!mounted) return
        setRtdbAvatarUrl(rec && rec.public && rec.public.avatarUrl ? rec.public.avatarUrl : null)
        // populate banner URL into local auth user state so UI can read it
        if (rec && rec.public && rec.public.bannerUrl) {
          try { setUser(prev => prev ? { ...prev, bannerURL: rec.public.bannerUrl } : prev) } catch (e) {}
        }
      } catch (e) {
        console.error('Failed to load RTDB user record for avatar', e)
      }
    })()
    return () => { mounted = false }
  }, [user?.uid])

  const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || '').trim())
  const validatePassword = (value) => {
    if (!value) return ''
    if (value.length < 8) return `Please use at least 8 characters (you are currently using ${value.length} characters).`
    return ''
  }
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
    const passwordErr = password ? validatePassword(password) : 'Please use at least 8 characters (you are currently using 0 characters).'
    if (passwordErr) {
      setPasswordError(passwordErr)
      return
    }
    if (emailTrim === user.email) {
      setEmailError('New email must be different from current email')
      return
    }
    setSaving(true)
    try {
      // call admin cloud function to update auth email
      await resetEmail(user.uid, emailTrim)
      // update local UI state so the UI shows the new email
      try { setUser(prev => prev ? { ...prev, email: emailTrim } : prev) } catch (e) {}
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
    if (!cpCurrent) {
      return
    }
    const currErr = validatePassword(cpCurrent)
    if (currErr) {
      return
    }
    if (!cpNew) {
      return
    }
    const newErr = validatePassword(cpNew)
    if (newErr) {
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
      // call admin cloud function to update password
      await resetPassword(user.uid, cpNew)
      setShowChangePassword(false)
      setCpCurrent('')
      setCpNew('')
      setCpConfirm('')
      setLogoutOtherApps(false)
      setToastMessage('Your password has been changed.')
      setShowToast(true)
    } catch (e) {
      setCpErrors(prev => ({ ...prev, general: e?.message || 'Failed to update password' }))
    } finally {
      setCpSaving(false)
    }
  }
  const handleDeleteAccount = async () => {
    setDeletePasswordError('')
    if (!deletePassword) {
      setDeletePasswordError('Please use at least 8 characters (you are currently using 0 characters).')
      return
    }
    const err = validatePassword(deletePassword)
    if (err) {
      setDeletePasswordError(err)
      return
    }
    setDeleteSaving(true)
    try {
      if (!user || !user.uid) throw new Error('Not authenticated')
      // mark user as deactivated in RTDB public record
      await updateUserPublic(user.uid, { deactivated: true })
      // sign out and redirect to login
      try { await signOut(auth) } catch (e) {}
      try { router.push('/login') } catch (e) {}
      setShowDeleteAccount(false)
      setDeletePassword('')
      setDeleteReason('')
      setToastMessage('Your account has been deactivated.')
      setShowToast(true)
    } catch (e) {
      setDeletePasswordError(e?.message || 'Failed to delete account')
    } finally {
      setDeleteSaving(false)
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
  if (cpTouched.current && cpCurrent && cpCurrent.length > 0) {
    const err = validatePassword(cpCurrent)
    if (err) validationErrors.current = err
  }
  if (cpTouched.new && cpNew && cpNew.length > 0) {
    const err = validatePassword(cpNew)
    if (err) validationErrors.new = err
  }
  if (cpTouched.confirm && cpConfirm && cpNew !== cpConfirm) validationErrors.confirm = 'Passwords do not match'
  if (cpTouched.new && cpTouched.current && cpNew && cpCurrent && cpNew === cpCurrent) validationErrors.new = 'New password must be different'

  // Username validation (mirror signup page behavior)
  const validateUsername = (value) => {
    if (!value) return 'Username is required'
    if (value.length < 3) return 'Username must be at least 3 characters'
    if (value.length > 60) return 'Username must be at most 60 characters'
    if (!/^[A-Za-z0-9_]+$/.test(value)) return 'Only letters, numbers and _ are allowed'
    return ''
  }

  const checkUsernameUnique = async (value) => {
    const name = (value || '').toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 60)
    if (!name) return false
    try {
      const snap = await get(ref(rtdb, `usersByUsername/${name}`))
      return !snap.exists()
    } catch (e) {
      console.error('Failed to check username uniqueness:', e)
      return null
    }
  }

  // debounce username uniqueness check when typing in modal
  useEffect(() => {
    let mounted = true
    // Only run validation after the user has typed at least once
    if (!usernameTyped) { setUsernameError(''); setUsernameChecking(false); return }
    if (!usernameDraft) { setUsernameError(''); setUsernameChecking(false); return }
    setUsernameChecking(true)
    const handler = setTimeout(async () => {
      const basicErr = validateUsername(usernameDraft)
      if (basicErr) {
        if (mounted) setUsernameError(basicErr)
        if (mounted) setUsernameChecking(false)
        return
      }
      const ok = await checkUsernameUnique(usernameDraft)
      if (!mounted) return
      if (ok === true) {
        setUsernameError('')
        setUsernameChecking(false)
      } else if (ok === false) {
        setUsernameError('This username is already taken')
        setUsernameChecking(false)
      } else {
        setUsernameError('Unable to verify username availability')
        setUsernameChecking(false)
      }
    }, 400)
    return () => { mounted = false; clearTimeout(handler) }
  }, [usernameDraft])
  const canSaveUsername = Boolean(usernameDraft && usernameDraft.trim() && !validateUsername(usernameDraft) && !usernameChecking)
  return (
    <div data-layer="Post detail page" className="PostDetailPage w-full min-h-screen relative bg-white overflow-hidden">
      <Header />
      <div className="max-w-[1440px] mx-auto w-full relative mt-[-72px]">
      <div data-layer="Settings" className="Settings left-[142px] top-[112px] absolute justify-start text-slate-900 text-2xl font-semibold font-['Inter'] leading-loose">Settings</div>
      <div data-layer="Tab bar" role="tablist" aria-label="Settings tabs" className="TabBar size- left-[142px] top-[168px] absolute inline-flex justify-center items-center gap-6">
        <button
          type="button"
          role="tab"
          id="tab-account"
          aria-selected={activeTab === 'account'}
          aria-controls="panel-account"
          onClick={() => handleTabChange('account')}
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
          onClick={() => handleTabChange('profile')}
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
          onClick={() => handleTabChange('notifications')}
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
          <div className="absolute right-[142px] top-[235px] w-[360px] flex h-full items-center justify-end gap-1">
            <div className="text-gray-600 text-sm font-normal font-['Inter'] leading-snug truncate max-w-[260px] text-right">{(user && user.email) || 'johndoe@gmail.com'}</div>
            <div data-layer="Primary Button" className={`PrimaryButton h-8 px-4 py-2 rounded-[56px] inline-flex justify-center items-center gap-2 ${isGoogleAccount ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} onClick={isGoogleAccount ? undefined : () => ( setNewEmail(''), setPassword(''), setEmailError(''), setPasswordError(''), setNewEmailTyped(false), setPasswordTyped(false), setEmailEditStep('form'), setShowEditEmail(true) )} title={isGoogleAccount ? 'Google accounts cannot change email here' : undefined}>
              <div data-layer="Button" className="Button justify-start text-pink-700 text-xs font-semibold font-['Inter']">Edit</div>
            </div>
          </div>
          <div data-layer="***************" className="left-[1138px] top-[365px] absolute text-right justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug">***************</div>
          <EmailIcon className="size-6 left-[142px] top-[240px] absolute overflow-hidden" />
          <DeleteIcon className="size-6 left-[142px] top-[466px] absolute overflow-hidden" />
          <div data-layer="Primary Button" className={`PrimaryButton h-8 px-4 py-2 left-[1243px] top-[360px] absolute rounded-[56px] inline-flex justify-center items-center gap-2 ${isGoogleAccount ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} onClick={isGoogleAccount ? undefined : () => ( setCpCurrent(''), setCpNew(''), setCpConfirm(''), setCpErrors({}), setLogoutOtherApps(false), setShowChangePassword(true) )} title={isGoogleAccount ? 'Google accounts cannot change password here' : undefined}>
            <div data-layer="Button" className="Button justify-start text-pink-700 text-xs font-semibold font-['Inter']">Edit</div>
          </div>
          <div data-layer="Primary Button" className="PrimaryButton h-8 px-4 py-2 left-[1203px] top-[466px] absolute rounded-[56px] inline-flex justify-center items-center gap-2 cursor-pointer" onClick={() => setShowDeleteAccount(true)}>
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
                    onChange={(v) => { setCpCurrent(v); setCpErrors(prev => ({ ...prev, current: '' })) }}
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
                    onChange={(v) => { setCpNew(v); setCpErrors(prev => ({ ...prev, new: '' })) }}
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
                    onChange={(v) => { setCpConfirm(v); setCpErrors(prev => ({ ...prev, confirm: '' })) }}
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
                  <div data-layer="Primary Button" className={`PrimaryButton h-10 px-5 py-2 left-[469px] top-[14px] absolute ${cpSaving ? 'bg-[#e5c0d1]' : (cpHasTyped ? 'bg-pink-700' : 'bg-[#e5c0d1]')} rounded-[56px] inline-flex justify-center items-center gap-2 ${cpHasTyped && !cpSaving ? 'cursor-pointer' : 'cursor-not-allowed'}`} onClick={cpHasTyped && !cpSaving ? handleSavePassword : undefined}>
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
      {showDeleteAccount && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50" onClick={() => ( setShowDeleteAccount(false), setDeletePassword(''), setDeleteReason('') )}>
          <div data-layer="Modal" className="Modal w-[566px] h-[516px] relative bg-white rounded-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div data-layer="Section title" className="SectionTitle left-[24px] top-[24px] absolute justify-start text-[#17183b] text-lg font-semibold font-['Inter'] leading-normal">Delete account</div>
            <div data-svg-wrapper data-layer="Ellipse 11" className="Ellipse11 left-[510px] top-[20px] absolute">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="#F2F2F4"/>
              </svg>
            </div>
            <div data-svg-wrapper data-layer="Frame" className="Frame left-[516.40px] top-[26.40px] absolute cursor-pointer" onClick={() => ( setShowDeleteAccount(false), setDeletePassword(''), setDeleteReason('') )}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_407_12769)">
                  <path d="M14.7953 5.20117L5.19531 14.8012" stroke="#17183B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5.19531 5.20117L14.7953 14.8012" stroke="#17183B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <defs>
                  <clipPath id="clip0_407_12769">
                    <rect width="19.2" height="19.2" fill="white" transform="translate(0.398438 0.400391)"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div data-layer="WeReSorryToSeeYouLeave" className="WeReSorryToSeeYouLeave left-[24px] top-[64px] absolute justify-start text-[#10112a] text-base font-medium font-['Inter'] leading-normal">We&apos;re sorry to see you leave.</div>
            <div data-layer="OnceYouDeleteYourAccount..." className="OnceYouDeleteYourAccountYourProfileAndUsernameWillBePermanentlyRemovedFromSalesGossipYourPostsCommentsAndMessagesWillNoLongerBeLinkedToYourAccountButTheyWonTBeDeletedUnlessYouRemoveThemYourselfBeforehand w-[465px] left-[24px] top-[96px] absolute justify-start text-[#454662] text-sm font-normal font-['Inter'] leading-snug">Once you delete your account, your profile and username will be permanently removed from Sales Gossip. Your posts, comments, and messages will no longer be linked to your account, but they won&apos;t be deleted unless you remove them yourself beforehand.</div>
            <div className="absolute w-[518px] left-[24px] top-[208px]">
              <FloatingInput
                id="settings-delete-password"
                type="password"
                value={deletePassword}
                onChange={(v) => { setDeletePassword(v); setDeletePasswordError('') }}
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
                className={`PrimaryButton h-10 px-5 py-2 left-[399px] top-[14px] absolute ${deleteSaving ? 'bg-[#e5c0d1]' : (deletePassword && !validatePassword(deletePassword) ? 'bg-[#aa336a] cursor-pointer' : 'bg-[#e5c0d1]')} rounded-[56px] inline-flex justify-center items-center gap-2`}
                onClick={deleteSaving ? undefined : (deletePassword && !validatePassword(deletePassword) ? handleDeleteAccount : undefined)}
              >
                <div data-layer="Button" className="Button justify-start text-white text-sm font-semibold font-['Inter']">{deleteSaving ? 'Deleting...' : 'Delete account'}</div>
              </div>
              <div data-layer="Primary Button" className="PrimaryButton h-10 px-5 py-2 left-[295px] top-[14px] absolute bg-white rounded-[56px] outline outline-1 outline-offset-[-1px] outline-[#b7b7c2] inline-flex justify-center items-center gap-2 cursor-pointer" onClick={() => setShowDeleteAccount(false)}>
                <div data-layer="Button" className="Button justify-start text-[#aa336a] text-sm font-semibold font-['Inter']">Cancel</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast show={showToast} message={toastMessage} onClose={() => setShowToast(false)} />
      {activeTab === 'profile' && (
        <div id="panel-profile" role="tabpanel" aria-labelledby="tab-profile">
          <div data-svg-wrapper data-layer="Frame" className="Frame left-[142px] top-[240px] absolute">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_profile_username_icon)">
                <path d="M3 7C3 6.46957 3.21071 5.96086 3.58579 5.58579C3.96086 5.21071 4.46957 5 5 5H19C19.5304 5 20.0391 5.21071 20.4142 5.58579C20.7893 5.96086 21 6.46957 21 7V17C21 17.5304 20.7893 18.0391 20.4142 18.4142C20.0391 18.7893 19.5304 19 19 19H5C4.46957 19 3.96086 18.7893 3.58579 18.4142C3.21071 18.0391 3 17.5304 3 17V7Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 7L12 13L21 7" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs>
                <clipPath id="clip0_profile_username_icon">
                  <rect width="24" height="24" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </div>
          <div data-layer="Username*" className="Username left-[182px] top-[240px] absolute justify-start text-slate-900 text-base font-medium font-['Inter'] leading-normal">Username*</div>
          <div data-svg-wrapper data-layer="Frame" className="Frame left-[142px] top-[338px] absolute">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_profile_avatar_icon)">
                <path d="M5 13C5 12.4696 5.21071 11.9609 5.58579 11.5858C5.96086 11.2107 6.46957 11 7 11H17C17.5304 11 18.0391 11.2107 18.4142 11.5858C18.7893 11.9609 19 12.4696 19 13V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V13Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 11V7C8 5.93913 8.42143 4.92172 9.17157 4.17157C9.92172 3.42143 10.9391 3 12 3C13.0609 3 14.0783 3.42143 14.8284 4.17157C15.5786 4.92172 16 5.93913 16 7V11" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 16H15.01" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12.0098 16H12.0198" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.01953 16H9.02953" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs>
                <clipPath id="clip0_profile_avatar_icon">
                  <rect width="24" height="24" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </div>
          <div data-layer="Avatar" className="Avatar left-[182px] top-[338px] absolute justify-start text-slate-900 text-base font-medium font-['Inter'] leading-normal">Avatar</div>
          <div data-layer="Profile banner" className="ProfileBanner left-[182px] top-[458px] absolute justify-start text-slate-900 text-base font-medium font-['Inter'] leading-normal">Profile banner</div>
          <div data-layer="This will be your display name." className="ThisWillBeYourDisplayName w-80 left-[182px] top-[268px] absolute justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug">This will be your display name.</div>
          <div data-layer="This image will appear next to your posts and comments. Choose a clear photo that represents you." className="ThisImageWillAppearNextToYourPostsAndCommentsChooseAClearPhotoThatRepresentsYou w-96 left-[182px] top-[366px] absolute justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug">This image will appear next to your posts and comments. Choose a clear photo that represents you.</div>
          <div data-layer="Add a banner to personalize your profile. This will appear at the top of your profile page." className="AddABannerToPersonalizeYourProfileThisWillAppearAtTheTopOfYourProfilePage w-80 left-[182px] top-[486px] absolute justify-start text-gray-600 text-sm font-normal font-['Inter'] leading-snug">Add a banner to personalize your profile. This will appear at the top of your profile page.</div>

          <div className="absolute right-[142px] top-[235px] w-[360px] flex h-full items-center justify-end gap-1">
            <div className="text-gray-600 text-sm font-normal font-['Inter'] leading-snug truncate max-w-[260px] text-right">{(user && user.displayName) || 'Johndoe'}</div>
            <div data-layer="Primary Button" className="PrimaryButton h-8 px-4 py-2 rounded-[56px] inline-flex justify-center items-center gap-2 cursor-pointer" onClick={() => { setUsernameDraft((user && user.displayName) || ''); setUsernameTyped(false); setShowEditUsername(true) }}>
              <div data-layer="Button" className="Button justify-start text-pink-700 text-xs font-semibold font-['Inter']">Edit</div>
            </div>
          </div>

          <div data-layer="AvatarPreview" className="left-[1243px] top-[342px] absolute">
            <AvatarWithEdit
              avatarUrl={(user && user.photoURL) || rtdbAvatarUrl}
              onSave={async (fileOrNull) => {
                // parent handler will persist or update local state
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
                    setUser(prev => prev ? { ...prev, photoURL: url } : prev)
                    setToastMessage('Your avatar has been updated')
                    setShowToast(true)
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

          
          <div data-layer="Primary Button" className="PrimaryButton h-8 px-4 py-2 left-[1243px] top-[458px] absolute rounded-[56px] inline-flex justify-center items-center gap-2">
            <button type="button" onClick={() => setShowEditBanner(true)} className="inline-flex items-center justify-center">
              <div data-layer="Button" className="Button justify-start text-pink-700 text-xs font-semibold font-['Inter']">Edit</div>
            </button>
          </div>

          {showEditBanner && (
            <BannerEditModal
              open={showEditBanner}
              onClose={() => setShowEditBanner(false)}
              currentBanner={(user && user.bannerURL)}
              onSave={async (fileOrNull) => {
                if (!setUser) return
                try {
                  if (fileOrNull === null) {
                    // remove banner
                    setUser(prev => prev ? { ...prev, bannerURL: null } : prev)
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
                    setUser(prev => prev ? { ...prev, bannerURL: url } : prev)
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

          {showEditUsername && (
            <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50" onClick={() => setShowEditUsername(false)}>
              <div data-layer="Modal" className="Modal w-[566px] h-64 relative bg-white rounded-3xl overflow-hidden shadow-lg" onClick={e => e.stopPropagation()}>
              <div data-layer="Section title" className="SectionTitle left-[24px] top-[24px] absolute justify-start text-[#17183b] text-lg font-semibold font-['Inter'] leading-normal">Display name</div>
              <div data-svg-wrapper data-layer="Ellipse 11" className="Ellipse11 left-[510px] top-[20px] absolute">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="16" fill="#F2F2F4"/>
                </svg>
              </div>
              <div data-svg-wrapper data-layer="Frame" className="Frame left-[516.40px] top-[26.40px] absolute cursor-pointer" onClick={() => setShowEditUsername(false)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_407_12914)">
                    <path d="M14.7953 5.20117L5.19531 14.8012" stroke="#17183B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.19531 5.20117L14.7953 14.8012" stroke="#17183B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_407_12914">
                      <rect width="19.2" height="19.2" fill="white" transform="translate(0.398438 0.400391)"/>
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div className="absolute w-[518px] left-[24px] top-[104px]">
                <FloatingInput
                  id="settings-username"
                  type="text"
                  value={usernameDraft}
                  onChange={(v) => { setUsernameDraft(v); setUsernameError(''); setUsernameChecking(true); setUsernameTyped(true) }}
                  label="Username*"
                  className="w-full"
                  inputProps={{ autoComplete: 'off', 'aria-label': 'Display name', maxLength: 60 }}
                  errorOutlineClass={'outline-[#db0000]'}
                  errorLabelClass={'text-[#db0000]'}
                  helperErrorClass={'text-[#db0000]'}
                  error={Boolean(usernameError)}
                  helperText={usernameTyped ? (usernameDraft ? (usernameChecking ? 'Checking...' : (usernameError ? usernameError : 'Username available')) : '') : ''}
                  helperTextType={usernameTyped ? (usernameChecking ? 'info' : (usernameError ? 'error' : 'success')) : undefined}
                  rightElement={(
                    <div className="inline-flex items-center gap-2">
                      {usernameTyped && usernameError ? (
                        <div data-svg-wrapper data-layer="Frame" className="Frame relative">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_407_12941)">
                              <path d="M11.334 2.22725C12.3475 2.81237 13.189 3.65396 13.7742 4.66743C14.3593 5.6809 14.6673 6.83054 14.6673 8.00079C14.6673 9.17104 14.3593 10.3207 13.7741 11.3341C13.189 12.3476 12.3474 13.1892 11.3339 13.7743C10.3204 14.3594 9.1708 14.6674 8.00055 14.6674C6.83029 14.6674 5.68066 14.3593 4.66721 13.7742C3.65375 13.189 2.81218 12.3474 2.22707 11.334C1.64197 10.3205 1.33395 9.17083 1.33398 8.00058L1.33732 7.78458C1.37465 6.63324 1.70968 5.51122 2.30974 4.52791C2.90981 3.5446 3.75442 2.73355 4.76125 2.17383C5.76807 1.61412 6.90275 1.32484 8.05465 1.3342C9.20656 1.34357 10.3364 1.65124 11.334 2.22725ZM8.00065 10.0006C7.82384 10.0006 7.65427 10.0708 7.52925 10.1958C7.40422 10.3209 7.33398 10.4904 7.33398 10.6672V10.6739C7.33398 10.8507 7.40422 11.0203 7.52925 11.1453C7.65427 11.2703 7.82384 11.3406 8.00065 11.3406C8.17746 11.3406 8.34703 11.2703 8.47205 11.1453C8.59708 11.0203 8.66732 10.8507 8.66732 10.6739V10.6672C8.66732 10.4904 8.59708 10.3209 8.47205 10.1958C8.34703 10.0708 8.17746 10.0006 8.00065 10.0006ZM8.00065 5.33391C7.82384 5.33391 7.65427 5.40415 7.52925 5.52918C7.40422 5.6542 7.33398 5.82377 7.33398 6.00058V8.66725C7.33398 8.84406 7.40422 9.01363 7.52925 9.13865C7.65427 9.26367 7.82384 9.33391 8.00065 9.33391C8.17746 9.33391 8.34703 9.26367 8.47205 9.13865C8.59708 9.01363 8.66732 8.84406 8.66732 8.66725V6.00058C8.66732 5.82377 8.59708 5.6542 8.47205 5.52918C8.34703 5.40415 8.17746 5.33391 8.00065 5.33391Z" fill="#DB0000"/>
                            </g>
                            <defs>
                              <clipPath id="clip0_407_12941">
                                <rect width="16" height="16" fill="white"/>
                              </clipPath>
                            </defs>
                          </svg>
                        </div>
                      ) : (usernameTyped && !usernameChecking && usernameDraft && !validateUsername(usernameDraft)) ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M8 1C4.13438 1 1 4.13438 1 8C1 11.8656 4.13438 15 8 15C11.8656 15 15 11.8656 15 8C15 4.13438 11.8656 1 8 1ZM11.0234 5.71406L7.73281 10.2766C7.68682 10.3408 7.62619 10.3931 7.55595 10.4291C7.48571 10.4652 7.40787 10.4841 7.32891 10.4841C7.24994 10.4841 7.17211 10.4652 7.10186 10.4291C7.03162 10.3931 6.97099 10.3408 6.925 10.2766L4.97656 7.57656C4.91719 7.49375 4.97656 7.37813 5.07812 7.37813H5.81094C5.97031 7.37813 6.12187 7.45469 6.21562 7.58594L7.32812 9.12969L9.78438 5.72344C9.87813 5.59375 10.0281 5.51562 10.1891 5.51562H10.9219C11.0234 5.51562 11.0828 5.63125 11.0234 5.71406Z" fill="#34A853"/>
                        </svg>
                      ) : null}
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <g clipPath="url(#clip0_215_8807)">
                          <path d="M4 12V9C4 8.20435 4.31607 7.44129 4.87868 6.87868C5.44129 6.31607 6.20435 6 7 6H20M20 6L17 3M20 6L17 9" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M20 12V15C20 15.7956 19.6839 16.5587 19.1213 17.1213C18.5587 17.6839 17.7956 18 17 18H4M4 18L7 21M4 18L7 15" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_215_8807">
                            <rect width="24" height="24" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                  )}
                />
                <div data-layer="count" className="Count text-right justify-start text-[#454662] text-xs font-normal font-['Inter'] leading-none -translate-x-2 translate-y-2">{`${(usernameDraft || '').length}/60`}</div>
              </div>
              <div data-layer="This will change your display name." className="ThisWillChangeYourDisplayName w-[468px] left-[24px] top-[64px] absolute justify-start text-[#454662] text-base font-normal font-['Inter'] leading-normal">This will change your display name.</div>
              <div data-layer="Frame 48097040" className="Frame48097040 w-[566px] h-16 left-0 bottom-0 absolute overflow-hidden">
                <div data-layer="Primary Button" className={`PrimaryButton h-10 px-5 py-2 left-[469px] bottom-[14px] absolute rounded-[56px] inline-flex justify-center items-center gap-2 ${!canSaveUsername ? 'bg-[#e5c0d1]' : 'bg-pink-700 cursor-pointer'}`} onClick={async () => {
                  // final validation + uniqueness check before saving
                  const trimmed = (usernameDraft || '').trim()
                  const uErr = validateUsername(trimmed)
                  if (uErr) { setUsernameError(uErr); return }
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

                    // attempt to save username mapping + profile field in RTDB
                    if (!user || !user.uid) throw new Error('Not authenticated')
                    try {
                      await saveUsername(user.uid, trimmed, user.displayName || null)
                    } catch (writeErr) {
                      // Common failure is a permission-denied when another client claimed it.
                      console.error('Failed to write username mapping', writeErr)
                      const code = writeErr && writeErr.code ? writeErr.code : ''
                      if (code === 'PERMISSION_DENIED' || code === 'auth/permission-denied') {
                        setUsernameError('This username is already taken')
                      } else {
                        setUsernameError(writeErr?.message || 'Failed to save username')
                      }
                      return
                    }

                    // Keep Firebase Auth profile in sync so the display name persists
                    try {
                      if (auth && auth.currentUser) {
                        await updateProfile(auth.currentUser, { displayName: trimmed })
                      }
                    } catch (e) {
                      console.error('Failed to update Firebase Auth displayName', e)
                      // don't fail the whole flow for this; UI will still be updated locally
                    }

                    // update local UI state
                    try { setUser(prev => prev ? { ...prev, displayName: trimmed } : prev) } catch (e) {}
                    setToastMessage('Username updated')
                    setShowToast(true)
                    setShowEditUsername(false)
                  } catch (e) {
                    console.error(e)
                    setUsernameError(e?.message || 'Failed to update display name')
                  } finally {
                    setUsernameChecking(false)
                  }
                }}>
                  <div data-layer="Button" className="Button justify-start text-white text-sm font-semibold font-['Inter']">Save</div>
                </div>
                <div data-layer="Primary Button" className="PrimaryButton h-10 px-5 py-2 left-[365px] bottom-[14px] absolute bg-white rounded-[56px] outline outline-1 outline-offset-[-1px] outline-[#b7b7c2] inline-flex justify-center items-center gap-2 cursor-pointer" onClick={() => setShowEditUsername(false)}>
                  <div data-layer="Button" className="Button justify-start text-[#aa336a] text-sm font-semibold font-['Inter']">Cancel</div>
                </div>
              </div>
              </div>
            </div>
          )}

          <div data-layer="Line 2" className="Line2 w-[1156px] h-0 left-[142px] top-[314px] absolute outline outline-1 outline-offset-[-0.50px] outline-gray-200"></div>
          <div data-layer="Line 5" className="Line5 w-[1156px] h-0 left-[142px] top-[434px] absolute outline outline-1 outline-offset-[-0.50px] outline-gray-200"></div>
        </div>
      )}
      {activeTab === 'notifications' && (
        <div id="panel-notifications" role="tabpanel" aria-labelledby="tab-notifications" className="left-[142px] top-[240px] absolute">
          <NotificationsPanel />
        </div>
      )}
      </div>
    </div>
  )
}
