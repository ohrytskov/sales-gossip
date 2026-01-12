import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import Toast from '@/components/Toast'
import FloatingInput from '@/components/FloatingInput'
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import CompanySelect from '@/components/CompanySelect'
import { rtdb } from '@/firebase/config'
import { ref, set } from 'firebase/database'
import { savePostCompany, removePostFromCompany } from '@/firebase/rtdb/companies'
import { saveTagsAggregate } from '@/firebase/rtdb/tags'
import { uploadMedia } from '@/firebase/storage/media'
import { nanoid } from 'nanoid'
import { useAuth } from '@/hooks/useAuth'
import { getUser } from '@/firebase/rtdb/users'
import { escape as escapeHtml, unescape as unescapeHtml } from 'html-escaper'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

function hasBodyContent(html) {
  if (!html) return false
  try {
    const stripped = String(html).replace(/<[^>]*>/g, '').replace(/&nbsp;|\\u00A0/g, '').trim()
    return stripped.length > 0
  } catch (err) {
    return Boolean(String(html).trim())
  }
}

// Toolbar icon components (extracted from inline SVGs in the editor toolbar)
const IconBold = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_215_589)">
      <path d="M5.82812 4.16797H10.8281C11.6017 4.16797 12.3435 4.47526 12.8905 5.02224C13.4375 5.56922 13.7448 6.31109 13.7448 7.08464C13.7448 7.85818 13.4375 8.60005 12.8905 9.14703C12.3435 9.69401 11.6017 10.0013 10.8281 10.0013H5.82812V4.16797Z" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.8281 10H11.6615C12.435 10 13.1769 10.3073 13.7239 10.8543C14.2708 11.4013 14.5781 12.1431 14.5781 12.9167C14.5781 13.6902 14.2708 14.4321 13.7239 14.9791C13.1769 15.526 12.435 15.8333 11.6615 15.8333H5.82812V10" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_215_589">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const IconItalic = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_215_593)">
      <path d="M9.17188 4.16797H14.1719" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.82812 15.832H10.8281" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.6615 4.16797L8.32812 15.8346" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_215_593">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const IconStrikethrough = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_215_598)">
      <path d="M4.17188 10H15.8385" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.3333 5.41685C13.1444 5.05015 12.7113 4.72656 12.1054 4.49935C11.4995 4.27214 10.757 4.15487 10 4.16685H9.16667C8.39312 4.16685 7.65125 4.47414 7.10427 5.02112C6.55729 5.5681 6.25 6.30997 6.25 7.08352C6.25 7.85706 6.55729 8.59893 7.10427 9.14591C7.65125 9.69289 8.39312 10.0002 9.16667 10.0002H10.8333C11.6069 10.0002 12.3487 10.3075 12.8957 10.8545C13.4427 11.4014 13.75 12.1433 13.75 12.9169C13.75 13.6904 13.4427 14.4323 12.8957 14.9792C12.3487 15.5262 11.6069 15.8335 10.8333 15.8335H9.58333C8.82636 15.8455 8.0838 15.7282 7.47792 15.501C6.87203 15.2738 6.43896 14.9502 6.25 14.5835" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_215_598">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const IconSuperscript = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_215_602)">
      <path d="M4.17188 5.83203L10.8385 14.1654M4.17188 14.1654L10.8385 5.83203" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5052 9.16662H14.1719L17.0885 5.83329C17.198 5.64178 17.2686 5.43059 17.2964 5.21177C17.3243 4.99296 17.3087 4.77081 17.2507 4.55801C17.1926 4.34521 17.0932 4.14593 16.9582 3.97153C16.8231 3.79714 16.6551 3.65106 16.4635 3.54162C16.0768 3.32061 15.618 3.26229 15.1883 3.3795C14.7585 3.49671 14.3929 3.77985 14.1719 4.16662" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_215_602">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const IconLink = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_215_606)">
      <path d="M7.5 12.5L12.5 7.5" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.17188 4.99895L9.55771 4.55229C10.3392 3.77089 11.3991 3.33195 12.5043 3.33203C13.6094 3.33211 14.6692 3.7712 15.4506 4.5527C16.232 5.33421 16.671 6.39411 16.6709 7.49925C16.6708 8.60438 16.2317 9.66423 15.4502 10.4456L15.0052 10.8323" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.8282 15.0013L10.4974 15.4463C9.70678 16.2281 8.63973 16.6666 7.52783 16.6666C6.41592 16.6666 5.34887 16.2281 4.55824 15.4463C4.16854 15.061 3.85916 14.6022 3.648 14.0964C3.43685 13.5907 3.32812 13.0481 3.32812 12.5001C3.32812 11.952 3.43685 11.4094 3.648 10.9037C3.85916 10.398 4.16854 9.93914 4.55824 9.5538L4.99491 9.16797" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_215_606">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const IconBulletedList = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_215_611)">
      <path d="M7.5 5H16.6667" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 10H16.6667" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 15H16.6667" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.17188 5V5.00833" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.17188 10V10.0083" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.17188 15V15.0083" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_215_611">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const IconNumberedList = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_215_619)">
      <path d="M9.17188 5H16.6719" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.17188 10H16.6719" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 15H16.6667" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.32812 13.3346C3.32812 12.8926 3.50372 12.4687 3.81628 12.1561C4.12884 11.8436 4.55276 11.668 4.99479 11.668C5.43682 11.668 5.86074 11.8436 6.1733 12.1561C6.48586 12.4687 6.66146 12.8926 6.66146 13.3346C6.66146 13.8271 6.24479 14.168 5.82812 14.5846L3.32812 16.668H6.66146" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.99479 8.33203V3.33203L3.32812 4.9987" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_215_619">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const IconDivider = (props) => (
  <svg width="2" height="26" viewBox="0 0 2 26" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M1 1V25" stroke="#B7B7C2" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const IconEmoji = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_215_629)">
      <path d="M2.5 10C2.5 10.9849 2.69399 11.9602 3.0709 12.8701C3.44781 13.7801 4.00026 14.6069 4.6967 15.3033C5.39314 15.9997 6.21993 16.5522 7.12987 16.9291C8.03982 17.306 9.01509 17.5 10 17.5C10.9849 17.5 11.9602 17.306 12.8701 16.9291C13.7801 16.5522 14.6069 15.9997 15.3033 15.3033C15.9997 14.6069 16.5522 13.7801 16.9291 12.8701C17.306 11.9602 17.5 10.9849 17.5 10C17.5 9.01509 17.306 8.03982 16.9291 7.12987C16.5522 6.21993 15.9997 5.39314 15.3033 4.6967C14.6069 4.00026 13.7801 3.44781 12.8701 3.0709C11.9602 2.69399 10.9849 2.5 10 2.5C9.01509 2.5 8.03982 2.69399 7.12987 3.0709C6.21993 3.44781 5.39314 4.00026 4.6967 4.6967C4.00026 5.39314 3.44781 6.21993 3.0709 7.12987C2.69399 8.03982 2.5 9.01509 2.5 10Z" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 8.33203H7.50833" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 8.33203H12.5083" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.91406 12.5C8.18563 12.7772 8.50977 12.9974 8.8675 13.1477C9.22523 13.298 9.60936 13.3754 9.9974 13.3754C10.3854 13.3754 10.7696 13.298 11.1273 13.1477C11.485 12.9974 11.8092 12.7772 12.0807 12.5" stroke="#64647C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_215_629">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

