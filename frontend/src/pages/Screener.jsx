import React, { useState } from 'react';
import {
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';

const API = 'http://localhost:8001';
const SECTORS = ['All', 'Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer', 'Industrials', 'ETF'];
const SIGNALS = ['All', 'OVERSOLD', 'BULLISH', 'NEUTRAL', 'BEARISH', 'OVERBOUGHT'];

const SIGNAL_CLASSES = {
  OVERSOLD:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  BULLISH:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  NEUTRAL:    'bg-gray-100 text-gray-700 border-gray-200',
  BEARISH:    'bg-red-50 text-red-700 border-red-200',
  OVERBOUGHT: 'bg-red-50 text-red-700 border-red-200',
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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f3f4f6]">
      
      {/* Sub-Header / Filter Controls */}
      <div className="px-4 md:px-8 py-4 bg-[#f3f4f6] shrink-0 border-b border-gray-200/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Market Momentum Screener</h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Filter across 50+ equities for RSI divergences and momentum signals</p>
          </div>

          <button
            onClick={runScreen}
            disabled={loading}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <SlidersHorizontal className="w-3.5 h-3.5" />
            )}
            <span>{loading ? 'Screening Markets...' : 'Run Screener'}</span>
          </button>
        </div>

        {/* Pill Selector Bars */}
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sector:</span>
            <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-2xl shadow-sm border border-gray-200/70">
              {SECTORS.map(s => (
                <button
                  key={s}
                  onClick={() => setSector(s)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    sector === s
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Signal:</span>
            <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-2xl shadow-sm border border-gray-200/70">
              {SIGNALS.map(sig => (
                <button
                  key={sig}
                  onClick={() => setSignal(sig)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    signal === sig
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {sig}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-12">
        
        {!ran ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
              <SlidersHorizontal className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Custom Forensic Filter</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              Choose your sector and signal parameters above, then click <strong>Run Screener</strong> to find high-probability opportunities.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No Matching Equities</h3>
            <p className="text-xs text-gray-500 mt-1">Try broadening your Sector or Signal filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">Screening Matches</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-900 text-white">
                  {results.length} results
                </span>
              </div>
              <span className="text-xs text-gray-400 font-medium">Ranked by momentum divergence</span>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-4 px-3">Ticker</th>
                    <th className="pb-4 px-3">Sector</th>
                    <th className="pb-4 px-3">Price</th>
                    <th className="pb-4 px-3">1D Change</th>
                    <th className="pb-4 px-3">RSI Momentum</th>
                    <th className="pb-4 px-3">Signal</th>
                    <th className="pb-4 px-3 text-right">Deep Dive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {results.map(r => {
                    const isPositive = Number(r.change_1d) >= 0;
                    return (
                      <tr key={r.ticker} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-4 px-3 font-extrabold text-sm text-gray-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-800">
                              {r.ticker.slice(0, 2)}
                            </div>
                            <span>{r.ticker}</span>
                          </div>
                        </td>

                        <td className="py-4 px-3">
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                            {r.sector}
                          </span>
                        </td>

                        <td className="py-4 px-3 font-bold text-sm text-gray-900">
                          ${r.price}
                        </td>

                        <td className="py-4 px-3">
                          <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            isPositive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}>
                            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {isPositive ? '+' : ''}{r.change_1d}%
                          </span>
                        </td>

                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-800">{r.rsi}</span>
                            <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className={`h-full rounded-full ${
                                  r.rsi > 70 ? 'bg-red-500' : r.rsi < 30 ? 'bg-emerald-500' : 'bg-gray-900'
                                }`}
                                style={{ width: `${Math.min(r.rsi, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-3">
                          <span className={`px-3 py-1 font-bold text-[10px] uppercase tracking-wider rounded-full border ${SIGNAL_CLASSES[r.signal] || ''}`}>
                            {r.signal}
                          </span>
                        </td>

                        <td className="py-4 px-3 text-right">
                          <button
                            onClick={() => onNavigateAnalysis(r.ticker)}
                            className="px-3.5 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm"
                          >
                            <Activity className="w-3.5 h-3.5" />
                            Analyze
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
