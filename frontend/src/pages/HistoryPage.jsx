import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Clock, ChevronRight, BarChart2 } from 'lucide-react';

export default function HistoryPage({ onRestore }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('cf_history') || '[]');
    setHistory(saved);
  }, []);

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      localStorage.removeItem('cf_history');
      setHistory([]);
    }
  };

  const restoreSession = (item) => {
    onRestore(item.results, item.responses);
    navigate('/results');
  };

  const deleteItem = (e, id) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem('cf_history', JSON.stringify(updated));
    setHistory(updated);
  };

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Your Journey</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review your past career assessments and growth patterns.</p>
        </div>
        {history.length > 0 && (
          <button className="btn" onClick={clearHistory} style={{ color: '#FF6B6B', borderColor: 'rgba(255,107,107,0.2)' }}>
            <Trash2 size={16} /> Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '6rem 2rem', 
          background: 'rgba(255,255,255,0.02)', 
          borderRadius: '2rem',
          border: '1px dashed var(--border)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.3 }}>⌛</div>
          <h2 style={{ marginBottom: '1rem' }}>No history found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Complete an assessment to start tracking your career evolution.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/quiz')}>
            Start Assessment
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {history.map((item) => (
            <div 
              key={item.id}
              onClick={() => restoreSession(item)}
              style={{ 
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                borderRadius: '1.5rem',
                padding: '1.5rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '12px', 
                  background: 'var(--accent-dim)', 
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BarChart2 size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{item.results[0].career}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <Clock size={14} /> {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                    <span className="tag tag-accent" style={{ fontSize: '0.7rem' }}>
                      {item.results[0].confidence}% Match
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="btn" onClick={(e) => deleteItem(e, item.id)} style={{ padding: '8px', borderRadius: '10px' }}>
                  <Trash2 size={16} />
                </button>
                <ChevronRight size={24} color="var(--text-muted)" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
