import { EditorOptions } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { common, createLowlight } from 'lowlight'

const lowlight = createLowlight(common)

export const editorExtensions: EditorOptions['extensions'] = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3, 4],
    },
    codeBlock: false, // We'll use CodeBlockLowlight instead
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
  Image.configure({
    inline: true,
    allowBase64: false,
    HTMLAttributes: {
      class: 'rounded-lg max-w-full h-auto',
    },
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-blue-600 hover:text-blue-700 underline',
    },
  }),
  Table.configure({
    resizable: true,
    HTMLAttributes: {
      class: 'border-collapse table-auto w-full',
    },
  }),
  TableRow.configure({
    HTMLAttributes: {
      class: 'border border-gray-300',
    },
  }),
  TableHeader.configure({
    HTMLAttributes: {
      class: 'border border-gray-300 bg-gray-100 px-4 py-2 font-semibold text-left',
    },
  }),
  TableCell.configure({
    HTMLAttributes: {
      class: 'border border-gray-300 px-4 py-2',
    },
  }),
  CodeBlockLowlight.configure({
    lowlight,
    HTMLAttributes: {
      class: 'bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto',
    },
  }),
  Placeholder.configure({
    placeholder: 'Start writing your blog post...',
    emptyEditorClass: 'is-editor-empty',
  }),
  CharacterCount.configure({
    limit: 50000, // 50k character limit
  }),
]

export const editorProps: EditorOptions['editorProps'] = {
  attributes: {
    class:
      'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[500px] px-6 py-4',
  },
}
