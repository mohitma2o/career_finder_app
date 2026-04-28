import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Clipboard, Search, BarChart2, History, FileText } from "lucide-react";

export default function Sidebar({ hasResults }) {
  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/quiz", label: "Assessment", icon: Clipboard },
    { to: "/explore", label: "Database", icon: Search },
    { to: "/history", label: "History", icon: History },
    { to: "/resume-maker", label: "Resume Maker", icon: FileText },
  ];

  if (hasResults) {
    links.push({ to: "/results", label: "Results", icon: BarChart2 });
  }

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
      </nav>
    </aside>
  );
}
