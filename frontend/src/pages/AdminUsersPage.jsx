import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Shield, ShieldCheck, Search, ArrowLeftRight, Download, BarChart2, TrendingUp, Activity, History } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

export default function AdminUsersPage() {
  const { token, user: currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.warn("Backend users fetch failed, using local storage...");
      const localUsers = JSON.parse(localStorage.getItem('cf_local_users') || '[]');
      // Include the hardcoded super admin in the list
      const allUsers = [
        { id: '1', username: 'mohit', role: 'super_admin' },
        ...localUsers
      ];
      setUsers(allUsers);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (username, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await axios.post(`${API_URL}/admin/update-role`, 
        { username, role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      console.warn("Backend role update failed, updating local storage...");
      const localUsers = JSON.parse(localStorage.getItem('cf_local_users') || '[]');
      const userIndex = localUsers.findIndex(u => u.username === username);
      if (userIndex !== -1) {
        localUsers[userIndex].role = newRole;
        localStorage.setItem('cf_local_users', JSON.stringify(localUsers));
        fetchUsers();
      } else {
        alert("Cannot update hardcoded Super Admin role.");
      }
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Username", "Role"];
    const rows = users.map(u => [u.id, u.username, u.role]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "user_directory.csv");
    document.body.appendChild(link);
    link.click();
  };

  const chartData = [
    { name: 'Super Admin', value: users.filter(u => u.role === 'super_admin').length },
    { name: 'Admin', value: users.filter(u => u.role === 'admin').length },
    { name: 'User', value: users.filter(u => u.role === 'user').length },
  ];

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAdmin()) return <div style={{ padding: '4rem', textAlign: 'center' }}>Access Denied</div>;

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Admin Console</h1>
          <p style={{ color: 'var(--text-muted)' }}>System-wide user directory and activity metrics.</p>
        </div>
        <button className="btn" onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* Analytics Row */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(129, 140, 248, 0.1)', padding: '1rem', borderRadius: '1rem' }}>
            <Users color="var(--accent)" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{users.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Users</div>
          </div>
        </div>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '1rem', borderRadius: '1rem' }}>
            <Activity color="#f43f5e" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{users.filter(u => u.role !== 'user').length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Elevated Roles</div>
          </div>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <ResponsiveContainer width="100%" height={60}>
            <BarChart data={chartData}>
              <Bar dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#818CF8', '#38bdf8', '#10b981'][index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>Role Distribution</div>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
        <Search style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} size={20} />
        <input 
          type="text" 
          placeholder="Search users..."
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

      <div style={{ 
        background: 'rgba(255, 255, 255, 0.02)', 
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '2.5rem',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1.5rem 2.5rem', textAlign: 'left', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>USERNAME</th>
              <th style={{ padding: '1.5rem 2.5rem', textAlign: 'left', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>ROLE</th>
              <th style={{ padding: '1.5rem 2.5rem', textAlign: 'right', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" style={{ padding: '4rem', textAlign: 'center' }}>Loading users...</td></tr>
            ) : filteredUsers.map(u => (
              <tr key={u.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '0.8rem', 
                    background: u.role === 'super_admin' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: u.role === 'super_admin' ? '#f59e0b' : 'white'
                  }}>
                    {u.username[0].toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 600 }}>{u.username}</span>
                  {u.username === currentUser.username && <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>(You)</span>}
                </td>
                <td style={{ padding: '1.5rem 2.5rem' }}>
                  <span style={{ 
                    padding: '0.4rem 1rem', 
                    borderRadius: '2rem', 
                    fontSize: '0.75rem', 
                    fontWeight: 700,
                    background: u.role === 'super_admin' ? 'rgba(245, 158, 11, 0.1)' : (u.role === 'admin' ? 'rgba(129, 140, 248, 0.1)' : 'rgba(255,255,255,0.05)'),
                    color: u.role === 'super_admin' ? '#f59e0b' : (u.role === 'admin' ? 'var(--accent)' : 'rgba(255,255,255,0.5)')
                  }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '1.5rem 2.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                    <button 
                      onClick={() => navigate(`/history?userId=${u.id}`)}
                      style={{ 
                        background: 'rgba(129, 140, 248, 0.1)', 
                        border: '1px solid rgba(129, 140, 248, 0.2)', 
                        padding: '0.6rem 1.2rem', 
                        borderRadius: '0.8rem',
                        color: 'var(--accent)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      <History size={14} />
                      History
                    </button>

                    {u.role !== 'super_admin' && (
                      <button 
                        onClick={() => toggleRole(u.username, u.role)}
                        style={{ 
                          background: 'rgba(255,255,255,0.03)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          padding: '0.6rem 1.2rem', 
                          borderRadius: '0.8rem',
                          color: 'white',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        <ArrowLeftRight size={14} />
                        {u.role === 'admin' ? 'Demote' : 'Promote'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
