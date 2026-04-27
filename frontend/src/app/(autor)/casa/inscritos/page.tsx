'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createBrowserClient, getMinhaNiusleter } from '@/lib/pocketbase'
import type { Inscrito } from '@/lib/types'

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

type InscritoStatus = 'desinscrito' | 'verificado' | 'pendente'

interface StatusInfo {
  label: string
  className: string
}

const STATUS_INFO: Record<InscritoStatus, StatusInfo> = {
  verificado: {
    label: 'verificado',
    className: 'bg-citrino/30 text-sombra border-citrino',
  },
  pendente: {
    label: 'pendente',
    className: 'bg-sombra/5 text-sombra/70 border-sombra/20',
  },
  desinscrito: {
    label: 'desinscrito',
    className: 'bg-bordo/10 text-bordo border-bordo/30',
  },
}

function statusOf(inscrito: Inscrito): InscritoStatus {
  if (inscrito.desinscrito) return 'desinscrito'
  if (inscrito.verificado) return 'verificado'
  return 'pendente'
}

export default function CasaInscritosPage() {
  const [inscritos, setInscritos] = useState<Inscrito[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        const pb = createBrowserClient()
        const list = await pb.collection('inscritos').getFullList<Inscrito>({
          filter: `niusleter="${niusleter.id}"`,
          sort: '-created',
        })
        if (!cancelled) setInscritos(list)
      } catch (err) {
        console.error(err)
        if (!cancelled) setError('Não foi possível carregar os inscritos.')
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
          <h1 className="text-2xl font-bold text-sombra mt-2">Inscritos</h1>
          <p className="text-sm text-sombra/70">
            Quem se inscreveu para receber a sua niusleter.
          </p>
        </header>

        {loading && <p className="text-sm text-sombra/70">Carregando…</p>}

        {error && (
          <p className="text-sm text-bordo border border-bordo/30 bg-bordo/5 px-3 py-2">
            {error}
          </p>
        )}

        {!loading && !error && inscritos.length === 0 && (
          <div className="bg-white border border-sombra/10 rounded-lg p-6 text-center text-sombra/80">
            <p>Ninguém inscrito ainda.</p>
            <p className="text-xs text-sombra/60 mt-2">
              Quando alguém se inscrever pela sua página pública, vai aparecer por aqui.
            </p>
          </div>
        )}

        {!loading && !error && inscritos.length > 0 && (
          <div className="bg-white border border-sombra/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-marfim border-b border-sombra/10">
                <tr className="text-left text-xs uppercase tracking-wider text-sombra/60">
                  <th className="px-4 py-3">E-mail</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Inscrito em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sombra/10">
                {inscritos.map((inscrito) => {
                  const info = STATUS_INFO[statusOf(inscrito)]
                  return (
                    <tr key={inscrito.id} className="hover:bg-marfim/60">
                      <td className="px-4 py-3 text-sombra font-mono text-xs">
                        {inscrito.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block border px-2 py-0.5 text-xs ${info.className}`}
                        >
                          {info.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sombra/80">
                        {formatDate(inscrito.created)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
