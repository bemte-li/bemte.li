import Image from 'next/image'
import { SanitizedHtml } from './SanitizedHtml'

interface RodapeDisplayProps {
  name: string
  bio: string
  imageUrl: string
}

export function RodapeDisplay({ name, bio, imageUrl }: RodapeDisplayProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg">
      <div className="relative w-24 h-32 flex-shrink-0">
        <Image
          src={imageUrl}
          alt={`Foto de ${name}`}
          fill
          className="object-cover border border-sombra"
          sizes="(max-width: 96px) 100vw, 96px"
        />
      </div>
      <div className="flex flex-col">
        <p className="text-sm font-mono mb-1">Escrito por</p>
        <h2 className="font-bold text-4xl font-mono mb-2">{name}</h2>
        <SanitizedHtml html={bio} className="text-lg" />
      </div>
    </div>
  )
}
