'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/userContext';
import { getMinhaNiusleter } from '@/lib/pocketbase';
import type { Niusleter } from '@/lib/types';

/**
 * Niusleter da sessão atual (uma por usuário). Útil em rotas /casa e /criar.
 */
export function useMinhaNiusleter(): {
  niusleter: Niusleter | null;
  loading: boolean;
  error: Error | null;
} {
  const { user, loading: authLoading } = useUser();
  const [niusleter, setNiusleter] = useState<Niusleter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const n = await getMinhaNiusleter();
        if (!cancelled) {
          setNiusleter(n);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id]);

  return {
    niusleter,
    loading: authLoading || loading,
    error,
  };
}
