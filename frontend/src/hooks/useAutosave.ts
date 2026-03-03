'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const DRAFT_KEY = 'bemteli_draft'
const DEBOUNCE_MS = 2000

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface DraftData {
  title: string
  content: string
  rodape: {
    autor: string
    descricao: string
    foto: string | null
  }
}

export interface UseAutosaveReturn {
  status: AutosaveStatus
  saveNow: (data: DraftData) => void
  loadDraft: () => DraftData | null
  clearDraft: () => void
}

export function useAutosave(data: DraftData): UseAutosaveReturn {
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dataRef = useRef(data)

  useEffect(() => {
    dataRef.current = data
  }, [data])

  const persist = useCallback((payload: DraftData) => {
    setStatus('saving')
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...payload, savedAt: Date.now() }))
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }, [])

  const saveNow = useCallback(
    (payload: DraftData) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      persist(payload)
    },
    [persist]
  )

  const loadDraft = useCallback((): DraftData | null => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      const { savedAt: _savedAt, ...rest } = parsed
      return rest as DraftData
    } catch {
      return null
    }
  }, [])

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY)
    setStatus('idle')
  }, [])

  // Debounced autosave on data change
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      persist(dataRef.current)
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // Re-run only when the actual data values change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.title, data.content, data.rodape.autor, data.rodape.descricao, data.rodape.foto, persist])

  return { status, saveNow, loadDraft, clearDraft }
}
