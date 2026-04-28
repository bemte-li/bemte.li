import type { ReactNode } from 'react';
import { Navbar } from '@/components/Navbar';
import { ARTICLE_COLUMN_CLASS } from '@/components/article-column';
import { getServerIsLoggedIn } from '@/lib/auth-server';
import type { Niusleter } from '@/lib/types';

export { ARTICLE_COLUMN_CLASS };

/**
 * Shell público para páginas server-rendered: navbar + coluna padrão.
 *
 * - Sem `niusleter`: navbar mostra o logo horizontal Bemte.li e nada no
 *   centro (caso de `/[niusleter_path]`, que já tem o `NiusleterHeader`).
 * - Com `niusleter`: navbar usa o logo dos passarinhos à esquerda e o
 *   nome/foto da niusleter no centro (caso de `/[niusleter_path]/[texto]`).
 *
 * O estado de login é derivado do cookie `pb_auth` pelo servidor — não
 * precisa ser passado pela página.
 */
export function PublicShell({
  niusleter,
  children,
}: {
  niusleter?: Niusleter;
  children: ReactNode;
}) {
  const isLoggedIn = getServerIsLoggedIn();
  return (
    <>
      <Navbar niusleter={niusleter} isLoggedIn={isLoggedIn} />
      <div className={ARTICLE_COLUMN_CLASS}>{children}</div>
    </>
  );
}
