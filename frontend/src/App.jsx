import React, { useState } from 'react';
import { useAnalysis, useSectorHeatmap } from './hooks/useAnalysis';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const sessionId = Math.random().toString(36).substring(7).toUpperCase();

export default function App() {
  const { data, isLoading, error, analyze } = useAnalysis();
  const heatmap = useSectorHeatmap();
  
  const [tickerInput, setTickerInput] = useState('');
  const [timeframe, setTimeframe] = useState('1W');

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const t = tickerInput.trim().toUpperCase();
    if (!t || isLoading) return;
    analyze(t, timeframe);
  };

  const handleTimeframeChange = (tf) => {
    setTimeframe(tf);
    const t = tickerInput.trim().toUpperCase();
    if (t) {
      analyze(t, tf);
    }
  };

  // Safe data extraction
  const priceData = data?.price?.data || [];
  const overall_sentiment = data?.overall_sentiment || { bullish: 0, bearish: 0, neutral: 1, label: 'NEUTRAL', text_count: 0 };
  const technicals = data?.technicals || {};
  const company = data?.company || { name: 'Company Name' };
  const ticker = data?.ticker || 'TICKER';
  
  const score = overall_sentiment.bullish - overall_sentiment.bearish;
  const needleAngle = 180 - ((score + 1) / 2) * 180;
  
  const redditPct = (data?.sources?.reddit?.sentiment?.bullish || 0) * 100;
  const newsPct = (data?.sources?.news?.sentiment?.bullish || 0) * 100;
  const stPct = (data?.sources?.stocktwits?.sentiment?.bullish || 0) * 100;

  return (
    <div className="bg-background text-on-surface h-screen w-full flex overflow-hidden font-body-md antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* SideNavBar */}
      <nav className="fixed left-0 top-0 h-screen w-64 border-r border-slate-800 bg-[#1A222E] flex flex-col z-50">
        <div className="px-6 py-8 border-b border-slate-800">
          <h1 className="text-xl font-black text-white tracking-widest font-h2">SHYLOCK</h1>
          <p className="text-slate-400 font-caption text-caption mt-1">Financial Intelligence</p>
        </div>
        <div className="flex-1 py-6 flex flex-col gap-2 px-2">
          <a className="bg-slate-800 text-blue-400 border-l-4 border-blue-500 px-4 py-3 flex items-center gap-3 font-sans text-xs uppercase tracking-widest scale-100 active:scale-95 transition-transform hover:bg-slate-800/50 duration-200" href="#">
            <span className="material-symbols-outlined text-lg" data-icon="analytics">analytics</span>
            Analysis
          </a>
          <a className="text-slate-400 hover:text-slate-200 px-4 py-3 flex items-center gap-3 font-sans text-xs uppercase tracking-widest scale-100 active:scale-95 transition-transform hover:bg-slate-800/50 duration-200" href="#">
            <span className="material-symbols-outlined text-lg" data-icon="sensors">sensors</span>
            Signals
          </a>
          <a className="text-slate-400 hover:text-slate-200 px-4 py-3 flex items-center gap-3 font-sans text-xs uppercase tracking-widest scale-100 active:scale-95 transition-transform hover:bg-slate-800/50 duration-200" href="#">
            <span className="material-symbols-outlined text-lg" data-icon="grid_view">grid_view</span>
            Sector Map
          </a>
          <a className="text-slate-400 hover:text-slate-200 px-4 py-3 flex items-center gap-3 font-sans text-xs uppercase tracking-widest scale-100 active:scale-95 transition-transform hover:bg-slate-800/50 duration-200" href="#">
            <span className="material-symbols-outlined text-lg" data-icon="dynamic_feed">dynamic_feed</span>
            Feed
          </a>
        </div>
        <div className="border-t border-slate-800 p-2">
          <a className="text-slate-400 hover:text-slate-200 px-4 py-3 flex items-center gap-3 font-sans text-xs uppercase tracking-widest scale-100 active:scale-95 transition-transform hover:bg-slate-800/50 duration-200" href="#">
            <span className="material-symbols-outlined text-lg" data-icon="settings">settings</span>
            Settings
          </a>
          <a className="text-slate-400 hover:text-slate-200 px-4 py-3 flex items-center gap-3 font-sans text-xs uppercase tracking-widest scale-100 active:scale-95 transition-transform hover:bg-slate-800/50 duration-200" href="#">
            <span className="material-symbols-outlined text-lg" data-icon="contact_support">contact_support</span>
            Support
          </a>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 flex flex-col h-screen overflow-hidden bg-background">
        {/* TopAppBar */}
        <header className="bg-white border-b border-slate-200 flex justify-between items-center w-full px-6 py-3 shrink-0 z-40">
          <form onSubmit={handleSearch} className="flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm" data-icon="search">search</span>
              <input 
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-DEFAULT focus:border-primary focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors outline-none h-10" 
                placeholder="Search entity, ticker, or topic..." 
                type="text"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value)}
              />
            </div>
            {isLoading && <span className="text-xs text-slate-500 animate-pulse">Analysing...</span>}
          </form>

          <div className="flex items-center gap-6">
            <div className="flex bg-surface-container-low p-1 rounded-DEFAULT border border-outline-variant">
              {['1D', '1W', '1M', '3M', '6M', '1Y'].map(tf => (
                <button 
                  key={tf}
                  onClick={() => handleTimeframeChange(tf)}
                  className={`px-3 py-1 font-label-sm text-label-sm transition-colors ${timeframe === tf ? 'bg-white shadow-sm rounded-[2px] text-primary border border-outline-variant' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <button 
              onClick={handleSearch}
              className="bg-primary text-on-primary font-label-sm text-label-sm px-6 py-2 h-10 rounded-DEFAULT hover:bg-tertiary transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm" data-icon="summarize">summarize</span>
              Generate Report
            </button>
            <div className="flex items-center gap-4 border-l border-outline-variant pl-6">
              <button className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer active:opacity-70 relative">
                <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
              </button>
              <button className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer active:opacity-70">
                <span className="material-symbols-outlined" data-icon="account_circle">account_circle</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Canvas */}
        <div className="flex-1 overflow-y-auto p-margin-page pb-24">
          
          {error && (
             <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg border border-red-200">
               {error}
             </div>
          )}

          {!data && !isLoading && !error ? (
            <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant opacity-50">
              <span className="material-symbols-outlined text-4xl mb-4">analytics</span>
              <p>Enter a ticker above to analyze sentiment</p>
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <h2 className="font-h2 text-h2 text-primary flex items-center gap-3">
                    {ticker}
                    <span className="font-body-lg text-body-lg text-outline font-normal">{company.name}</span>
                  </h2>
                  <p className="font-caption text-caption text-on-surface-variant mt-2">Real-time Intelligence & Sentiment Mapping</p>
                </div>
                <div className="text-right">
                  <p className="font-h3 text-h3 text-primary">${technicals.current_price || '0.00'}</p>
                  <p className={`font-label-sm text-label-sm mt-1 flex items-center justify-end gap-1 ${technicals.change_1d >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    <span className="material-symbols-outlined text-xs" data-icon={technicals.change_1d >= 0 ? 'arrow_upward' : 'arrow_downward'}>
                      {technicals.change_1d >= 0 ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                    {(technicals.change_1d * 100 || 0).toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-gutter">
                {/* Sentiment Gauge Card */}
                <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px]">
                  <h3 className="font-label-sm text-label-sm text-on-surface-variant w-full text-left uppercase tracking-widest mb-8">Aggregate Sentiment</h3>
                  <div className="relative w-48 h-24 mb-4">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50">
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f3f4f6" strokeLinecap="round" strokeWidth="8"></path>
                      <path d={`M 10 50 A 40 40 0 0 1 ${50 - 40 * Math.cos(needleAngle * Math.PI / 180)} ${50 - 40 * Math.sin(needleAngle * Math.PI / 180)}`} fill="none" stroke="#1a222e" strokeLinecap="round" strokeWidth="8"></path>
                      <g transform={`translate(50, 50) rotate(${needleAngle})`}>
                        <polygon fill="#040b16" points="-2,-35 2,-35 0,5"></polygon>
                        <circle cx="0" cy="0" fill="#040b16" r="4"></circle>
                      </g>
                    </svg>
                    <div className="absolute bottom-0 left-0 w-full text-center translate-y-full pt-4">
                      <span className="font-h1 text-h1 text-primary block">{(overall_sentiment.bullish * 100).toFixed(0)}</span>
                      <span className="font-label-sm text-label-sm text-primary block mt-1">{overall_sentiment.label} Bias</span>
                    </div>
                  </div>
                </div>

                {/* Price vs Sentiment Chart Card */}
                <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-lg p-6 flex flex-col min-h-[300px]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Price Momentum</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-[2px] bg-primary"></span>
                        <span className="font-caption text-caption text-on-surface-variant">Price</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={priceData}>
                        <Line type="monotone" dataKey="close" stroke="#1a222e" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Data Cards (Mini row) */}
                <div className="col-span-12 grid grid-cols-3 gap-gutter">
                  <SourceCard title="Reddit Focus" icon="forum" pct={redditPct} />
                  <SourceCard title="News Volume" icon="newspaper" pct={newsPct} />
                  <SourceCard title="StockTwits" icon="tag" pct={stPct} />
                </div>

                {/* Live Feed */}
                <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col h-[400px]">
                  <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-bright rounded-t-lg">
                    <h3 className="font-label-sm text-label-sm text-primary uppercase tracking-widest">Live Signal Feed</h3>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-20"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2">
                    {data?.feed?.map((item, idx) => (
                      <div key={idx} className="p-3 hover:bg-surface transition-colors cursor-pointer border-b border-surface-container last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 font-caption text-[10px] uppercase tracking-wider rounded-sm border ${item.source === 'news' ? 'bg-primary/5 text-primary border-primary/20' : 'bg-surface-container text-on-surface-variant border-outline-variant/30'}`}>
                            {item.source}
                          </span>
                          <span className="font-caption text-[10px] text-outline">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="font-body-md text-body-md text-primary leading-tight">{item.text.substring(0, 100)}...</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Peer Sector Correlation Map (Heatmap) */}
                <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-lg p-6 flex flex-col h-[400px]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Peer Sector Correlation Map</h3>
                    <button className="text-outline hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-sm" data-icon="open_in_full">open_in_full</span>
                    </button>
                  </div>
                  <div className="flex-1 grid grid-cols-4 grid-rows-2 gap-2">
                    {heatmap && heatmap.map((cell, idx) => {
                      const pct = (cell.change_1m * 100).toFixed(2);
                      const sign = cell.change_1m > 0 ? '+' : '';
                      const bg = cell.change_1m > 0.03 ? 'bg-primary/90 text-white' : cell.change_1m < -0.03 ? 'bg-primary/40 text-primary' : 'bg-surface-container text-on-surface-variant';
                      return (
                        <div key={idx} className={`${bg} rounded-sm flex flex-col items-center justify-center cursor-crosshair hover:opacity-90 transition-opacity`}>
                          <span className="font-label-sm text-label-sm">{cell.sector}</span>
                          <span className="font-caption text-caption opacity-70">{sign}{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function SourceCard({ title, icon, pct }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">{title}</h4>
        <span className="material-symbols-outlined text-outline text-sm" data-icon={icon}>{icon}</span>
      </div>
      <p className="font-h3 text-h3 text-primary mb-3">{pct.toFixed(0)}%</p>
      <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
        <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}
