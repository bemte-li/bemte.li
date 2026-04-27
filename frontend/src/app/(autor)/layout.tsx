'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useUser } from '@/contexts/userContext'

/**
 * Camada cliente de defesa-em-profundidade. O middleware (`middleware.ts`)
 * j\u00e1 redireciona quem n\u00e3o est\u00e1 autenticado antes do HTML ser renderizado.
 * Este layout cobre o caso de uma sess\u00e3o que cai no meio do uso (ex.: um
 * `authRefresh` falhou, esvaziando o `authStore` em mem\u00f3ria, mesmo com o
 * cookie ainda formalmente v\u00e1lido). Quando isso acontece, o middleware n\u00e3o
 * teria como saber, ent\u00e3o garantimos o redirect aqui no cliente.
 */
export default function AutorLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useUser()

  useEffect(() => {
    if (!loading && !user) {
      const target = '/entrar?redirect=' + encodeURIComponent(pathname || '/casa')
      router.replace(target)
    }
  }, [loading, user, pathname, router])

  if (loading || !user) {
    return <div className="min-h-screen bg-marfim" aria-hidden="true" />
  }

  return <>{children}</>
}
