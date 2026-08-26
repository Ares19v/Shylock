import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  HelpCircle
} from 'lucide-react';

const API = 'http://localhost:8001';

const STARTERS = [
  'What is Delphi?',
  'How does FinBERT sentiment work?',
  'What does RSI divergence mean?',
  'How do I use the Screener?',
  'Explain Sentiment Velocity',
];

export default function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm **Delphi AI**, your financial forensics and sentiment copilot. Ask me about ticker signals, RSI indicators, or how to interpret market velocity."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Could not connect to backend server. Make sure the FastAPI service is running on port 8001.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-[250] w-96 max-w-[calc(100vw-3rem)] bg-white rounded-3xl shadow-2xl border border-gray-150 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300"
      style={{ height: '540px' }}
    >
      {/* Sleek Header */}
      <div className="bg-gray-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm">Delphi AI Copilot</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-gray-400">Forensic Market Intelligence</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Starter Prompts */}
      {messages.length === 1 && (
        <div className="px-4 pt-3 pb-1 flex flex-wrap gap-1.5 shrink-0 bg-gray-50/50 border-b border-gray-100">
          {STARTERS.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-[11px] font-semibold px-3 py-1 bg-white border border-gray-200 hover:border-gray-900 text-gray-700 hover:text-gray-900 rounded-full transition-all shadow-2xs"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0 mb-1">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-gray-900 text-white rounded-br-none shadow-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <ReactMarkdown className="prose prose-xs max-w-none prose-p:my-1 prose-headings:my-1 text-inherit">
                {m.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-gray-100 px-3.5 py-2.5 rounded-2xl rounded-bl-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 border-t border-gray-100 bg-white shrink-0">
        <form onSubmit={e => { e.preventDefault(); send(); }} className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about sentiment, tickers, RSI..."
            className="flex-1 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium text-gray-900 outline-none focus:border-gray-400 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl transition-all disabled:opacity-40 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
