import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { useGlobal } from './useGlobal'
import { getFollowing, addFollowPerson, removeFollowPerson, getUser } from '@/firebase/rtdb/users'

export function useFollow() {
  const { user } = useAuth()
  const { showToast } = useGlobal()
  const [followingPeople, setFollowingPeople] = useState([])
  const [loadingFollowState, setLoadingFollowState] = useState(null)

  // Load current user's following list on mount
  useEffect(() => {
    const loadFollowing = async () => {
      if (!user?.uid) return
      try {
        const following = await getFollowing(user.uid)
        setFollowingPeople(following?.people ?? [])
      } catch (err) {
        console.error('Error loading following list:', err)
      }
    }
    loadFollowing()
  }, [user?.uid])

  const handleFollow = async (targetUid) => {
    if (!user?.uid) {
      console.warn('User not logged in')
      return false
    }
    if (loadingFollowState === targetUid) return false

    // Check if user is banned
    try {
      const userData = await getUser(user.uid)
      if (userData?.public?.isBanned) {
        showToast('Your account has been banned and you cannot follow users.')
        return false
      }
    } catch (error) {
      console.error('Error checking user ban status:', error)
      showToast('Error checking account status. Please try again.')
      return false
    }

    try {
      setLoadingFollowState(targetUid)
      await addFollowPerson(user.uid, targetUid)
      setFollowingPeople((prev) => {
        if (prev.includes(targetUid)) return prev
        return [...prev, targetUid]
      })
      return true
    } catch (err) {
      console.error('Error following user:', err)
      return false
    } finally {
      setLoadingFollowState(null)
    }
  }

  const handleUnfollow = async (targetUid) => {
    if (!user?.uid) {
      console.warn('User not logged in')
      return false
    }
    if (loadingFollowState === targetUid) return false

    // Check if user is banned
    try {
      const userData = await getUser(user.uid)
      if (userData?.public?.isBanned) {
        showToast('Your account has been banned and you cannot unfollow users.')
        return false
      }
    } catch (error) {
      console.error('Error checking user ban status:', error)
      showToast('Error checking account status. Please try again.')
      return false
    }

    try {
      setLoadingFollowState(targetUid)
      await removeFollowPerson(user.uid, targetUid)
      setFollowingPeople((prev) => prev.filter((uid) => uid !== targetUid))
      return true
    } catch (err) {
      console.error('Error unfollowing user:', err)
      return false
    } finally {
      setLoadingFollowState(null)
    }
  }

  const toggleFollow = async (targetUid) => {
    if (!user?.uid) {
      console.warn('User not logged in - cannot follow/unfollow')
      return false
    }
    if (!targetUid) {
      console.warn('Missing target uid - cannot follow/unfollow')
      return false
    }
    if (loadingFollowState === targetUid) return false
    if (followingPeople.includes(targetUid)) {
      return await handleUnfollow(targetUid)
    } else {
      return await handleFollow(targetUid)
    }
  }

  const isFollowing = (targetUid) => followingPeople.includes(targetUid)
  const isLoadingFollow = (targetUid) => loadingFollowState === targetUid

  return {
    followingPeople,
    toggleFollow,
    isFollowing,
    isLoadingFollow,
    handleFollow,
    handleUnfollow
  }
}