import PocketBase from 'pocketbase';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type { Usuario, Texto, Niusleter, Inscrito, Convite, Rodape } from './types';

export type { Usuario, Texto, Niusleter, Inscrito, Convite, Rodape } from './types';

// URL pública usada pelo navegador (acessível pelo usuário final).
const getPublicUrl = () => {
  if (!process.env.NEXT_PUBLIC_POCKETBASE_URL) {
    console.error('[PocketBase] NEXT_PUBLIC_POCKETBASE_URL não definida.');
    throw new Error('NEXT_PUBLIC_POCKETBASE_URL é necessária para requisições client-side.');
  }
  return process.env.NEXT_PUBLIC_POCKETBASE_URL;
};

// URL interna da rede Docker, usada pelo lado servidor do Next.js.
const getInternalUrl = () => {
  if (!process.env.POCKETBASE_INTERNAL_URL) {
    console.error('[PocketBase] POCKETBASE_INTERNAL_URL não definida.');
    throw new Error('POCKETBASE_INTERNAL_URL é necessária para requisições server-side.');
  }
  return process.env.POCKETBASE_INTERNAL_URL;
};

export const getPublicPocketBaseUrl = () => process.env.NEXT_PUBLIC_POCKETBASE_URL || '';

/**
 * Constrói a URL completa para um arquivo do PocketBase. O PocketBase
 * armazena apenas o nome do arquivo — esta função monta a URL pública.
 */
export const getPocketBaseFileUrl = (
  collectionName: string,
  recordId: string,
  filename: string | undefined
): string => {
  if (!filename) return '';
  return `${getPublicPocketBaseUrl()}/api/files/${collectionName}/${recordId}/${filename}`;
};

// Singleton do navegador. O SDK precisa ficar único na aba para que o
// `authStore` (e o handler de cookie) seja compartilhado entre componentes.
let browserSingleton: PocketBase | null = null;

/**
 * Cria (ou retorna) a instância do PocketBase para uso no navegador.
 *
 * No primeiro uso, registra um `pb.authStore.onChange` que espelha o estado
 * de autenticação para um cookie `pb_auth` via `exportToCookie`. Isso permite
 * que o middleware do Next.js leia a sessão server-side antes de renderizar
 * qualquer HTML protegido.
 *
 * Quando chamada em contexto server-side (build, RSC sem cookies), retorna
 * uma instância sem cookie-mirror — útil para fetches públicos.
 */
export function createBrowserClient(): PocketBase {
  if (typeof window === 'undefined') {
    return new PocketBase(getInternalUrl());
  }

  if (!browserSingleton) {
    browserSingleton = new PocketBase(getPublicUrl());
    browserSingleton.authStore.onChange(() => {
      if (!browserSingleton) return;
      document.cookie = browserSingleton.authStore.exportToCookie({
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
      });
    });
  }

  return browserSingleton;
}

/**
 * Cria uma instância do PocketBase server-side. Sempre fresca (nunca
 * compartilha estado entre requests). Quando recebe um `cookieStore` do
 * Next.js, hidrata o `authStore` lendo o cookie `pb_auth` via
 * `loadFromCookie`.
 */
export function createServerClient(cookieStore?: ReadonlyRequestCookies): PocketBase {
  const pb = new PocketBase(getInternalUrl());
  if (cookieStore) {
    const authCookie = cookieStore.get('pb_auth');
    if (authCookie?.value) {
      try {
        pb.authStore.loadFromCookie(`${authCookie.name}=${authCookie.value}`);
      } catch (err) {
        console.warn('[PocketBase] Cookie pb_auth inválido, ignorando:', err);
      }
    }
  }
  return pb;
}

// Tipos para criação de registros via API pública.
export interface ConviteData {
  email?: string;
  nome?: string;
  sobre?: string;
}

export interface InscritoData {
  email: string;
  nota?: string;
  niusleter: string;
}

export const createConvite = async (data: ConviteData) => {
  const pb = createBrowserClient();
  try {
    return await pb.collection('convites').create(data);
  } catch (error) {
    console.error('Error creating convite:', error);
    throw error;
  }
};

export const createInscricao = async (data: InscritoData) => {
  const pb = createBrowserClient();
  try {
    return await pb.collection('inscritos').create(data);
  } catch (error) {
    console.error('Error creating inscricao:', error);
    throw error;
  }
};

export const getTextosByNiusleter = async (niusleterId: string): Promise<Texto[]> => {
  const pb = createServerClient();
  try {
    console.log('[PocketBase] Fetching textos by niusleterId:', niusleterId);
    return await pb.collection('textos').getFullList<Texto>({
      filter: `niusleter="${niusleterId}"`,
      expand: 'niusleter,niusleter.usuario,rodape',
      sort: '-created',
    });
  } catch (error) {
    console.error('[PocketBase] Error fetching textos by niusleterId:', error);
    throw error;
  }
};

export const getTextoByPath = async (path: string): Promise<Texto> => {
  const pb = createServerClient();
  try {
    console.log('[PocketBase] Fetching texto by path:', path);
    return await pb.collection('textos').getFirstListItem<Texto>(`caminho="${path}"`, {
      expand: 'niusleter,niusleter.usuario,rodape',
    });
  } catch (error) {
    console.error('[PocketBase] Error fetching texto by path:', error);
    throw error;
  }
};

export const getNiusleterByPath = async (path: string): Promise<Niusleter> => {
  const pb = createServerClient();
  try {
    return await pb.collection('niusleteres').getFirstListItem<Niusleter>(`caminho="${path}"`, {
      expand: 'usuario',
    });
  } catch (error) {
    console.error('[PocketBase] Error fetching niusleter by path:', error);
    throw error;
  }
};

/**
 * Busca a niusleter associada ao usuário autenticado. Retorna `null` quando
 * a conta existe mas ainda não está vinculada a nenhuma niusleter (criação
 * de niusleter é admin-only por enquanto).
 */
export const getMinhaNiusleter = async (): Promise<Niusleter | null> => {
  const pb = createBrowserClient();
  const userId = pb.authStore.model?.id;
  if (!userId) return null;
  try {
    return await pb.collection('niusleteres').getFirstListItem<Niusleter>(
      `usuario="${userId}"`
    );
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'status' in error && (error as { status: number }).status === 404) {
      return null;
    }
    console.error('[PocketBase] Error fetching minha niusleter:', error);
    throw error;
  }
};

/* ── Compatibilidade com o código existente ────────────────────────────── */

/**
 * @deprecated Use `createBrowserClient()` em código novo.
 */
export const getClientSideInstance = (): PocketBase => {
  if (typeof window === 'undefined') {
    throw new Error('Instância client-side não pode ser usada no servidor');
  }
  return createBrowserClient();
};

/**
 * @deprecated Use `createServerClient()` em código novo.
 */
export const getServerSideInstance = (): PocketBase => {
  return createServerClient();
};
