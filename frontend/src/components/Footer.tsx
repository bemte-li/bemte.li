import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-marfim to-citrino py-8 mt-auto">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Placeholder for birds art */}
        <div className="mb-6">
          {/* We'll replace this with SVG later */}
          <div className="h-8 w-24 mx-auto bg-sombra/80" />
        </div>
        
        {/* Navigation links */}
        <nav className="mb-6">
          <ul className="flex justify-center gap-4 text-sombra">
            <li>
              <Link href="/sobre" className="hover:text-sombra/70">
                Sobre
              </Link>
            </li>
            <li className="text-sombra/40">•</li>
            <li>
              <Link href="/privacidade" className="hover:text-sombra/70">
                Privacidade
              </Link>
            </li>
            <li className="text-sombra/40">•</li>
            <li>
              <Link href="/termos" className="hover:text-sombra/70">
                Termos
              </Link>
            </li>
          </ul>
        </nav>

        {/* Contact line */}
        <p className="text-sombra">
          Mande um e-mail para{' '}
          <a 
            href="mailto:contato@bemte.li" 
            className="underline hover:text-sombra/70"
          >
            contato@bemte.li
          </a>
          {' '}e fale com um ser humano.
        </p>
      </div>
    </footer>
  )
} 