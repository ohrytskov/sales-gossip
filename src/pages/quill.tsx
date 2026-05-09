import { useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'
import SeoHead from '@/components/seo/SeoHead'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

export default function QuillPage() {
  const toggleBold = useCallback(() => {
    const builtinBold = document.querySelector('.ql-toolbar button.ql-bold')
    if (builtinBold) {
      builtinBold.click()
    }
  }, [])

  const modules = useMemo(
    () => ({
      toolbar: [
        ['bold', 'italic', 'strike', 'link'],
        [{ script: 'super' }, { script: 'sub' }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['clean'],
      ],
    }),
    []
  )

  const formats = useMemo(() => ['bold', 'italic', 'strike', 'script', 'link', 'list', 'bullet'], [])

  return (
    <div className="p-5">
      <SeoHead
        title="Quill"
        description="Rich text editor demo for CorporateGossip."
        noindex
      />
      <h1 className="text-2xl font-semibold mb-3">Custom Quill Editor</h1>

      <button
        className="my-2 py-2 px-3 border border-blue-500 text-blue-500 rounded"
        onMouseDown={e => e.preventDefault()}
        onClick={toggleBold}
      >
        Custom Toggle Bold
      </button>

      <ReactQuill className="h-48" theme="snow" modules={modules} formats={formats} defaultValue="Try the custom button now." />
    </div>
  )
}
