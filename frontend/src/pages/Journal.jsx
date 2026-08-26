import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Plus,
  Edit3,
  Trash2,
  Check,
  BookOpen,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

const J_KEY = 'delphi_journal';

function newNote(title, body) {
  return { id: Date.now(), title, body, createdAt: Date.now() };
}

export default function Journal() {
  const [notes, setNotes] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(J_KEY) || '[]');
      return saved.length ? saved : [
        {
          id: 1,
          title: 'NVDA Q3 Momentum Analysis',
          body: '## Hypothesis\n\n- FinBERT sentiment accelerated **+18.4%** across Reddit and Financial News.\n- RSI sits at **62**, indicating strong upward momentum without immediate overbought condition.\n\n### Strategy\n- Set stop loss at **$135**.\n- Target **$155** on earnings catalyst.',
          createdAt: Date.now() - 3600000 * 24
        }
      ];
    } catch {
      return [];
    }
  });
  const [active, setActive] = useState(notes[0]?.id || null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: '', body: '' });

  const save = (list) => {
    localStorage.setItem(J_KEY, JSON.stringify(list));
    setNotes(list);
  };

  const createNote = () => {
    const n = newNote('New Trade Thesis', '');
    save([n, ...notes]);
    setActive(n.id);
    setForm({ title: n.title, body: n.body });
    setEditing(true);
  };

  const updateNote = () => {
    save(notes.map(n => n.id === active ? { ...n, ...form } : n));
    setEditing(false);
  };

  const deleteNote = (id) => {
    const next = notes.filter(n => n.id !== id);
    save(next);
    if (active === id) {
      setActive(next[0]?.id || null);
      if (next[0]) {
        setForm({ title: next[0].title, body: next[0].body });
      }
      setEditing(false);
    }
  };

  const openNote = (n) => {
    setActive(n.id);
    setForm({ title: n.title, body: n.body });
    setEditing(false);
  };

  const current = notes.find(n => n.id === active) || notes[0];

  const fmt = (ts) => new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f3f4f6]">
      
      {/* Header Bar */}
      <div className="px-4 md:px-8 py-4 bg-[#f3f4f6] shrink-0 border-b border-gray-200/60 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Trade &amp; Forensic Journal</h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Private markdown trade notes, research theses, and strategy logs</p>
        </div>

        <button
          onClick={createNote}
          className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          New Note
        </button>
      </div>

      {/* Main Split Body */}
      <div className="flex-1 overflow-hidden px-4 md:px-8 py-6 pb-12 flex gap-6">
        
        {/* Notes Sidebar List */}
        <div className="w-72 bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0">
          <div className="flex justify-between items-center mb-3 px-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Entries ({notes.length})</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {!notes.length ? (
              <div className="p-8 text-center text-gray-400 text-xs font-medium">
                No journal entries yet. Click <strong>New Note</strong> to write your first trade thesis.
              </div>
            ) : (
              notes.map(n => {
                const isActive = (active || current?.id) === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => openNote(n)}
                    className={`w-full text-left p-3 rounded-2xl transition-all ${
                      isActive
                        ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {n.title || 'Untitled Note'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className={`w-3 h-3 ${isActive ? 'text-gray-400' : 'text-gray-400'}`} />
                      <span className={`text-[10px] ${isActive ? 'text-gray-400' : 'text-gray-400'}`}>
                        {fmt(n.createdAt)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Note Editor / Reader Card */}
        <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          {!current ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center">
              <BookOpen className="w-12 h-12 mb-3 text-gray-300" />
              <h3 className="text-sm font-bold text-gray-700">Select an entry or start a new note</h3>
            </div>
          ) : (
            <>
              {/* Note Header & Actions */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 shrink-0">
                {editing ? (
                  <input
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Note Title..."
                    className="flex-1 text-lg font-bold text-gray-900 outline-none bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200"
                  />
                ) : (
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900">{current.title}</h2>
                    <span className="text-[11px] font-medium text-gray-400 mt-0.5 block">
                      Logged on {fmt(current.createdAt)}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 ml-4">
                  {editing ? (
                    <button
                      onClick={updateNote}
                      className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-xs font-semibold hover:bg-gray-800 transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setForm({ title: current.title, body: current.body });
                        setEditing(true);
                      }}
                      className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => deleteNote(current.id)}
                    className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Note Body Area */}
              <div className="flex-1 overflow-y-auto pr-2">
                {editing ? (
                  <textarea
                    value={form.body}
                    onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                    placeholder="Write your trade idea in markdown... e.g. ## Bull case&#10;&#10;- RSI oversold&#10;- FinBERT sentiment velocity positive"
                    className="w-full h-full min-h-[300px] text-sm text-gray-800 bg-gray-50/50 p-4 rounded-2xl border border-gray-200 outline-none resize-none leading-relaxed font-mono"
                  />
                ) : (
                  <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
                    <ReactMarkdown>
                      {current.body || '*No content written yet. Click **Edit** above to start drafting your thesis.*'}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
