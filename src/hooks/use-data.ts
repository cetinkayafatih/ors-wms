'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UseDataOptions<T> {
  /** Supabase fetcher function - receives supabase client */
  fetcher?: (supabase: ReturnType<typeof createClient>) => Promise<T>;
  /** Mock/fallback data to use when Supabase is unavailable */
  mockData: T;
  /** Whether to skip initial fetch */
  skip?: boolean;
}

interface UseDataReturn<T> {
  data: T;
  loading: boolean;
  error: string | null;
  usingMockData: boolean;
  refetch: () => Promise<void>;
}

/**
 * Dual-mode data hook
 * Supabase varsa gercek veri, yoksa mock fallback
 */
export function useData<T>(options: UseDataOptions<T>): UseDataReturn<T> {
  const { fetcher, mockData, skip = false } = options;
  const [data, setData] = useState<T>(mockData);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  const fetchData = useCallback(async () => {
    if (!fetcher) {
      setUsingMockData(true);
      setData(mockData);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const result = await fetcher(supabase);
      setData(result);
      setUsingMockData(false);
    } catch {
      setData(mockData);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  }, [fetcher, mockData]);

  useEffect(() => {
    if (!skip) {
      fetchData();
    }
  }, [skip, fetchData]);

  return { data, loading, error, usingMockData, refetch: fetchData };
}
