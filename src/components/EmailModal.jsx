import { useState } from 'react'
import { ref, get } from 'firebase/database'
import { sendEmail } from '../utils/sendEmail'
import { useAuth } from '../hooks/useAuth'
import Toast from '@/components/Toast'
import { rtdb } from '@/firebase/config'

const DEFAULT_CONTACT_EMAILS = ['hello@corpgossip.com']

function normalizeEmailList(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return [value]
  if (!value || typeof value !== 'object') return []

  const entries = Object.entries(value)
  const numericKeys = entries.every(([key]) => /^\d+$/.test(key))
  if (numericKeys) {
    return entries
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([, email]) => email)
  }

  return entries.filter(([, enabled]) => Boolean(enabled)).map(([email]) => email)
}

async function getContactEmails() {
  try {
    const snap = await get(ref(rtdb, 'contactToEmails'))
    if (!snap || !snap.exists()) {
      console.warn('No contact emails configured in RTDB at /contactToEmails')
      return DEFAULT_CONTACT_EMAILS
    }

    const emails = normalizeEmailList(snap.val())
      .filter(email => typeof email === 'string' && email.includes('@'))
      .map(email => email.trim())
      .filter(Boolean)

    return emails.length ? emails : DEFAULT_CONTACT_EMAILS
  } catch (error) {
    console.error('Failed to get contact emails from RTDB:', error)
    return DEFAULT_CONTACT_EMAILS
  }
}

const EmailModal = ({ isOpen, onClose }) => {
  const [emailMessage, setEmailMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const { user } = useAuth()

  const showToastMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
  }

  const handleSendEmail = async () => {
    if (!emailMessage.trim()) return

    setIsSending(true)
    try {
      const recipients = Array.from(new Set(await getContactEmails()))
      const subject = 'Message from CorporateGossip About Page'

      const results = await Promise.allSettled(
        recipients.map(recipient =>
          sendEmail(recipient, subject, emailMessage, {
            userId: user?.uid
          })
        )
      )

      const sentCount = results.filter(result => result.status === 'fulfilled').length
      if (sentCount === 0) {
        throw new Error('Failed to send email')
      }

      const failed = results
        .map((result, idx) => (result.status === 'rejected' ? recipients[idx] : null))
        .filter(Boolean)

      if (failed.length) {
        console.error('Failed to send contact email to:', failed)
      }

      setEmailMessage('')
      showToastMessage('Thank you for your message! We\'ll get back to you soon.')
      onClose()
    } catch (error) {
      showToastMessage('Failed to send email. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) {
    return showToast ? (
      <Toast show={showToast} message={toastMessage} onClose={() => setShowToast(false)} />
    ) : null
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
	          <div className="mb-4">
	            <h3 className="text-lg font-semibold text-gray-900 mb-2">Send us a message</h3>
	            <textarea
	              value={emailMessage}
	              onChange={(e) => setEmailMessage(e.target.value)}
	              placeholder="Type your message here..."
	              className="w-full h-32 p-3 border border-gray-200 rounded-md resize-none focus:outline-none focus:border-gray-300"
	              disabled={isSending}
	            />
	          </div>
	          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isSending}
            >
              Cancel
            </button>
            <button
              onClick={handleSendEmail}
              disabled={!emailMessage.trim() || isSending}
              className="px-4 py-2 text-sm text-white bg-[#aa336a] rounded-md hover:bg-[#9a2d5d] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
      <Toast show={showToast} message={toastMessage} onClose={() => setShowToast(false)} />
    </>
  )
}

export default EmailModal
