import { useState } from 'react';

const STORAGE_KEY = 'delphi_users';
const SESSION_KEY = 'delphi_session';

function hashPassword(password) {
  // Simple deterministic hash for demo auth — NOT for production
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const chr = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString(36);
}

export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem(SESSION_KEY);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const getUsers = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  };

  const signup = (username, email, password) => {
    const users = getUsers();
    if (users.find(u => u.email === email)) return { ok: false, error: 'Email already registered.' };
    if (users.find(u => u.username === username)) return { ok: false, error: 'Username taken.' };
    const newUser = { username, email, passwordHash: hashPassword(password), createdAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...users, newUser]));
    const session = { username, email, token: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { ok: true };
  };

  const login = (email, password) => {
    const users = getUsers();
    const found = users.find(u => u.email === email && u.passwordHash === hashPassword(password));
    if (!found) return { ok: false, error: 'Invalid email or password.' };
    const session = { username: found.username, email: found.email, token: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return { user, login, signup, logout };
}
