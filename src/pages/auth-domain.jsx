import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Header from '@/components/Header'
import FloatingInput from '@/components/FloatingInput'
import { useAuth } from '@/hooks/useAuth'
import { auth } from '@/firebase/config'
import { getUser } from '@/firebase/rtdb/users'

const FUNCTIONS_BASE = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_BASE || 'https://us-central1-coldcall-48def.cloudfunctions.net/api'
const FUNCTIONS_PATH = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_PATH || '/authDomain'

const AuthDomainPage = () => {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [domain, setDomain] = useState('corpgossip.com')
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [authorizedDomains, setAuthorizedDomains] = useState([])

  useEffect(() => {
    const verifyAdmin = async () => {
      if (authLoading) return
      if (!user) {
        router.push('/login')
        setChecking(false)
        return
      }

      try {
        const userRecord = await getUser(user.uid)
        const role = userRecord?.meta?.role || 'user'
        if (role !== 'admin') {
          router.push('/')
          setChecking(false)
          return
        }
      } catch (err) {
        setError('Unable to verify admin access')
        setChecking(false)
        return
      }

      setIsAdmin(true)
      setChecking(false)
    }

    verifyAdmin()
  }, [user, authLoading, router])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setStatus('')
    setSubmitting(true)
    const sanitizedDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*/, '')
    console.log('[auth-domain] submitting', { domain: sanitizedDomain })
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken(true) : null
      if (!token) throw new Error('Please sign in to continue')

      if (!sanitizedDomain) throw new Error('Domain is required')

      const url = `${FUNCTIONS_BASE}${FUNCTIONS_PATH}`
      console.log('[auth-domain] calling functions', { url })

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ domain: sanitizedDomain })
      })

      const data = await res.json()
      console.log('[auth-domain] response', data)
      if (!res.ok) throw new Error(data?.error || 'Unable to update auth domain')

      setAuthorizedDomains(data?.authorizedDomains || [])
      setStatus(data?.updated ? 'Domain added to Firebase Authentication.' : data?.message || 'Domain already authorized.')
    } catch (err) {
      console.error('[auth-domain] failed', err)
      setError(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
        Checking access...
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
        {error || 'Redirecting...'}
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Auth domain | Sales Gossip</title>
      </Head>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Firebase auth domain</h1>
          <p className="text-sm text-slate-600 mt-2">Add a custom domain so the Google auth modal shows corpgossip.com instead of the firebaseapp domain.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <FloatingInput
            id="auth-domain"
            label="Custom domain"
            value={domain}
            onChange={setDomain}
            className="w-full"
            inputProps={{
              placeholder: 'corpgossip.com',
              required: true,
              className: 'text-sm'
            }}
          />

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-pink-700 text-white rounded-full text-sm font-semibold disabled:opacity-60"
            >
              {submitting ? 'Updating...' : 'Add domain to Firebase Auth'}
            </button>
            <p className="text-xs text-slate-500">Requires an admin account and server credentials for Firebase Admin SDK.</p>
          </div>

          {status && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              {status}
              {!!authorizedDomains.length && (
                <div className="mt-2 text-xs text-slate-600">
                  Authorized domains: {authorizedDomains.join(', ')}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </div>
          )}
        </form>

        <div className="mt-8 text-xs text-slate-500 leading-relaxed">
          <p>We call the Identity Toolkit API with the Firebase Admin service account. Make sure the server has <code>FIREBASE_SERVICE_ACCOUNT</code> or application default credentials set.</p>
          <p className="mt-2">If the domain is already authorized, the request will return without changes.</p>
        </div>
      </main>
    </>
  )
}

export default AuthDomainPage
