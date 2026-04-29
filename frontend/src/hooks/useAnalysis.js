import { useState, useRef, useEffect, useCallback } from 'react';

export function useAnalysis() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = useCallback(async (ticker, timeframe = '1W') => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(
        `http://localhost:8001/analyze/${ticker}?timeframe=${timeframe}`
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, analyze };
}

export function useSectorHeatmap() {
  const [heatmap, setHeatmap] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8001/sector-heatmap')
      .then((r) => r.json())
      .then((d) => setHeatmap(d.heatmap))
      .catch(() => {});
  }, []);

  return heatmap;
}
