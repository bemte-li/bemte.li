'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { getClientSideInstance, getPocketBaseFileUrl } from '@/lib/pocketbase'

function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Zm6-13.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    </svg>
  )
}

export interface RodapeData {
  autor: string
  descricao: string
  foto: string | null
  fotoPreviewUrl?: string | null
}

interface RodapeEditorProps {
  value: RodapeData
  onChange: (data: RodapeData) => void
  onBioEditorReady?: (editor: Editor) => void
}

export default function RodapeEditor({ value, onChange, onBioEditorReady }: RodapeEditorProps) {
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const bioEditor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        bulletList: false,
        orderedList: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-bordo underline cursor-pointer',
        },
      }),
    ],
    content: value.descricao,
    editorProps: {
      attributes: {
        class: 'text-lg text-sombra outline-none focus:outline-none min-h-[2em] prose prose-lg max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange({ ...value, descricao: editor.getHTML() })
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (bioEditor) {
      onBioEditorReady?.(bioEditor)
    }
  }, [bioEditor, onBioEditorReady])

  useEffect(() => {
    if (bioEditor && value.descricao !== bioEditor.getHTML()) {
      bioEditor.commands.setContent(value.descricao)
    }
  }, [bioEditor, value.descricao])

  useEffect(() => {
    if (loaded) return
    const pb = getClientSideInstance()

    async function fetchRodape() {
      try {
        const niusleterList = await pb.collection('niusleteres').getList(1, 1, {
          filter: `caminho="diario-de-borda"`,
          requestKey: null,
        })
        if (niusleterList.items.length === 0) return

        const niusleterId = niusleterList.items[0].id
        const rodapeList = await pb.collection('rodapes').getList(1, 1, {
          filter: `niusleter="${niusleterId}"`,
          sort: '-created',
          requestKey: null,
        })

        if (rodapeList.items.length === 0) return

        const rodape = rodapeList.items[0]
        const fotoUrl = rodape.foto
          ? getPocketBaseFileUrl('rodapes', rodape.id, rodape.foto)
          : null

        onChange({
          autor: rodape.autor || '',
          descricao: rodape.descricao || '',
          foto: rodape.foto || null,
          fotoPreviewUrl: fotoUrl,
        })
        setLoaded(true)
      } catch (err) {
        console.error('[RodapeEditor] Error fetching rodapé:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRodape()
  }, [loaded, onChange])

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const previewUrl = URL.createObjectURL(file)
    onChange({ ...value, fotoPreviewUrl: previewUrl })
  }

  const displayUrl = value.fotoPreviewUrl || null

  return (
    <div className="mt-16">
      <div className="flex items-start gap-4 p-4 rounded-lg">
        {/* Foto */}
        <div className="relative w-24 h-32 flex-shrink-0">
          <div
            className="w-full h-full border border-sombra overflow-hidden relative cursor-pointer group/foto"
            onClick={() => fileInputRef.current?.click()}
            title="Clique para trocar a foto"
          >
            {displayUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayUrl}
                alt="Foto do autor"
                className="object-cover w-full h-full block"
              />
            ) : (
              <div className="w-full h-full bg-sombra/10 flex items-center justify-center">
                {loading ? (
                  <span className="text-xs text-sombra/40 animate-pulse">…</span>
                ) : (
                  <PhotoIcon className="w-10 h-10 text-sombra/30" />
                )}
              </div>
            )}
            <div className="absolute inset-0 bg-sombra/0 group-hover/foto:bg-sombra/20 transition-colors flex items-center justify-center">
              <PhotoIcon className="w-8 h-8 opacity-0 group-hover/foto:opacity-100 text-marfim transition-opacity" />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleFotoChange}
          />
        </div>

        {/* Text fields */}
        <div className="flex flex-col min-w-0 flex-1">
          <p className="text-sm font-mono mb-1">
            Escrito por
          </p>
          <input
            type="text"
            value={value.autor}
            onChange={(e) => onChange({ ...value, autor: e.target.value })}
            placeholder="Nome do autor"
            className="font-bold text-4xl font-mono bg-transparent outline-none border-b border-transparent hover:border-sombra/20 focus:border-sombra transition-colors mb-2 text-sombra"
          />
          {loading ? (
            <div className="h-4 bg-sombra/10 rounded animate-pulse w-3/4" />
          ) : (
            <EditorContent editor={bioEditor} />
          )}
        </div>
      </div>
    </div>
  )
}
