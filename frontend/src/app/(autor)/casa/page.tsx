'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getMinhaNiusleter } from '@/lib/pocketbase'
import { useUser } from '@/contexts/userContext'
import type { Niusleter } from '@/lib/types'

interface CasaLink {
  href: string
  title: string
  description: string
}

const links: CasaLink[] = [
  {
    href: '/casa/editar',
    title: 'Editar niusleter',
    description: 'Mude nome, descrição, foto e endereço da sua niusleter',
  },
  {
    href: '/casa/textos',
    title: 'Ver textos',
    description: 'Liste os textos publicados e enviados',
  },
  {
    href: '/casa/inscritos',
    title: 'Ver inscritos',
    description: 'Quem se inscreveu para receber a sua niusleter',
  },
  {
    href: '/criar',
    title: 'Criar texto',
    description: 'Abra o editor para escrever um novo texto',
  },
]

export default function CasaPage() {
  const router = useRouter()
  const { signOut } = useUser()
  const [niusleter, setNiusleter] = useState<Niusleter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const n = await getMinhaNiusleter()
        if (!cancelled) setNiusleter(n)
      } catch (err) {
        console.error(err)
        if (!cancelled) setError('Não foi possível carregar a sua niusleter.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleLogout = () => {
    signOut()
    router.replace('/')
  }

  return (
    <div className="min-h-screen bg-marfim flex flex-col items-center px-4 py-12">
      <div className="mb-8">
        <Link href="/">
          <Image
            src="/Logo-Vertical.svg"
            alt="Bemte.li"
            width={96}
            height={96}
            priority
          />
        </Link>
      </div>

      <div className="w-full max-w-md">
        <header className="flex items-start justify-between mb-8 gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-sombra/60">Sua casa</p>
            <h1 className="text-2xl font-bold text-sombra">
              {loading ? 'Carregando…' : niusleter?.nome ?? 'Sem niusleter'}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="border border-sombra/30 text-sombra px-4 py-2 text-sm hover:border-sombra transition-colors"
          >
            Sair
          </button>
        </header>

        {error && (
          <p className="text-sm text-bordo border border-bordo/30 bg-bordo/5 px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {!loading && !niusleter && !error && (
          <div className="bg-white border border-sombra/10 rounded-lg p-4 text-sm text-sombra/80">
            Nenhuma niusleter está associada à sua conta ainda. Peça para alguém da
            Bemte.li configurar a sua niusleter — por enquanto, a criação é feita
            manualmente.
          </div>
        )}

        {!loading && niusleter && (
          <div className="space-y-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block p-4 bg-white border border-sombra/10 rounded-lg hover:border-citrino transition-colors"
              >
                <h2 className="font-bold text-lg mb-1 text-sombra">{link.title}</h2>
                <p className="text-sm text-sombra/70">{link.description}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