export default function CreatePostModal({ open, onClose, initialBody = '', post = null }) {
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

    // Check if user is banned
    try {
      const userData = await getUser(user?.uid)
      if (userData?.public?.isBanned) {
        setToastMessage('Your account has been banned and you cannot create posts.')
        setShowToast(true)
        return
      }
    } catch (error) {
      console.error('Error checking user ban status:', error)
      setToastMessage('Error checking account status. Please try again.')
      setShowToast(true)
      return
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
        avatar: post?.avatar || (user?.photoURL || ''),
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

  const toggleBold = useCallback(() => {
    const builtinBold = document.querySelector('.ql-toolbar button.ql-bold');
    if (builtinBold) {
      builtinBold.click();
      return;
    }
  }, []);

  const toggleItalic = useCallback(() => {
    const builtinItalic = document.querySelector('.ql-toolbar button.ql-italic');
    if (builtinItalic) {
      builtinItalic.click();
      return;
    }
  }, []);

  const toggleStrikethrough = useCallback(() => {
    const builtinStrike = document.querySelector('.ql-toolbar button.ql-strike');
    if (builtinStrike) {
      builtinStrike.click();
      return;
    }
  }, []);

  const toggleSuperscript = useCallback(() => {
    const btn = document.querySelector('.ql-toolbar button.ql-script[value="super"]');
    if (btn) btn.click();
  }, []);

  const toggleLink = useCallback(() => {
    const builtinLink = document.querySelector('.ql-toolbar button.ql-link');
    if (builtinLink) {
      builtinLink.click();
      // Focus the tooltip input so the user can type the URL immediately.
      setTimeout(() => {
        const input = document.querySelector('.ql-tooltip input[data-link], .ql-tooltip input');
        if (input) {
          try {
            input.focus();
            if (input.select) input.select();
            input.setAttribute('placeholder', 'https://sales-gossip.com')
            input.setAttribute('data-link', 'https://sales-gossip.com')
          } catch (err) {
            // ignore
          }
        }
      }, 0);
      return;
    }
  }, []);

  const toggleBulletedList = useCallback(() => {
    const btn = document.querySelector('.ql-toolbar button.ql-list[value="bullet"]');
    if (btn) {
      btn.click();
      return;
    }
  }, []);

  const toggleNumberedList = useCallback(() => {
    const btn = document.querySelector('.ql-toolbar button.ql-list[value="ordered"]');
    if (btn) {
      btn.click();
      return;
    }
  }, []);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const savedRangeRef = useRef(null);

  const saveSelectionIfInEditor = useCallback(() => {
    try {
      const sel = window.getSelection && window.getSelection();
      if (!sel || sel.rangeCount === 0) {
        savedRangeRef.current = null;
        return;
      }
      const range = sel.getRangeAt(0);
      const editorEl = document.querySelector('.create-post-quill .ql-editor');
      if (!editorEl || !editorEl.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = null;
        return;
      }
      savedRangeRef.current = range.cloneRange();
    } catch (err) {
      savedRangeRef.current = null;
    }
  }, []);

  const insertEmojiAtSavedSelection = useCallback((emojiChar) => {
    if (!emojiChar) return;
    const saved = savedRangeRef.current;
    const editorEl = document.querySelector('.create-post-quill .ql-editor');
    if (saved) {
      const sel = window.getSelection && window.getSelection();
      sel.removeAllRanges();
      sel.addRange(saved);
      if (editorEl) {
        try {
          editorEl.focus();
        } catch (e) {
          //
        }
      }

      try {
        if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
          document.execCommand('insertText', false, emojiChar);
        }
      } catch (err) {
        //
      }

      savedRangeRef.current = null;
    } else {
      // No saved selection - fallback to appending or try execCommand at caret
      if (editorEl) {
        try {
          editorEl.focus();
          document.execCommand('insertText', false, emojiChar);
        } catch (e) {
          //
        }
      }
    }
  }, []);

  const onEmojiSelect = useCallback((emojiData, event) => {
    const emojiChar = (emojiData && (emojiData.emoji || emojiData.native)) || (event && (event.emoji || event.native)) || (typeof emojiData === 'string' && emojiData) || '';
    if (!emojiChar) return;
    insertEmojiAtSavedSelection(emojiChar);
    setShowEmojiPicker(false);
  }, [insertEmojiAtSavedSelection]);

  // Provide a small toolbar configuration so Quill renders a strike button.
  // This allows the programmatic `.click()` on `.ql-strike` to work.
  const modules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'strike', 'link'],
      [{ 'script': 'super' }, { 'script': 'sub' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ]
  }), []);

  const formats = useMemo(() => [
    'bold', 'italic', 'strike', 'script', 'link', 'list', 'bullet'
  ], []);

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
      setShowEmojiPicker(false)
      savedRangeRef.current = null
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

        {activeTab === 'details' ?
          (
            <div data-layer="Input field"
              className="InputField w-[778px] h-48 left-[24px] top-[251px] absolute bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#b7b7c2]"
            >
              <ReactQuill
                id="post-body"
                className="create-post-quill left-[0px] right-[16px] top-[55px] bottom-[16px] absolute text-sm text-[#17183b] font-normal font-['Inter'] leading-tight bg-transparent resize-none outline-none overflow-auto pr-2"
                editorClassName="font-inter"
                editorStyle={{ fontFamily: 'Inter, sans-serif' }}
                theme="snow"
                modules={modules}
                formats={formats}
                value={body}
                onChange={(t) => setBody(t)}
                placeholder={'Write your thoughts here. You can also include @mentions.'}
              />

              <div data-svg-wrapper data-layer="Frame" className="Frame left-[16px] top-[16px] absolute" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); toggleBold(); setToastMessage('Bold'); setShowToast(true); }}>
                <IconBold />
              </div>
              <div data-svg-wrapper data-layer="Frame" className="Frame left-[52px] top-[16px] absolute" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); toggleItalic(); setToastMessage('Italic'); setShowToast(true); }}>
                <IconItalic />
              </div>
              <div data-svg-wrapper data-layer="Frame" className="Frame left-[88px] top-[16px] absolute" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); toggleStrikethrough(); setToastMessage('Strikethrough'); setShowToast(true); }}>
                <IconStrikethrough />
              </div>
              <div data-svg-wrapper data-layer="Frame" className="Frame left-[124px] top-[16px] absolute" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); toggleSuperscript(); setToastMessage('Superscript'); setShowToast(true); }}>
                <IconSuperscript />
              </div>
              <div data-svg-wrapper data-layer="Frame" className="Frame left-[176px] top-[16px] absolute" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); toggleLink(); setToastMessage('Link'); setShowToast(true); }}>
                <IconLink />
              </div>
              <div data-svg-wrapper data-layer="Frame" className="Frame left-[212px] top-[16px] absolute" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); toggleBulletedList(); setToastMessage('List'); setShowToast(true); }}>
                <IconBulletedList />
              </div>
              <div data-svg-wrapper data-layer="Frame" className="Frame left-[248px] top-[16px] absolute" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); toggleNumberedList(); setToastMessage('Numbered List'); setShowToast(true); }}>
                <IconNumberedList />
              </div>
              <div className="left-0 right-0 top-[52px] absolute border-t border-[#b7b7c2]" />
              <div data-svg-wrapper data-layer="Line 8" className="Line8 left-[160px] top-[14px] absolute" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); setToastMessage('Separator'); setShowToast(true); }}>
                <IconDivider />
              </div>
              <div data-svg-wrapper data-layer="Line 9" className="Line9 left-[284px] top-[14px] absolute" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); setToastMessage('Separator'); setShowToast(true); }}>
                <IconDivider />
              </div>
              <div data-svg-wrapper data-layer="Frame" className="Frame left-[300px] top-[16px] absolute">
                <div className="relative inline-block">
                  <div onMouseDown={(e) => { e.preventDefault(); saveSelectionIfInEditor(); }} onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(v => !v); setToastMessage('Emoji'); setShowToast(true); }} role="button" tabIndex={0}>
                    <IconEmoji />
                  </div>
                  {showEmojiPicker && (
                    <div className="absolute z-50 mt-2" style={{ left: 0 }}>
                      <EmojiPicker onEmojiClick={onEmojiSelect} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
          :
          (
            selectedMedia.length === 0 ?
              (
                <div data-layer="Frame 48097060" className="Frame48097060 size- left-[24px] top-[147px] absolute inline-flex justify-start items-center gap-6">
                  <div data-layer="Input field" role="button" onClick={onOpenImagesPicker} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); onOpenImagesPicker() } }} className="InputField w-96 h-16 relative bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#b7b7c2] cursor-pointer">
                    <div data-layer="Label-text" className="LabelText left-[56px] top-[22px] absolute justify-start text-[#0a0a19] text-sm font-normal font-['Inter'] leading-tight">Add Images</div>
                    <div data-svg-wrapper data-layer="Frame" className="Frame left-[24px] top-[20px] absolute">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_215_1028)">
                          <path d="M8.813 11.612C9.27 11.232 9.731 11.232 10.199 11.623L10.307 11.721L15.293 16.707L15.387 16.79C15.5794 16.9391 15.8196 17.013 16.0626 16.9976C16.3056 16.9823 16.5346 16.8789 16.7067 16.7067C16.8789 16.5346 16.9823 16.3056 16.9976 16.0626C17.013 15.8196 16.9391 15.5794 16.79 15.387L16.707 15.293L15.415 14L15.707 13.707L15.813 13.612C16.27 13.232 16.731 13.232 17.199 13.623L17.307 13.721L21.981 18.396C21.8863 19.3483 21.4534 20.235 20.7608 20.8954C20.0681 21.5557 19.1617 21.9459 18.206 21.995L18 22H6C5.00791 21.9999 4.05124 21.6312 3.31576 20.9654C2.58028 20.2996 2.11847 19.3842 2.02 18.397L8.707 11.707L8.813 11.612ZM18 2C19.0262 2 20.0132 2.39444 20.7568 3.10172C21.5004 3.80901 21.9437 4.77504 21.995 5.8L22 6V15.585L18.707 12.293L18.557 12.156C17.301 11.061 15.707 11.059 14.461 12.139L14.307 12.279L14 12.585L11.707 10.293L11.557 10.156C10.301 9.061 8.707 9.059 7.461 10.139L7.307 10.279L2 15.585V6C2 4.97376 2.39444 3.98677 3.10172 3.24319C3.80901 2.4996 4.77504 2.05631 5.8 2.005L6 2H18ZM15.01 7L14.883 7.007C14.64 7.03591 14.4159 7.15296 14.2534 7.33596C14.0909 7.51897 14.0011 7.75524 14.0011 8C14.0011 8.24476 14.0909 8.48103 14.2534 8.66403C14.4159 8.84704 14.64 8.96409 14.883 8.993L15 9L15.127 8.993C15.37 8.96409 15.5941 8.84704 15.7566 8.66403C15.9191 8.48103 16.0089 8.24476 16.0089 8C16.0089 7.75524 15.9191 7.51897 15.7566 7.33596C15.5941 7.15296 15.37 7.03591 15.127 7.007L15.01 7Z" fill="#AA336A" />
                        </g>
                        <defs>
                          <clipPath id="clip0_215_1028">
                            <rect width="24" height="24" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  <div data-layer="Input field" role="button" onClick={onOpenVideoPicker} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); onOpenVideoPicker() } }} className="InputField w-96 h-16 relative bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#b7b7c2] cursor-pointer">
                    <div data-layer="Label-text" className="LabelText left-[56px] top-[22px] absolute justify-start text-[#0a0a19] text-sm font-normal font-['Inter'] leading-tight">Add video</div>
                    <div data-svg-wrapper data-layer="Frame" className="Frame left-[24px] top-[20px] absolute">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_215_1033)">
                          <path d="M18 3C18.6566 3 19.3068 3.12933 19.9134 3.3806C20.52 3.63188 21.0712 4.00017 21.5355 4.46447C21.9998 4.92876 22.3681 5.47995 22.6194 6.08658C22.8707 6.69321 23 7.34339 23 8V16C23 16.6566 22.8707 17.3068 22.6194 17.9134C22.3681 18.52 21.9998 19.0712 21.5355 19.5355C21.0712 19.9998 20.52 20.3681 19.9134 20.6194C19.3068 20.8707 18.6566 21 18 21H6C5.34339 21 4.69321 20.8707 4.08658 20.6194C3.47995 20.3681 2.92876 19.9998 2.46447 19.5355C1.52678 18.5979 1 17.3261 1 16V8C1 6.67392 1.52678 5.40215 2.46447 4.46447C3.40215 3.52678 4.67392 3 6 3H18ZM9 9V15C9.00014 15.1768 9.04718 15.3505 9.13631 15.5032C9.22545 15.656 9.35349 15.7823 9.50739 15.8695C9.66129 15.9566 9.83555 16.0013 10.0124 15.9991C10.1892 15.9969 10.3623 15.9479 10.514 15.857L15.514 12.857C15.6619 12.7681 15.7842 12.6425 15.8691 12.4923C15.9541 12.3421 15.9987 12.1725 15.9987 12C15.9987 11.8275 15.9541 11.6579 15.8691 11.5077C15.7842 11.3575 15.6619 11.2319 15.514 11.143L10.514 8.143C10.3623 8.0521 10.1892 8.00306 10.0124 8.00087C9.83555 7.99868 9.66129 8.04342 9.50739 8.13054C9.35349 8.21765 9.22545 8.34402 9.13631 8.49677C9.04718 8.64951 9.00014 8.82315 9 9Z" fill="#AA336A" />
                        </g>
                        <defs>
                          <clipPath id="clip0_215_1033">
                            <rect width="24" height="24" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>
              )
              :
              (
                <div data-layer="Media layout" className="left-[24px] top-[147px] absolute w-[778px] h-72">
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <div className="relative bg-white rounded-2xl overflow-hidden">
                        {(() => {
                          const activeFile = selectedMedia && selectedMedia[activeMediaIndex]
                          const activeUrl = previewUrls && previewUrls[activeMediaIndex]
                          if (activeFile && activeFile.type && activeFile.type.startsWith('video/')) {
                            return activeUrl ? (
                              <video src={activeUrl} controls className="w-full h-56 object-cover bg-black" />
                            ) : (
                              <div className="w-full h-56 bg-[#f2f2f4]" />
                            )
                          }

                          return activeUrl ? (
                            <img src={activeUrl} alt={`preview-${activeMediaIndex}`} className="w-full h-56 object-cover" />
                          ) : (
                            <div className="w-full h-56 bg-[#f2f2f4]" />
                          )
                        })()}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="text-[#454662] text-sm">{`${activeMediaIndex + 1} of ${selectedMedia.length}`}</div>
                        <button type="button" onClick={removeSelectedMedia} className="text-sm text-[#454662] hover:text-[#17183b]">
                          Remove all
                        </button>
                      </div>

                      <div className="mt-2">
                        <button type="button" onClick={onOpenImagesPicker} className="text-sm text-[#0a0a19] inline-flex items-center gap-2">
                          Add more photos
                        </button>
                      </div>
                    </div>

                    <div className="w-1/2 bg-[#f2f2f4] rounded-tl-xl rounded-bl-xl p-4">
                      <div className="text-[#17183b] text-base font-medium">Drag to rearrange the images</div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        {previewUrls.map((url, idx) => (
                          <div
                            key={idx}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDropOnIndex(e, idx)}
                            className={`relative rounded-lg overflow-hidden ${activeMediaIndex === idx ? 'ring-2 ring-[#79244b]' : ''}`}
                          >
                            {selectedMedia && selectedMedia[idx] && selectedMedia[idx].type && selectedMedia[idx].type.startsWith('video/') ? (
                              <div className="relative">
                                <video src={url} muted playsInline className="w-full h-24 object-cover cursor-pointer" onClick={() => setActiveMediaIndex(idx)} />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 5v14l11-7L8 5z" fill="#fff" opacity="0.9" />
                                  </svg>
                                </div>
                              </div>
                            ) : (
                              <img src={url} alt={`thumb-${idx}`} className="w-full h-24 object-cover cursor-pointer" onClick={() => setActiveMediaIndex(idx)} />
                            )}
                            <button type="button" onClick={(e) => { e.stopPropagation(); removeMediaAtIndex(idx) }} className="absolute top-2 right-2 bg-white rounded-full p-1">
                              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.5 3.5L3.5 10.5" stroke="#64647C" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M3.5 3.5L10.5 10.5" stroke="#64647C" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
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

          <div
            data-layer="Input field"
            className={`InputField w-[772px] left-[24px] absolute bg-white rounded-2xl flex flex-col ${(tagFocused || tagInput) ? 'shadow-[0px_4px_8px_0px_rgba(10,10,25,0.16)] outline outline-1 outline-offset-[-1px] outline-[#0a0a19]' : 'outline outline-1 outline-offset-[-1px] outline-[#b7b7c2]'}`}
            style={{ top: `573px` }}
          >
            <div className="flex items-center px-4 gap-2 h-12">
              <div className="text-[#454662] text-sm font-normal">#</div>
              <input
                type="text"
                aria-label="Add tag"
                value={tagInput}
                onFocus={() => setTagFocused(true)}
                onBlur={() => setTagFocused(false)}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag"
                className={`ml-3 bg-transparent outline-none text-sm flex-1 placeholder:text-[#64647c] ${(tagFocused || tagInput) ? 'text-[#0a0a19]' : 'text-[#151636]'}`}
              />
            </div>

            {tagInput && (
              (() => {
                const SUGGESTIONS = ['MarketingStrategy', 'GrowthStrategy', 'DigitalStrategy', 'SalesStrategy']
                const filtered = SUGGESTIONS.filter(s => s.toLowerCase().includes((tagInput || '').toLowerCase()))
                return (
                  <div className="absolute left-0 z-50" style={{ left: 0, bottom: 'calc(100% + 12px)' }}>
                    {filtered.length ? (
                      <div className="Frame48097064 w-60 h-40 relative bg-white rounded-xl shadow-[0px_0px_12px_0px_rgba(10,10,25,0.24)] overflow-hidden">
                        <div className="p-2">
                          {filtered.map((s) => (
                            <div key={s} onMouseDown={(e) => { e.preventDefault(); addTag(s); }} className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50">
                              <div className="w-4 h-4 rounded-sm border border-[#B7B7C2] flex-shrink-0" />
                              <div className="text-[#10112a] text-sm font-normal">{s}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="Frame48097063 w-44 h-12 relative bg-white rounded-xl shadow-[0px_0px_12px_0px_rgba(10,10,25,0.24)] overflow-hidden"
                        onMouseDown={(e) => { e.preventDefault(); addTag(tagInput); }}
                        role="button"
                      >
                        <div className="LabelText left-[16px] top-1/2 absolute -translate-y-1/2 justify-start flex items-center gap-1">
                          <span className="text-[#9b2e60] text-sm font-normal font-['Inter'] leading-tight">Create tag</span>
                          <span className="text-[#9b2e60] text-sm font-medium font-['Inter'] leading-tight"> “{tagInput}”</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()
            )}

            <div className="px-4 pb-3 mt-4 absolute top-12">
              <div className="flex items-center gap-3 flex-wrap">
                {tags.map((t) => (
                  <div key={t} className="Tag h-6 px-3 py-1 bg-[#f2f2f4] rounded-lg inline-flex justify-center items-center gap-1">
                    <div className="DropdownText justify-start text-[#10112a] text-xs font-normal font-['Inter'] leading-tight">#{t}</div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(t) }} aria-label={`Remove ${t}`} className="Frame relative">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.5 3.5L3.5 10.5" stroke="#64647C" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3.5 3.5L10.5 10.5" stroke="#64647C" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
