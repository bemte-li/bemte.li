import { cookies } from 'next/headers';
import { createServerClient } from './pocketbase';

/**
 * Verifica se a requisição RSC atual carrega uma sessão válida do PocketBase.
 *
 * Lê o cookie `pb_auth` via `next/headers` — portanto este módulo só pode ser
 * importado a partir de Server Components / Route Handlers. Em Client
 * Components, use `useUser()` do `@/contexts/userContext`.
 */
export function getServerIsLoggedIn(): boolean {
  const pb = createServerClient(cookies());
  return pb.authStore.isValid;
}
