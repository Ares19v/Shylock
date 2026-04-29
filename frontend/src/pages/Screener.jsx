import React, { useState } from 'react';

const API = 'http://localhost:8001';
const SECTORS = ['All', 'Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer', 'Industrials', 'ETF'];
const SIGNALS = ['All', 'OVERSOLD', 'BULLISH', 'NEUTRAL', 'BEARISH', 'OVERBOUGHT'];

const SIGNAL_COLORS = {
  OVERSOLD:   'text-emerald-600 bg-emerald-50 border-emerald-200',
  BULLISH:    'text-emerald-700 bg-emerald-50 border-emerald-200',
  NEUTRAL:    'text-slate-500 bg-slate-50 border-slate-200',
  BEARISH:    'text-red-600 bg-red-50 border-red-200',
  OVERBOUGHT: 'text-red-700 bg-red-50 border-red-200',
};

export default function Screener({ onNavigateAnalysis }) {
  const [sector, setSector] = useState('All');
  const [signal, setSignal] = useState('All');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  const runScreen = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sector !== 'All') params.set('sector', sector);
      if (signal !== 'All') params.set('signal', signal);
      const res = await fetch(`${API}/screener?${params}`);
      const data = await res.json();
      setResults(data.results || []);
      setRan(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
      <header className="bg-white border-b border-slate-200 px-6 py-3 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-h3 text-h3 text-primary">Stock Screener</h1>
            <p className="font-caption text-caption text-outline mt-0.5">Filter 50+ tickers by sector, RSI signal, and momentum</p>
          </div>
          <button onClick={runScreen} disabled={loading}
            className="bg-primary text-on-primary font-label-sm text-label-sm px-6 py-2 h-10 rounded-DEFAULT hover:bg-tertiary transition-colors flex items-center gap-2 disabled:opacity-50">
            <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>{loading ? 'hourglass_empty' : 'filter_list'}</span>
            {loading ? 'Screening...' : 'Run Screen'}
          </button>
        </div>
        <div className="flex gap-4">
          <div>
            <label className="font-caption text-caption text-outline block mb-1 uppercase tracking-widest">Sector</label>
            <select value={sector} onChange={e => setSector(e.target.value)}
              className="px-3 py-1.5 border border-outline-variant rounded-DEFAULT bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:border-primary transition-colors">
              {SECTORS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="font-caption text-caption text-outline block mb-1 uppercase tracking-widest">Signal</label>
            <select value={signal} onChange={e => setSignal(e.target.value)}
              className="px-3 py-1.5 border border-outline-variant rounded-DEFAULT bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:border-primary transition-colors">
              {SIGNALS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-12">
        {!ran ? (
          <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant opacity-50">
            <span className="material-symbols-outlined text-4xl mb-4">filter_list</span>
            <p>Set your filters above and click Run Screen</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant opacity-50">
            <span className="material-symbols-outlined text-4xl mb-4">search_off</span>
            <p>No results match your filters</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-outline-variant bg-surface-container flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Results</span>
              <span className="font-caption text-caption text-outline">{results.length} matches</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  {['Ticker', 'Sector', 'Price', '1D Change', 'RSI', 'Signal', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.ticker} className="border-b border-surface-container last:border-0 hover:bg-surface-container/30 transition-colors">
                    <td className="px-5 py-3 font-label-sm text-label-sm text-primary">{r.ticker}</td>
                    <td className="px-5 py-3 font-caption text-caption text-outline">{r.sector}</td>
                    <td className="px-5 py-3 font-body-md text-body-md text-primary">${r.price}</td>
                    <td className="px-5 py-3">
                      <span className={`font-label-sm text-label-sm ${r.change_1d >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {r.change_1d >= 0 ? '+' : ''}{r.change_1d}%
                      </span>
                    </td>
                    <td className="px-5 py-3 font-body-md text-body-md text-primary">{r.rsi}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 font-caption text-[10px] uppercase tracking-wider rounded-sm border ${SIGNAL_COLORS[r.signal] || ''}`}>{r.signal}</span>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => onNavigateAnalysis(r.ticker)} className="font-caption text-caption text-primary hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">analytics</span> Deep Dive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
