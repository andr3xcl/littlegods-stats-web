
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function getCachedData(key) {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }

  return cached.data;
}

export function setCachedData(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

export function clearCache() {
  cache.clear();
}

import { useState, useEffect } from 'react';

export function useCachedData(key, fetcher) {
  const [data, setData] = useState(() => getCachedData(key));
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      const cached = getCachedData(key);
      if (cached && mounted) {
        setData(cached);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await fetcher();
        if (mounted) {
          setCachedData(key, result);
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [key, fetcher]);

  return { data, loading, error };
}
