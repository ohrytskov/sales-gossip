import { useEffect, useState } from 'react'
import { updateProfile } from 'firebase/auth'
import { useRouter } from 'next/router'

import FloatingInput from '@/components/FloatingInput'
import Header from '@/components/Header'
import { useAuth } from '@/hooks/useAuth'
import { auth } from '@/firebase/config'
import { getUser, updateUserPublic } from '@/firebase/rtdb/users'
import { checkUsernameUnique, saveUsername } from '@/firebase/rtdb/usernames'
import { sanitize } from '@/firebase/rtdb/helpers'
import getRandomUsername from '@/utils/getRandomUsername'

const generateSuggestedUsername = () => {
  try {
    const suggestion = sanitize(getRandomUsername()).slice(0, 30)
    return suggestion.length >= 3 ? suggestion : `_${Math.random().toString(36).slice(2, 8)}`
  } catch (_) {
    return `_${Math.random().toString(36).slice(2, 8)}`
  }
}

const validateUsername = (value) => {
  if (!value) return 'Username is required'
  if (value.length < 3) return 'Username must be at least 3 characters'
  if (value.length > 30) return 'Username must be at most 30 characters'
  if (!/^[A-Za-z0-9_]+$/.test(value)) return 'Only letters, numbers and _ are allowed'
  return ''
}

export default function ChooseUsernamePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [username, setUsername] = useState('')
  const [existingUsernameKey, setExistingUsernameKey] = useState('')
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [saving, setSaving] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized || loading) return
    if (!user?.uid) {
      router.replace('/login')
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        const rec = await getUser(user.uid)
        if (cancelled) return

        const current =
          (rec?.public?.nickname || rec?.public?.username || user.displayName || '').trim()
        const next = current || generateSuggestedUsername()
        setUsername(next)
        setExistingUsernameKey(sanitize(current))
        setInitialized(true)
      } catch (e) {
        if (cancelled) return
        const next = (user.displayName || '').trim() || generateSuggestedUsername()
        setUsername(next)
        setExistingUsernameKey(sanitize(user.displayName || ''))
        setInitialized(true)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [initialized, loading, router, user?.displayName, user?.uid])

  useEffect(() => {
    let mounted = true

    if (!username) {
      setUsernameError('')
      setUsernameChecking(false)
      return
    }

    setUsernameChecking(true)
    const handler = setTimeout(async () => {
      if (!mounted) return
      setSubmitError('')

      const trimmed = username.trim()
      const basicErr = validateUsername(trimmed)
      if (basicErr) {
        setUsernameError(basicErr)
        setUsernameChecking(false)
        return
      }

      const key = sanitize(trimmed)
      if (existingUsernameKey && key === existingUsernameKey) {
        setUsernameError('')
        setUsernameChecking(false)
        return
      }

      const ok = await checkUsernameUnique(trimmed)
      if (!mounted) return

      if (ok === true) setUsernameError('')
      else if (ok === false) setUsernameError('This username is already taken')
      else setUsernameError('Unable to verify username availability')

      setUsernameChecking(false)
    }, 400)

    return () => {
      mounted = false
      clearTimeout(handler)
    }
  }, [existingUsernameKey, username])

  const handleSubmit = async () => {
    if (!user?.uid || saving) return
    setSubmitError('')

    const trimmed = username.trim()
    const basicErr = validateUsername(trimmed)
    if (basicErr) {
      setUsernameError(basicErr)
      return
    }

    const key = sanitize(trimmed)
    if (existingUsernameKey && key !== existingUsernameKey) {
      const unique = await checkUsernameUnique(trimmed)
      if (unique === false) {
        setUsernameError('This username is already taken')
        return
      }
      if (unique === null) {
        setUsernameError('Unable to verify username availability. Please try again.')
        return
      }
    }

    setSaving(true)
    try {
      const rec = await getUser(user.uid)
      const oldUsername = rec?.public?.nickname || rec?.public?.username || null

      await saveUsername(user.uid, trimmed, oldUsername)
      await updateUserPublic(user.uid, {
        displayName: trimmed,
        nickname: trimmed,
      })

      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, { displayName: trimmed })
        } catch (_) {}
      }

      router.push('/')
    } catch (e) {
      console.error('Failed to save username', e)
      setSubmitError('Failed to save username. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <Header />
        <main className="mx-auto flex w-full max-w-[1440px] flex-col items-center px-[142px] pb-24 pt-[50px]">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-700"></div>
          </div>
        </main>
      </div>
    )
  }

  const trimmed = username.trim()
  const canContinue =
    Boolean(user?.uid) &&
    Boolean(trimmed) &&
    !validateUsername(trimmed) &&
    !usernameChecking &&
    !usernameError &&
    !saving

  return (
    <div className="bg-white min-h-screen">
      <Header />

      <main className="mx-auto flex w-full max-w-[1440px] flex-col items-center px-[142px] pb-24 pt-[50px]">
        <section className="w-full max-w-xl rounded-2xl border border-[#e8e8eb] bg-white p-8">
          <h1 className="text-2xl font-semibold text-[#10112a]">Choose an anonymous username</h1>
          <p className="mt-3 text-base text-[#454662]">
            This name will be shown on your posts and profile. Avoid using your real name or email.
          </p>

          <div className="mt-6">
            <FloatingInput
              id="username"
              type="text"
              value={username}
              onChange={(val) => {
                setUsername(val)
                setUsernameError('')
                setSubmitError('')
                setUsernameChecking(true)
              }}
              label="Username*"
              className="w-full"
              error={Boolean(usernameError)}
              helperText={
                username
                  ? usernameChecking
                    ? 'Checking...'
                    : usernameError
                      ? usernameError
                      : 'Username available'
                  : ''
              }
              helperTextType={usernameChecking ? 'info' : usernameError ? 'error' : 'success'}
              inputProps={{
                autoComplete: 'username',
                name: 'username',
                required: true,
                maxLength: 30,
                onBlur: () => {
                  const t = username.trim()
                  if (t !== username) setUsername(t)
                },
                'aria-invalid': usernameError ? 'true' : 'false',
                onKeyDown: (e) => {
                  if (e.key === 'Enter') handleSubmit()
                },
              }}
            />

            {submitError ? (
              <div className="mt-3 text-sm text-red-600">{submitError}</div>
            ) : null}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              className="h-10 px-5 py-2 bg-white rounded-full outline outline-1 outline-gray-400 text-sm font-semibold"
              onClick={() => setUsername(generateSuggestedUsername())}
              disabled={saving}
            >
              Suggest another
            </button>

            <button
              type="button"
              className={`h-10 px-5 py-2 rounded-full text-sm font-semibold text-white ${
                canContinue ? 'bg-pink-700 hover:bg-pink-800' : 'bg-[#E5C0D1] cursor-not-allowed'
              }`}
              onClick={handleSubmit}
              disabled={!canContinue}
              data-testid="choose-username-continue"
            >
              {saving ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
