import { useState } from 'react'
import { sendEmail } from '../utils/sendEmail'
import { useAuth } from '../hooks/useAuth'
import Toast from '@/components/Toast'

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
      await sendEmail('hello@sales-gossip.com', 'Message from SalesGossip About Page', emailMessage, {
        userId: user?.uid
      })
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
              className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
