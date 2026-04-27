'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  createBrowserClient,
  getMinhaNiusleter,
  getPocketBaseFileUrl,
} from '@/lib/pocketbase'
import type { Niusleter } from '@/lib/types'
import TextEditor from '@/components/editor'

const CAMINHO_PATTERN = /^[a-z0-9-]+$/

type DisplayMode = Niusleter['display_mode']

const DISPLAY_MODE_LABELS: Record<DisplayMode, string> = {
  title_only: 'Apenas o título',
  title_with_3x4_photo: 'Título com foto redonda (3x4)',
  title_image_horizontal: 'Imagem horizontal',
}

interface ConfirmCaminhoModalProps {
  oldCaminho: string
  newCaminho: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmCaminhoModal({
  oldCaminho,
  newCaminho,
  onConfirm,
  onCancel,
}: ConfirmCaminhoModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sombra/50 px-4">
      <div className="w-full max-w-md bg-marfim border border-sombra rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-bold text-sombra">Mudar o endereço da niusleter?</h2>
        <p className="text-sm text-sombra/80">
          Você está alterando o <code className="font-bold">caminho</code> de{' '}
          <code className="bg-sombra/10 px-1">{oldCaminho}</code> para{' '}
          <code className="bg-sombra/10 px-1">{newCaminho}</code>. Isso quebra
          links públicos existentes:
        </p>
        <ul className="text-sm text-sombra/80 list-disc pl-5 space-y-1">
          <li>
            A página da niusleter passa a viver em{' '}
            <code className="bg-sombra/10 px-1">/{newCaminho}</code>.
          </li>
          <li>
            Todos os textos publicados ficam acessíveis em{' '}
            <code className="bg-sombra/10 px-1">/{newCaminho}/...</code>; os
            antigos links em <code className="bg-sombra/10 px-1">/{oldCaminho}/...</code>{' '}
            param de funcionar.
          </li>
        </ul>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="border border-sombra/30 text-sombra px-4 py-2 text-sm hover:border-sombra transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-citrino text-sombra px-4 py-2 text-sm font-bold hover:bg-citrino/90 transition-colors"
          >
            Sim, mudar mesmo assim
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EditarNiusleterPage() {
  const [niusleter, setNiusleter] = useState<Niusleter | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [displayMode, setDisplayMode] = useState<DisplayMode>('title_only')
  const [caminho, setCaminho] = useState('')
  const [caminhoOriginal, setCaminhoOriginal] = useState('')
  const [caminhoError, setCaminhoError] = useState<string | null>(null)

  const [foto3x4File, setFoto3x4File] = useState<File | null>(null)
  const [foto3x4Clear, setFoto3x4Clear] = useState(false)
  const [foto3x4Preview, setFoto3x4Preview] = useState<string | null>(null)
  const [fotoHorizontalFile, setFotoHorizontalFile] = useState<File | null>(null)
  const [fotoHorizontalClear, setFotoHorizontalClear] = useState(false)
  const [fotoHorizontalPreview, setFotoHorizontalPreview] = useState<string | null>(null)

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const tempPreviewUrls = useRef<string[]>([])

  const hydrate = (n: Niusleter) => {
    setNiusleter(n)
    setNome(n.nome ?? '')
    setDescricao(n.descricao ?? '')
    setDisplayMode(n.display_mode ?? 'title_only')
    setCaminho(n.caminho ?? '')
    setCaminhoOriginal(n.caminho ?? '')
    setFoto3x4File(null)
    setFoto3x4Clear(false)
    setFoto3x4Preview(getPocketBaseFileUrl('niusleteres', n.id, n.foto_3x4) || null)
    setFotoHorizontalFile(null)
    setFotoHorizontalClear(false)
    setFotoHorizontalPreview(
      getPocketBaseFileUrl('niusleteres', n.id, n.foto_horizontal) || null
    )
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const n = await getMinhaNiusleter()
        if (cancelled) return
        if (!n) {
          setLoadError('Nenhuma niusleter está associada à sua conta.')
        } else {
          hydrate(n)
        }
      } catch (err) {
        console.error(err)
        if (!cancelled) setLoadError('Não foi possível carregar a sua niusleter.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
      tempPreviewUrls.current.forEach((u) => URL.revokeObjectURL(u))
      tempPreviewUrls.current = []
    }
  }, [])

  const handleCaminhoChange = (value: string) => {
    setCaminho(value)
    if (!value.trim()) {
      setCaminhoError('O endereço não pode ficar vazio.')
    } else if (!CAMINHO_PATTERN.test(value)) {
      setCaminhoError(
        'Use apenas letras minúsculas, números e hífens (sem espaços ou acentos).'
      )
    } else {
      setCaminhoError(null)
    }
  }

  const handleFoto3x4 = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setFoto3x4File(file)
    setFoto3x4Clear(false)
    if (file) {
      const url = URL.createObjectURL(file)
      tempPreviewUrls.current.push(url)
      setFoto3x4Preview(url)
    } else if (niusleter) {
      setFoto3x4Preview(
        getPocketBaseFileUrl('niusleteres', niusleter.id, niusleter.foto_3x4) || null
      )
    }
  }

