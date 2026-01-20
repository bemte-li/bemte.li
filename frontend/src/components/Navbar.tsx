import Link from 'next/link';
import { Highlight } from './Highlight';
import Image from 'next/image';
import type { Niusleter } from '@/lib/types';
import { getPocketBaseFileUrl } from '@/lib/pocketbase';

interface NavbarProps {
  isLoggedIn?: boolean;
  pageName?: string;
  niusleter?: Niusleter;
}

function NiusleterTitle({ niusleter }: { niusleter: Niusleter }) {
  const foto3x4Url = getPocketBaseFileUrl('niusleteres', niusleter.id, niusleter.foto_3x4);
  const fotoHorizontalUrl = getPocketBaseFileUrl('niusleteres', niusleter.id, niusleter.foto_horizontal);

  if (niusleter.display_mode === 'title_only') {
    return <span className="text-xl sm:text-2xl font-bold text-sombra">{niusleter.nome}</span>;
  }

  if (niusleter.display_mode === 'title_with_3x4_photo') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex-shrink-0">
          <Image
            src={foto3x4Url || '/Logo-Vertical.svg'}
            alt={niusleter.nome}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <span className="text-xl sm:text-2xl font-bold text-sombra">{niusleter.nome}</span>
      </div>
    );
  }

  if (niusleter.display_mode === 'title_image_horizontal') {
    if (fotoHorizontalUrl) {
      return (
        <div className="h-10 sm:h-14 relative">
          <Image
            src={fotoHorizontalUrl}
            alt={niusleter.nome}
            width={0}
            height={0}
            sizes="300px"
            className="h-full w-auto"
          />
        </div>
      );
    }
    return <span className="text-xl sm:text-2xl font-bold text-sombra">{niusleter.nome}</span>;
  }

  // Fallback
  return <span className="text-xl sm:text-2xl font-bold text-sombra">{niusleter.nome}</span>;
}

export function Navbar({ isLoggedIn = false, pageName, niusleter }: NavbarProps) {
  const showCenterContent = pageName || niusleter;

  return (
    <div className="border-b border-sombra">
      <nav className="flex justify-between items-center px-6 py-4 bg-creme">
        <Link href="/" className="flex items-center gap-4">
          {showCenterContent ? (
            <Image
              src="/So-Passaros.svg"
              alt="Bemte.li"
              width={300}
              height={100}
              className="w-8 sm:w-12"
            />
          ) : (
            <Image
              src="/Logo-Horizontal.svg"
              alt="Bemte.li"
              width={300}
              height={100}
              className="w-24 sm:w-32"
            />
          )}
        </Link>

        {showCenterContent && (
          <div className="absolute left-1/2 transform -translate-x-1/2">
            {niusleter ? (
              <NiusleterTitle niusleter={niusleter} />
            ) : (
              <span className="text-xl sm:text-2xl font-bold text-sombra">{pageName}</span>
            )}
          </div>
        )}

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard">
                <Highlight color="citrino" className="text-base">Casa</Highlight>
              </Link>
              <Link href="/logout">
                <Highlight color="citrino" className="text-base">Sair</Highlight>
              </Link>
            </>
          ) : (
            <Link href="/solicitar-convite">
              <Highlight color="citrino" className="text-base">Faça parte</Highlight>
            </Link>
          )}
        </div>

        {/* Hamburger Menu */}
        <details className="md:hidden relative">
          <summary className="list-none p-2 cursor-pointer hover:opacity-70">
            <div className="flex flex-col justify-center w-6 h-6">
              <div className="w-6 h-0.5 bg-sombra mb-1"></div>
              <div className="w-6 h-0.5 bg-sombra mb-1"></div>
              <div className="w-6 h-0.5 bg-sombra"></div>
            </div>
          </summary>
          
          <div className="absolute top-full right-0 w-screen bg-creme border-b border-sombra">
            <div className="flex flex-col items-end p-4 gap-4">
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard">
                    <Highlight color="citrino" className="text-base">Casa</Highlight>
                  </Link>
                  <Link href="/logout">
                    <Highlight color="citrino" className="text-base">Sair</Highlight>
                  </Link>
                </>
              ) : (
                <Link href="/solicitar-convite">
                  <Highlight color="citrino" className="text-base">Faça parte</Highlight>
                </Link>
              )}
            </div>
          </div>
        </details>
      </nav>
    </div>
  );
} 