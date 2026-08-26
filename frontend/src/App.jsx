import React, { useState, useEffect } from 'react';
import {
  Activity,
  Bookmark,
  SlidersHorizontal,
  ArrowLeftRight,
  BookOpen,
  Bot,
  Bell,
  Search,
  User,
  LogOut,
  Sparkles,
  TrendingUp,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight
} from 'lucide-react';
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
  { id: 'analysis',  label: 'Analysis',  icon: Activity },
  { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
  { id: 'screener',  label: 'Screener',  icon: SlidersHorizontal },
  { id: 'compare',   label: 'Compare',   icon: ArrowLeftRight },
  { id: 'journal',   label: 'Journal',   icon: BookOpen },
];

function NavItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-gray-900 text-white shadow-md shadow-gray-400/20 font-semibold'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-500'}`} />
        <span>{label}</span>
      </div>
      {badge && (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
          active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

export default function App() {
  const [page, setPage] = useState('analysis');
  const [authOpen, setAuthOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [pendingTicker, setPendingTicker] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchDropdown, setSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const { user, login, signup, logout } = useAuth();
  const { history, addToHistory, clearHistory } = useSearchHistory();

  // Profile Drawer States
  const [userName, setUserName] = useState(() => localStorage.getItem('delphi_username') || (user?.username || 'Devansh Tyagi'));
  const [userRole, setUserRole] = useState(() => localStorage.getItem('delphi_role') || 'Chief Intelligence Analyst');
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('delphi_pfp') || null);

  // Notification Center
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('delphi_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return [
      { id: '1', title: 'FinBERT Engine Live', body: 'Sentiment analyzer pipeline loaded and ready for real-time inference.', time: 'Just now', type: 'info', read: false },
      { id: '2', title: 'Market Alert: NVDA', body: 'Bullish velocity accelerated +18.4% with heavy social volume.', time: '12m ago', type: 'success', read: false },
      { id: '3', title: 'Sector Heatmap Refreshed', body: 'Semiconductors and Cloud computing correlation updated.', time: '1h ago', type: 'info', read: true },
    ];
  });

  useEffect(() => {
    localStorage.setItem('delphi_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (user?.username) setUserName(user.username);
  }, [user]);

  const handleProfileSave = (e) => {
    e.preventDefault();
    localStorage.setItem('delphi_username', userName);
    localStorage.setItem('delphi_role', userRole);
    setShowProfileModal(false);
  };

  const handlePfpUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setProfilePic(base64);
        localStorage.setItem('delphi_pfp', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const navigateAnalysis = (ticker) => {
    setPendingTicker(ticker);
    setPage('analysis');
  };

  const handleGlobalSearchSubmit = (e, overrideTicker) => {
    if (e) e.preventDefault();
    const t = (overrideTicker || globalSearch).trim().toUpperCase();
    if (!t) return;
    navigateAnalysis(t);
    setGlobalSearch('');
    setSearchDropdown(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen w-full bg-[#f3f4f6] text-gray-800 font-sans overflow-hidden">
      
      {/* Sleek Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-[#f3f4f6] border-r border-gray-200 flex-col justify-between py-6 px-4 shrink-0">
        <div>
          {/* Brand Header */}
          <div className="px-4 mb-8">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage('analysis')}>
              <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-md shadow-gray-900/20">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-none">DELPHI</h1>
                <p className="text-[11px] font-medium text-gray-400 mt-1">Forensic Intelligence</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {NAV.map(n => (
              <NavItem
                key={n.id}
                icon={n.icon}
                label={n.label}
                active={page === n.id}
                onClick={() => setPage(n.id)}
              />
            ))}
          </nav>

          {/* Spotlight Card */}
          <div className="mt-8 px-2">
            <div className="bg-gray-900 text-white p-5 rounded-3xl shadow-xl shadow-gray-900/10 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">AI Assistant</span>
                </div>
                <h3 className="font-bold text-base mb-1">Financial Forensics</h3>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  Query social momentum, inspect anomalies, or calibrate thresholds.
                </p>
                <button
                  onClick={() => setChatOpen(true)}
                  className="bg-white/15 hover:bg-white/25 text-white text-xs font-semibold py-2.5 px-4 rounded-2xl transition-all duration-200 w-full flex items-center justify-center gap-2"
                >
                  <Bot className="w-4 h-4" />
                  Launch Assistant
                </button>
              </div>
              {/* Subtle ambient light blur */}
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-2 pt-4 border-t border-gray-200/80">
          <button
            onClick={() => {
              if (user) {
                logout();
              } else {
                setAuthOpen(true);
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{user ? 'Sign Out' : 'Sign In / Account'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Universal Header */}
        <header className="flex items-center justify-between px-4 md:px-8 py-4 shrink-0 bg-[#f3f4f6] gap-4 z-40 border-b border-gray-200/60">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {page === 'analysis' ? 'Sentiment & Forensic Analysis' :
               page === 'watchlist' ? 'Watchlist & Live Trackers' :
               page === 'screener' ? 'Market Screener' :
               page === 'compare' ? 'Side-by-Side Asset Compare' : 'Trade & Forensic Journal'}
            </h2>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {/* Global Search with Dropdown */}
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={globalSearch}
                onChange={e => {
                  setGlobalSearch(e.target.value);
                  setSearchDropdown(true);
                }}
                onFocus={() => setSearchDropdown(true)}
                onBlur={() => setTimeout(() => setSearchDropdown(false), 250)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleGlobalSearchSubmit(e);
                }}
                placeholder="Search ticker (e.g. NVDA, AAPL, TSLA)..."
                className="pl-10 pr-9 py-2 bg-white rounded-2xl border border-gray-200/80 shadow-sm focus:border-gray-400 focus:ring-0 outline-none w-56 md:w-72 text-sm text-gray-800 font-medium placeholder:text-gray-400 transition-all duration-200"
              />
              {globalSearch && (
                <button
                  onClick={() => { setGlobalSearch(''); setSearchDropdown(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Autocomplete / History Dropdown */}
              {searchDropdown && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-72 overflow-y-auto divide-y divide-gray-50">
                  <div className="p-3 bg-gray-50/70 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex justify-between items-center">
                    <span>Recent / Popular Tickers</span>
                    {history && history.length > 0 && (
                      <button onClick={clearHistory} className="text-red-500 hover:underline">Clear</button>
                    )}
                  </div>
                  {(history && history.length > 0 ? history : [
                    { ticker: 'NVDA', ts: Date.now() },
                    { ticker: 'AAPL', ts: Date.now() },
                    { ticker: 'TSLA', ts: Date.now() },
                    { ticker: 'AMD', ts: Date.now() },
                    { ticker: 'MSFT', ts: Date.now() },
                  ]).map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleGlobalSearchSubmit(null, item.ticker)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-bold text-gray-800">{item.ticker}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {item.ts ? new Date(item.ts).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Popular'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 bg-white rounded-full shadow-sm relative text-gray-600 hover:text-gray-900 border border-gray-200/70 transition-all hover:shadow"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              {/* Notification Drawer Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/60 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-sm">Intelligence Alerts</h4>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-900 text-white">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                      className="text-xs text-gray-500 hover:text-gray-900 font-semibold"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.map((notif, i) => (
                      <div
                        key={notif.id || i}
                        className={`p-4 hover:bg-gray-50/70 transition-colors flex gap-3 items-start ${
                          !notif.read ? 'bg-blue-50/20' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                          notif.type === 'alert' ? 'bg-red-50 text-red-600' :
                          notif.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {notif.type === 'alert' ? <AlertTriangle className="w-4 h-4" /> :
                           notif.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <p className="text-xs font-bold text-gray-900 truncate pr-1">{notif.title}</p>
                            <span className="text-[10px] text-gray-400 font-semibold whitespace-nowrap">{notif.time}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Button */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-10 h-10 rounded-full bg-white overflow-hidden shadow-sm border border-gray-200 flex items-center justify-center hover:opacity-90 transition-all hover:shadow"
            >
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-hidden flex flex-col min-w-0">
          {page === 'analysis'  && (
            <Analysis
              addToHistory={addToHistory}
              initialTicker={pendingTicker}
              key={pendingTicker}
              user={user}
              history={history}
              clearHistory={clearHistory}
              onAuthClick={() => setAuthOpen(true)}
            />
          )}
          {page === 'watchlist' && <Watchlist onNavigateAnalysis={navigateAnalysis} />}
          {page === 'screener'  && <Screener  onNavigateAnalysis={navigateAnalysis} />}
          {page === 'compare'   && <Compare />}
          {page === 'journal'   && <Journal />}
        </main>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-150 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Analyst Profile</h3>
              <button onClick={() => setShowProfileModal(false)} className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                  {profilePic ? (
                    <img src={profilePic} alt="PFP" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-gray-400 m-auto mt-4" />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition-colors">
                    Upload Avatar
                    <input type="file" accept="image/*" onChange={handlePfpUpload} className="hidden" />
                  </label>
                  <p className="text-[10px] text-gray-400 mt-1">PNG, JPG or SVG up to 2MB</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-900 focus:bg-white focus:border-gray-400 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Role / Department</label>
                <input
                  type="text"
                  value={userRole}
                  onChange={e => setUserRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-900 focus:bg-white focus:border-gray-400 outline-none transition-all"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overlays */}
      {authOpen && (
        <AuthModal
          user={user}
          login={login}
          signup={signup}
          logout={logout}
          onClose={() => setAuthOpen(false)}
        />
      )}
      {chatOpen && <Chatbot onClose={() => setChatOpen(false)} />}
    </div>
  );
}
