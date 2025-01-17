import Link from 'next/link';
import { Highlight } from './Highlight';

interface NavbarProps {
  isLoggedIn?: boolean;
  pageName?: string;
}

export function Navbar({ isLoggedIn = false, pageName }: NavbarProps) {
  return (
    <div className="border-b border-sombra">
      <nav className="flex justify-between items-center px-6 py-4 bg-creme">
        <div className="flex items-center gap-4">
          {/* Logo placeholder - will be replaced later */}
          <div className="w-8 h-8 bg-bordo rounded-full"></div>
        </div>

        {pageName && (
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <span className="text-2xl">{pageName}</span>
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
              <Highlight color="citrino" className="text-base">Solicite um convite</Highlight>
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
                  <Highlight color="citrino" className="text-base">Solicite um convite</Highlight>
                </Link>
              )}
            </div>
          </div>
        </details>
      </nav>
    </div>
  );
} 