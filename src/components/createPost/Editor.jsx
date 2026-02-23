import { useCallback, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconSuperscript,
  IconLink,
  IconBulletedList,
  IconNumberedList,
  IconDivider,
  IconEmoji,
} from '@/components/createPost/ToolbarIcons'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

export default function Editor({ value, onChange, onToast }) {
  const toast = (message) => {
    if (typeof onToast === 'function') onToast(message)
  }

  const toggleBold = useCallback(() => {
    const builtinBold = document.querySelector('.ql-toolbar button.ql-bold')
    if (builtinBold) {
      builtinBold.click()
      return
    }
  }, [])

  const toggleItalic = useCallback(() => {
    const builtinItalic = document.querySelector('.ql-toolbar button.ql-italic')
    if (builtinItalic) {
      builtinItalic.click()
      return
    }
  }, [])

  const toggleStrikethrough = useCallback(() => {
    const builtinStrike = document.querySelector('.ql-toolbar button.ql-strike')
    if (builtinStrike) {
      builtinStrike.click()
      return
    }
  }, [])

  const toggleSuperscript = useCallback(() => {
    const btn = document.querySelector('.ql-toolbar button.ql-script[value="super"]')
    if (btn) btn.click()
  }, [])

  const toggleLink = useCallback(() => {
    const builtinLink = document.querySelector('.ql-toolbar button.ql-link')
    if (builtinLink) {
      builtinLink.click()
      // Focus the tooltip input so the user can type the URL immediately.
      setTimeout(() => {
        const input = document.querySelector('.ql-tooltip input[data-link], .ql-tooltip input')
        if (input) {
          try {
            input.focus()
            if (input.select) input.select()
            input.setAttribute('placeholder', 'https://corpgossip.com')
            input.setAttribute('data-link', 'https://corpgossip.com')
          } catch (err) {
            // ignore
          }
        }
      }, 0)
      return
    }
  }, [])

  const toggleBulletedList = useCallback(() => {
    const btn = document.querySelector('.ql-toolbar button.ql-list[value="bullet"]')
    if (btn) {
      btn.click()
      return
    }
  }, [])

  const toggleNumberedList = useCallback(() => {
    const btn = document.querySelector('.ql-toolbar button.ql-list[value="ordered"]')
    if (btn) {
      btn.click()
      return
    }
  }, [])

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const savedRangeRef = useRef(null)

  const saveSelectionIfInEditor = useCallback(() => {
    try {
      const sel = window.getSelection && window.getSelection()
      if (!sel || sel.rangeCount === 0) {
        savedRangeRef.current = null
        return
      }
      const range = sel.getRangeAt(0)
      const editorEl = document.querySelector('.create-post-quill .ql-editor')
      if (!editorEl || !editorEl.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = null
        return
      }
      savedRangeRef.current = range.cloneRange()
    } catch (err) {
      savedRangeRef.current = null
    }
  }, [])

  const insertEmojiAtSavedSelection = useCallback((emojiChar) => {
    if (!emojiChar) return
    const saved = savedRangeRef.current
    const editorEl = document.querySelector('.create-post-quill .ql-editor')
    if (saved) {
      const sel = window.getSelection && window.getSelection()
      sel.removeAllRanges()
      sel.addRange(saved)
      if (editorEl) {
        try {
          editorEl.focus()
        } catch (e) {
          //
        }
      }

      try {
        if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
          document.execCommand('insertText', false, emojiChar)
        }
      } catch (err) {
        //
      }

      savedRangeRef.current = null
    } else {
      // No saved selection - fallback to appending or try execCommand at caret
      if (editorEl) {
        try {
          editorEl.focus()
          document.execCommand('insertText', false, emojiChar)
        } catch (e) {
          //
        }
      }
    }
  }, [])

  const onEmojiSelect = useCallback((emojiData, event) => {
    const emojiChar = (emojiData && (emojiData.emoji || emojiData.native)) || (event && (event.emoji || event.native)) || (typeof emojiData === 'string' && emojiData) || ''
    if (!emojiChar) return
    insertEmojiAtSavedSelection(emojiChar)
    setShowEmojiPicker(false)
  }, [insertEmojiAtSavedSelection])

  // Provide a small toolbar configuration so Quill renders a strike button.
  // This allows the programmatic `.click()` on `.ql-strike` to work.
  const modules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'strike', 'link'],
      [{ 'script': 'super' }, { 'script': 'sub' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ]
  }), [])

  const formats = useMemo(() => [
    'bold', 'italic', 'strike', 'script', 'link', 'list', 'bullet'
  ], [])

  return (
    <div
      data-layer="Input field"
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
        value={value}
        onChange={(t) => onChange(t)}
        placeholder={'Write your thoughts here. You can also include @mentions.'}
      />

      <div data-svg-wrapper data-layer="Frame" className="Frame left-[16px] top-[16px] absolute" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); toggleBold(); toast('Bold') }}>
        <IconBold />
      </div>
      <div data-svg-wrapper data-layer="Frame" className="Frame left-[52px] top-[16px] absolute" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); toggleItalic(); toast('Italic') }}>
        <IconItalic />
      </div>
      <div data-svg-wrapper data-layer="Frame" className="Frame left-[88px] top-[16px] absolute" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); toggleStrikethrough(); toast('Strikethrough') }}>
        <IconStrikethrough />
      </div>
      <div data-svg-wrapper data-layer="Frame" className="Frame left-[124px] top-[16px] absolute" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); toggleSuperscript(); toast('Superscript') }}>
        <IconSuperscript />
      </div>
      <div data-svg-wrapper data-layer="Frame" className="Frame left-[176px] top-[16px] absolute" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); toggleLink(); toast('Link') }}>
        <IconLink />
      </div>
      <div data-svg-wrapper data-layer="Frame" className="Frame left-[212px] top-[16px] absolute" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); toggleBulletedList(); toast('List') }}>
        <IconBulletedList />
      </div>
      <div data-svg-wrapper data-layer="Frame" className="Frame left-[248px] top-[16px] absolute" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); toggleNumberedList(); toast('Numbered List') }}>
        <IconNumberedList />
      </div>
      <div className="left-0 right-0 top-[52px] absolute border-t border-[#b7b7c2]" />
      <div data-svg-wrapper data-layer="Line 8" className="Line8 left-[160px] top-[14px] absolute" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); toast('Separator') }}>
        <IconDivider />
      </div>
      <div data-svg-wrapper data-layer="Line 9" className="Line9 left-[284px] top-[14px] absolute" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); toast('Separator') }}>
        <IconDivider />
      </div>
      <div data-svg-wrapper data-layer="Frame" className="Frame left-[300px] top-[16px] absolute">
        <div className="relative inline-block">
          <div onMouseDown={(e) => { e.preventDefault(); saveSelectionIfInEditor() }} onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(v => !v); toast('Emoji') }} role="button" tabIndex={0}>
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
}
