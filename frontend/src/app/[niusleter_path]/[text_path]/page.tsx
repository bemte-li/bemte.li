import Image from 'next/image'
import Link from 'next/link'
import { Highlight } from '@/components/Highlight'
import { AuthorBio } from '@/components/AuthorBio'
import { getTextoByPath, getNiusleterByPath, getPocketBaseFileUrl } from '@/lib/pocketbase'
import type { Texto, Niusleter } from '@/lib/types'
import { Navbar } from '@/components/Navbar'

interface PageProps {
  params: Promise<{
    niusleter_path: string;
    text_path: string;
  }>
}

export default async function TextoPage({ params }: PageProps) {
  const { niusleter_path, text_path } = await params
  let texto: Texto | null = null
  let niusleter: Niusleter | null = null
  let error: string | null = null

  try {
    // Get the texto by its path
    texto = await getTextoByPath(text_path)
    
    // Get the niusleter by its path for additional context
    niusleter = await getNiusleterByPath(niusleter_path)
    
    // Verify that the texto belongs to the niusleter
    if (texto && niusleter && texto.niusleter !== niusleter.id) {
      error = 'Texto não encontrado nesta niusleter.'
    }
  } catch (e) {
    error = 'Erro ao carregar texto do PocketBase.'
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>
  }

  if (!texto || !niusleter) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <>
      <Navbar niusleter={texto.expand?.niusleter || niusleter} isLoggedIn={false} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <article className="prose lg:prose-xl">
          <div className="flex items-center mb-6">
            <Link href={`/${niusleter_path}`} className="text-black no-underline">
              <Highlight color="citrino" className="text-4xl">←</Highlight>
            </Link>
          </div>

          <div className="text-sm text-gray-600 mb-4 font-mono">
            {texto.enviado ? new Date(texto.enviado).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
          </div>

          <h1 className="mt-0 mb-8 text-sombra">
            {texto.titulo}
          </h1>

          <div className="font-serif text-sombra" dangerouslySetInnerHTML={{ __html: texto.corpo || '' }} />

          <div className="mt-16">
            {texto.expand?.rodape?.autor && (
              <AuthorBio
                name={texto.expand.rodape.autor}
                bio={texto.expand.rodape.descricao || ''}
                imageUrl={
                  texto.expand.rodape.foto
                    ? getPocketBaseFileUrl('rodapes', texto.expand.rodape.id, texto.expand.rodape.foto)
                    : '/Logo-Vertical.svg'
                }
              />
            )}
          </div>
        </article>
      </div>
    </>
  )
} 