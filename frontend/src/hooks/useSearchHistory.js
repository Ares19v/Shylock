import { useState } from 'react';

const KEY = 'delphi_history';
const MAX = 10;

export function useSearchHistory() {
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  });

  const addToHistory = (ticker) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.ticker !== ticker.toUpperCase());
      const next = [{ ticker: ticker.toUpperCase(), ts: Date.now() }, ...filtered].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem(KEY);
    setHistory([]);
  };

  return { history, addToHistory, clearHistory };
}
