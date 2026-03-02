import Link from 'next/link'
import { getNiusleterByPath, getTextosByNiusleter } from '@/lib/pocketbase'
import type { Niusleter, Texto } from '@/lib/types'
import { Navbar } from '@/components/Navbar'
import { SubscriptionForm } from '@/components/SubscriptionForm'
import { NiusleterHeader } from '@/components/NiusleterHeader'

interface PageProps {
  params: Promise<{
    niusleter_path: string
  }>
}

export default async function NiusleterPage({ params }: PageProps) {
  const { niusleter_path } = await params
  let niusleter: Niusleter | null = null
  let textos: Texto[] = []
  let error: string | null = null

  try {
    niusleter = await getNiusleterByPath(niusleter_path)
    textos = await getTextosByNiusleter(niusleter.id)
  } catch (e) {
    error = 'Erro ao carregar dados do PocketBase. ' + e
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>
  }

  if (!niusleter) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <>
      <Navbar isLoggedIn={false} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Newsletter header with different display modes */}
        <NiusleterHeader niusleter={niusleter} />

      {/* Newsletter subscription section - full width */}
      <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-citrino mb-16">
        <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center">
          <SubscriptionForm niusleterId={niusleter.id} />
        </div>
      </div>

      {/* Posts section */}
      <div className="space-y-16">
        {textos.length === 0 ? (
          <div className="text-center text-neutral-500">Nenhum texto encontrado.</div>
        ) : (
          textos.map((texto) => (
            <article key={texto.id} className="border-l-4 border-citrino pl-4">
              <div className="text-sm font-mono mb-2">
                {texto.enviado ? new Date(texto.enviado).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' }) : ''}
              </div>
              <Link href={`/${niusleter_path}/${texto.caminho}`} className="group">
                <h2 className="text-2xl font-bold text-sombra mb-2 group-hover:text-citrino transition-colors">
                  {texto.titulo}
                </h2>
                <p className="text-sombra font-serif mb-4">
                  {/* Excerpt: first 160 chars or first paragraph */}
                  {texto.corpo?.replace(/<[^>]+>/g, '').slice(0, 160)}...
                </p>
              </Link>
              <div className="text-sm font-mono text-neutral-600">
                POR {texto.expand?.rodape?.autor || 'AUTOR DESCONHECIDO'}
              </div>
            </article>
          ))
        )}
      </div>
      </div>
    </>
  )
} 