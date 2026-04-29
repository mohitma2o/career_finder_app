import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Clipboard, Search, BarChart2, History, FileText, Settings, LogIn, LogOut, User, Palette, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../theme/ThemeProvider";

export default function Sidebar({ hasResults }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme, themes } = useTheme();
  
  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/quiz", label: "Assessment", icon: Clipboard },
    { to: "/explore", label: "Database", icon: Search },
    { to: "/history", label: "History", icon: History },
    { to: "/resume-maker", label: "Resume Maker", icon: FileText },
    { to: "/flashcards", label: "Mastery", icon: BookOpen },
  ];

  if (hasResults) {
    links.push({ to: "/results", label: "Results", icon: BarChart2 });
  }

  // Admin Features
  const adminLinks = [
    { to: "/admin/users", label: "User Management", icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span style={{ color: 'var(--accent)' }}>Career</span> Finder
      </div>
      
      <nav className="sidebar-nav">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            <l.icon size={20} />
            {l.label}
          </NavLink>
        ))}

        {isAdmin() && (
          <>
            <div className="sidebar-section-title">ADMINISTRATION</div>
            {adminLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `sidebar-link${isActive ? " active" : ""}`
                }
              >
                <l.icon size={20} />
                {l.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-footer" style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem' }}>
        {/* Theme Swatcher */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', justifyContent: 'center' }}>
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              title={t.name}
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: t.color,
                border: theme === t.id ? '2px solid white' : 'none',
                cursor: 'pointer',
                padding: 0,
                boxShadow: theme === t.id ? `0 0 10px ${t.color}` : 'none',
                transition: 'all 0.2s'
              }}
            />
          ))}
        </div>

        {user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '50%', 
                background: 'var(--accent)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.8rem'
              }}>
                {user.username[0].toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.username}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{user.role}</div>
              </div>
            </div>
            <button 
              onClick={() => { logout(); navigate('/login'); }}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.6rem', 
                background: 'rgba(239, 68, 68, 0.1)', color: '#f87171',
                border: 'none', borderRadius: '0.8rem', padding: '0.8rem',
                fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={() => navigate('/login')}
            className="sidebar-link"
            style={{ width: '100%', border: 'none', background: 'rgba(129, 140, 248, 0.1)', color: 'var(--accent)', cursor: 'pointer' }}
          >
            <LogIn size={20} />
            Login
          </button>
        )}
      </div>
    </aside>
  );
}
