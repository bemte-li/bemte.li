'use client'

import { useEditor, EditorContent, useCurrentEditor, EditorProvider, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ListItem from '@tiptap/extension-list-item'
import TextAlign from '@tiptap/extension-text-align'

const MenuBar = ({editor} : {editor: Editor | null}) => {
  if (!editor) {
    return null
  }

  const basicClasses = "bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4"
  const activeClasses = "bg-gray-400 text-gray-800 font-bold py-2 px-4"

  const isActive = (command: string, attrs: any = null) => {
    if (attrs) {
      return editor.isActive(command, attrs) ? activeClasses : basicClasses
    }
    return editor.isActive(command) ? activeClasses : basicClasses
  }

  return (
    <div className='w-full flex justify-center'>
        <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={isActive('heading', { level: 1 })}
      >
        h1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={isActive('heading', { level: 2 })}
      >
        h2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={isActive('heading', { level: 3 })}
      >
        h3
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={isActive('bold')}
      >
        N
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={isActive('italic')}
      >
        I
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={isActive('strike')}
      >
        S
      </button>
      <button 
        onClick={() => editor.chain().focus().setTextAlign('left').run()} 
        className={isActive('textAlign', { textAlign: 'left' })}
      >
        esq
      </button>
      <button 
        onClick={() => editor.chain().focus().setTextAlign('center').run()} 
        className={isActive('textAlign', { textAlign: 'center' })}
        >
        centro
      </button>
      <button 
        onClick={() => editor.chain().focus().setTextAlign('right').run()} 
        className={isActive('textAlign', { textAlign: 'right' })}
      >
        dir
      </button>
    </div>
  )
}

export default function TextEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    editorProps: {
      attributes: {
        spellcheck: 'false',
        class: 'max-w-full h-96',
      },
    },
  })

  return (
    <div>
      <MenuBar editor={editor} />
      <EditorContent 
        editor={editor} 
        className='max-w-full h-96'
      />
    </div>
  )
}