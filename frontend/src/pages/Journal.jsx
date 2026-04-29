import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const J_KEY = 'shylock_journal';

function newNote(title, body) {
  return { id: Date.now(), title, body, createdAt: Date.now() };
}

export default function Journal() {
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem(J_KEY) || '[]'); } catch { return []; }
  });
  const [active, setActive] = useState(null); // id
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: '', body: '' });

  const save = (list) => {
    localStorage.setItem(J_KEY, JSON.stringify(list));
    setNotes(list);
  };

  const createNote = () => {
    const n = newNote('Untitled Note', '');
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
    save(notes.filter(n => n.id !== id));
    if (active === id) { setActive(null); setEditing(false); }
  };

  const openNote = (n) => {
    setActive(n.id);
    setForm({ title: n.title, body: n.body });
    setEditing(false);
  };

  const current = notes.find(n => n.id === active);

  const fmt = (ts) => new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
      <header className="bg-white border-b border-slate-200 flex items-center justify-between px-6 py-3 shrink-0">
        <div>
          <h1 className="font-h3 text-h3 text-primary">Trade Journal</h1>
          <p className="font-caption text-caption text-outline mt-0.5">Private markdown notes — stored locally</p>
        </div>
        <button onClick={createNote}
          className="bg-primary text-on-primary font-label-sm text-label-sm px-5 py-2 h-10 rounded-DEFAULT hover:bg-tertiary transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">add</span>
          New Note
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Note list */}
        <div className="w-64 border-r border-outline-variant bg-surface-container-lowest flex flex-col overflow-hidden shrink-0">
          <div className="flex-1 overflow-y-auto">
            {!notes.length ? (
              <div className="p-6 text-center text-on-surface-variant opacity-50">
                <span className="material-symbols-outlined text-3xl block mb-2">note_add</span>
                <p className="font-caption text-caption">No notes yet</p>
              </div>
            ) : notes.map(n => (
              <button key={n.id} onClick={() => openNote(n)}
                className={`w-full text-left px-4 py-3.5 border-b border-surface-container transition-colors ${active === n.id ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-surface-container'}`}>
                <p className="font-label-sm text-label-sm text-primary truncate">{n.title}</p>
                <p className="font-caption text-[10px] text-outline mt-0.5">{fmt(n.createdAt)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Editor / Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!current ? (
            <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant opacity-50">
              <span className="material-symbols-outlined text-4xl mb-4">edit_note</span>
              <p>Select a note or create a new one</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-8 py-3 border-b border-outline-variant bg-white">
                {editing ? (
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className="flex-1 font-h3 text-h3 text-primary outline-none bg-transparent border-b border-primary"
                  />
                ) : (
                  <h2 className="font-h3 text-h3 text-primary">{current.title}</h2>
                )}
                <div className="flex items-center gap-3 ml-4">
                  {editing ? (
                    <button onClick={updateNote} className="px-4 py-1.5 bg-primary text-on-primary font-label-sm text-label-sm rounded-DEFAULT hover:bg-tertiary transition-colors">Save</button>
                  ) : (
                    <button onClick={() => setEditing(true)} className="px-4 py-1.5 border border-outline-variant text-on-surface-variant font-label-sm text-label-sm rounded-DEFAULT hover:border-primary hover:text-primary transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">edit</span> Edit
                    </button>
                  )}
                  <button onClick={() => deleteNote(current.id)} className="text-outline hover:text-error transition-colors">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                {editing ? (
                  <textarea value={form.body}
                    onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                    placeholder="Write your trade idea in markdown... e.g. ## Bull case&#10;&#10;- RSI oversold&#10;- Strong earnings"
                    className="w-full h-full min-h-[400px] font-body-md text-body-md text-on-surface bg-transparent outline-none resize-none placeholder:text-outline leading-relaxed"
                  />
                ) : (
                  <div className="prose prose-sm max-w-none text-on-surface">
                    <ReactMarkdown>{current.body || '*No content yet. Click Edit to start writing.*'}</ReactMarkdown>
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
