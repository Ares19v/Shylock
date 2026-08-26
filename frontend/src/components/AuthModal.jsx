import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Mail,
  ShieldCheck,
  LogOut
} from 'lucide-react';

export default function AuthModal({ user, login, signup, logout, onClose }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'login') {
      const res = login(form.email, form.password);
      if (res.ok) onClose();
      else setError(res.error);
    } else {
      if (!form.username.trim()) return setError('Username is required.');
      const res = signup(form.username, form.email, form.password);
      if (res.ok) onClose();
      else setError(res.error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm rounded-3xl border border-gray-150 shadow-2xl p-6 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {user ? `Active Analyst` : mode === 'login' ? 'Sign In to Delphi' : 'Create Intelligence Account'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Local session authentication
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="pt-5">
          {user ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                  Active Session
                </span>
                <p className="text-base font-extrabold text-gray-900">{user.username}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>

              <button
                onClick={() => { logout(); onClose(); }}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Analyst Handle
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={form.username}
                      onChange={e => set('username', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-semibold text-gray-900 outline-none focus:border-gray-400 focus:bg-white transition-all"
                      placeholder="e.g. devansh_tyagi"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-semibold text-gray-900 outline-none focus:border-gray-400 focus:bg-white transition-all"
                    placeholder="analyst@delphi.io"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-semibold text-gray-900 outline-none focus:border-gray-400 focus:bg-white transition-all"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs rounded-2xl transition-all shadow-sm mt-2"
              >
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-gray-400">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                </span>
                <button
                  type="button"
                  onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                  className="text-xs font-bold text-gray-900 hover:underline"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
