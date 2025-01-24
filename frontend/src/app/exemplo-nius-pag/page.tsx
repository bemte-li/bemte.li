import Link from 'next/link'
import Image from 'next/image'
import { Highlight } from '@/components/Highlight'

interface NewsletterEdition {
  id: number
  title: string
  excerpt: string
  date: string
  author: string
}

const mockEditions: NewsletterEdition[] = [
  {
    id: 1,
    title: "fantasias de um brasil sem meta",
    excerpt: "Entrei numa espécie de crise existencial recentemente quando percebi que minha doppelgänger digital atingiu a maioridade. Com isso eu quero dizer que tem...",
    date: "17/JAN/25",
    author: "LUANA ADRIANO"
  },
  {
    id: 2,
    title: "três grandes decisões",
    excerpt: "Tudo começou quando meu psicólogo falou que a motivação é produzida. Não é algo que a gente tem ou não tem, mas sim algo que...",
    date: "4/FEV/25",
    author: "LUANA ADRIANO"
  },
  // Add more mock editions as needed
]

export default function ExemploNiusPag() {
  return (
    <>
      {/* Profile image and header */}
      <div className="mb-16 text-center flex flex-col items-center">
        <div className="w-32 h-32 mb-8 relative">
          <Image
            src="https://placehold.co/400x400"
            alt="Newsletter profile"
            fill
            className="rounded-lg object-cover"
          />
        </div>
        <h1 className="text-4xl font-bold text-sombra mb-2">
          Desculpa Incomodar
        </h1>
        <p className="text-sombra font-serif">
          Internet, política, trabalho e o colapso civilizatório.
        </p>
      </div>

      {/* Newsletter subscription section - full width */}
      <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-citrino mb-16">
        <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-sombra mb-8 text-center">
            Receba os textos por e-mail
          </h2>
          
          <form className="flex flex-col gap-8 w-full max-w-md">
            <div className="flex flex-col">
              <label htmlFor="email" className="font-mono">E-mail:</label>
              <input
                type="email"
                id="email"
                className="bg-transparent border-b border-sombra focus:outline-none py-1"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-marfim text-sombra px-8 py-2 self-center hover:bg-opacity-90 transition-colors"
            >
              Inscrever-se
            </button>
          </form>
        </div>
      </div>

      {/* Posts section */}
      <div className="space-y-16">
        {mockEditions.map((edition) => (
          <article key={edition.id} className="border-l-4 border-citrino pl-4">
            <div className="text-sm font-mono mb-2">
              {edition.date}
            </div>
            
            <Link href={`/exemplo-texto`} className="group">
              <h2 className="text-2xl font-bold text-sombra mb-2 group-hover:text-citrino transition-colors">
                {edition.title}
              </h2>
              
              <p className="text-sombra font-serif mb-4">
                {edition.excerpt}
              </p>
            </Link>

            <div className="text-sm font-mono text-neutral-600">
              POR {edition.author}
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
