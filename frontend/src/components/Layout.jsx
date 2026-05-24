import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/', icon: 'bi-grid-1x2', label: 'Dashboard', end: true },
  { to: '/employees', icon: 'bi-people', label: 'Employees' },
  { to: '/projects', icon: 'bi-kanban', label: 'Projects' },
  { to: '/allocate', icon: 'bi-arrow-left-right', label: 'Allocate' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex' }}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(108,138,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-diagram-3" style={{ color: 'var(--accent)', fontSize: '1rem' }} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '0.95rem' }}>
                <span>Staff</span>Alloc
              </h5>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 1 }}>
                Manager Portal
              </div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ to, icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <i className={`bi ${icon}`} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{user?.username}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Admin</div>
            </div>
          </div>
          <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>
            <i className="bi bi-box-arrow-right" /> Logout
          </button>
        </div>
      </aside>

      <div className="layout" style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}
