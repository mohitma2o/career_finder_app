import React, { useState, useEffect, useRef } from 'react';
import { Search, History, Database, Clipboard, Layout, X, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CommandPalette({ isOpen, onClose }) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const actions = [
    { icon: Clipboard, label: "Start Assessment", path: "/quiz", category: "Action" },
    { icon: Layout, label: "View Dashboard", path: "/", category: "Navigation" },
    { icon: History, label: "View History", path: "/history", category: "Navigation" },
    { icon: Database, label: "Browse Database", path: "/explore", category: "Navigation" },
    { icon: Zap, label: "Quick Skill Test", path: "/skill-test", category: "Action" },
  ];

  const filteredActions = actions.filter(a => 
    a.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % filteredActions.length);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + filteredActions.length) % filteredActions.length);
      }
      if (e.key === "Enter") {
        const action = filteredActions[selectedIndex];
        if (action) {
          navigate(action.path);
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div 
      style={{ 
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', 
        zIndex: 2000, display: 'flex', justifyContent: 'center', paddingTop: '15vh' 
      }}
      onClick={onClose}
    >
      <div 
        style={{ 
          width: '100%', maxWidth: '600px', background: 'rgba(30,30,40,0.95)', 
          borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', 
          overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' 
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Search size={20} color="var(--accent)" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              flex: 1, background: 'none', border: 'none', outline: 'none', 
              color: 'white', fontSize: '1.1rem', marginLeft: '1rem' 
            }}
          />
          <div style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
            ESC
          </div>
        </div>

        <div style={{ padding: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
          {filteredActions.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
              No results found for "{search}"
            </div>
          ) : (
            filteredActions.map((a, i) => (
              <div
                key={a.label}
                onClick={() => { navigate(a.path); onClose(); }}
                onMouseEnter={() => setSelectedIndex(i)}
                style={{
                  display: 'flex', alignItems: 'center', padding: '1rem', borderRadius: '1rem',
                  background: i === selectedIndex ? 'rgba(129, 140, 248, 0.1)' : 'transparent',
                  cursor: 'pointer', transition: 'all 0.1s'
                }}
              >
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '10px', 
                  background: i === selectedIndex ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginRight: '1rem', transition: 'all 0.2s'
                }}>
                  <a.icon size={18} color={i === selectedIndex ? 'white' : 'rgba(255,255,255,0.5)'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: i === selectedIndex ? 'white' : 'rgba(255,255,255,0.8)' }}>
                    {a.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{a.category}</div>
                </div>
                {i === selectedIndex && <Zap size={14} color="var(--accent)" />}
              </div>
            ))
          )}
        </div>

        <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>↵</span> Select
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>↑↓</span> Navigate
          </div>
        </div>
      </div>
    </div>
  );
}
