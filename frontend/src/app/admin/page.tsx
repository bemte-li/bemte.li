import Link from 'next/link'
import Image from 'next/image'

interface AdminLink {
  href: string
  title: string
  description: string
}

const links: AdminLink[] = [
  {
    href: '/exemplo-nius-pag',
    title: 'Exemplo de niusleter',
    description: 'Visualize o exemplo de niusleter com textos simulados'
  },
  {
    href: '/exemplo-texto',
    title: 'Exemplo de Texto',
    description: 'Visualize um exemplo de texto com conteúdo completo'
  },
  {
    href: '/criar-texto',
    title: 'Editor de Texto',
    description: 'Teste a interface de criação e edição de textos'
  },
  {
    href: '/solicitar-convite',
    title: 'Solicitar Convite',
    description: 'Visualize a página do formulário de solicitação de convite'
  }
]

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-marfim flex flex-col items-center px-4 py-12">
      {/* Logo */}
      <div className="mb-12">
        <Link href="/">
          <Image
            src="/Logo-Vertical.svg"
            alt="Bemte.li"
            width={120}
            height={120}
            priority
          />
        </Link>
      </div>

      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8 text-sombra">
          Painel Administrativo
        </h1>

        <div className="space-y-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block p-4 bg-white border border-sombra/10 rounded-lg hover:border-citrino transition-colors"
            >
              <h2 className="font-bold text-lg mb-1 text-sombra">
                {link.title}
              </h2>
              <p className="text-sm text-sombra/70">
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 