import Link from 'next/link'
import Image from "next/image";


export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-marfim to-citrino py-8 mt-auto">
      <div className="w-full text-center">
        <div className="mb-6 overflow-hidden">
          <Image
            src="/Fio-Rodape.svg"
            alt="Decorative footer art"
            width={3939}
            height={208}
            className="w-full scale-100 mt-2"
          />
        </div>
        
        {/* Navigation links */}
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
        </nav>

        {/* Contact line */}
        <p className="text-sombra px-4">
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