// components/MediaPicker.jsx
import { useState } from 'react'

export default function MediaPicker({ onChange }) {
  const [items, setItems] = useState([])

  const handleFiles = (files) => {
    const arr = Array.from(files)
    const newItems = arr.map(file => ({ type: 'file', file }))
    const updated = [...items, ...newItems]
    setItems(updated)
    onChange(updated)
  }

  const handleUrl = (e) => {
    e.preventDefault()
    const url = e.target.elements.url.value.trim()
    if (url) {
      const newItems = [...items, { type: 'url', url }]
      setItems(newItems)
      onChange(newItems)
      e.target.reset()
    }
  }

  const removeItem = (index) => {
    const updated = items.filter((_, i) => i !== index)
    setItems(updated)
    onChange(updated)
  }

  return (
    <div className="absolute bottom-90 left-100 border rounded-2xl p-4 space-y-3">
      {/* File input */}
      <input
        type="file"
        multiple
        id="media-file-input"
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      <label htmlFor="media-file-input" className="block cursor-pointer">
        <div className="w-full p-6 border-2 border-dashed rounded-xl text-center text-gray-500 hover:bg-gray-50">
          Drag & drop files or click to upload
        </div>
      </label>

      {/* URL insert */}
      <form onSubmit={handleUrl} className="flex gap-2">
        <input
          name="url"
          type="url"
          placeholder="Paste media link (YouTube, Vimeo, image...)"
          className="flex-1 border rounded-xl px-3 py-2"
        />
        <button
          type="submit"
          className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          Add
        </button>
      </form>

      {/* Preview list */}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg"
          >
            {item.type === 'file' ? (
              <span className="text-sm text-gray-700">📁 {item.file.name}</span>
            ) : (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 underline truncate max-w-xs"
              >
                🔗 {item.url}
              </a>
            )}
            <button
              onClick={() => removeItem(idx)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
