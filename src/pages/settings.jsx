import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { useAuth } from '@/hooks/useAuth'
import { auth, rtdb } from '@/firebase/config'
import { ref, get } from 'firebase/database'
import { resetEmail, resetPassword } from '@/firebase/adminApi'
import { updateUserPublic, getUser as getUserRecord } from '@/firebase/rtdb/users'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/router'
import Toast from '@/components/Toast'
import NotificationsPanel from '@/components/NotificationsPanel'
import ProtectedRoute from '@/components/ProtectedRoute'
import SettingsAccountTab from '@/components/settings/SettingsAccountTab'
import SettingsChangePasswordModal from '@/components/settings/SettingsChangePasswordModal'
import SettingsDeleteAccountModal from '@/components/settings/SettingsDeleteAccountModal'
import SettingsEditEmailModal from '@/components/settings/SettingsEditEmailModal'
import SettingsProfileTab from '@/components/settings/SettingsProfileTab'
import SettingsTabBar from '@/components/settings/SettingsTabBar'
import { isValidEmail } from '@/utils/isValidEmail'
import { validatePassword } from '@/utils/validatePassword'

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
  const uid = user?.uid
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
  const [showEditDescription, setShowEditDescription] = useState(false)
  const [usernameDraft, setUsernameDraft] = useState('')
  const [usernameTyped, setUsernameTyped] = useState(false)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [rtdbAvatarUrl, setRtdbAvatarUrl] = useState(null)
  const [rtdbDescription, setRtdbDescription] = useState('')
  const [descriptionDraft, setDescriptionDraft] = useState('')
  const [descriptionSaving, setDescriptionSaving] = useState(false)

  const openEditEmailModal = () => {
    setNewEmail('')
    setPassword('')
    setEmailError('')
    setPasswordError('')
    setNewEmailTyped(false)
    setPasswordTyped(false)
    setEmailEditStep('form')
    setShowEditEmail(true)
  }

  const openChangePasswordModal = () => {
    setCpCurrent('')
    setCpNew('')
    setCpConfirm('')
    setCpErrors({})
    setLogoutOtherApps(false)
    setShowChangePassword(true)
  }

  useEffect(() => {
    try {
      const cu = auth.currentUser
      const google = !!(cu && cu.providerData && cu.providerData.some((p) => p.providerId === 'google.com'))
      setIsGoogleAccount(google)
    } catch (e) {
      setIsGoogleAccount(false)
    }
  }, [])

  // Load RTDB public avatarUrl (fall back to Auth photoURL)
  useEffect(() => {
    let mounted = true
    if (!uid) {
      setRtdbAvatarUrl(null)
      setRtdbDescription('')
      return
    }
    ;(async () => {
      try {
        const rec = await getUserRecord(uid)
        if (!mounted) return
        setRtdbAvatarUrl(rec && rec.public && rec.public.avatarUrl ? rec.public.avatarUrl : null)
        const description =
          typeof rec?.public?.bio === 'string'
            ? rec.public.bio
            : typeof rec?.public?.headline === 'string'
              ? rec.public.headline
              : ''
        setRtdbDescription(description)
        // populate banner URL into local auth user state so UI can read it
        if (rec && rec.public && rec.public.bannerUrl) {
          try {
            setUser((prev) => {
              if (!prev) return prev
              if (prev.bannerURL === rec.public.bannerUrl) return prev
              return { ...prev, bannerURL: rec.public.bannerUrl }
            })
          } catch (e) {}
        }
      } catch (e) {
        console.error('Failed to load RTDB user record for avatar', e)
      }
    })()
    return () => {
      mounted = false
    }
  }, [uid, setUser])

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
    const passwordErr = password
      ? validatePassword(password)
      : 'Please use at least 8 characters (you are currently using 0 characters).'
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
      try {
        setUser((prev) => (prev ? { ...prev, email: emailTrim } : prev))
      } catch (e) {}
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
      setCpErrors((prev) => ({ ...prev, general: e?.message || 'Failed to update password' }))
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
      try {
        await signOut(auth)
      } catch (e) {}
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
    const name = (value || '')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .slice(0, 60)
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
    if (!usernameTyped) {
      setUsernameError('')
      setUsernameChecking(false)
      return
    }
    if (!usernameDraft) {
      setUsernameError('')
      setUsernameChecking(false)
      return
    }
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
    return () => {
      mounted = false
      clearTimeout(handler)
    }
  }, [usernameDraft, usernameTyped])
  const canSaveUsername = Boolean(usernameDraft && usernameDraft.trim() && !validateUsername(usernameDraft) && !usernameChecking)

  return (
    <div data-layer="Post detail page" className="PostDetailPage w-full min-h-screen relative bg-white overflow-hidden">
      <Header />
      <div className="max-w-[1440px] mx-auto w-full relative mt-[-72px]">
        <SettingsTabBar activeTab={activeTab} onTabChange={handleTabChange} />

        {activeTab === 'account' && (
          <SettingsAccountTab
            email={(user && user.email) || ''}
            isGoogleAccount={isGoogleAccount}
            onOpenEditEmail={openEditEmailModal}
            onOpenChangePassword={openChangePasswordModal}
            onOpenDeleteAccount={() => setShowDeleteAccount(true)}
          />
        )}

        <SettingsEditEmailModal
          showEditEmail={showEditEmail}
          setShowEditEmail={setShowEditEmail}
          emailEditStep={emailEditStep}
          setEmailEditStep={setEmailEditStep}
          newEmail={newEmail}
          setNewEmail={setNewEmail}
          password={password}
          setPassword={setPassword}
          emailError={emailError}
          setEmailError={setEmailError}
          passwordError={passwordError}
          setPasswordError={setPasswordError}
          setNewEmailTyped={setNewEmailTyped}
          setPasswordTyped={setPasswordTyped}
          canSaveVisual={canSaveVisual}
          handleSave={handleSave}
          saving={saving}
        />

        <SettingsChangePasswordModal
          showChangePassword={showChangePassword}
          setShowChangePassword={setShowChangePassword}
          cpErrors={cpErrors}
          setCpErrors={setCpErrors}
          cpCurrent={cpCurrent}
          setCpCurrent={setCpCurrent}
          cpNew={cpNew}
          setCpNew={setCpNew}
          cpConfirm={cpConfirm}
          setCpConfirm={setCpConfirm}
          logoutOtherApps={logoutOtherApps}
          setLogoutOtherApps={setLogoutOtherApps}
          cpNewMasked={cpNewMasked}
          cpConfirmMasked={cpConfirmMasked}
          cpCurrentMasked={cpCurrentMasked}
          validationErrors={validationErrors}
          cpHasTyped={cpHasTyped}
          cpSaving={cpSaving}
          handleSavePassword={handleSavePassword}
        />

        <SettingsDeleteAccountModal
          showDeleteAccount={showDeleteAccount}
          setShowDeleteAccount={setShowDeleteAccount}
          deletePassword={deletePassword}
          setDeletePassword={setDeletePassword}
          deleteReason={deleteReason}
          setDeleteReason={setDeleteReason}
          deletePasswordError={deletePasswordError}
          setDeletePasswordError={setDeletePasswordError}
          deleteSaving={deleteSaving}
          handleDeleteAccount={handleDeleteAccount}
          validatePassword={validatePassword}
        />

        <Toast show={showToast} message={toastMessage} onClose={() => setShowToast(false)} />

        {activeTab === 'profile' && (
          <SettingsProfileTab
            user={user}
            setUser={setUser}
            rtdbAvatarUrl={rtdbAvatarUrl}
            rtdbDescription={rtdbDescription}
            setRtdbDescription={setRtdbDescription}
            setToastMessage={setToastMessage}
            setShowToast={setShowToast}
            showEditBanner={showEditBanner}
            setShowEditBanner={setShowEditBanner}
            showEditUsername={showEditUsername}
            setShowEditUsername={setShowEditUsername}
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
            showEditDescription={showEditDescription}
            setShowEditDescription={setShowEditDescription}
            descriptionDraft={descriptionDraft}
            setDescriptionDraft={setDescriptionDraft}
            descriptionSaving={descriptionSaving}
            setDescriptionSaving={setDescriptionSaving}
          />
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

SettingsPage.getLayout = (page) => <ProtectedRoute>{page}</ProtectedRoute>
