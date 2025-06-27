import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-marfim to-citrino py-8 mt-auto">
      <div className="w-full text-center">
        {/* Navigation links
        <nav className="mb-6 px-4">
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
        </nav> */}

        {/* Contact line */}
        <p className="text-sombra px-4">
          Mande um e-mail para{' '}
          <a 
            href="mailto:nos@bemte.li" 
            className="underline hover:text-sombra/70"
          >
            nos@bemte.li
          </a>
          {' '}e fale com um ser humano.
        </p>
      </div>
    </footer>
  )
} 