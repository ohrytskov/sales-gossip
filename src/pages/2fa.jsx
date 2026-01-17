import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Header from '@/components/Header'

const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const intervalSeconds = 30

const normalizeSecret = secret => secret.replace(/[^A-Z2-7]/gi, '').toUpperCase()

const base32ToBytes = secret => {
  const clean = normalizeSecret(secret)
  if (!clean) return null
  let bits = 0
  let value = 0
  const output = []

  for (const char of clean) {
    const idx = base32Alphabet.indexOf(char)
    if (idx === -1) return null
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }

  return new Uint8Array(output)
}

const getSubtle = () => {
  if (typeof window !== 'undefined' && window.crypto?.subtle) return window.crypto.subtle
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) return globalThis.crypto.subtle
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.webcrypto?.subtle) return globalThis.crypto.webcrypto.subtle
  return null
}

const computeOtp = async (secret, step, digits = 6) => {
  const subtle = getSubtle()
  if (!subtle) throw new Error('Web Crypto not available')

  const keyBytes = base32ToBytes(secret)
  if (!keyBytes || keyBytes.length === 0) throw new Error('Enter a valid secret')

  const key = await subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])

  const counter = new ArrayBuffer(8)
  const view = new DataView(counter)
  view.setUint32(4, step)

  const signature = await subtle.sign('HMAC', key, counter)
  const hmac = new Uint8Array(signature)
  const offset = hmac[hmac.length - 1] & 0xf
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)

  const otp = (code % 10 ** digits).toString().padStart(digits, '0')
  return otp
}

export default function TwoFaPage() {
  const [secret, setSecret] = useState('')
  const [otp, setOtp] = useState('------')
  const [timeLeft, setTimeLeft] = useState(intervalSeconds)
  const [error, setError] = useState('')
  const lastStepRef = useRef(-1)

  useEffect(() => {
    let cancelled = false
    lastStepRef.current = -1

    const refresh = async () => {
      const nowSeconds = Math.floor(Date.now() / 1000)
      const step = Math.floor(nowSeconds / intervalSeconds)
      const remaining = intervalSeconds - (nowSeconds % intervalSeconds)
      setTimeLeft(remaining)

      if (!secret) {
        setOtp('------')
        setError('')
        lastStepRef.current = step
        return
      }

      if (lastStepRef.current === step) return

      try {
        const code = await computeOtp(secret, step)
        if (cancelled) return
        setOtp(code)
        setError('')
        lastStepRef.current = step
      } catch (err) {
        if (cancelled) return
        setError(err?.message || 'Could not generate code')
        setOtp('------')
        lastStepRef.current = step
      }
    }

    refresh()
    const interval = setInterval(refresh, 1000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [secret])

  const progress = Math.max(0, Math.min(100, (timeLeft / intervalSeconds) * 100))

  return (
    <>
      <Head>
        <title>2FA | CorporateGossip</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-white via-[#fff5f8] to-[#fce3ef]">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-[#10112a]">Authenticator</h1>
                <p className="text-[#64647c]">Enter your shared secret to generate time-based codes.</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-[#64647c]">Refreshes every {intervalSeconds}s</div>
                <div className="text-lg font-medium text-[#aa336a]">Next in {timeLeft}s</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#10112a]">Secret</label>
              <input
                value={secret}
                onChange={e => setSecret(e.target.value)}
                placeholder="Paste your Base32 secret"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#aa336a]"
              />
              <p className="text-xs text-[#64647c]">Spaces and dashes are ignored. Supports standard Base32 shared secrets.</p>
              {error && <div className="text-sm text-red-600">{error}</div>}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 p-6 rounded-xl bg-[#fff5f5] border border-[#f4d7e5]">
              <div>
                <div className="text-xs uppercase tracking-wide text-[#64647c]">Current code</div>
                <div className="text-4xl sm:text-5xl font-bold text-[#10112a] font-mono mt-2">{otp}</div>
              </div>
              <div className="flex flex-col items-end gap-2 w-full sm:w-48">
                <div className="w-full h-2 bg-[#f7e4ef] rounded-full overflow-hidden">
                  <div className="h-full bg-[#aa336a]" style={{ width: `${progress}%` }} />
                </div>
                <div className="text-xs text-[#64647c]">Updates automatically</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
