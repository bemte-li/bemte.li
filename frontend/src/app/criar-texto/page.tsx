'use client'

import React, { useState, useEffect, memo, KeyboardEvent, useCallback, useRef } from 'react'
import Link from 'next/link'
import { type Editor } from '@tiptap/react'
import { Highlight } from '@/components/Highlight'
import TextEditor from '@/components/editor'
import EditorToolbar, { type ToolbarVariant } from '@/components/editor-toolbar'
import RodapeEditor, { type RodapeData } from '@/components/rodape-editor'
import ScrollToTop from '@/components/scroll-to-top'
import { useAutosave, type AutosaveStatus, type DraftData } from '@/hooks/useAutosave'

// ── Autosave status label ────────────────────────────────────────────────────

function AutosaveIndicator({ status }: { status: AutosaveStatus }) {
  const labels: Record<AutosaveStatus, string> = {
    idle: '',
    saving: 'Salvando…',
    saved: 'Rascunho salvo',
    error: 'Erro ao salvar',
  }
  if (!labels[status]) return null
  return (
    <span className="text-xs text-sombra/50 font-mono transition-opacity">
      {labels[status]}
    </span>
  )
}

// ── Draft recovery banner ────────────────────────────────────────────────────

interface DraftBannerProps {
  onRestore: () => void
  onDiscard: () => void
}

function DraftBanner({ onRestore, onDiscard }: DraftBannerProps) {
  return (
    <div className="mb-6 border border-citrino bg-citrino/10 px-4 py-3 flex items-center gap-4 text-sm text-sombra">
      <span className="flex-1">
        Rascunho recuperado. Deseja continuar de onde parou?
      </span>
      <button
        onClick={onRestore}
        className="bg-citrino text-sombra px-4 py-1 text-xs hover:bg-citrino/80 transition-colors"
      >
        Continuar
      </button>
      <button
        onClick={onDiscard}
        className="border border-sombra/30 text-sombra px-4 py-1 text-xs hover:border-sombra transition-colors"
      >
        Descartar
      </button>
    </div>
  )
}

// ── Publish tooltip button ───────────────────────────────────────────────────

function PublishButton() {
  const [hovered, setHovered] = useState(false)
  return (
    <div className="relative">
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="border border-sombra text-sombra px-6 py-2 text-sm opacity-60 cursor-not-allowed"
        aria-disabled="true"
      >
        Publicar
      </button>
      {hovered && (
        <div className="absolute right-0 top-full mt-1 bg-sombra text-marfim text-xs px-3 py-2 whitespace-nowrap z-50">
          Em breve — login necessário
        </div>
      )}
    </div>
  )
}

// ── PreviewMode ──────────────────────────────────────────────────────────────

interface PreviewModeProps {
  title: string
  content: string
  currentDate: string
  rodape: RodapeData
  onEdit: () => void
}

const PreviewMode = memo(({ title, content, currentDate, rodape, onEdit }: PreviewModeProps) => (
  <>
  <article className="prose lg:prose-xl">
    <div className="flex items-center justify-between mb-6">
      <Link href="/" className="text-black no-underline">
        <Highlight color="citrino" className="text-4xl">←</Highlight>
      </Link>
      <button
        onClick={onEdit}
        className="bg-citrino px-6 py-2 text-sm hover:bg-citrino/90 transition-colors text-sombra"
      >
        Editar
      </button>
    </div>

    <div className="text-sm text-gray-600 mb-4 font-mono">{currentDate}</div>

    <h1 className="mt-0 mb-8 text-sombra">{title || 'Sem título'}</h1>

    <div
      className="font-serif text-sombra"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  </article>

  {/* Rodapé preview */}
  <div className="mt-16 flex items-start gap-4 p-4 rounded-lg">
    <div className="relative w-24 h-32 flex-shrink-0 border border-sombra overflow-hidden">
      {rodape.fotoPreviewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={rodape.fotoPreviewUrl} alt={`Foto de ${rodape.autor}`} className="object-cover w-full h-full block" />
      ) : (
        <div className="w-full h-full bg-sombra/10" />
      )}
    </div>
    <div className="flex flex-col">
      <p className="text-sm font-mono mb-1">Escrito por</p>
      <h2 className="font-bold text-4xl font-mono mb-2">{rodape.autor || '—'}</h2>
      <div
        className="text-lg"
        dangerouslySetInnerHTML={{ __html: rodape.descricao }}
      />
    </div>
  </div>
  </>
))
PreviewMode.displayName = 'PreviewMode'

// ── EditMode ─────────────────────────────────────────────────────────────────

interface EditModeProps {
  title: string
  content: string
  currentDate: string
  rodape: RodapeData
  autosaveStatus: AutosaveStatus
  activeEditor: Editor | null
  toolbarVariant: ToolbarVariant
  onTitleChange: (value: string) => void
  onPreview: () => void
  onEditorUpdate: (html: string) => void
  onRodapeChange: (data: RodapeData) => void
  onSave: () => void
  onBodyEditorReady: (editor: Editor) => void
  onBioEditorReady: (editor: Editor) => void
}

