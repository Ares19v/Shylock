import React, { useState, useEffect } from 'react';

const API = 'http://localhost:8001';
const WL_KEY = 'shylock_watchlist';

const SIGNAL_COLORS = {
  OVERSOLD: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  BULLISH:  'text-emerald-700 bg-emerald-50 border-emerald-200',
  NEUTRAL:  'text-slate-500 bg-slate-50 border-slate-200',
  BEARISH:  'text-red-600 bg-red-50 border-red-200',
  OVERBOUGHT: 'text-red-700 bg-red-50 border-red-200',
};

export default function Watchlist({ onNavigateAnalysis }) {
  const [tickers, setTickers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(WL_KEY) || '[]'); } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const saveTickers = (list) => {
    localStorage.setItem(WL_KEY, JSON.stringify(list));
    setTickers(list);
  };
  const addTicker = (e) => {
    e.preventDefault();
    const t = input.trim().toUpperCase();
    if (!t || tickers.includes(t)) return;
    saveTickers([...tickers, t]);
    setInput('');
  };
  const removeTicker = (t) => saveTickers(tickers.filter(x => x !== t));

  const refresh = async () => {
    if (!tickers.length) return;
    setLoading(true);
    const results = {};
    await Promise.all(tickers.map(async (t) => {
      try {
        const res = await fetch(`${API}/quick/${t}`);
        if (res.ok) results[t] = await res.json();
      } catch { /* network error — skip ticker */ }
    }));
    setData(results);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refresh(); }, [tickers.length]);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
      <header className="bg-white border-b border-slate-200 flex items-center justify-between px-6 py-3 shrink-0">
        <div>
          <h1 className="font-h3 text-h3 text-primary">Watchlist</h1>
          <p className="font-caption text-caption text-outline mt-0.5">Track tickers with live price &amp; technicals</p>
        </div>
        <button onClick={refresh} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-DEFAULT text-on-surface-variant hover:text-primary hover:border-primary transition-colors font-label-sm text-label-sm disabled:opacity-40">
          <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>refresh</span>
          Refresh
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-12">
        <form onSubmit={addTicker} className="flex gap-3 mb-8">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">add</span>
            <input value={input} onChange={e => setInput(e.target.value)}
              placeholder="Add ticker (e.g. AAPL)"
              className="pl-10 pr-4 py-2.5 w-64 bg-surface-container-low border border-outline-variant rounded-DEFAULT text-on-surface placeholder:text-outline outline-none focus:border-primary transition-colors h-10 uppercase font-body-md text-body-md"
            />
          </div>
          <button type="submit" className="px-5 py-2 bg-primary text-on-primary font-label-sm text-label-sm rounded-DEFAULT hover:bg-tertiary transition-colors h-10">
            Add to Watchlist
          </button>
        </form>
        {!tickers.length ? (
          <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant opacity-50">
            <span className="material-symbols-outlined text-4xl mb-4">bookmarks</span>
            <p>Add tickers above to start tracking them</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container">
                  {['Ticker', 'Price', '1D Change', 'RSI', 'Signal', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickers.map(t => {
                  const d = data[t]?.technicals;
                  const change = d?.change_1d;
                  const rsi = d?.rsi;
                  const sig = rsi < 30 ? 'OVERSOLD' : rsi > 70 ? 'OVERBOUGHT' : change > 0.015 ? 'BULLISH' : change < -0.015 ? 'BEARISH' : 'NEUTRAL';
                  return (
                    <tr key={t} className="border-b border-surface-container last:border-0 hover:bg-surface-container/30 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-label-sm text-label-sm text-primary">{t}</span>
                        <span className="block font-caption text-[10px] text-outline">{data[t]?.company?.name || ''}</span>
                      </td>
                      <td className="px-5 py-4 font-body-md text-body-md text-primary">{d ? `$${d.current_price}` : loading ? '...' : '—'}</td>
                      <td className="px-5 py-4">
                        {d && <span className={`font-label-sm text-label-sm ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{change >= 0 ? '+' : ''}{((change || 0) * 100).toFixed(2)}%</span>}
                      </td>
                      <td className="px-5 py-4 font-body-md text-body-md text-primary">{d?.rsi ?? '—'}</td>
                      <td className="px-5 py-4">
                        {d && <span className={`px-2 py-0.5 font-caption text-[10px] uppercase tracking-wider rounded-sm border ${SIGNAL_COLORS[sig] || ''}`}>{sig}</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => onNavigateAnalysis(t)} className="font-caption text-caption text-primary hover:underline flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">analytics</span> Analyze
                          </button>
                          <button onClick={() => removeTicker(t)} className="text-outline hover:text-error transition-colors">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
