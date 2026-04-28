import Link from 'next/link'
import { PublicShell } from '@/components/article-layout'
import { Highlight } from '@/components/Highlight'
import { RodapeDisplay } from '@/components/rodape-display'
import { getNiusleterByPath, getPocketBaseFileUrl, getTextoByPath } from '@/lib/pocketbase'
import type { Niusleter, Texto } from '@/lib/types'

interface PageProps {
  params: Promise<{
    niusleter_path: string
    text_path: string
  }>
}

export default async function TextoPage({ params }: PageProps) {
  const { niusleter_path, text_path } = await params
  let texto: Texto | null = null
  let niusleter: Niusleter | null = null
  let error: string | null = null

  try {
    texto = await getTextoByPath(text_path)
    niusleter = await getNiusleterByPath(niusleter_path)

    if (texto && niusleter && texto.niusleter !== niusleter.id) {
      error = 'Texto não encontrado nesta niusleter.'
    }
  } catch {
    error = 'Erro ao carregar texto do PocketBase.'
  }

  if (error) {
    return (
      <PublicShell>
        <div className="text-red-600 text-center py-8">{error}</div>
      </PublicShell>
    )
  }

  if (!texto || !niusleter) {
    return (
      <PublicShell>
        <div className="text-center py-8">Carregando...</div>
      </PublicShell>
    )
  }

  const niusleterRecord = texto.expand?.niusleter || niusleter

  return (
    <PublicShell niusleter={niusleterRecord}>
      <article className="prose lg:prose-xl">
        <div className="flex items-center mb-6">
          <Link href={`/${niusleter_path}`} className="text-black no-underline">
            <Highlight color="citrino" className="text-4xl">←</Highlight>
          </Link>
        </div>

        <div className="text-sm text-gray-600 mb-4 font-mono">
          {texto.enviado
            ? new Date(texto.enviado).toLocaleString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''}
        </div>

        <h1 className="mt-0 mb-8 text-sombra">{texto.titulo}</h1>

        <div
          className="font-serif text-sombra"
          dangerouslySetInnerHTML={{ __html: texto.corpo || '' }}
        />

        <div className="mt-16">
          {texto.expand?.rodape?.autor && (
            <RodapeDisplay
              name={texto.expand.rodape.autor}
              bio={texto.expand.rodape.descricao || ''}
              imageUrl={
                texto.expand.rodape.foto
                  ? getPocketBaseFileUrl(
                      'rodapes',
                      texto.expand.rodape.id,
                      texto.expand.rodape.foto,
                    )
                  : '/Logo-Vertical.svg'
              }
            />
          )}
        </div>
      </article>
    </PublicShell>
  )
}
