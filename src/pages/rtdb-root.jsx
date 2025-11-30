import { useState, useEffect } from 'react'
import { rtdb, auth } from '@/firebase/config'
import { ref, get } from 'firebase/database'
import { onAuthStateChanged } from 'firebase/auth'
import { syncUsersToPosts } from '@/firebase/rtdb/syncUsersToPosts'
import { syncUsersToComments } from '@/firebase/rtdb/syncUsersToComments'
import { syncUserMetadata } from '@/firebase/rtdb/syncUserMetadata'
import { syncUserPrivateData } from '@/firebase/rtdb/syncUserPrivateData'
import { syncUserStats } from '@/firebase/rtdb/syncUserStats'
import { recalculateFollowersCount } from '@/firebase/rtdb/users'

export default function RtdbRoot() {
  const [roots, setRoots] = useState([])
  const [isRecalculating, setIsRecalculating] = useState(false)
  const [isSyncingStats, setIsSyncingStats] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        async function fetchRoots() {
          const snapshot = await get(ref(rtdb, '/'))
          if (snapshot.exists()) {
            setRoots(Object.keys(snapshot.val()))
          }
        }
        fetchRoots()
      }
    })
    return unsubscribe
  }, [])

  async function handleClick(key) {
    const snapshot = await get(ref(rtdb, `/${key}`))
    console.log(snapshot.val())
  }

  async function handleRecalculateFollowers() {
    setIsRecalculating(true)
    try {
      await recalculateFollowersCount()
      console.log('Follower counts recalculated')
    } catch (error) {
      console.error('Failed to recalculate followers count', error)
    } finally {
      setIsRecalculating(false)
    }
  }

  async function handleSyncUserStats() {
    setIsSyncingStats(true)
    try {
      const updates = await syncUserStats()
      console.log('syncUserStats completed', updates)
    } catch (error) {
      console.error('Failed to sync user stats', error)
    } finally {
      setIsSyncingStats(false)
    }
  }


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">RTDB Root Nodes</h1>
      <ul className="space-y-2 mb-6">
        {roots.map(key => (
          <li key={key}>
            <button
              onClick={() => handleClick(key)}
              className="px-3 py-1 bg-white border rounded hover:bg-gray-100"
            >
              {key}
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() => syncUsersToPosts()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Sync users → posts
      </button>
      <button
        onClick={() => syncUsersToComments()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Sync users → comments
      </button>
      <button
        onClick={() => syncUserMetadata()}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Sync user metadata
      </button>
      <button
        onClick={() => syncUserPrivateData()}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Sync user private data
      </button>
      <button
        onClick={handleSyncUserStats}
        disabled={isSyncingStats}
        className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSyncingStats ? 'Syncing user stats...' : 'Sync user stats'}
      </button>
      <button
        onClick={handleRecalculateFollowers}
        disabled={isRecalculating}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRecalculating ? 'Recalculating...' : 'Recalculate follower counts'}
      </button>
    </div>
  )
}
