import React from 'react';

export default function SearchHistory({ history, onSelect, onClear, onClose }) {
  if (!history.length) {
    return (
      <div className="absolute right-0 top-12 w-72 bg-white border border-outline-variant rounded-lg shadow-xl z-[100] p-6 text-center">
        <span className="material-symbols-outlined text-3xl text-outline mb-2 block">history</span>
        <p className="font-caption text-caption text-outline">No searches yet. Analyze a ticker to get started.</p>
      </div>
    );
  }

  const fmt = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="absolute right-0 top-12 w-72 bg-white border border-outline-variant rounded-lg shadow-xl z-[100]" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Search History</span>
        <button onClick={onClear} className="font-caption text-caption text-error hover:underline">Clear</button>
      </div>
      <ul>
        {history.map((h, i) => (
          <li key={i}>
            <button onClick={() => { onSelect(h.ticker); onClose(); }}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-container transition-colors text-left border-b border-surface-container last:border-0">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-sm text-outline">trending_up</span>
                <span className="font-label-sm text-label-sm text-primary">{h.ticker}</span>
              </div>
              <span className="font-caption text-caption text-outline">{fmt(h.ts)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
