'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createBrowserClient, getMinhaNiusleter } from '@/lib/pocketbase'
import type { Texto } from '@/lib/types'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

function formatDate(value: string | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return dateFormatter.format(d)
}

export default function CasaTextosPage() {
  const [textos, setTextos] = useState<Texto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [niusleterCaminho, setNiusleterCaminho] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const niusleter = await getMinhaNiusleter()
        if (cancelled) return
        if (!niusleter) {
          setError('Nenhuma niusleter está associada à sua conta.')
          return
        }
        setNiusleterCaminho(niusleter.caminho)
        const pb = createBrowserClient()
        const list = await pb.collection('textos').getFullList<Texto>({
          filter: `niusleter="${niusleter.id}"`,
          sort: '-created',
        })
        if (!cancelled) setTextos(list)
      } catch (err) {
        console.error(err)
        if (!cancelled) setError('Não foi possível carregar os textos.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-marfim flex flex-col items-center px-4 py-12">
      <div className="mb-8">
        <Link href="/casa">
          <Image src="/Logo-Vertical.svg" alt="Bemte.li" width={96} height={96} priority />
        </Link>
      </div>

      <div className="w-full max-w-3xl">
        <header className="mb-6">
          <Link href="/casa" className="text-sm text-sombra/60 hover:text-sombra">
            ← Voltar para a casa
          </Link>
          <h1 className="text-2xl font-bold text-sombra mt-2">Textos</h1>
          <p className="text-sm text-sombra/70">Os textos que você já escreveu.</p>
        </header>

        {loading && <p className="text-sm text-sombra/70">Carregando…</p>}

        {error && (
          <p className="text-sm text-bordo border border-bordo/30 bg-bordo/5 px-3 py-2">
            {error}
          </p>
        )}

        {!loading && !error && textos.length === 0 && (
          <div className="bg-white border border-sombra/10 rounded-lg p-6 text-center space-y-3">
            <p className="text-sombra/80">Você ainda não escreveu nenhum texto.</p>
            <Link
              href="/criar"
              className="inline-block bg-citrino text-sombra px-4 py-2 text-sm font-bold hover:bg-citrino/90 transition-colors"
            >
              Criar seu primeiro texto
            </Link>
          </div>
        )}

        {!loading && !error && textos.length > 0 && (
          <div className="bg-white border border-sombra/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-marfim border-b border-sombra/10">
                <tr className="text-left text-xs uppercase tracking-wider text-sombra/60">
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Endereço</th>
                  <th className="px-4 py-3">Enviado</th>
                  <th className="px-4 py-3">Criado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sombra/10">
                {textos.map((texto) => (
                  <tr key={texto.id} className="hover:bg-marfim/60">
                    <td className="px-4 py-3 text-sombra">{texto.titulo || 'Sem título'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-sombra/70">
                      {niusleterCaminho ? (
                        <Link
                          href={`/${niusleterCaminho}/${texto.caminho}`}
                          className="hover:underline"
                        >
                          /{niusleterCaminho}/{texto.caminho}
                        </Link>
                      ) : (
                        `/${texto.caminho}`
                      )}
                    </td>
                    <td className="px-4 py-3 text-sombra/80">
                      {formatDate(texto.enviado)}
                    </td>
                    <td className="px-4 py-3 text-sombra/80">
                      {formatDate(texto.created)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
