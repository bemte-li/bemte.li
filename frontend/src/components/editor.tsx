'use client'

import { useRouter } from 'next/navigation'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Superscript from '@tiptap/extension-superscript'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { useEffect } from 'react'
import { Highlight } from './Highlight'
import EditorToolbar from './editor-toolbar'

export function EditorVoltarButton() {
  const router = useRouter()
  const handleVoltar = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }
    router.push('/casa')
  }
  return (
    <button
      type="button"
      onClick={handleVoltar}
      className="text-black bg-transparent border-0 p-0 cursor-pointer font-inherit"
      aria-label="Voltar"
    >
      <Highlight color="citrino" className="text-4xl">
        ←
      </Highlight>
    </button>
  )
}

interface TextEditorProps {
  onUpdate?: (html: string) => void
  initialContent?: string
  showToolbar?: boolean
  onEditorReady?: (editor: Editor) => void
}

export default function TextEditor({
  onUpdate,
  initialContent = '',
  showToolbar = true,
  onEditorReady,
}: TextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Superscript,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-bordo underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px]',
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML())
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (editor) {
      onEditorReady?.(editor)
    }
  }, [editor, onEditorReady])

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent)
    }
  }, [editor, initialContent])

  return (
    <div>
      {showToolbar && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}
