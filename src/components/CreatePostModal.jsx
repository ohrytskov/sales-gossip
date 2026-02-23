import { useRef, useState, useEffect } from 'react'
import Toast from '@/components/Toast'
import FloatingInput from '@/components/FloatingInput'
import CompanySelect from '@/components/CompanySelect'
import Editor from '@/components/createPost/Editor'
import MediaTab from '@/components/createPost/MediaTab'
import TagsInput from '@/components/createPost/TagsInput'
import { rtdb } from '@/firebase/config'
import { ref, set } from 'firebase/database'
import { savePostCompany, removePostFromCompany } from '@/firebase/rtdb/companies'
import { saveTagsAggregate } from '@/firebase/rtdb/tags'
import { uploadMedia } from '@/firebase/storage/media'
import { nanoid } from 'nanoid'
import { useAuth } from '@/hooks/useAuth'
import { getUser } from '@/firebase/rtdb/users'
import { escape as escapeHtml, unescape as unescapeHtml } from 'html-escaper'

function hasBodyContent(html) {
  if (!html) return false
  try {
    const stripped = String(html).replace(/<[^>]*>/g, '').replace(/&nbsp;|\\u00A0/g, '').trim()
    return stripped.length > 0
  } catch (err) {
    return Boolean(String(html).trim())
  }
}

