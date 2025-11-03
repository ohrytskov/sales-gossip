import { useState, useEffect } from 'react'
import { rtdb, auth } from '@/firebase/config'
import { ref, get } from 'firebase/database'
import { onAuthStateChanged } from 'firebase/auth'
import { syncUsersToPosts } from '@/firebase/rtdb/syncUsersToPosts'
import { syncUsersToComments } from '@/firebase/rtdb/syncUsersToComments'

export default function RtdbRoot() {
  const [roots, setRoots] = useState([])

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
    </div>
  )
}
