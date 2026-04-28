import Image from 'next/image';
import Link from 'next/link';
import { Highlight } from './Highlight';
import { getPocketBaseFileUrl } from '@/lib/pocketbase';
import type { Niusleter } from '@/lib/types';

interface NavbarProps {
  isLoggedIn?: boolean;
  /**
   * Quando passado, a navbar entra no modo "página da niusleter": logo
   * compacto (passarinhos) à esquerda e nome/foto da niusleter no centro,
   * conforme `display_mode`.
   *
   * Quando ausente, a navbar mostra o logo horizontal Bemte.li e nada no
   * centro — usado nas páginas onde o conteúdo já carrega o título grande
   * (ex.: `/[niusleter_path]`, com `NiusleterHeader`) ou nas páginas
   * institucionais.
   */
  niusleter?: Niusleter;
}

function NiusleterTitle({ niusleter }: { niusleter: Niusleter }) {
  const titleClassName = 'text-xl sm:text-2xl font-bold text-sombra';

  if (niusleter.display_mode === 'title_with_3x4_photo') {
    const foto3x4Url = getPocketBaseFileUrl('niusleteres', niusleter.id, niusleter.foto_3x4);
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
        <span className={titleClassName}>{niusleter.nome}</span>
      </div>
    );
  }

  if (niusleter.display_mode === 'title_image_horizontal') {
    const fotoHorizontalUrl = getPocketBaseFileUrl(
      'niusleteres',
      niusleter.id,
      niusleter.foto_horizontal,
    );
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
  }

  return <span className={titleClassName}>{niusleter.nome}</span>;
}

function SessionLink({ isLoggedIn }: { isLoggedIn: boolean }) {
  const href = isLoggedIn ? '/casa' : '/solicitar-convite';
  const label = isLoggedIn ? 'Casa' : 'Faça parte';
  return (
    <Link href={href}>
      <Highlight color="citrino" className="text-base">
        {label}
      </Highlight>
    </Link>
  );
}

function HomeLogo({ compact }: { compact: boolean }) {
  if (compact) {
    return (
      <Image
        src="/So-Passaros.svg"
        alt="Bemte.li"
        width={300}
        height={100}
        className="w-8 sm:w-12"
      />
    );
  }
  return (
    <Image
      src="/Logo-Horizontal.svg"
      alt="Bemte.li"
      width={300}
      height={100}
      className="w-24 sm:w-32"
    />
  );
}

export function Navbar({ isLoggedIn = false, niusleter }: NavbarProps) {
  return (
    <div className="border-b border-sombra">
      <nav className="flex justify-between items-center px-6 py-4 bg-creme">
        <Link href="/" className="flex items-center gap-4" aria-label="Bemte.li">
          <HomeLogo compact={!!niusleter} />
        </Link>

        {niusleter && (
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <NiusleterTitle niusleter={niusleter} />
          </div>
        )}

        <div className="hidden md:flex items-center gap-4">
          <SessionLink isLoggedIn={isLoggedIn} />
        </div>

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
              <SessionLink isLoggedIn={isLoggedIn} />
            </div>
          </div>
        </details>
      </nav>
    </div>
  );
}
