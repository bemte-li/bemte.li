'use client'

import { useMemo } from 'react'
import DOMPurify from 'dompurify'

interface SanitizedHtmlProps {
  html: string
  className?: string
}

/**
 * Client Component que renderiza HTML de forma segura com sanitização via DOMPurify.
 * Use para qualquer conteúdo HTML gerado por usuários para prevenir ataques XSS.
 */
export function SanitizedHtml({ html, className }: SanitizedHtmlProps) {
  const sanitizedHtml = useMemo(
    () => DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }),
    [html]
  )

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
    />
  )
}
