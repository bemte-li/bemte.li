import Image from 'next/image'

interface AuthorBioProps {
  name: string
  bio: string
  imageUrl: string
}

export function AuthorBio({ name, bio, imageUrl }: AuthorBioProps) {
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
        <h2 className="text-xl font-mono mb-2">
          Escrito por
          <div className="font-bold text-2xl">{name}</div>
        </h2>
        <p className="text-sm">{bio}</p>
      </div>
    </div>
  )
} 