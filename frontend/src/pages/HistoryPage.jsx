import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Trash2, Clock, ChevronRight, BarChart2, Search, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function HistoryPage({ onRestore }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterUserId = searchParams.get('userId');
  const { user, token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

  useEffect(() => {
    fetchHistory();
  }, [token, filterUserId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Try to fetch history from server with token
      const url = filterUserId ? `${API_URL}/history?userId=${filterUserId}` : `${API_URL}/history`;
      const res = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setHistory(res.data);
    } catch (err) {
      console.warn("Server history fetch failed or unauthorized. Using scoped local history.");
      const saved = JSON.parse(localStorage.getItem('cf_history') || '[]');
      
      // If logged in as admin, show everything. Otherwise filter by user id.
      const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
      const userId = user?.id || 'anonymous';
      const scoped = isAdmin ? saved : saved.filter(h => (h.userId || 'anonymous') === userId);
      
      setHistory(scoped);
    } finally {
      setLoading(false);
    }
  };

  const restoreSession = (item) => {
    onRestore(item.results, item.responses);
    navigate('/results');
  };

  const filteredHistory = history.filter(h => 
    (h.results?.[0]?.career?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (h.user_username?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="fade-up">
      <div style={{ marginBottom: "3rem" }}>
        {filterUserId && (
          <button 
            onClick={() => navigate('/admin/users')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.6rem 1rem', borderRadius: '0.8rem', color: 'white', 
              cursor: 'pointer', marginBottom: '1.5rem'
            }}
          >
            <ArrowLeft size={16} /> Back to User Management
          </button>
        )}
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>
          {filterUserId ? "User Activity" : "Your Journey"}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>
          {filterUserId ? "Reviewing session logs for specific user." : "Review your past career discovery sessions."}
        </p>
      </div>

      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <Search style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} size={20} />
        <input 
          type="text" 
          placeholder="Search history..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '1.2rem 1.2rem 1.2rem 3.5rem', 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '1.2rem', 
            color: 'white',
            fontSize: '1rem',
            outline: 'none'
          }} 
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>
      ) : filteredHistory.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '2.5rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.3 }}>⌛</div>
          <h2 style={{ marginBottom: '1rem' }}>No records found</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>Start your first assessment to begin your journey.</p>
          <button className="btn btn-primary" onClick={() => navigate('/quiz')}>Start Assessment</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.2rem' }}>
          {filteredHistory.map((item) => (
            <div 
              key={item.id || item.timestamp}
              onClick={() => restoreSession(item)}
              style={{ 
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '2rem',
                padding: '1.8rem 2.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                <div style={{ 
                  width: '60px', height: '60px', borderRadius: '1.2rem', 
                  background: 'rgba(129, 140, 248, 0.1)', color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <BarChart2 size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', marginBottom: '6px' }}>
                    {item.results?.[0]?.career || "Unknown Career"}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                      <Clock size={14} /> {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight size={24} color="rgba(255,255,255,0.2)" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
