'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/pocketbase'
import { useUser } from '@/contexts/userContext'

// Aceita apenas pathnames same-origin (`/algo` ou `/algo/sub`). Tudo que não
// começar com uma única barra é tratado como inválido para evitar redirect
// open-relay.
function sanitizeRedirect(raw: string | null): string {
  if (!raw) return '/casa'
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/casa'
  return raw
}

export default function EntrarPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useUser()

  const redirectTarget = sanitizeRedirect(searchParams.get('redirect'))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Rede de seguran\u00e7a client-side. O middleware deve ter interceptado, mas se
  // por algum motivo o usu\u00e1rio chegou aqui j\u00e1 logado, manda para `/casa`.
  useEffect(() => {
    const pb = createBrowserClient()
    if (pb.authStore.isValid) {
      router.replace(redirectTarget)
    }
  }, [router, redirectTarget])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setEmailError(null)
    setPasswordError(null)

    let hasFieldError = false
    if (!email.trim()) {
      setEmailError('Informe seu e-mail.')
      hasFieldError = true
    }
    if (!password) {
      setPasswordError('Informe sua senha.')
      hasFieldError = true
    }
    if (hasFieldError) return

    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
      router.replace(redirectTarget)
    } catch {
      setError('E-mail ou senha incorretos.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-marfim flex flex-col items-center px-4 py-12">
      <div className="mb-12">
        <Link href="/">
          <Image
            src="/Logo-Vertical.svg"
            alt="Bemte.li"
            width={120}
            height={120}
            priority
          />
        </Link>
      </div>

      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8 text-sombra">Entrar</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white border border-sombra/10 rounded-lg p-6"
          noValidate
        >
          <div>
            <label htmlFor="email" className="block text-sm text-sombra mb-1">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="w-full border border-sombra/30 px-3 py-2 text-sombra bg-marfim focus:outline-none focus:border-sombra"
              aria-invalid={emailError ? 'true' : 'false'}
              aria-describedby={emailError ? 'email-error' : undefined}
            />
            {emailError && (
              <p id="email-error" className="text-xs text-bordo mt-1">
                {emailError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-sombra mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              className="w-full border border-sombra/30 px-3 py-2 text-sombra bg-marfim focus:outline-none focus:border-sombra"
              aria-invalid={passwordError ? 'true' : 'false'}
              aria-describedby={passwordError ? 'password-error' : undefined}
            />
            {passwordError && (
              <p id="password-error" className="text-xs text-bordo mt-1">
                {passwordError}
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-bordo border border-bordo/30 bg-bordo/5 px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-citrino text-sombra py-2 font-bold hover:bg-citrino/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-xs text-sombra/60 mt-6">
          Sem cadastro por aqui — o Bemte.li é por convite.{' '}
          <Link href="/solicitar-convite" className="underline hover:text-sombra">
            Solicitar convite
          </Link>
        </p>
      </div>
    </div>
  )
}