export default function CreatePostModal({ open, onClose, initialBody = '', post = null, onPostSaved = null }) {
  const modalRef = useRef(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selectedCompany, setSelectedCompany] = useState(null)
  // Layout: positions inlined below
  // Tags: interactive tag chips + input
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [tagFocused, setTagFocused] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [selectedMedia, setSelectedMedia] = useState([])
  const [activeMediaIndex, setActiveMediaIndex] = useState(0)
  const [previewUrls, setPreviewUrls] = useState([])
  const imagesInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const dragIndexRef = useRef(null)

  useEffect(() => {
    if (!selectedMedia || !selectedMedia.length) {
      setPreviewUrls([])
      setActiveMediaIndex(0)
      return
    }

    const created = selectedMedia.map((file) => URL.createObjectURL(file))
    setPreviewUrls(created)
    setActiveMediaIndex((prev) => (prev >= created.length ? 0 : prev))

    return () => {
      created.forEach((url) => {
        try { URL.revokeObjectURL(url) } catch (e) { /* ignore */ }
      })
    }
  }, [selectedMedia])

  const onOpenImagesPicker = () => imagesInputRef.current && imagesInputRef.current.click()
  const onOpenVideoPicker = () => videoInputRef.current && videoInputRef.current.click()

  const handleImagesSelected = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setSelectedMedia(files)
    setActiveMediaIndex(0)
    e.target.value = ''
  }

  const handleVideoSelected = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setSelectedMedia([files[0]])
    setActiveMediaIndex(0)
    e.target.value = ''
  }

  const removeSelectedMedia = () => setSelectedMedia([])

  const handleDragStart = (e, idx) => {
    dragIndexRef.current = idx
    try { e.dataTransfer.setData('text/plain', String(idx)) } catch (err) { /* ignore */ }
  }

  const handleDropOnIndex = (e, targetIdx) => {
    e.preventDefault()

    let srcIdx = dragIndexRef.current
    if (srcIdx === null || srcIdx === undefined) {
      try { srcIdx = Number(e.dataTransfer.getData('text/plain')) } catch (err) { srcIdx = null }
    }

    if (srcIdx === null || srcIdx === undefined || isNaN(srcIdx) || srcIdx === targetIdx) return

    setSelectedMedia((prev) => {
      const next = [...prev]
      const [removed] = next.splice(srcIdx, 1)
      next.splice(targetIdx, 0, removed)
      return next
    })

    dragIndexRef.current = null
  }

  const removeMediaAtIndex = (idx) => {
    setSelectedMedia((prev) => {
      const next = prev.filter((_, i) => i !== idx)
      if (next.length === 0) setActiveMediaIndex(0)
      else if (activeMediaIndex >= next.length) setActiveMediaIndex(0)
      return next
    })
  }

  const { user } = useAuth()

  const canPost = title.trim() && hasBodyContent(body)

  const handlePost = async () => {
    if (!canPost) return

    let authorData = null

    // Check if user is banned
    try {
      authorData = await getUser(user?.uid)
      if (authorData?.public?.isBanned) {
        setToastMessage('Your account has been banned and you cannot create posts.')
        setShowToast(true)
        return
      }
    } catch (error) {
      console.error('Error checking user ban status:', error)
    }

    const isEditing = Boolean(post && post.id)
    const postId = isEditing ? post.id : 'post-id--' + nanoid()
    const now = new Date().toISOString()
    const createdAt = isEditing ? (post.createdAt || post.timestamp || now) : now
    const timestamp = isEditing ? (post.timestamp || now) : now
    const previousCompanyId = post?.companyId || ''
    const companyId = selectedCompany?.id || ''
    const companyName = selectedCompany?.title || ''
    const companyLogo = selectedCompany?.logo || ''
    const companyWebsite = selectedCompany?.website || ''
    const textBody = escapeHtml(body)

    let mediaUrls = isEditing
      ? (
        Array.isArray(post.mediaUrls)
          ? [...post.mediaUrls]
          : post.mediaUrl
            ? [post.mediaUrl]
            : []
      )
      : []
    let mediaUrl = isEditing ? (post.mediaUrl || '') : ''

    try {
      // upload selected media (images or video) to Firebase Storage and attach URLs
      if (selectedMedia && selectedMedia.length) {
        setToastMessage('Uploading media...')
        setShowToast(true)
        try {
          const uploads = selectedMedia.map((file, idx) => uploadMedia(file, postId, idx, () => {}))
          const results = await Promise.all(uploads)
          mediaUrls = results.map(r => r.url)
          mediaUrl = mediaUrls[0] || ''
        } catch (uploadErr) {
          console.error('Media upload failed', uploadErr)
          // continue and save post without media
        }
      } else if (!isEditing) {
        mediaUrls = []
        mediaUrl = ''
      }

      const postObj = {
        authorUid: post?.authorUid || (user ? user.uid : ''),
        avatar:
          post?.avatar ||
          user?.photoURL ||
          authorData?.public?.avatarUrl ||
          authorData?.public?.avatar ||
          '/images/feed/avatar1.svg',
        comments: post?.comments || [],
        commentsCount: post?.commentsCount ?? 0,
        companyId,
        companyName,
        companyLogo,
        companyWebsite,
        excerpt: textBody,
        id: postId,
        likes: post?.likes ?? 0,
        likedBy: post?.likedBy || {},
        mediaUrl,
        mediaUrls,
        moreLink: post?.moreLink ?? false,
        shares: post?.shares ?? 0,
        tags: Array.isArray(tags) ? tags : [],
        timestamp,
        title,
        username: post?.username || (user && (user.displayName || user.email)) || '',
        createdAt,
        updatedAt: now
      }

      await set(ref(rtdb, `posts/${postId}`), postObj)
      if (!isEditing) {
        await saveTagsAggregate(postObj.tags, postObj.createdAt, postObj.updatedAt)
      }
      // add or refresh entry under the company
      if (companyId) {
        await savePostCompany(
          companyId,
          { title: companyName, logo: companyLogo, website: companyWebsite },
          postId,
          now
        )
      }
      if (isEditing && previousCompanyId && previousCompanyId !== companyId) {
        await removePostFromCompany(previousCompanyId, postId)
      }
      setToastMessage(isEditing ? 'Post updated' : 'Post saved')
      setShowToast(true)
      if (typeof onPostSaved === 'function') {
        try {
          onPostSaved({ postId, isEditing })
        } catch (e) {
          console.error('Failed to run onPostSaved', e)
        }
      }
      // Close modal after a short delay so toast is visible
      setTimeout(() => onClose && onClose(), 700)
    } catch (err) {
      console.error('Failed to save post', err)
      setToastMessage('Failed to save post')
      setShowToast(true)
    }
  }

  const addTag = (raw) => {
    if (!raw) return
    let t = String(raw || '').trim()
    if (!t) return
    if (t.startsWith('#')) t = t.slice(1).trim()
    if (!t) return
    if (!tags.includes(t)) setTags(prev => [...prev, t])
    setTagInput('')
  }

  const removeTag = (t) => setTags(prev => prev.filter(x => x !== t))

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    } else if (e.key === 'Backspace' && !tagInput) {
      // remove last
      setTags(prev => prev.slice(0, Math.max(0, prev.length - 1)))
    }
  }

  useEffect(() => {
    if (open) {
      // Reset all form fields and transient state when modal opens so
      // each opening starts with a fresh form (no cached data or files)
      setShowToast(false)
      setToastMessage('')
      if (post) {
        setTitle(post.title || '')
        setBody(post.excerpt ? unescapeHtml(post.excerpt) : '')
        setSelectedCompany(
          post.companyId
            ? {
                id: post.companyId,
                title: post.companyName || '',
                logo: post.companyLogo || '',
                website: post.companyWebsite || ''
              }
            : null
        )
        setTags(Array.isArray(post.tags) ? post.tags : [])
      } else {
        setTitle('')
        setBody(initialBody || '')
        setSelectedCompany(null)
        setTags([])
      }
      setTagInput('')
      setTagFocused(false)
      setActiveTab('details')
      setSelectedMedia([])
      if (imagesInputRef.current) try { imagesInputRef.current.value = '' } catch (e) { /* ignore */ }
      if (videoInputRef.current) try { videoInputRef.current.value = '' } catch (e) { /* ignore */ }

      setTimeout(() => modalRef.current?.focus(), 0)
    }
  }, [open, initialBody, post])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Create post"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} aria-hidden="true" />

      <div
        ref={modalRef}
        tabIndex={-1}
        data-layer="Modal"
        className={`Modal font-inter w-[826px] ${activeTab === 'media' ? 'h-[575px]' : 'h-[759px]'} relative bg-white rounded-3xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div data-layer="Frame 48097039" className="Frame48097039 w-[826px] h-16 left-0 top-0 absolute overflow-hidden">
          <div data-layer="Section title" className="SectionTitle left-[24px] top-[24px] absolute justify-start text-[#17183b] text-lg font-semibold font-['Inter'] leading-normal">Create post </div>
          <div data-svg-wrapper data-layer="Ellipse 11" className="Ellipse11 left-[770px] top-[20px] absolute">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#F2F2F4" />
            </svg>
          </div>
          <div data-svg-wrapper data-layer="Frame" className="Frame left-[776.40px] top-[26.40px] absolute cursor-pointer" onClick={onClose} role="button" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_215_579)">
                <path d="M14.7953 5.20117L5.19531 14.8012" stroke="#17183B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5.19531 5.20117L14.7953 14.8012" stroke="#17183B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </g>
              <defs>
                <clipPath id="clip0_215_579">
                  <rect width="19.2" height="19.2" fill="white" transform="translate(0.398438 0.400391)" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>

        {/* Primary action bar */}
        <div data-layer="Frame 48097040" className={`Frame48097040 w-[826px] h-16 left-0 ${activeTab === 'media' ? 'top-[507px]' : 'top-[691px]'} absolute overflow-hidden`}>
          <div
            data-layer="Primary Button"
            className={`PrimaryButton h-10 px-5 py-2 left-[731px] top-[14px] absolute ${canPost ? 'bg-[#aa336a] cursor-pointer' : 'bg-[#e5c0d1]'} rounded-[56px] inline-flex justify-center items-center gap-2`}
            onClick={canPost ? handlePost : undefined}
          >
            <div data-layer="Button" className="Button justify-start text-white text-sm font-semibold font-['Inter']">Post</div>
          </div>
        </div>

        {activeTab === 'details'
          ? (
            <Editor
              value={body}
              onChange={setBody}
              onToast={(message) => {
                setToastMessage(message)
                setShowToast(true)
              }}
            />
          )
          : (
            <MediaTab
              selectedMedia={selectedMedia}
              previewUrls={previewUrls}
              activeMediaIndex={activeMediaIndex}
              setActiveMediaIndex={setActiveMediaIndex}
              onOpenImagesPicker={onOpenImagesPicker}
              onOpenVideoPicker={onOpenVideoPicker}
              removeSelectedMedia={removeSelectedMedia}
              removeMediaAtIndex={removeMediaAtIndex}
              handleDragStart={handleDragStart}
              handleDropOnIndex={handleDropOnIndex}
            />
          )}


        <input ref={imagesInputRef} type="file" accept="image/*" multiple onChange={handleImagesSelected} className="hidden" />
        <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoSelected} className="hidden" />

        <div data-layer="Details controls" className={`${activeTab === 'media' ? 'hidden' : ''}`}>
          <FloatingInput
            id="post-title"
            value={title}
            onChange={setTitle}
            label="Title*"
            className="w-[778px] h-14 left-[24px] top-[139px] absolute"
            inputProps={{ maxLength: 300 }}
            maxLength={300}
            showCount
          />

          <CompanySelect value={selectedCompany} onChange={setSelectedCompany} />

          <TagsInput
            tagInput={tagInput}
            setTagInput={setTagInput}
            tagFocused={tagFocused}
            setTagFocused={setTagFocused}
            tags={tags}
            handleTagKeyDown={handleTagKeyDown}
            addTag={addTag}
            removeTag={removeTag}
          />
        </div>

        <div data-layer="Tab bar" className="TabBar size- left-[24px] top-[80px] absolute inline-flex justify-center items-center gap-6">
          <div data-layer="Menu" role="button" onClick={() => setActiveTab('details')} className={`Menu size- py-2 ${activeTab === 'details' ? 'border-b-[1.50px] border-[#79244b]' : ''} flex justify-center items-center gap-2`}>
            <div data-layer="Menu" className={`Menu justify-start ${activeTab === 'details' ? 'text-[#79244b]' : 'text-[#9495a5]'} text-base font-medium font-['Inter']`}>Post details</div>
          </div>
          <div data-layer="Menu" role="button" onClick={() => setActiveTab('media')} className={`Menu size- py-2 ${activeTab === 'media' ? 'border-b-[1.50px] border-[#79244b]' : ''} flex justify-center items-center gap-2`}>
            <div data-layer="Menu" className={`Menu justify-start ${activeTab === 'media' ? 'text-[#79244b]' : 'text-[#9495a5]'} text-base font-medium font-['Inter']`}>Images/video</div>
          </div>
        </div>
      </div>
      <Toast show={showToast} message={toastMessage} onClose={() => setShowToast(false)} />
    </div>
  )
}
