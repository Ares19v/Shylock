import React, { useState, useEffect } from 'react';
import {
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Search,
  Bookmark
} from 'lucide-react';

const API = 'http://localhost:8001';
const WL_KEY = 'delphi_watchlist';

const SIGNAL_CLASSES = {
  OVERSOLD: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  BULLISH:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  NEUTRAL:  'bg-gray-100 text-gray-700 border-gray-200',
  BEARISH:  'bg-red-50 text-red-700 border-red-200',
  OVERBOUGHT: 'bg-red-50 text-red-700 border-red-200',
};

export default function Watchlist({ onNavigateAnalysis }) {
  const [tickers, setTickers] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(WL_KEY) || '[]');
      return stored.length ? stored : ['NVDA', 'AAPL', 'TSLA', 'AMD', 'MSFT'];
    } catch {
      return ['NVDA', 'AAPL', 'TSLA', 'AMD', 'MSFT'];
    }
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
      } catch {
        /* skip network error */
      }
    }));
    setData(results);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [tickers.length]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f3f4f6]">
      
      {/* Sub-header Bar */}
      <div className="px-4 md:px-8 py-4 bg-[#f3f4f6] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Active Portfolio Watchlist</h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Live price tracking, sentiment momentum &amp; technical indicators</p>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={addTicker} className="flex gap-2">
            <div className="relative">
              <Plus className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Add ticker (e.g. AMZN)"
                className="pl-10 pr-4 py-2 w-48 sm:w-60 bg-white rounded-full border border-gray-200 shadow-sm text-xs font-semibold text-gray-900 outline-none focus:border-gray-400 uppercase placeholder:normal-case placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </form>

          <button
            onClick={refresh}
            disabled={loading}
            className="p-2.5 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-600 transition-all disabled:opacity-50"
            title="Refresh Quotes"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-12">
        
        {/* Quick Stat Pill Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tracked Assets</span>
            <p className="text-2xl font-black text-gray-900 mt-1">{tickers.length}</p>
          </div>
          <div className="bg-gray-900 text-white rounded-3xl p-5 shadow-sm">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bullish Assets</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              {tickers.filter(t => (data[t]?.technicals?.change_1d || 0) >= 0).length}
            </p>
          </div>
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg. RSI</span>
            <p className="text-2xl font-black text-gray-900 mt-1">
              {tickers.length ? (tickers.reduce((acc, t) => acc + (data[t]?.technicals?.rsi || 50), 0) / tickers.length).toFixed(0) : '50'}
            </p>
          </div>
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Market Status</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">Active</p>
          </div>
        </div>

        {/* Watchlist Table */}
        {!tickers.length ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
              <Bookmark className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Your Watchlist is Empty</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              Add tickers in the search bar above to monitor live prices, RSI momentum, and forensic sentiment.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-4 px-3">Asset</th>
                    <th className="pb-4 px-3">Last Price</th>
                    <th className="pb-4 px-3">1D Change</th>
                    <th className="pb-4 px-3">RSI</th>
                    <th className="pb-4 px-3">Signal</th>
                    <th className="pb-4 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tickers.map(t => {
                    const d = data[t]?.technicals;
                    const change = d?.change_1d;
                    const rsi = d?.rsi;
                    const sig = rsi < 30 ? 'OVERSOLD' : rsi > 70 ? 'OVERBOUGHT' : change > 0.015 ? 'BULLISH' : change < -0.015 ? 'BEARISH' : 'NEUTRAL';
                    const isPositive = (change || 0) >= 0;

                    return (
                      <tr key={t} className="hover:bg-gray-50/70 transition-colors group">
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center font-extrabold text-sm text-gray-800 shrink-0">
                              {t.slice(0, 2)}
                            </div>
                            <div>
                              <span className="font-extrabold text-sm text-gray-900 block leading-tight">{t}</span>
                              <span className="text-[11px] font-medium text-gray-400 truncate max-w-[150px] block">
                                {data[t]?.company?.name || 'Equity Asset'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-3 font-extrabold text-sm text-gray-900">
                          {d ? `$${d.current_price}` : loading ? '...' : '—'}
                        </td>

                        <td className="py-4 px-3">
                          {d ? (
                            <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              isPositive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700'
                            }`}>
                              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {isPositive ? '+' : ''}{((change || 0) * 100).toFixed(2)}%
                            </span>
                          ) : '—'}
                        </td>

                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-800">{d?.rsi ?? '—'}</span>
                            {d?.rsi && (
                              <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                <div
                                  className={`h-full rounded-full ${
                                    d.rsi > 70 ? 'bg-red-500' : d.rsi < 30 ? 'bg-emerald-500' : 'bg-gray-900'
                                  }`}
                                  style={{ width: `${Math.min(d.rsi, 100)}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-3">
                          {d ? (
                            <span className={`px-3 py-1 font-bold text-[10px] uppercase tracking-wider rounded-full border ${SIGNAL_CLASSES[sig] || ''}`}>
                              {sig}
                            </span>
                          ) : '—'}
                        </td>

                        <td className="py-4 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onNavigateAnalysis(t)}
                              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition-all inline-flex items-center gap-1"
                            >
                              <Activity className="w-3 h-3" />
                              Analyze
                            </button>
                            <button
                              onClick={() => removeTicker(t)}
                              className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Remove from Watchlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
