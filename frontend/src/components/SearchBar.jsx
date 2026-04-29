import { useState } from 'react';
import { Search, Loader } from 'lucide-react';

const TIMEFRAMES = ['1D', '1W', '1M', '3M', '6M', '1Y'];

export default function SearchBar({ onSearch, isLoading }) {
  const [ticker, setTicker] = useState('');
  const [timeframe, setTimeframe] = useState('1W');

  const handleSubmit = (e) => {
    e.preventDefault();
    const t = ticker.trim().toUpperCase();
    if (!t || isLoading) return;
    onSearch(t, timeframe);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10 }}>
        <div className="input-wrap" style={{ flex: 1 }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Ticker symbol — AAPL, TSLA, NVDA..."
            maxLength={10}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || !ticker.trim()}
          style={{ opacity: isLoading || !ticker.trim() ? 0.5 : 1 }}
        >
          {isLoading ? <Loader size={13} className="spin" /> : null}
          {isLoading ? 'Analysing...' : 'Analyse'}
        </button>
      </form>

      <div className="tf-group" style={{ alignSelf: 'flex-start' }}>
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            className={`tf-btn ${timeframe === tf ? 'active' : ''}`}
            onClick={() => setTimeframe(tf)}
            type="button"
          >
            {tf}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}
