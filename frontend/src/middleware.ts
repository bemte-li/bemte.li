import { NextResponse, type NextRequest } from 'next/server'
import PocketBase from 'pocketbase'

// Rotas em que exigimos sess\u00e3o v\u00e1lida.
const PROTECTED = [/^\/casa(\/|$)/, /^\/criar(\/|$)/]

// Lemos diretamente um `PocketBase` aqui (sem importar `createServerClient`)
// porque o middleware roda no Edge Runtime, que n\u00e3o suporta as APIs de
// `next/headers`. O custo \u00e9 baixo: `loadFromCookie` apenas decodifica o JWT.
function loadAuthFromCookie(cookieValue: string | undefined): PocketBase {
  const pb = new PocketBase()
  if (cookieValue) {
    try {
      pb.authStore.loadFromCookie(`pb_auth=${cookieValue}`)
    } catch {
      // cookie corrompido: trata como sem sess\u00e3o e segue
    }
  }
  return pb
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const cookie = request.cookies.get('pb_auth')?.value
  const pb = loadAuthFromCookie(cookie)

  if (pathname === '/entrar' && pb.authStore.isValid) {
    const url = request.nextUrl.clone()
    url.pathname = '/casa'
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (PROTECTED.some((r) => r.test(pathname))) {
    if (pb.authStore.isValid) return NextResponse.next()
    const url = request.nextUrl.clone()
    url.pathname = '/entrar'
    url.search = '?redirect=' + encodeURIComponent(pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - common static asset extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
}
