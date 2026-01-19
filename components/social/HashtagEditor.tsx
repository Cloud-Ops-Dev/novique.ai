'use client'

import { useState, KeyboardEvent } from 'react'

interface HashtagEditorProps {
  hashtags: string[]
  onChange: (hashtags: string[]) => void
  max?: number
  placeholder?: string
  className?: string
}

export default function HashtagEditor({
  hashtags,
  onChange,
  max = 30,
  placeholder = 'Add hashtag...',
  className = '',
}: HashtagEditorProps) {
  const [inputValue, setInputValue] = useState('')

  const addHashtag = (tag: string) => {
    const cleanTag = tag.replace(/^#/, '').trim().toLowerCase()
    if (!cleanTag) return
    if (hashtags.includes(cleanTag)) return
    if (hashtags.length >= max) return

    onChange([...hashtags, cleanTag])
    setInputValue('')
  }

  const removeHashtag = (tag: string) => {
    onChange(hashtags.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addHashtag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && hashtags.length > 0) {
      removeHashtag(hashtags[hashtags.length - 1])
    }
  }

  const handleInputChange = (value: string) => {
    // If user pastes or types a comma, split and add
    if (value.includes(',')) {
      const parts = value.split(',')
      parts.forEach((part) => addHashtag(part))
      return
    }
    setInputValue(value)
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-white min-h-[80px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        {hashtags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeHashtag(tag)}
              className="hover:text-blue-600 focus:outline-none"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </span>
        ))}
        {hashtags.length < max && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hashtags.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[100px] border-none outline-none text-sm bg-transparent"
          />
        )}
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>Press Enter or comma to add</span>
        <span>
          {hashtags.length} / {max}
        </span>
      </div>
    </div>
  )
}
