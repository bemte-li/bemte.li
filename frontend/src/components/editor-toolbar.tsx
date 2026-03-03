'use client'

import { type Editor } from '@tiptap/react'
import { useState, useCallback } from 'react'

interface EditorToolbarProps {
  editor: Editor | null
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  const base = 'py-1 px-2 text-xs transition-colors border'
  const inactive = `${base} bg-marfim border-sombra/20 hover:border-sombra text-sombra`
  const active = `${base} bg-citrino border-sombra text-sombra`

  const cls = useCallback(
    (name: string, attrs?: Record<string, unknown>) => {
      if (!editor) return inactive
      return editor.isActive(name, attrs) ? active : inactive
    },
    [editor, active, inactive]
  )

  if (!editor) return null

  const applyLink = () => {
    if (linkUrl.trim()) {
      editor.chain().focus().toggleLink({ href: linkUrl.trim() }).run()
    }
    setLinkUrl('')
    setLinkPopoverOpen(false)
  }

  const removeLink = () => {
    editor.chain().focus().unsetLink().run()
    setLinkPopoverOpen(false)
  }

  const insertImage = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl.trim() }).run()
    }
    setImageUrl('')
    setImagePopoverOpen(false)
  }

  return (
    <div className="sticky top-0 z-50 bg-marfim border-b border-sombra/10 py-2 px-0 -mx-0">
      <div className="flex flex-nowrap gap-0.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Text style */}
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={cls('bold')} title="Negrito">
          <strong>N</strong>
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={cls('italic')} title="Itálico">
          <em>I</em>
        </button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={cls('underline')} title="Sublinhado">
          <span className="underline">S</span>
        </button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={cls('strike')} title="Riscado">
          <span className="line-through">R</span>
        </button>
        <button onClick={() => editor.chain().focus().toggleSuperscript().run()} className={cls('superscript')} title="Sobreescrito">
          x<sup>2</sup>
        </button>

        <span className="w-px bg-sombra/15 mx-0.5 self-stretch" />

        {/* Headings */}
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={cls('heading', { level: 1 })} title="Título 1">
          T1
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={cls('heading', { level: 2 })} title="Título 2">
          T2
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={cls('heading', { level: 3 })} title="Título 3">
          T3
        </button>

        <span className="w-px bg-sombra/15 mx-0.5 self-stretch" />

        {/* Block elements */}
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={cls('blockquote')} title="Citação">
          &ldquo;&rdquo;
        </button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={cls('bulletList')} title="Lista">
          •
        </button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={cls('orderedList')} title="Lista numerada">
          1.
        </button>
        <button onClick={() => editor.chain().focus().toggleCode().run()} className={cls('code')} title="Código">
          {'</>'}
        </button>
        <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className={inactive} title="Divisor">
          —
        </button>

        <span className="w-px bg-sombra/15 mx-0.5 self-stretch" />

        {/* Alignment */}
        <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={cls('', { textAlign: 'left' })} title="Alinhar esquerda">
          ←
        </button>
        <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={cls('', { textAlign: 'center' })} title="Centralizar">
          ↔
        </button>
        <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={cls('', { textAlign: 'right' })} title="Alinhar direita">
          →
        </button>

        <span className="w-px bg-sombra/15 mx-0.5 self-stretch" />

        {/* Link */}
        <div className="relative">
          <button
            onClick={() => {
              setImagePopoverOpen(false)
              setLinkPopoverOpen((v) => !v)
            }}
            className={editor.isActive('link') ? active : inactive}
            title="Link"
          >
            🔗
          </button>
          {linkPopoverOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-marfim border border-sombra/20 shadow-md p-3 flex flex-col gap-2 min-w-[240px]">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyLink()}
                placeholder="https://..."
                className="border border-sombra/30 px-2 py-1 text-sm bg-marfim text-sombra outline-none focus:border-sombra w-full"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={applyLink} className="bg-citrino text-sombra px-3 py-1 text-xs">
                  Aplicar
                </button>
                {editor.isActive('link') && (
                  <button onClick={removeLink} className="border border-sombra/30 text-sombra px-3 py-1 text-xs hover:border-sombra">
                    Remover
                  </button>
                )}
                <button onClick={() => setLinkPopoverOpen(false)} className="ml-auto text-sombra/50 hover:text-sombra text-xs px-2">
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Image */}
        <div className="relative">
          <button
            onClick={() => {
              setLinkPopoverOpen(false)
              setImagePopoverOpen((v) => !v)
            }}
            className={inactive}
            title="Imagem"
          >
            🖼
          </button>
          {imagePopoverOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-marfim border border-sombra/20 shadow-md p-3 flex flex-col gap-2 min-w-[240px]">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && insertImage()}
                placeholder="URL da imagem..."
                className="border border-sombra/30 px-2 py-1 text-sm bg-marfim text-sombra outline-none focus:border-sombra w-full"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={insertImage} className="bg-citrino text-sombra px-3 py-1 text-xs">
                  Inserir
                </button>
                <button onClick={() => setImagePopoverOpen(false)} className="ml-auto text-sombra/50 hover:text-sombra text-xs px-2">
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
