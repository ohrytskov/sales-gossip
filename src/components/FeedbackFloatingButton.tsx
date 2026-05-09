import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { useGlobal } from '@/hooks/useGlobal'
import FloatingInput from '@/components/FloatingInput'
import { logFeedback } from '@/firebase/rtdb/feedback'

const feedbackSvg = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_d_554_10991)">
<rect x="12" y="12" width="40" height="40" rx="20" fill="#AA336A" shape-rendering="crispEdges"/>
<g clip-path="url(#clip0_554_10991)">
<path d="M30.7642 38.5573C29.9495 38.4362 29.158 38.192 28.4167 37.8331L24.5 38.6664L25.5833 35.4164C23.6467 32.5523 24.395 28.8564 27.3333 26.7714C30.2717 24.6873 34.4917 24.8581 37.2042 27.1714C38.5925 28.3556 39.3658 29.9131 39.4933 31.5131" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M36.8326 39.3472L35.0226 40.2956C34.9688 40.3235 34.9084 40.336 34.848 40.3316C34.7876 40.3272 34.7296 40.3061 34.6805 40.2707C34.6314 40.2352 34.5932 40.1868 34.57 40.1309C34.5468 40.075 34.5396 40.0137 34.5492 39.9539L34.8951 37.9447L33.4309 36.5222C33.3872 36.48 33.3562 36.4263 33.3416 36.3673C33.3269 36.3083 33.3292 36.2464 33.348 36.1886C33.3669 36.1308 33.4016 36.0795 33.4482 36.0405C33.4949 36.0015 33.5515 35.9764 33.6117 35.9681L35.6351 35.6747L36.5401 33.8472C36.5671 33.7928 36.6088 33.747 36.6605 33.715C36.7122 33.683 36.7718 33.666 36.8326 33.666C36.8933 33.666 36.9529 33.683 37.0046 33.715C37.0563 33.747 37.098 33.7928 37.1251 33.8472L38.0301 35.6747L40.0534 35.9681C40.1134 35.9767 40.1698 36.002 40.2163 36.041C40.2627 36.08 40.2973 36.1313 40.3161 36.1889C40.3349 36.2466 40.3372 36.3084 40.3227 36.3673C40.3083 36.4262 40.2776 36.4799 40.2342 36.5222L38.7701 37.9447L39.1151 39.9531C39.1254 40.013 39.1188 40.0745 39.0959 40.1309C39.073 40.1872 39.0348 40.2359 38.9855 40.2716C38.9363 40.3072 38.8781 40.3284 38.8175 40.3326C38.7569 40.3369 38.6963 40.324 38.6426 40.2956L36.8326 39.3472Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</g>
<defs>
<filter id="filter0_d_554_10991" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="6"/>
<feComposite in="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.0627451 0 0 0 0 0.0666667 0 0 0 0 0.164706 0 0 0 0.16 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_554_10991"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_554_10991" result="shape"/>
</filter>
<clipPath id="clip0_554_10991">
<rect width="20" height="20" fill="white" transform="translate(22 22)"/>
</clipPath>
</defs>
</svg>
`

export default function FeedbackFloatingButton() {
  const router = useRouter()
  const { user } = useAuth()
  const { showToast } = useGlobal()

  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [router.asPath])

  const handleSubmit = async () => {
    const trimmed = message.trim()
    if (!trimmed || isSubmitting) return

    setIsSubmitting(true)
    try {
      await logFeedback({
        message: trimmed,
        userId: user?.uid,
        email: user?.email,
        url: typeof window !== 'undefined' ? window.location.href : router.asPath,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
        metadata: { route: router.asPath }
      })

      setMessage('')
      setIsOpen(false)
      showToast('Thanks for the feedback!')
    } catch (e) {
      console.error('Failed to submit feedback', e)
      showToast('Failed to submit feedback. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className="fixed bottom-10 right-10 z-50"
        aria-label="Leave feedback"
        onClick={() => setIsOpen(true)}
      >
        <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: feedbackSvg }} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 w-[420px] max-w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Feedback</h3>
            <p className="text-sm text-gray-600 mb-4">Tell us what you think</p>

            <FloatingInput
              id="feedback-message"
              multiline
              rows={4}
              value={message}
              onChange={setMessage}
              label="Type your feedback here..."
              className="w-full h-32"
              inputProps={{
                disabled: isSubmitting,
                name: 'feedback-message'
              }}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!message.trim() || isSubmitting}
                className="px-4 py-2 text-sm text-white bg-[#aa336a] rounded-md hover:bg-[#9a2d5d] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