function EditMode({
  title,
  content,
  currentDate,
  rodape,
  autosaveStatus,
  activeEditor,
  toolbarVariant,
  onTitleChange,
  onPreview,
  onEditorUpdate,
  onRodapeChange,
  onSave,
  onBodyEditorReady,
  onBioEditorReady,
}: EditModeProps) {
  const titleRef = React.useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (titleRef.current && titleRef.current.textContent !== title) {
      titleRef.current.textContent = title
    }
  }, [title])

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLHeadingElement>) => {
    if (e.key === 'Enter') e.preventDefault()
  }

  const handleTitleInput = (e: React.FormEvent<HTMLHeadingElement>) => {
    const newText = e.currentTarget.textContent || ''
    if (newText !== title) onTitleChange(newText)
  }

  return (
    <>
    <div className="prose lg:prose-xl">
      <div className="flex items-center justify-between mb-6 not-prose">
        <Link href="/" className="text-black no-underline">
          <Highlight color="citrino" className="text-4xl">←</Highlight>
        </Link>

        <div className="flex items-center gap-3">
          <AutosaveIndicator status={autosaveStatus} />
          <button
            onClick={onSave}
            className="bg-citrino text-sombra px-6 py-2 text-sm hover:bg-citrino/90 transition-colors"
          >
            Salvar
          </button>
          <PublishButton />
          <button
            onClick={onPreview}
            className="border border-sombra/30 text-sombra px-6 py-2 text-sm hover:border-sombra transition-colors"
          >
            Visualizar
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-4 font-mono">{currentDate}</div>

      <h1
        ref={titleRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleTitleInput}
        onKeyDown={handleTitleKeyDown}
        dir="ltr"
        className="mt-0 mb-8 text-sombra outline-none border-b border-sombra/20 focus:border-sombra transition-colors empty:before:content-[attr(data-placeholder)] empty:before:text-gray-500 empty:before:italic"
        data-placeholder="Título do texto"
      />
    </div>

    <EditorToolbar editor={activeEditor} variant={toolbarVariant} />

    <div className="prose lg:prose-xl">
      <div className="font-serif text-sombra">
        <TextEditor
          onUpdate={onEditorUpdate}
          initialContent={content}
          showToolbar={false}
          onEditorReady={onBodyEditorReady}
        />
      </div>
    </div>

    <RodapeEditor
      value={rodape}
      onChange={onRodapeChange}
      onBioEditorReady={onBioEditorReady}
    />
    </>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

const EMPTY_RODAPE: RodapeData = { autor: '', descricao: '', foto: null, fotoPreviewUrl: null }

export default function CriarTexto() {
  const [isPreview, setIsPreview] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [rodape, setRodape] = useState<RodapeData>(EMPTY_RODAPE)
  const [pendingDraft, setPendingDraft] = useState<DraftData | null>(null)
  const [draftBannerVisible, setDraftBannerVisible] = useState(false)

  const [activeEditor, setActiveEditor] = useState<Editor | null>(null)
  const [toolbarVariant, setToolbarVariant] = useState<ToolbarVariant>('full')

  const bodyEditorRef = useRef<Editor | null>(null)
  const bioEditorRef = useRef<Editor | null>(null)

  const handleBodyEditorReady = useCallback((editor: Editor) => {
    bodyEditorRef.current = editor
    setActiveEditor(editor)
    setToolbarVariant('full')

    editor.on('focus', () => {
      setActiveEditor(editor)
      setToolbarVariant('full')
    })
  }, [])

  const handleBioEditorReady = useCallback((editor: Editor) => {
    bioEditorRef.current = editor

    editor.on('focus', () => {
      setActiveEditor(editor)
      setToolbarVariant('basic')
    })
  }, [])

  const [currentDate, setCurrentDate] = useState('')
  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).toLowerCase()
    )
  }, [])

  const draftData: DraftData = {
    title,
    content,
    rodape: { autor: rodape.autor, descricao: rodape.descricao, foto: rodape.foto },
  }

  const { status, saveNow, loadDraft, clearDraft } = useAutosave(draftData)

  useEffect(() => {
    const draft = loadDraft()
    if (draft && (draft.title || draft.content || draft.rodape.autor)) {
      setPendingDraft(draft)
      setDraftBannerVisible(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRestoreDraft = () => {
    if (!pendingDraft) return
    setTitle(pendingDraft.title)
    setContent(pendingDraft.content)
    setRodape((prev) => ({
      ...prev,
      autor: pendingDraft.rodape.autor,
      descricao: pendingDraft.rodape.descricao,
      foto: pendingDraft.rodape.foto,
    }))
    setDraftBannerVisible(false)
    setPendingDraft(null)
  }

  const handleDiscardDraft = () => {
    clearDraft()
    setDraftBannerVisible(false)
    setPendingDraft(null)
  }

  const handleSave = useCallback(() => {
    saveNow(draftData)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveNow, title, content, rodape])

  return (
    <>
      {draftBannerVisible && (
        <DraftBanner onRestore={handleRestoreDraft} onDiscard={handleDiscardDraft} />
      )}

      {isPreview ? (
        <PreviewMode
          title={title}
          content={content}
          currentDate={currentDate}
          rodape={rodape}
          onEdit={() => setIsPreview(false)}
        />
      ) : (
        <EditMode
          title={title}
          content={content}
          currentDate={currentDate}
          rodape={rodape}
          autosaveStatus={status}
          activeEditor={activeEditor}
          toolbarVariant={toolbarVariant}
          onTitleChange={setTitle}
          onPreview={() => setIsPreview(true)}
          onEditorUpdate={setContent}
          onRodapeChange={setRodape}
          onSave={handleSave}
          onBodyEditorReady={handleBodyEditorReady}
          onBioEditorReady={handleBioEditorReady}
        />
      )}

      <ScrollToTop />
    </>
  )
}
