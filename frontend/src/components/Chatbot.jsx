import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const API = 'http://localhost:8001';

const STARTERS = [
  'What is Shylock?',
  'How does sentiment analysis work?',
  'What does RSI mean?',
  'How do I use the Screener?',
  'What is the Watchlist for?',
];

export default function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm **SHYLOCK AI**. I can explain the platform, help you interpret data, or answer basic financial questions. What would you like to know?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput('');
    const next = [...messages, { role: 'user', content: userMsg }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Is the backend running?' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200] w-96 bg-white border border-outline-variant rounded-lg shadow-2xl flex flex-col" style={{ height: '520px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-[#1A222E] rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="font-label-sm text-label-sm text-white tracking-widest uppercase">Shylock AI</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>

      {/* Starters */}
      {messages.length === 1 && (
        <div className="px-3 pt-3 flex flex-wrap gap-1.5">
          {STARTERS.map(s => (
            <button key={s} onClick={() => send(s)}
              className="px-2.5 py-1 font-caption text-caption border border-outline-variant rounded-full text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface'
            }`}>
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface-container px-3 py-2 rounded-lg">
              <span className="flex gap-1">
                {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }}></span>)}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-outline-variant p-3">
        <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            placeholder="Ask anything about Shylock..."
            className="flex-1 px-3 py-2 bg-surface-container-low border border-outline-variant rounded-DEFAULT font-body-md text-body-md text-on-surface placeholder:text-outline outline-none focus:border-primary transition-colors text-sm"
          />
          <button type="submit" disabled={loading || !input.trim()}
            className="px-3 py-2 bg-primary text-on-primary rounded-DEFAULT hover:bg-tertiary transition-colors disabled:opacity-40">
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
