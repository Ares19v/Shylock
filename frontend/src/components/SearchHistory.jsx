import React from 'react';
import { History, TrendingUp, Trash2 } from 'lucide-react';

export default function SearchHistory({ history, onSelect, onClear, onClose }) {
  if (!history || !history.length) {
    return (
      <div className="absolute right-0 top-12 w-72 bg-white border border-gray-150 rounded-3xl shadow-xl z-[100] p-6 text-center">
        <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-xs text-gray-400 font-medium">No searches yet. Analyze a ticker to get started.</p>
      </div>
    );
  }

  const fmt = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="absolute right-0 top-12 w-80 bg-white border border-gray-150 rounded-3xl shadow-2xl z-[100] overflow-hidden" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Search History</span>
        <button onClick={onClear} className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1">
          <Trash2 className="w-3 h-3" />
          Clear
        </button>
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
        {history.map((h, i) => (
          <button
            key={i}
            onClick={() => { onSelect(h.ticker); onClose(); }}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-gray-900">{h.ticker}</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">{fmt(h.ts)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
