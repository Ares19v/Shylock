import React, { useState, useRef, useEffect } from 'react';
import { useAnalysis, useSectorHeatmap } from '../hooks/useAnalysis';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Download,
  Share2,
  Clock,
  Radio,
  FileText,
  MessageSquare,
  Newspaper,
  Hash,
  Sparkles,
  ChevronUp,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function StatCard({ title, value, subtext, trend, dark = false, negative = false, icon: Icon }) {
  return (
    <div
      className={`rounded-3xl p-5 md:p-6 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col justify-between relative overflow-hidden ${
        dark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 border border-gray-100'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-2xl ${dark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="my-1">
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">{value}</h3>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100/10">
        <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'} truncate`}>
          {subtext}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              negative
                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
            }`}
          >
            {negative ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>

      {dark && (
        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
      )}
    </div>
  );
}

function SourceCard({ title, icon: Icon, pct, count, sentiment }) {
  const isBull = pct >= 50;
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-gray-100 text-gray-700">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">{title}</h4>
            <span className="text-[10px] text-gray-400 font-medium">{count} data points</span>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
          isBull ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}>
          {isBull ? 'Bullish' : 'Bearish'}
        </span>
      </div>

      <div className="flex items-baseline justify-between mb-2 mt-4">
        <span className="text-2xl font-extrabold text-gray-900">{pct.toFixed(0)}%</span>
        <span className="text-xs text-gray-400 font-medium">positive ratio</span>
      </div>

      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            isBull ? 'bg-gray-900' : 'bg-red-500'
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function Analysis({ addToHistory, initialTicker = 'NVDA', onTickerChange, user, history, clearHistory, onAuthClick }) {
  const { data, isLoading, error, analyze } = useAnalysis();
  const heatmap = useSectorHeatmap();
  const [tickerInput, setTickerInput] = useState(initialTicker || 'NVDA');
  const [timeframe, setTimeframe] = useState('1W');
  const [pdfLoading, setPdfLoading] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    const t = (initialTicker || 'NVDA').trim().toUpperCase();
    analyze(t, timeframe);
    addToHistory(t);
  }, []);

  const handleSearch = (e, overrideTicker) => {
    if (e) e.preventDefault();
    const t = (overrideTicker || tickerInput).trim().toUpperCase();
    if (!t || isLoading) return;
    setTickerInput(t);
    analyze(t, timeframe);
    addToHistory(t);
    if (onTickerChange) onTickerChange(t);
  };

  const handleTimeframeChange = (tf) => {
    setTimeframe(tf);
    const t = tickerInput.trim().toUpperCase();
    if (t) analyze(t, tf);
  };

  const handleGeneratePDF = async () => {
    if (!reportRef.current || !data) return;
    setPdfLoading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f3f4f6'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      const date = new Date().toISOString().split('T')[0];
      pdf.save(`DELPHI_${data.ticker}_${date}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  const priceData = data?.price?.data || [];
  const overall_sentiment = data?.overall_sentiment || { bullish: 0, bearish: 0, neutral: 1, label: 'NEUTRAL', text_count: 0 };
  const technicals = data?.technicals || {};
  const company = data?.company || { name: '' };
  const ticker = data?.ticker || tickerInput || 'NVDA';
  const direction = data?.direction || {};

  const score = overall_sentiment.bullish - overall_sentiment.bearish;
  const needleAngle = 180 - ((score + 1) / 2) * 180;

  const redditSentiment = data?.sources?.reddit?.sentiment;
  const newsSentiment = data?.sources?.news?.sentiment;
  const stSentiment = data?.sources?.stocktwits?.sentiment;
  const redditPct = redditSentiment ? redditSentiment.bullish * 100 : 0;
  const newsPct = newsSentiment ? newsSentiment.bullish * 100 : 0;
  const stPct = stSentiment ? stSentiment.bullish * 100 : 0;

  const bullPct = Math.round(overall_sentiment.bullish * 100);
  const bearPct = Math.round(overall_sentiment.bearish * 100);
  const neutralPct = Math.round(overall_sentiment.neutral * 100);

  // SVG Circular Gauge calculations
  const donutRadius = 38;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutBullOffset = donutCircumference - (donutCircumference * (bullPct / 100));

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f3f4f6]">
      
      {/* Sub-Header Actions */}
      <div className="px-4 md:px-8 py-3 bg-[#f3f4f6] flex flex-wrap items-center justify-between gap-3 shrink-0">
        
        {/* Quick Ticker Switcher */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={tickerInput}
              onChange={e => setTickerInput(e.target.value)}
              placeholder="Ticker..."
              className="w-28 sm:w-36 uppercase font-bold text-sm px-3.5 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm outline-none focus:border-gray-400 text-gray-900"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Activity className="w-3.5 h-3.5" />
            )}
            Analyze
          </button>
        </form>

        <div className="flex items-center gap-3">
          {/* Timeframe Filter Pills */}
          <div className="flex gap-1.5 bg-white p-1 rounded-full shadow-sm border border-gray-200/70">
            {['1D', '1W', '1M', '3M', '6M', '1Y'].map(tf => (
              <button
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  timeframe === tf
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            onClick={handleGeneratePDF}
            disabled={!data || pdfLoading}
            className="px-4 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/80 rounded-full text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>{pdfLoading ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-12" ref={reportRef}>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-3xl border border-red-200 text-sm font-medium flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Entity Title Hero */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{ticker}</span>
              {company.name && (
                <span className="text-base sm:text-lg text-gray-400 font-medium truncate max-w-md">
                  {company.name}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 font-medium mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-time Social Sentiment &amp; FinBERT Forensic Pipeline
            </p>
          </div>

          <div className="flex items-baseline gap-4 sm:text-right">
            <div>
              <p className="text-3xl font-extrabold text-gray-900">
                ${technicals.current_price || '0.00'}
              </p>
              <div className="flex items-center sm:justify-end gap-1.5 mt-0.5">
                <span
                  className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                    (technicals.change_1d || 0) >= 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {(technicals.change_1d || 0) >= 0 ? '+' : ''}
                  {((technicals.change_1d || 0) * 100).toFixed(2)}% (1D)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <StatCard
            title="Overall Sentiment"
            value={`${overall_sentiment.label} ${bullPct}%`}
            subtext={`${overall_sentiment.text_count || 0} signals synthesized`}
            trend={bullPct > 50 ? `+${bullPct - 50}%` : `-${50 - bullPct}%`}
            dark
            icon={TrendingUp}
          />
          <StatCard
            title="Market Direction"
            value={direction.signal || 'HOLD'}
            subtext={`Confidence: ${((direction.confidence || 0) * 100).toFixed(0)}%`}
            trend={direction.signal === 'BUY' ? 'Strong' : 'Neutral'}
            negative={direction.signal === 'SELL'}
            icon={Radio}
          />
          <StatCard
            title="Relative Strength"
            value={`RSI ${technicals.rsi || '50'}`}
            subtext={technicals.rsi > 70 ? 'Overbought Zone' : technicals.rsi < 30 ? 'Oversold Opportunity' : 'Balanced Momentum'}
            trend={technicals.rsi > 50 ? 'Bullish' : 'Neutral'}
            icon={Activity}
          />
          <StatCard
            title="Forensic Volume"
            value={`${(data?.sources?.reddit?.posts?.length || 0) + (data?.sources?.news?.articles?.length || 0) + (data?.sources?.stocktwits?.posts?.length || 0)}`}
            subtext="Total captured posts &amp; news"
            trend="+14.2%"
            icon={MessageSquare}
          />
        </div>

        {/* Middle Section: Price Chart & Sentiment Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Main Price History Chart (2 cols) */}
          <div className="col-span-1 lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Price Momentum Flow</h3>
                <p className="text-xs text-gray-400 mt-0.5">Historical close prices over selected timeframe</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-900" />
                <span className="text-xs font-semibold text-gray-600">Close Price</span>
              </div>
            </div>

            <div className="h-64 w-full mt-2 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                <AreaChart data={priceData}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#111827" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#111827" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
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
                    formatter={(val) => [`$${Number(val).toFixed(2)}`, 'Price']}
                  />
                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke="#111827"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#priceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sentiment Radial / Donut Gauge (1 col) */}
          <div className="col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-bold text-gray-900">Sentiment Distribution</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                FinBERT
              </span>
            </div>

            {/* Circular Donut Visual */}
            <div className="flex items-center justify-center my-4 relative">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r={donutRadius}
                  stroke="#f3f4f6"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={donutRadius}
                  stroke="#111827"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={donutCircumference}
                  strokeDashoffset={donutBullOffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-gray-900">{bullPct}%</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bullish</span>
              </div>
            </div>

            {/* Bull / Neutral / Bear Progress Breakdown */}
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                  <span>Bullish Bias</span>
                  <span>{bullPct}%</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-900 rounded-full" style={{ width: `${bullPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                  <span>Bearish Pressure</span>
                  <span>{bearPct}%</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${bearPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                  <span>Neutral Discussion</span>
                  <span>{neutralPct}%</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-400 rounded-full" style={{ width: `${neutralPct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Source Intelligence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SourceCard
            title="Reddit Community"
            icon={MessageSquare}
            pct={redditPct}
            count={data?.sources?.reddit?.posts?.length || 0}
          />
          <SourceCard
            title="Financial News"
            icon={Newspaper}
            pct={newsPct}
            count={data?.sources?.news?.articles?.length || 0}
          />
          <SourceCard
            title="StockTwits Stream"
            icon={Hash}
            pct={stPct}
            count={data?.sources?.stocktwits?.posts?.length || 0}
          />
        </div>

        {/* Live Signal Feed & Peer Correlation Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Live Feed (5 cols) */}
          <div className="col-span-1 lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-[440px]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-base font-bold text-gray-900">Live Forensic Feed</h3>
              </div>
              <span className="text-xs text-gray-400 font-semibold">Real-time Stream</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {data?.feed?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-gray-50/70 hover:bg-gray-100/80 transition-all border border-gray-100"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      item.source === 'news'
                        ? 'bg-blue-50 text-blue-700'
                        : item.source === 'reddit'
                        ? 'bg-orange-50 text-orange-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {item.source}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-800 font-medium leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
              {(!data?.feed || data.feed.length === 0) && (
                <div className="text-center py-12 text-gray-400 text-xs font-semibold">
                  No live messages for this ticker currently.
                </div>
              )}
            </div>
          </div>

          {/* Sector Correlation Map (7 cols) */}
          <div className="col-span-1 lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-[440px]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Peer Sector Correlation Map</h3>
                <p className="text-xs text-gray-400 mt-0.5">30-day relative strength across key market sectors</p>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {heatmap && heatmap.map((cell, idx) => {
                const pct = (cell.change_1m * 100).toFixed(1);
                const isPositive = cell.change_1m >= 0;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:scale-[1.02] ${
                      isPositive
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <span className="text-xs font-bold tracking-tight">{cell.sector}</span>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className={`text-lg font-black ${isPositive ? 'text-emerald-400' : 'text-gray-900'}`}>
                        {isPositive ? '+' : ''}{pct}%
                      </span>
                      <span className={`text-[10px] font-bold ${isPositive ? 'text-gray-400' : 'text-gray-500'}`}>
                        1M
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
