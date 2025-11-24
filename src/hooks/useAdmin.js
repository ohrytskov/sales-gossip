import { useState, useEffect } from 'react'
import { rtdb } from '@/firebase/config'
import { ref, get, update } from 'firebase/database'
import { resetPassword, resetEmail } from '@/firebase/adminApi'

// Helper function to sort users by last login in descending order
const sortUsersByLastLogin = (users) => {
  return [...users].sort((a, b) => {
    const aLogin = a.meta?.lastLoginAt || 0
    const bLogin = b.meta?.lastLoginAt || 0
    return bLogin - aLogin // Descending order (most recent first)
  })
}

export const useAdmin = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch all users from RTDB
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const usersRef = ref(rtdb, 'users')
      const snapshot = await get(usersRef)
      if (snapshot.exists()) {
        const usersData = snapshot.val()
        const usersList = Object.entries(usersData).map(([uid, userData]) => ({
          uid,
          authUid: uid,
          ...userData,
          public: userData.public || {},
          following: userData.following || {}
        }))

        // Sort users by last login in descending order (most recent first)
        const sortedUsers = sortUsersByLastLogin(usersList)
        setUsers(sortedUsers)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  // Ban or unban a user
  const toggleUserBan = async (uid, isBanned) => {
    try {
      const userRef = ref(rtdb, `users/${uid}/public`)
      await update(userRef, { isBanned })

      // Update local state and re-sort
      setUsers(prev => sortUsersByLastLogin(prev.map(user =>
        user.uid === uid
          ? { ...user, public: { ...user.public, isBanned } }
          : user
      )))

      return { success: true }
    } catch (err) {
      console.error(`Error ${isBanned ? 'banning' : 'unbanning'} user:`, err)
      throw new Error(`Failed to ${isBanned ? 'ban' : 'unban'} user`)
    }
  }

  // Reset user password
  const resetUserPassword = async (uid, newPassword) => {
    try {
      const authUid = uid
      await resetPassword(authUid, newPassword)
      return { success: true }
    } catch (err) {
      console.error('Error resetting password:', err)
      throw err
    }
  }

  // Reset user email
  const resetUserEmail = async (uid, newEmail) => {
    try {
      await resetEmail(uid, newEmail)

      // Update RTDB with new email
      const userRef = ref(rtdb, `users/${uid}/private`)
      await update(userRef, { email: newEmail })

      // Update local state
      setUsers(prev => sortUsersByLastLogin(prev.map(user =>
        user.uid === uid
          ? { ...user, private: { ...user.private, email: newEmail } }
          : user
      )))

      return { success: true }
    } catch (err) {
      console.error('Error resetting email:', err)
      throw err
    }
  }

  // Update user role
  const updateUserRole = async (uid, newRole) => {
    try {
      const userRef = ref(rtdb, `users/${uid}/meta`)
      await update(userRef, { role: newRole })

      // Update local state and re-sort
      setUsers(prev => sortUsersByLastLogin(prev.map(user =>
        user.uid === uid
          ? { ...user, meta: { ...user.meta, role: newRole } }
          : user
      )))

      return { success: true }
    } catch (err) {
      console.error('Error updating user role:', err)
      throw new Error('Failed to update user role')
    }
  }

  // Refresh users list
  const refreshUsers = () => {
    fetchUsers()
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    error,
    fetchUsers,
    toggleUserBan,
    resetUserPassword,
    resetUserEmail,
    updateUserRole,
    refreshUsers
  }
}