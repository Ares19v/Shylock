import React, { useState } from 'react';
import Analysis from './pages/Analysis';
import Watchlist from './pages/Watchlist';
import Screener from './pages/Screener';
import Compare from './pages/Compare';
import Journal from './pages/Journal';
import AuthModal from './components/AuthModal';
import Chatbot from './components/Chatbot';
import { useAuth } from './hooks/useAuth';
import { useSearchHistory } from './hooks/useSearchHistory';

const NAV = [
  { id: 'analysis',  label: 'Analysis',  icon: 'analytics' },
  { id: 'watchlist', label: 'Watchlist', icon: 'bookmarks' },
  { id: 'screener',  label: 'Screener',  icon: 'filter_list' },
  { id: 'compare',   label: 'Compare',   icon: 'compare_arrows' },
];

export default function App() {
  const [page, setPage] = useState('analysis');
  const [authOpen, setAuthOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [pendingTicker, setPendingTicker] = useState('');

  const { user, login, signup, logout } = useAuth();
  const { history, addToHistory, clearHistory } = useSearchHistory();

  const navigateAnalysis = (ticker) => {
    setPendingTicker(ticker);
    setPage('analysis');
  };

  return (
    <div className="bg-background text-on-surface h-screen w-full flex overflow-hidden font-body-md antialiased">
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 h-screen w-64 border-r border-slate-800 bg-[#1A222E] flex flex-col z-50">
        <div className="px-6 py-8 border-b border-slate-800">
          <h1 className="text-xl font-black text-white tracking-widest font-h2">SHYLOCK</h1>
          <p className="text-slate-400 font-caption text-caption mt-1">Financial Intelligence</p>
        </div>

        <div className="flex-1 py-6 flex flex-col gap-1 px-2 overflow-y-auto">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 font-sans text-xs uppercase tracking-widest transition-all duration-200 rounded-sm
                ${page === n.id
                  ? 'bg-slate-800 text-blue-400 border-l-4 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}>
              <span className="material-symbols-outlined text-lg">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>

        <div className="border-t border-slate-800 p-2">
          <button onClick={() => setPage('journal')}
            className={`w-full text-left px-4 py-3 flex items-center gap-3 font-sans text-xs uppercase tracking-widest transition-all duration-200 rounded-sm
              ${page === 'journal' ? 'bg-slate-800 text-blue-400 border-l-4 border-blue-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
            <span className="material-symbols-outlined text-lg">edit_note</span>
            Journal
          </button>
          <button onClick={() => setChatOpen(true)}
            className="w-full text-left px-4 py-3 flex items-center gap-3 font-sans text-xs uppercase tracking-widest text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all duration-200 rounded-sm">
            <span className="material-symbols-outlined text-lg">smart_toy</span>
            AI Assistant
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="ml-64 flex-1 flex overflow-hidden">
        {/* Pages — Analysis owns its own header icons to avoid overlap */}
        {page === 'analysis'  && <Analysis
          addToHistory={addToHistory}
          initialTicker={pendingTicker}
          key={pendingTicker}
          user={user}
          history={history}
          clearHistory={clearHistory}
          onAuthClick={() => setAuthOpen(true)}
        />}
        {page === 'watchlist' && <Watchlist onNavigateAnalysis={navigateAnalysis} />}
        {page === 'screener'  && <Screener  onNavigateAnalysis={navigateAnalysis} />}
        {page === 'compare'   && <Compare />}
        {page === 'journal'   && <Journal />}
      </main>

      {/* Overlays */}
      {authOpen && <AuthModal user={user} login={login} signup={signup} logout={logout} onClose={() => setAuthOpen(false)} />}
      {chatOpen && <Chatbot onClose={() => setChatOpen(false)} />}
    </div>
  );
}
