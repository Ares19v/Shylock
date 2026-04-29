import React, { useState } from 'react';

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
      if (!form.username.trim()) return setError('Username required.');
      const res = signup(form.username, form.email, form.password);
      if (res.ok) onClose();
      else setError(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-sm mx-4 rounded-lg border border-outline-variant shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant">
          <div>
            <h2 className="font-h3 text-h3 text-primary">
              {user ? `Signed in as ${user.username}` : mode === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="font-caption text-caption text-outline mt-0.5">
              Demo Auth — stored locally
            </p>
          </div>
          <button onClick={onClose} className="text-outline hover:text-primary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-6 py-6">
          {user ? (
            <div className="space-y-4">
              <div className="bg-surface-container rounded-lg p-4">
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">Account</p>
                <p className="font-body-md text-body-md text-primary">{user.username}</p>
                <p className="font-caption text-caption text-outline">{user.email}</p>
              </div>
              <button onClick={() => { logout(); onClose(); }}
                className="w-full py-2.5 border border-error text-error font-label-sm text-label-sm rounded-DEFAULT hover:bg-error-container transition-colors">
                Sign Out
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-1.5">Username</label>
                  <input value={form.username} onChange={e => set('username', e.target.value)}
                    className="w-full px-3 py-2.5 border border-outline-variant rounded-DEFAULT bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:border-primary transition-colors"
                    placeholder="johndoe" />
                </div>
              )}
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-DEFAULT bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:border-primary transition-colors"
                  placeholder="you@example.com" required />
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-1.5">Password</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-DEFAULT bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:border-primary transition-colors"
                  placeholder="••••••••" required minLength={6} />
              </div>
              {error && <p className="font-caption text-caption text-error">{error}</p>}
              <button type="submit"
                className="w-full py-2.5 bg-primary text-on-primary font-label-sm text-label-sm rounded-DEFAULT hover:bg-tertiary transition-colors">
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
              <p className="text-center font-caption text-caption text-outline">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                  className="text-primary hover:underline">
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
