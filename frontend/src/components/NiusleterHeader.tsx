import Image from 'next/image'
import type { Niusleter } from '@/lib/types'
import { getPocketBaseFileUrl } from '@/lib/pocketbase'
import { SanitizedHtml } from './SanitizedHtml'

interface NiusleterHeaderProps {
  niusleter: Niusleter
}

/**
 * Server Component que renderiza o cabeçalho da newsletter.
 * Título e imagens são renderizados no servidor para SEO e carregamento rápido.
 * Apenas a descrição HTML usa um Client Component pequeno para sanitização.
 */
export function NiusleterHeader({ niusleter }: NiusleterHeaderProps) {
  // Constrói as URLs dos arquivos de imagem (lado servidor)
  const foto3x4Url = getPocketBaseFileUrl('niusleteres', niusleter.id, niusleter.foto_3x4)
  const fotoHorizontalUrl = getPocketBaseFileUrl('niusleteres', niusleter.id, niusleter.foto_horizontal)

  return (
    <div className="mb-16">
      {niusleter.display_mode === 'title_only' && (
        <div className="text-center flex flex-col items-center">
          <h1 className="text-4xl font-bold text-sombra mb-2">
            {niusleter.nome}
          </h1>
          <SanitizedHtml 
            html={niusleter.descricao || ''} 
            className="text-sombra font-serif" 
          />
        </div>
      )}
      
      {niusleter.display_mode === 'title_with_3x4_photo' && (
        <div className="text-center flex flex-col items-center">
          <div className="w-32 h-32 mb-8 relative">
            <Image
              src={foto3x4Url || '/Logo-Vertical.svg'}
              alt={niusleter.nome}
              fill
              className="rounded-lg object-cover"
            />
          </div>
          <h1 className="text-4xl font-bold text-sombra mb-2">
            {niusleter.nome}
          </h1>
          <SanitizedHtml 
            html={niusleter.descricao || ''} 
            className="text-sombra font-serif" 
          />
        </div>
      )}
      
      {niusleter.display_mode === 'title_image_horizontal' && (
        <div className="text-center flex flex-col items-center">
          {fotoHorizontalUrl ? (
            // Imagem horizontal: usa width/height automáticos para manter proporção
            <div className="w-full max-w-2xl mb-8">
              <Image
                src={fotoHorizontalUrl}
                alt={niusleter.nome}
                width={0}
                height={0}
                sizes="100vw"
                className="w-full h-auto rounded-lg"
              />
            </div>
          ) : (
            <h1 className="text-4xl font-bold text-sombra mb-2">
              {niusleter.nome}
            </h1>
          )}
          <SanitizedHtml 
            html={niusleter.descricao || ''} 
            className="text-sombra font-serif" 
          />
        </div>
      )}
    </div>
  )
}