  const handleFotoHorizontal = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setFotoHorizontalFile(file)
    setFotoHorizontalClear(false)
    if (file) {
      const url = URL.createObjectURL(file)
      tempPreviewUrls.current.push(url)
      setFotoHorizontalPreview(url)
    } else if (niusleter) {
      setFotoHorizontalPreview(
        getPocketBaseFileUrl('niusleteres', niusleter.id, niusleter.foto_horizontal) || null
      )
    }
  }

  const clearFoto3x4 = () => {
    setFoto3x4File(null)
    setFoto3x4Clear(true)
    setFoto3x4Preview(null)
  }

  const clearFotoHorizontal = () => {
    setFotoHorizontalFile(null)
    setFotoHorizontalClear(true)
    setFotoHorizontalPreview(null)
  }

  const persist = async () => {
    if (!niusleter) return
    setSaving(true)
    setErrorMessage(null)
    setStatusMessage(null)

    const formData = new FormData()
    formData.append('nome', nome.trim())
    formData.append('descricao', descricao)
    formData.append('caminho', caminho.trim())
    formData.append('display_mode', displayMode)

    if (foto3x4File) formData.append('foto_3x4', foto3x4File)
    else if (foto3x4Clear) formData.append('foto_3x4', '')

    if (fotoHorizontalFile) formData.append('foto_horizontal', fotoHorizontalFile)
    else if (fotoHorizontalClear) formData.append('foto_horizontal', '')

    try {
      const pb = createBrowserClient()
      const updated = await pb
        .collection('niusleteres')
        .update<Niusleter>(niusleter.id, formData)
      hydrate(updated)
      setStatusMessage('Niusleter atualizada.')
    } catch (err: unknown) {
      console.error(err)
      const friendly = friendlyErrorFor(err)
      setErrorMessage(friendly)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    setStatusMessage(null)

    if (caminhoError) return
    if (!caminho.trim() || !CAMINHO_PATTERN.test(caminho.trim())) {
      setCaminhoError('Endereço inválido.')
      return
    }

    if (caminho.trim() !== caminhoOriginal) {
      setShowConfirmModal(true)
      return
    }

    void persist()
  }

  const submitDisabled = saving || loading || !!caminhoError

  const niusleterId = niusleter?.id

  const previewBlock = useMemo(() => {
    if (!niusleterId) return null
    return (
      <p className="text-xs text-sombra/60 mt-2">
        Endereço público: <code className="bg-sombra/10 px-1">/{caminho || '—'}</code>
      </p>
    )
  }, [niusleterId, caminho])

  return (
    <div className="min-h-screen bg-marfim flex flex-col items-center px-4 py-12">
      <div className="mb-8">
        <Link href="/casa">
          <Image src="/Logo-Vertical.svg" alt="Bemte.li" width={96} height={96} priority />
        </Link>
      </div>

      <div className="w-full max-w-2xl">
        <header className="mb-8">
          <Link href="/casa" className="text-sm text-sombra/60 hover:text-sombra">
            ← Voltar para a casa
          </Link>
          <h1 className="text-2xl font-bold text-sombra mt-2">Editar niusleter</h1>
        </header>

        {loading && <p className="text-sm text-sombra/70">Carregando…</p>}

        {loadError && (
          <p className="text-sm text-bordo border border-bordo/30 bg-bordo/5 px-3 py-2">
            {loadError}
          </p>
        )}

        {!loading && niusleter && (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white border border-sombra/10 rounded-lg p-6"
            noValidate
          >
            <div>
              <label htmlFor="nome" className="block text-sm font-bold text-sombra mb-1">
                Nome
              </label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full border border-sombra/30 px-3 py-2 text-sombra bg-marfim focus:outline-none focus:border-sombra"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-sombra mb-1">Descrição</label>
              <div className="border border-sombra/30 bg-marfim p-2">
                <TextEditor initialContent={descricao} onUpdate={setDescricao} />
              </div>
            </div>

            <div>
              <label
                htmlFor="display_mode"
                className="block text-sm font-bold text-sombra mb-1"
              >
                Modo de exibição
              </label>
              <select
                id="display_mode"
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value as DisplayMode)}
                disabled={saving}
                className="w-full border border-sombra/30 px-3 py-2 text-sombra bg-marfim focus:outline-none focus:border-sombra"
              >
                {(Object.keys(DISPLAY_MODE_LABELS) as DisplayMode[]).map((mode) => (
                  <option key={mode} value={mode}>
                    {DISPLAY_MODE_LABELS[mode]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-sombra/60 mt-1">
                Controla como o nome (e a foto, quando houver) aparecem na navbar pública.
              </p>
            </div>

            <FotoField
              id="foto_3x4"
              label="Foto 3x4 (usada nos modos com avatar)"
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              previewUrl={foto3x4Preview}
              previewClassName="w-24 h-24 object-cover rounded-full border border-sombra/20"
              onChange={handleFoto3x4}
              onClear={clearFoto3x4}
              disabled={saving}
            />

            <FotoField
              id="foto_horizontal"
              label="Foto horizontal (usada quando o modo for “Imagem horizontal”)"
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              previewUrl={fotoHorizontalPreview}
              previewClassName="h-16 w-auto object-contain border border-sombra/20"
              onChange={handleFotoHorizontal}
              onClear={clearFotoHorizontal}
              disabled={saving}
            />

            <div>
              <label htmlFor="caminho" className="block text-sm font-bold text-sombra mb-1">
                Endereço (caminho)
              </label>
              <input
                id="caminho"
                type="text"
                value={caminho}
                onChange={(e) => handleCaminhoChange(e.target.value)}
                className="w-full border border-sombra/30 px-3 py-2 text-sombra bg-marfim focus:outline-none focus:border-sombra font-mono"
                disabled={saving}
                aria-invalid={caminhoError ? 'true' : 'false'}
                aria-describedby="caminho-help caminho-warn"
                pattern="^[a-z0-9-]+$"
              />
              {caminhoError ? (
                <p className="text-xs text-bordo mt-1">{caminhoError}</p>
              ) : (
                <p id="caminho-help" className="text-xs text-sombra/60 mt-1">
                  Use apenas letras minúsculas, números e hífens.
                </p>
              )}
              <p
                id="caminho-warn"
                className="text-xs text-bordo bg-bordo/5 border border-bordo/30 px-3 py-2 mt-2"
              >
                <strong>Atenção:</strong> mudar o endereço quebra todos os links públicos
                existentes para a sua niusleter e os textos publicados.
              </p>
              {previewBlock}
            </div>

            {statusMessage && (
              <p className="text-sm text-sombra border border-citrino bg-citrino/10 px-3 py-2">
                {statusMessage}
              </p>
            )}
            {errorMessage && (
              <p className="text-sm text-bordo border border-bordo/30 bg-bordo/5 px-3 py-2">
                {errorMessage}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <Link
                href="/casa"
                className="border border-sombra/30 text-sombra px-4 py-2 text-sm hover:border-sombra transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={submitDisabled}
                className="bg-citrino text-sombra px-6 py-2 text-sm font-bold hover:bg-citrino/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </form>
        )}
      </div>

      {showConfirmModal && (
        <ConfirmCaminhoModal
          oldCaminho={caminhoOriginal}
          newCaminho={caminho.trim()}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={() => {
            setShowConfirmModal(false)
            void persist()
          }}
        />
      )}
    </div>
  )
}

// Distingue um erro do PocketBase de erros gen\u00e9ricos e tenta dar uma mensagem
// \u00fatil em portugu\u00eas \u2014 incluindo o caso espec\u00edfico de `caminho` duplicado.
function friendlyErrorFor(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'data' in err) {
    const data = (err as { data?: { data?: Record<string, { code?: string; message?: string }> } }).data
    const fieldErrors = data?.data
    if (fieldErrors?.caminho) {
      const code = fieldErrors.caminho.code
      if (code === 'validation_not_unique') {
        return 'Esse endereço já está sendo usado por outra niusleter. Escolha outro.'
      }
      if (code === 'validation_invalid_format') {
        return 'Endereço inválido. Use apenas letras minúsculas, números e hífens.'
      }
      return fieldErrors.caminho.message || 'Endereço inválido.'
    }
    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      const first = Object.entries(fieldErrors)[0]
      return `${first[0]}: ${first[1]?.message ?? 'inválido'}`
    }
  }
  return 'Não foi possível salvar. Tente novamente.'
}

interface FotoFieldProps {
  id: string
  label: string
  accept: string
  previewUrl: string | null
  previewClassName: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  disabled: boolean
}

function FotoField({
  id,
  label,
  accept,
  previewUrl,
  previewClassName,
  onChange,
  onClear,
  disabled,
}: FotoFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-sombra mb-1">
        {label}
      </label>
      <div className="flex items-center gap-4">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Pré-visualização" className={previewClassName} />
        ) : (
          <div
            className={`${previewClassName} bg-sombra/5 flex items-center justify-center text-xs text-sombra/40`}
          >
            sem foto
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            id={id}
            type="file"
            accept={accept}
            onChange={onChange}
            disabled={disabled}
            className="block text-sm text-sombra"
          />
          {previewUrl && (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className="text-xs text-bordo hover:underline"
            >
              Remover foto
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
