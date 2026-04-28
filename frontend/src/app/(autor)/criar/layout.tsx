'use client';

import { ARTICLE_COLUMN_CLASS } from '@/components/article-column';
import { Navbar } from '@/components/Navbar';
import { useUser } from '@/contexts/userContext';
import { useMinhaNiusleter } from '@/hooks/useMinhaNiusleter';

/**
 * Layout do editor: usa a mesma `Navbar` da leitura pública, mas com os
 * dados vindos da sessão atual (niusleter do usuário + estado de login).
 */
export default function CriarTextoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const { niusleter } = useMinhaNiusleter();

  return (
    <div>
      <Navbar niusleter={niusleter ?? undefined} isLoggedIn={!!user} />
      <div className={ARTICLE_COLUMN_CLASS}>{children}</div>
    </div>
  );
}
