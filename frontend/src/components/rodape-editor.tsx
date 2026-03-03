'use client'

import { useEffect, useRef, useState } from 'react'
import { getClientSideInstance, getPocketBaseFileUrl } from '@/lib/pocketbase'

export interface RodapeData {
  autor: string
  descricao: string
  foto: string | null
  fotoPreviewUrl?: string | null
}

interface RodapeEditorProps {
  value: RodapeData
  onChange: (data: RodapeData) => void
}

export default function RodapeEditor({ value, onChange }: RodapeEditorProps) {
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const descRef = useRef<HTMLDivElement>(null)

  // Fetch rodapé from PocketBase on mount (only once)
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

  // Sync descricao contentEditable on external value changes
  useEffect(() => {
    if (descRef.current && descRef.current.innerHTML !== value.descricao) {
      descRef.current.innerHTML = value.descricao
    }
  }, [value.descricao])

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
                  <span className="text-2xl text-sombra/30">+</span>
                )}
              </div>
            )}
            <div className="absolute inset-0 bg-sombra/0 group-hover/foto:bg-sombra/20 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover/foto:opacity-100 text-marfim text-xs font-mono transition-opacity">
                ✎
              </span>
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
          <p className="text-xl font-mono mb-2">
            Escrito por
          </p>
          <input
            type="text"
            value={value.autor}
            onChange={(e) => onChange({ ...value, autor: e.target.value })}
            placeholder="Nome do autor"
            className="font-bold text-2xl font-mono bg-transparent outline-none border-b border-transparent hover:border-sombra/20 focus:border-sombra transition-colors mb-2 text-sombra"
          />
          {loading ? (
            <div className="h-4 bg-sombra/10 rounded animate-pulse w-3/4" />
          ) : (
            <div
              ref={descRef}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) =>
                onChange({ ...value, descricao: e.currentTarget.innerHTML })
              }
              className="text-sm text-sombra outline-none border-b border-transparent hover:border-sombra/20 focus:border-sombra transition-colors empty:before:content-[attr(data-placeholder)] empty:before:text-sombra/40"
              data-placeholder="Descrição / bio do autor"
            />
          )}
        </div>
      </div>
    </div>
  )
}
