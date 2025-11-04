import React, { useRef, useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { rtdb } from '@/firebase/config'
import { ref, set } from 'firebase/database'
import { nanoid } from 'nanoid'
import FloatingInput from '@/components/FloatingInput'

export default function HelpCenterModal({ open, onClose }) {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [issue, setIssue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const modalRef = useRef(null)

  useEffect(() => {
    if (open) {
      setEmail('')
      setIssue('')
      setSubmitStatus(null)
      setTimeout(() => modalRef.current?.focus(), 0)
    }
  }, [open])

  async function handleSubmit() {
  if (!email || !issue) {
    setSubmitStatus({ type: 'error', message: 'Please fill in all fields' })
    return
  }

  // basic email format validation
  const emailRegex = /^\S+@\S+\.\S+$/
  if (!emailRegex.test(email)) {
    setSubmitStatus({ type: 'error', message: 'Please enter a valid email address' })
    return
  }

    setSubmitting(true)
    try {
      // Save help request to Realtime Database
      // generate unique prefixed ID without push()
      const id = `help-id--${nanoid()}`
      await set(ref(rtdb, `helpCenter/${id}`), {
        email,
        issue,
        userId: user?.uid || null,
        createdAt: new Date().toISOString()
      })
      setSubmitStatus({ type: 'success', message: 'Help request submitted successfully!' })
      setTimeout(() => onClose(), 1500)
    } catch (err) {
      console.error('Help center submission failed', err)
      setSubmitStatus({ type: 'error', message: 'Failed to submit. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Help center"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} aria-hidden="true" />

      <div
        ref={modalRef}
        tabIndex={-1}
        className="Modal w-[566px] h-[456px] relative bg-white rounded-3xl overflow-hidden"
      >
        {/* Header */}
        <div className="w-full h-16 absolute left-0 top-0 overflow-hidden">
          <p className="text-[#17183b] text-lg font-semibold font-['Inter'] leading-normal absolute left-[24px] top-[24px]">
            Help center
          </p>
          <div
            onClick={onClose}
            role="button"
            tabIndex={0}
            aria-label="Close"
            className="absolute right-[24px] top-[20px] w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded-full"
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClose()}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_help_close)">
                <path d="M14.7953 5.19922L5.19531 14.7992" stroke="#17183B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5.19531 5.19922L14.7953 14.7992" stroke="#17183B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </g>
              <defs>
                <clipPath id="clip0_help_close">
                  <rect width="19.2" height="19.2" fill="white" transform="translate(0.398438 0.398438)" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>

        {/* Description */}
        <p className="text-[#454662] text-sm font-normal font-['Inter'] leading-[22px] absolute left-[24px] top-[64px] w-[465px]">
          Let us know how we can help — we&#39;ll get back to you shortly.
        </p>

        {/* Email Input */}
        <div className="absolute left-[24px] top-[110px] w-[518px]">
          <FloatingInput
            id="help-email"
            label="Email id*"
            value={email}
            onChange={setEmail}
            placeholder=""
            rounded="2xl"
            inputProps={{
              type: 'email',
              disabled: submitting
            }}
          />
        </div>

        {/* Issue Input */}
        <div className="absolute left-[24px] top-[190px] w-[518px]">
        <FloatingInput
          id="help-issue"
          label="Describe your issue here*"
          value={issue}
          onChange={setIssue}
          placeholder=""
          rounded="2xl"
          multiline
          rows={4}
          inputProps={{
            disabled: submitting,
            style: { resize: 'none', height: '120px' }
          }}
        />
        </div>

        {/* Status Message */}
        {submitStatus && (
          <div className={`absolute left-[24px] top-[325px] px-4 py-2 rounded-xl text-sm font-medium ${
            submitStatus.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-300'
              : 'bg-red-50 text-red-700 border border-red-300'
          }`}>
            {submitStatus.message}
          </div>
        )}

        {/* Footer Buttons */}
        <div className="absolute bottom-0 h-[68px] left-0 w-full overflow-hidden flex items-center justify-end gap-4 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-10 px-5 py-2 bg-white rounded-[56px] outline outline-1 outline-offset-[-1px] outline-[#b7b7c2] inline-flex justify-center items-center gap-2 text-[#aa336a] text-sm font-semibold font-['Inter'] hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !email || !issue}
            className={`h-10 px-5 py-2 rounded-[56px] inline-flex justify-center items-center gap-2 text-white text-sm font-semibold font-['Inter'] transition-colors ${
              submitting || !email || !issue
                ? 'bg-[#e5c0d1] cursor-not-allowed'
                : 'bg-[#aa336a] hover:bg-[#8b2a54] cursor-pointer'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}
