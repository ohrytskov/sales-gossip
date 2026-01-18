import { useCallback, useEffect, useRef, useState } from 'react'
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
import useRtdbDataKey from '@/hooks/useRtdbData'

const generateSuggestedUsername = () => {
  try {
    const suggestion = sanitize(getRandomUsername()).slice(0, 30)
    return suggestion.length >= 3 ? suggestion : `_${Math.random().toString(36).slice(2, 8)}`
  } catch (_) {
    return `_${Math.random().toString(36).slice(2, 8)}`
  }
}

function buildEmailHints(email) {
  const local = ((email || '').split('@')[0] || '').trim()
  if (!local) return { local: '', wordHints: [], numberHints: [], hint: '' }

  const rawParts = local.split(/[^a-zA-Z0-9]+/).filter(Boolean)
  const segments = rawParts.flatMap((part) => part.match(/[A-Za-z]+|\d+/g) || [])

  const words = segments
    .filter((seg) => /[A-Za-z]/.test(seg))
    .map((seg) => seg.toLowerCase())
    .filter(Boolean)

  const numbers = segments
    .filter((seg) => /^\d+$/.test(seg))
    .filter(Boolean)

  const wordHints = words.map((w) => w.slice(0, 4)).filter(Boolean).slice(0, 3)
  const numberHints = numbers.map((n) => n.slice(-4)).filter(Boolean).slice(0, 2)

  const hint = sanitize([...wordHints, ...numberHints].filter(Boolean).join('_')).slice(0, 12)

  return { local, wordHints, numberHints, hint }
}

function extractResponseText(json) {
  if (!json) return ''
  if (Array.isArray(json?.output)) {
    const msg = json.output.filter((o) => o.type === 'message').pop()
    return msg?.content?.[0]?.text ?? ''
  }
  return json?.choices?.[0]?.message?.content ?? json?.choices?.[0]?.text ?? ''
}

async function fetchAiUsername({ apiKey, query, email }) {
  if (!apiKey) return null
  const hints = buildEmailHints(email)

  const body = {
    model: 'gpt-4.1-mini',
    input: [
      {
        role: 'system',
        content: [
          {
            type: 'input_text',
            text:
              'You generate anonymous usernames for a social app. ' +
              'Return a single username that is not a real first/last name and does not include an email address.'
          }
        ],
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text:
              `Theme search query: "${query}"\n` +
              `Email hints (not full email): ${JSON.stringify({
                wordHints: hints.wordHints,
                numberHints: hints.numberHints,
              })}\n\n` +
              'Rules:\n' +
              '- Output JSON only.\n' +
              '- username: 3-30 chars, only letters/numbers/underscore.\n' +
              '- Use at least one email hint fragment (wordHints or numberHints) in an abbreviated form.\n' +
              '- Keep it anonymous (no real names).'
          }
        ],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'username_suggestion',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            username: { type: 'string' },
          },
          required: ['username'],
          additionalProperties: false,
        },
      },
    },
    reasoning: {},
    tools: [
      {
        type: 'web_search',
        user_location: { type: 'approximate', country: 'US' },
        search_context_size: 'high',
      },
    ],
    store: false,
  }

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  const json = await res.json()
  const content = extractResponseText(json)

  let parsed = null
  try {
    parsed = JSON.parse(content)
  } catch (_) {
    const objMatch = content.match(/\{[\s\S]*\}/)
    const substr = objMatch ? objMatch[0] : null
    try { parsed = substr ? JSON.parse(substr) : null } catch (e) { parsed = null }
  }

  const candidate = (parsed?.username || '').toString()
  const sanitized = sanitize(candidate).slice(0, 30)
  if (sanitized.length < 3) return null

  const emailHint = hints.hint
  if (emailHint && !sanitized.includes(emailHint)) {
    const corrected = sanitize(`${sanitized}_${emailHint}`).slice(0, 30)
    return corrected.length >= 3 ? corrected : sanitized
  }

  return sanitized
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

  const { data: sk1 } = useRtdbDataKey('useauth/sk1')
  const apiKey = sk1 || ''

  const [username, setUsername] = useState('')
  const [existingUsernameKey, setExistingUsernameKey] = useState('')
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [saving, setSaving] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [aiSuggesting, setAiSuggesting] = useState(false)
  const initialSuggestionRef = useRef('')
  const userEditedRef = useRef(false)
  const aiAttemptedRef = useRef(false)

  const suggestWithAi = useCallback(async ({ force = false } = {}) => {
    if (!user?.uid || saving) return
    if (aiSuggesting) return
    if (!apiKey) {
      const next = generateSuggestedUsername()
      initialSuggestionRef.current = next
      userEditedRef.current = true
      setUsername(next)
      return
    }

    setAiSuggesting(true)
    try {
      const suggestion = await fetchAiUsername({
        apiKey,
        query: 'latest news',
        email: user?.email || '',
      })
      if (!suggestion) return
      if (!force && userEditedRef.current) return
      setUsername(suggestion)
      initialSuggestionRef.current = suggestion
    } catch (e) {
      console.error('Failed to fetch AI username suggestion', e)
    } finally {
      setAiSuggesting(false)
    }
  }, [aiSuggesting, apiKey, saving, user?.email, user?.uid])

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

        const current = (rec?.public?.nickname || rec?.public?.username || '').trim()
        const next = current || generateSuggestedUsername()
        setUsername(next)
        setExistingUsernameKey(sanitize(current))
        initialSuggestionRef.current = next
        setInitialized(true)
      } catch (e) {
        if (cancelled) return
        const next = generateSuggestedUsername()
        setUsername(next)
        setExistingUsernameKey('')
        initialSuggestionRef.current = next
        setInitialized(true)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [initialized, loading, router, user?.uid])

  useEffect(() => {
    if (!initialized) return
    if (existingUsernameKey) return
    if (aiAttemptedRef.current) return
    if (!apiKey) return
    if (!username) return
    if (username !== initialSuggestionRef.current) return
    aiAttemptedRef.current = true
    suggestWithAi()
  }, [apiKey, existingUsernameKey, initialized, suggestWithAi, username])

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

      router.push('/signup?step=4')
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
                userEditedRef.current = true
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
              onClick={() => suggestWithAi({ force: true })}
              disabled={saving}
            >
              {aiSuggesting ? 'Thinking...' : 'Suggest another'}
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
