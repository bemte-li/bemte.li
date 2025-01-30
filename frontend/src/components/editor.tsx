'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { useEffect } from 'react'

interface MenuBarProps {
  editor: any
}

const MenuBar = ({ editor }: MenuBarProps) => {
  if (!editor) {
    return null
  }

  const basicClasses = "bg-marfim border border-sombra/20 hover:border-sombra text-sombra font-bold py-2 px-4 transition-colors"
  const activeClasses = "bg-citrino border border-sombra text-sombra font-bold py-2 px-4"

  const isActive = (command: string, attrs: any = null) => {
    if (attrs) {
      return editor.isActive(command, attrs) ? activeClasses : basicClasses
    }
    return editor.isActive(command) ? activeClasses : basicClasses
  }

  return (
    <div className='w-full flex justify-start gap-2 mb-4 flex-wrap'>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={isActive('heading', { level: 1 })}
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={isActive('heading', { level: 2 })}
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={isActive('bold')}
      >
        Negrito
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={isActive('italic')}
      >
        Itálico
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={isActive('strike')}
      >
        Riscado
      </button>
      <button 
        onClick={() => editor.chain().focus().setTextAlign('left').run()} 
        className={isActive('textAlign', { textAlign: 'left' })}
      >
        ←
      </button>
      <button 
        onClick={() => editor.chain().focus().setTextAlign('center').run()} 
        className={isActive('textAlign', { textAlign: 'center' })}
      >
        ↔
      </button>
      <button 
        onClick={() => editor.chain().focus().setTextAlign('right').run()} 
        className={isActive('textAlign', { textAlign: 'right' })}
      >
        →
      </button>
    </div>
  )
}

interface TextEditorProps {
  onUpdate?: (html: string) => void
  initialContent?: string
}

export default function TextEditor({ onUpdate, initialContent = '' }: TextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none min-h-[500px]',
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML())
    },
    immediatelyRender: false
  })

  // Update content when initialContent changes
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent)
    }
  }, [editor, initialContent])

  return (
    <div className="border border-sombra/20 rounded-lg p-4">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}