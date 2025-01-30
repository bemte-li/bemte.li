'use client'

import React, { useState, useEffect, memo, KeyboardEvent } from 'react'
import Link from 'next/link'
import { Highlight } from '@/components/Highlight'
import { AuthorBio } from '@/components/AuthorBio'
import TextEditor from '@/components/editor'

const BioSection = () => (
  <div className="mt-16">
    <AuthorBio 
      name="Luana Adriano"
      bio="Luana constrói o Bemte.li, lê pensa & escreve sobre internet, política, trabalho e o colapso civilizatório em curso."
      imageUrl="https://placehold.co/300x400"
    />
  </div>
)

interface PreviewModeProps {
  title: string
  content: string
  currentDate: string
  onEdit: () => void
}

const PreviewMode = memo(({ title, content, currentDate, onEdit }: PreviewModeProps) => (
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

    <div className="text-sm text-gray-600 mb-4 font-mono">
      {currentDate}
    </div>

    <h1 className="mt-0 mb-8 text-sombra">
      {title || 'Sem título'}
    </h1>

    <div 
      className="font-serif text-sombra"
      dangerouslySetInnerHTML={{ __html: content }}
    />

    <BioSection />
  </article>
))

interface EditModeProps {
  title: string
  content: string
  currentDate: string
  onTitleChange: (value: string) => void
  onPreview: () => void
  onEditorUpdate: (html: string) => void
}

const EditMode = memo(({ title, content, currentDate, onTitleChange, onPreview, onEditorUpdate }: EditModeProps) => {
  const titleRef = React.useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (titleRef.current) {
      // Only update if the content is different to avoid cursor jumping
      if (titleRef.current.textContent !== title) {
        titleRef.current.textContent = title
      }
    }
  }, [title])

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLHeadingElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  const handleTitleInput = (e: React.FormEvent<HTMLHeadingElement>) => {
    const newText = e.currentTarget.textContent || ''
    if (newText !== title) {
      onTitleChange(newText)
    }
  }

  return (
    <div className="prose lg:prose-xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-black no-underline">
          <Highlight color="citrino" className="text-4xl">←</Highlight>
        </Link>
        <button
          onClick={onPreview}
          className="bg-citrino px-6 py-2 text-sm hover:bg-citrino/90 transition-colors text-sombra"
        >
          Visualizar
        </button>
      </div>

      <div className="text-sm text-gray-600 mb-4 font-mono">
        {currentDate}
      </div>

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

      <div className="font-serif text-sombra">
        <TextEditor onUpdate={onEditorUpdate} initialContent={content} />
      </div>

      <BioSection />
    </div>
  )
})

PreviewMode.displayName = 'PreviewMode'
EditMode.displayName = 'EditMode'

export default function CriarTexto() {
  const [isPreview, setIsPreview] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const currentDate = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).toLowerCase()

  const handleEditorUpdate = (html: string) => {
    setContent(html)
  }

  return isPreview ? (
    <PreviewMode 
      title={title}
      content={content}
      currentDate={currentDate}
      onEdit={() => setIsPreview(false)}
    />
  ) : (
    <EditMode 
      title={title}
      content={content}
      currentDate={currentDate}
      onTitleChange={setTitle}
      onPreview={() => setIsPreview(true)}
      onEditorUpdate={handleEditorUpdate}
    />
  )
} 