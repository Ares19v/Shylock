import React, { useState } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const API = 'http://localhost:8001';

const SIGNAL_COLORS = {
  OVERSOLD: 'text-emerald-600', BULLISH: 'text-emerald-600',
  NEUTRAL: 'text-slate-500', BEARISH: 'text-red-500', OVERBOUGHT: 'text-red-600',
};

function MetricRow({ label, a, b }) {
  return (
    <tr className="border-b border-surface-container last:border-0">
      <td className="px-4 py-2.5 font-caption text-caption text-on-surface-variant uppercase tracking-widest">{label}</td>
      <td className="px-4 py-2.5 font-body-md text-body-md text-primary text-center">{a ?? '—'}</td>
      <td className="px-4 py-2.5 font-body-md text-body-md text-primary text-center">{b ?? '—'}</td>
    </tr>
  );
}

export default function Compare() {
  const [t1, setT1] = useState('');
  const [t2, setT2] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async (e) => {
    e.preventDefault();
    if (!t1.trim() || !t2.trim()) return;
    setLoading(true); setError(''); setData(null);
    try {
      const res = await fetch(`${API}/compare/${t1.trim().toUpperCase()}/${t2.trim().toUpperCase()}`);
      if (!res.ok) throw new Error('Failed to fetch comparison');
      const d = await res.json();
      setData(d);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const A = data?.a;
  const B = data?.b;

  const chartData = A?.price?.data?.map((p, i) => ({
    i,
    [A.ticker]: p.close,
    [B?.ticker]: B?.price?.data?.[i]?.close,
  })) || [];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
      <header className="bg-white border-b border-slate-200 px-6 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-h3 text-h3 text-primary">Compare</h1>
            <p className="font-caption text-caption text-outline mt-0.5">Side-by-side sentiment &amp; technical analysis</p>
          </div>
          <form onSubmit={run} className="flex items-center gap-3">
            {[t1, t2].map((val, i) => (
              <input key={i} value={val} onChange={e => i === 0 ? setT1(e.target.value) : setT2(e.target.value)}
                placeholder={`Ticker ${i + 1}`}
                className="w-32 px-3 py-2 border border-outline-variant rounded-DEFAULT bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-outline outline-none focus:border-primary transition-colors h-10 uppercase"
              />
            ))}
            <button type="submit" disabled={loading}
              className="bg-primary text-on-primary font-label-sm text-label-sm px-5 py-2 h-10 rounded-DEFAULT hover:bg-tertiary transition-colors flex items-center gap-2 disabled:opacity-50">
              <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>{loading ? 'hourglass_empty' : 'compare_arrows'}</span>
              {loading ? 'Analysing...' : 'Compare'}
            </button>
          </form>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-12">
        {error && <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg">{error}</div>}
        {loading && (
          <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant opacity-50">
            <span className="material-symbols-outlined text-4xl mb-4 animate-spin">hourglass_empty</span>
            <p>Running parallel analysis… this may take ~20s</p>
          </div>
        )}
        {!data && !loading && !error && (
          <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant opacity-50">
            <span className="material-symbols-outlined text-4xl mb-4">compare_arrows</span>
            <p>Enter two tickers above to compare them</p>
          </div>
        )}
        {data && (
          <div className="space-y-6">
            {/* Header row */}
            <div className="grid grid-cols-3 gap-6">
              <div></div>
              {[A, B].map(d => d && (
                <div key={d.ticker} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 text-center">
                  <p className="font-h2 text-h2 text-primary">{d.ticker}</p>
                  <p className="font-caption text-caption text-outline">{d.company?.name}</p>
                  <p className="font-h3 text-h3 text-primary mt-2">${d.technicals?.current_price}</p>
                  <p className={`font-label-sm text-label-sm mt-1 ${d.technicals?.change_1d >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {((d.technicals?.change_1d || 0) * 100).toFixed(2)}%
                  </p>
                </div>
              ))}
            </div>

            {/* Metrics comparison */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-outline-variant bg-surface-container">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Technical Comparison</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="px-4 py-2.5 text-left font-caption text-caption text-outline uppercase tracking-widest">Metric</th>
                    <th className="px-4 py-2.5 text-center font-label-sm text-label-sm text-primary uppercase tracking-widest">{A?.ticker}</th>
                    <th className="px-4 py-2.5 text-center font-label-sm text-label-sm text-primary uppercase tracking-widest">{B?.ticker}</th>
                  </tr>
                </thead>
                <tbody>
                  <MetricRow label="Sentiment" a={A?.overall_sentiment?.label} b={B?.overall_sentiment?.label} />
                  <MetricRow label="Bullish %" a={`${((A?.overall_sentiment?.bullish||0)*100).toFixed(0)}%`} b={`${((B?.overall_sentiment?.bullish||0)*100).toFixed(0)}%`} />
                  <MetricRow label="RSI" a={A?.technicals?.rsi} b={B?.technicals?.rsi} />
                  <MetricRow label="Volatility" a={A?.technicals?.volatility} b={B?.technicals?.volatility} />
                  <MetricRow label="Signal" a={A?.direction?.signal} b={B?.direction?.signal} />
                  <MetricRow label="Confidence" a={`${((A?.direction?.confidence||0)*100).toFixed(0)}%`} b={`${((B?.direction?.confidence||0)*100).toFixed(0)}%`} />
                </tbody>
              </table>
            </div>

            {/* Dual price chart */}
            {chartData.length > 0 && (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6">
                <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-4">Price History Overlay</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartData}>
                    <Line type="monotone" dataKey={A.ticker} stroke="#1a222e" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey={B.ticker} stroke="#64748b" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                    <Tooltip />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
