import React, { useState } from 'react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis
} from 'recharts';
import {
  ArrowLeftRight,
  TrendingUp,
  Sparkles,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck
} from 'lucide-react';

const API = 'http://localhost:8001';

function MetricRow({ label, a, b, highlightWinner = false }) {
  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
      <td className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</td>
      <td className="py-3.5 px-4 text-sm font-extrabold text-gray-900 text-center">{a ?? '—'}</td>
      <td className="py-3.5 px-4 text-sm font-extrabold text-gray-900 text-center">{b ?? '—'}</td>
    </tr>
  );
}

export default function Compare() {
  const [t1, setT1] = useState('NVDA');
  const [t2, setT2] = useState('AMD');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async (e) => {
    if (e) e.preventDefault();
    if (!t1.trim() || !t2.trim()) return;
    setLoading(true);
    setError('');
    setData(null);
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
    date: p.date,
    [A.ticker]: p.close,
    [B?.ticker]: B?.price?.data?.[i]?.close,
  })) || [];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f3f4f6]">
      
      {/* Sub-Header Inputs */}
      <div className="px-4 md:px-8 py-4 bg-[#f3f4f6] shrink-0 border-b border-gray-200/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Side-by-Side Equities Battle</h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Compare forensic sentiment, technical momentum, and price divergence</p>
          </div>

          <form onSubmit={run} className="flex items-center gap-2">
            <input
              value={t1}
              onChange={e => setT1(e.target.value)}
              placeholder="Ticker 1 (e.g. NVDA)"
              className="w-28 sm:w-36 uppercase font-bold text-xs px-3.5 py-2 bg-white rounded-full border border-gray-200 shadow-sm outline-none focus:border-gray-400 text-gray-900"
            />
            <span className="text-xs font-bold text-gray-400">VS</span>
            <input
              value={t2}
              onChange={e => setT2(e.target.value)}
              placeholder="Ticker 2 (e.g. AMD)"
              className="w-28 sm:w-36 uppercase font-bold text-xs px-3.5 py-2 bg-white rounded-full border border-gray-200 shadow-sm outline-none focus:border-gray-400 text-gray-900"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowLeftRight className="w-3.5 h-3.5" />
              )}
              <span>{loading ? 'Comparing...' : 'Compare'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Main Comparison Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-12">
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-3xl border border-red-200 text-sm font-medium">
            {error}
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-3 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
            <h3 className="text-base font-bold text-gray-900">Synthesizing Dual Pipelines</h3>
            <p className="text-xs text-gray-500 mt-1">Fetching FinBERT sentiment and technical histories in parallel (~10s)...</p>
          </div>
        )}

        {!data && !loading && !error && (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
              <ArrowLeftRight className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Head-to-Head Comparison</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              Enter any two tickers above (e.g. <strong>NVDA</strong> vs <strong>AMD</strong> or <strong>AAPL</strong> vs <strong>MSFT</strong>) and click <strong>Compare</strong>.
            </p>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            
            {/* Dual Hero Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[A, B].map((d, idx) => d && (
                <div
                  key={d.ticker}
                  className={`rounded-3xl p-6 shadow-sm border transition-all ${
                    idx === 0 ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-gray-900 border-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black">{d.ticker}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          idx === 0 ? 'bg-white/10 text-emerald-400' : 'bg-gray-100 text-gray-700'
                        }`}>
                          Asset #{idx + 1}
                        </span>
                      </div>
                      <p className={`text-xs font-medium mt-1 truncate ${idx === 0 ? 'text-gray-400' : 'text-gray-500'}`}>
                        {d.company?.name || 'Equity Asset'}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-black">${d.technicals?.current_price || '0.00'}</p>
                      <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full mt-1 ${
                        (d.technicals?.change_1d || 0) >= 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {(d.technicals?.change_1d || 0) >= 0 ? '+' : ''}
                        {((d.technicals?.change_1d || 0) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200/10 text-center">
                    <div>
                      <span className={`text-[10px] uppercase tracking-wider ${idx === 0 ? 'text-gray-400' : 'text-gray-400'}`}>Sentiment</span>
                      <p className="text-sm font-bold mt-0.5">{d.overall_sentiment?.label || 'NEUTRAL'}</p>
                    </div>
                    <div>
                      <span className={`text-[10px] uppercase tracking-wider ${idx === 0 ? 'text-gray-400' : 'text-gray-400'}`}>Bull Ratio</span>
                      <p className="text-sm font-bold mt-0.5">{((d.overall_sentiment?.bullish || 0) * 100).toFixed(0)}%</p>
                    </div>
                    <div>
                      <span className={`text-[10px] uppercase tracking-wider ${idx === 0 ? 'text-gray-400' : 'text-gray-400'}`}>RSI</span>
                      <p className="text-sm font-bold mt-0.5">{d.technicals?.rsi || '50'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Metrics Breakdown Table */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
              <h3 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                Quantitative &amp; Sentiment Forensics
              </h3>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3 px-4">Metric</th>
                    <th className="pb-3 px-4 text-center text-gray-900">{A?.ticker}</th>
                    <th className="pb-3 px-4 text-center text-gray-900">{B?.ticker}</th>
                  </tr>
                </thead>
                <tbody>
                  <MetricRow label="Overall Sentiment Bias" a={A?.overall_sentiment?.label} b={B?.overall_sentiment?.label} />
                  <MetricRow label="Bullish Confidence" a={`${((A?.overall_sentiment?.bullish || 0) * 100).toFixed(0)}%`} b={`${((B?.overall_sentiment?.bullish || 0) * 100).toFixed(0)}%`} />
                  <MetricRow label="RSI Relative Strength" a={A?.technicals?.rsi} b={B?.technicals?.rsi} />
                  <MetricRow label="Volatility (30D)" a={A?.technicals?.volatility} b={B?.technicals?.volatility} />
                  <MetricRow label="Directional AI Signal" a={A?.direction?.signal} b={B?.direction?.signal} />
                  <MetricRow label="Signal Confidence" a={`${((A?.direction?.confidence || 0) * 100).toFixed(0)}%`} b={`${((B?.direction?.confidence || 0) * 100).toFixed(0)}%`} />
                  <MetricRow label="Total Signal Volume" a={A?.overall_sentiment?.text_count} b={B?.overall_sentiment?.text_count} />
                </tbody>
              </table>
            </div>

            {/* Dual Price History Chart */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Historical Price Overlay</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Normalized comparative performance</p>
                  </div>
                </div>

                <div className="h-64 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                    <LineChart data={chartData}>
                      <XAxis dataKey="date" hide />
                      <YAxis domain={['auto', 'auto']} hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111827',
                          borderRadius: '16px',
                          color: '#fff',
                          border: 'none',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                          fontSize: '12px'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey={A.ticker} stroke="#111827" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey={B.ticker} stroke="#3b82f6" strokeWidth={2.5} dot={false} strokeDasharray="4 4" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
