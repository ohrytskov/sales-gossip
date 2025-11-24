import { useEffect, useState, useRef } from 'react'
import Head from 'next/head'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/router'
import { useAdmin } from '@/hooks/useAdmin'
import { getUser } from '@/firebase/rtdb/users'
import _get from 'lodash.get'
import FloatingInput from '@/components/FloatingInput'
import Header from '@/components/Header'
import Toast from '@/components/Toast'

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(parseInt(timestamp))
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

const validatePassword = (value) => {
  if (!value) return ''
  if (value.length < 8) return `Please use at least 8 characters (you are currently using ${value.length} characters).`
  return ''
}

const AdminPage = () => {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { users, loading: adminLoading, error: adminError, toggleUserBan, resetUserPassword, resetUserEmail, updateUserRole, refreshUsers } = useAdmin()

  const [windowSize, setWindowSize] = useState({ width: 1024, height: 768 })
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false)
  const [isEmailResetModalOpen, setIsEmailResetModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [passwordTouched, setPasswordTouched] = useState({ new: false, confirm: false })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [performingAdminAction, setPerformingAdminAction] = useState(false)

  // Refs for outside click detection
  const dropdownRef = useRef(null)
  const passwordModalRef = useRef(null)
  const emailModalRef = useRef(null)
  const adminCheckRef = useRef(false)

  // Check if user is admin and handle redirects
  useEffect(() => {
    // Prevent multiple runs
    if (adminCheckRef.current) {
      return
    }

    const checkAdminStatus = async () => {
      // If still loading auth, wait
      if (authLoading) {
        return
      }

      adminCheckRef.current = true

      try {
        setCheckingAdmin(true)

        // If no user after auth loads, redirect to login (but not during admin actions)
        if (!user && !performingAdminAction) {
          setCheckingAdmin(false)
          router.push('/login')
          return
        }

        const userData = await getUser(user.uid)

        if (!userData) {
          console.log('No user data found in RTDB')
          setIsAdmin(false)
          setCheckingAdmin(false)
          router.push('/')
          setToastMessage('User data not found.')
          setShowToast(true)
          return
        }

        const userRole = _get(userData, 'meta.role', 'user')
        const isUserAdmin = userRole === 'admin'

        console.log('Admin check result:', { userRole, isUserAdmin, userId: user.uid })

        setIsAdmin(isUserAdmin)
        setCheckingAdmin(false)

        if (!isUserAdmin && !performingAdminAction) {
          router.push('/')
          setToastMessage('Access denied. Admin privileges required.')
          setShowToast(true)
        }
        // If user is admin, stay on page

      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
        setCheckingAdmin(false)
        if (!performingAdminAction) {
          router.push('/')
          setToastMessage('Error checking admin status.')
          setShowToast(true)
        }
      }
    }

    checkAdminStatus()
  }, [user, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth
      const newHeight = window.innerHeight
      setWindowSize({ width: newWidth, height: newHeight })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])


  // Handle admin errors
  useEffect(() => {
    if (adminError) {
      setToastMessage(adminError)
      setShowToast(true)
    }
  }, [adminError])

  // Password validation
  useEffect(() => {
    const validationErrors = {
      new: '',
      confirm: '',
    }

    if (passwordTouched.new && newPassword && newPassword.length > 0) {
      const err = validatePassword(newPassword)
      if (err) validationErrors.new = err
    }

    if (passwordTouched.confirm && confirmPassword && newPassword !== confirmPassword) {
      validationErrors.confirm = 'Passwords do not match'
    }

    setPasswordErrors(validationErrors)
  }, [newPassword, confirmPassword, passwordTouched])

  // Handle outside clicks for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  // Handle outside clicks for modals
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (passwordModalRef.current && !passwordModalRef.current.contains(event.target)) {
        setIsPasswordResetModalOpen(false)
        setNewPassword('')
        setConfirmPassword('')
        setSelectedUser(null)
        setPasswordTouched({ new: false, confirm: false })
        setPasswordErrors({})
      }
      if (emailModalRef.current && !emailModalRef.current.contains(event.target)) {
        setIsEmailResetModalOpen(false)
        setNewEmail('')
        setSelectedUser(null)
      }
    }

    if (isPasswordResetModalOpen || isEmailResetModalOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isPasswordResetModalOpen, isEmailResetModalOpen])

  const toggleDropdown = (userId) => {
    setDropdownOpen(dropdownOpen === userId ? null : userId)
  }

  const handleMenuAction = async (action, userData) => {
    console.log({ action, userData })
    setDropdownOpen(null)
    setSelectedUser(userData)

    if (action === 'reset_password') {
      setIsPasswordResetModalOpen(true)
    } else if (action === 'reset_email') {
      setNewEmail(userData.private?.email || '')
      setIsEmailResetModalOpen(true)
    } else if (action === 'promote_admin') {
      await handleRoleChange(userData.uid, 'admin')
    } else if (action === 'demote_admin') {
      await handleRoleChange(userData.uid, 'user')
    } else if (action === 'ban_user') {
      await handleBanUser(userData.uid, true)
    } else if (action === 'unban_user') {
      await handleBanUser(userData.uid, false)
    }
  }

  const handlePasswordResetClick = (userData, provider) => {
    if (provider !== 'password') {
      setDropdownOpen(null)
      setToastMessage('Password reset is only available for email/password sign-in users')
      setShowToast(true)
      return
    }

    handleMenuAction('reset_password', userData)
  }

  const handleBanUser = async (uid, isBanned) => {
    try {
      setActionLoading(true)
      setPerformingAdminAction(true)
      await toggleUserBan(uid, isBanned)
      setToastMessage(`User ${isBanned ? 'banned' : 'unbanned'} successfully`)
      setShowToast(true)
    } catch (error) {
      console.error(`Error ${isBanned ? 'banning' : 'unbanning'} user:`, error)
      setToastMessage(`Error ${isBanned ? 'banning' : 'unbanning'} user`)
      setShowToast(true)
    } finally {
      setActionLoading(false)
      setPerformingAdminAction(false)
    }
  }

  const handleRoleChange = async (uid, newRole) => {
    try {
      setActionLoading(true)
      setPerformingAdminAction(true)
      await updateUserRole(uid, newRole)
      setToastMessage(`User ${newRole === 'admin' ? 'promoted to admin' : 'demoted from admin'} successfully`)
      setShowToast(true)
    } catch (error) {
      console.error(`Error updating user role:`, error)
      setToastMessage(`Error updating user role`)
      setShowToast(true)
    } finally {
      setActionLoading(false)
      setPerformingAdminAction(false)
    }
  }

  const handlePasswordResetSave = async () => {
    // Clear any server-side errors
    setPasswordErrors({})

    // Mark fields as touched to reveal client-side validation
    setPasswordTouched({ new: true, confirm: true })

    // Basic client validation
    if (!newPassword) {
      return
    }
    const newErr = validatePassword(newPassword)
    if (newErr) {
      return
    }
    if (!confirmPassword) {
      return
    }
    if (newPassword !== confirmPassword) {
      return
    }

    const targetUid =
      _get(selectedUser, 'authUid') ||
      _get(selectedUser, 'uid') ||
      _get(selectedUser, 'id') ||
      _get(selectedUser, 'private.uid') ||
      _get(selectedUser, 'public.uid')

    if (!targetUid) {
      setToastMessage('Unable to reset password: missing user identifier')
      setShowToast(true)
      return
    }

    try {
      setActionLoading(true)
      setPerformingAdminAction(true)
      await resetUserPassword(targetUid, newPassword)
      setIsPasswordResetModalOpen(false)
      setNewPassword('')
      setConfirmPassword('')
      setSelectedUser(null)
      setPasswordTouched({ new: false, confirm: false })
      setToastMessage('Password reset successfully')
      setShowToast(true)
    } catch (error) {
      console.error('Error resetting password:', error)
      setToastMessage(error?.message || 'Error resetting password')
      setShowToast(true)
    } finally {
      setActionLoading(false)
      setPerformingAdminAction(false)
    }
  }

  const handleEmailResetSave = async () => {
    if (!selectedUser || !newEmail) return

    const targetUid =
      _get(selectedUser, 'authUid') ||
      _get(selectedUser, 'uid') ||
      _get(selectedUser, 'id') ||
      _get(selectedUser, 'private.uid') ||
      _get(selectedUser, 'public.uid')

    if (!targetUid) {
      setToastMessage('Unable to reset email: missing user identifier')
      setShowToast(true)
      return
    }

    const isResettingOwnEmail = targetUid === user?.uid

    try {
      setActionLoading(true)
      setPerformingAdminAction(true)
      await resetUserEmail(targetUid, newEmail)
      setIsEmailResetModalOpen(false)
      setNewEmail('')
      setSelectedUser(null)

      if (isResettingOwnEmail) {
        setToastMessage('Your email has been reset. You may need to sign in again with the new email.')
      } else {
        setToastMessage('Email reset successfully')
      }
      setShowToast(true)

      // Refresh the users list to show updated email
      refreshUsers()
    } catch (error) {
      console.error('Error resetting email:', error)
      setToastMessage(error?.message || 'Error resetting email')
      setShowToast(true)
    } finally {
      setActionLoading(false)
      setPerformingAdminAction(false)
    }
  }

  if (authLoading || adminLoading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-700 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Head>
        <title>Admin - Sales Gossip</title>
      </Head>

      <div className="relative">
        <Header />

        <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Internal Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Manage users and their accounts</p>
            </div>

            <div className="overflow-x-auto overflow-y-visible">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Followers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login ↓
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userData) => {
                    const isBanned = _get(userData, 'public.isBanned', false)
                    const role = _get(userData, 'meta.role', 'user')
                    const provider = _get(userData, 'meta.provider', 'unknown')
                    const username = _get(userData, 'public.username', 'N/A')
                    const avatarSrc =
                      userData?.public?.avatar ||
                      userData?.public?.avatarUrl ||
                      userData?.photoURL ||
                      '/images/feed/avatar1.svg'
                    return (
                      <tr key={userData.uid} className={isBanned ? 'opacity-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className="flex items-center gap-3 text-sm font-medium text-gray-900"
                          >
                            <img
                              src={avatarSrc}
                              alt={`${username} avatar`}
                              className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                            />
                            <span>{username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {_get(userData, 'private.email', 'N/A')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 capitalize">
                            {provider}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {_get(userData, 'public.followersCount', 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : isBanned
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {role === 'admin' ? 'Admin' : isBanned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(_get(userData, 'meta.lastLoginAt'))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative inline-flex justify-end">
                            <button
                              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                              onClick={() => toggleDropdown(userData.uid)}
                              disabled={actionLoading}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="2" fill="currentColor"/>
                                <circle cx="12" cy="5" r="2" fill="currentColor"/>
                                <circle cx="12" cy="19" r="2" fill="currentColor"/>
                              </svg>
                            </button>
                            {dropdownOpen === userData.uid && (
                              <div ref={dropdownRef} className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                <div className="py-1 flex flex-col">
                                  <button
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                                      provider === 'password' ? 'text-gray-700' : 'text-gray-400'
                                    }`}
                                    onClick={() => handlePasswordResetClick(userData, provider)}
                                  >
                                    Reset Password {provider !== 'password' && '(N/A)'}
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => handleMenuAction('reset_email', userData)}
                                  >
                                    Reset Email
                                  </button>
                                  {role !== 'admin' && (
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-gray-100"
                                      onClick={() => handleMenuAction('promote_admin', userData)}
                                    >
                                      Promote to Admin
                                    </button>
                                  )}
                                  {role === 'admin' && (
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-gray-100"
                                      onClick={() => handleMenuAction('demote_admin', userData)}
                                    >
                                      Demote from Admin
                                    </button>
                                  )}
                                  <button
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                                      isBanned ? 'text-green-700' : 'text-red-700'
                                    }`}
                                    onClick={() => handleMenuAction(isBanned ? 'unban_user' : 'ban_user', userData)}
                                  >
                                    {isBanned ? 'Unban User' : 'Ban User'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Password Reset Modal */}
      {isPasswordResetModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div ref={passwordModalRef} className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Reset Password for {selectedUser.public?.username}
            </h3>
            <div className="space-y-4">
              <FloatingInput
                id="admin-new-password"
                type="password"
                label="New password*"
                value={newPassword}
                onChange={(v) => {
                  setNewPassword(v)
                  setPasswordTouched(prev => ({ ...prev, new: true }))
                }}
                className="w-full"
                inputProps={{ autoComplete: 'off', name: 'admin-new-password' }}
                error={Boolean(passwordErrors.new)}
                helperText={passwordErrors.new}
              />
              <FloatingInput
                id="admin-confirm-password"
                type="password"
                label="Confirm new password*"
                value={confirmPassword}
                onChange={(v) => {
                  setConfirmPassword(v)
                  setPasswordTouched(prev => ({ ...prev, confirm: true }))
                }}
                className="w-full"
                inputProps={{ autoComplete: 'off', name: 'admin-confirm-password' }}
                error={Boolean(passwordErrors.confirm)}
                helperText={passwordErrors.confirm}
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                onClick={() => {
                  setIsPasswordResetModalOpen(false)
                  setNewPassword('')
                  setConfirmPassword('')
                  setSelectedUser(null)
                  setPasswordTouched({ new: false, confirm: false })
                  setPasswordErrors({})
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-pink-600 border border-transparent rounded-md hover:bg-pink-700 disabled:opacity-50"
                onClick={handlePasswordResetSave}
                disabled={!newPassword || !confirmPassword || actionLoading || Object.values(passwordErrors).some(err => err)}
              >
                {actionLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Reset Modal */}
      {isEmailResetModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div ref={emailModalRef} className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Reset Email for {selectedUser.public?.username}
            </h3>
            <div className="space-y-4">
              <FloatingInput
                id="admin-new-email"
                type="email"
                label="New email*"
                value={newEmail}
                onChange={(v) => setNewEmail(v)}
                className="w-full"
                inputProps={{ autoComplete: 'off', name: 'admin-new-email' }}
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                onClick={() => {
                  setIsEmailResetModalOpen(false)
                  setNewEmail('')
                  setSelectedUser(null)
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-pink-600 border border-transparent rounded-md hover:bg-pink-700 disabled:opacity-50"
                onClick={handleEmailResetSave}
                disabled={!newEmail || actionLoading}
              >
                {actionLoading ? 'Resetting...' : 'Reset Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast show={showToast} message={toastMessage} onClose={() => setShowToast(false)} />
    </>
  )
}

export default AdminPage
