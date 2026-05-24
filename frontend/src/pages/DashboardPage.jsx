import { useEffect, useState } from 'react';
import api from '../services/api';

function StatCard({ icon, iconBg, iconColor, label, value, sub }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-num" style={{ marginTop: 8 }}>{value}</div>
          {sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
        </div>
        <div className="stat-icon" style={{ background: iconBg }}>
          <i className={`bi ${icon}`} style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/api/employees'), api.get('/api/projects')])
      .then(([empRes, projRes]) => {
        setEmployees(empRes.data);
        setProjects(projRes.data);
      }).finally(() => setLoading(false));
  }, []);

  const available = employees.filter(e => e.isAvailable).length;
  const busy = employees.length - available;
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const avgRating = employees.length
    ? (employees.reduce((s, e) => s + e.rating, 0) / employees.length).toFixed(1) : '—';

  const techMap = {};
  employees.forEach(e => {
    (e.technology || '').split(',').forEach(t => {
      const key = t.trim();
      if (key) techMap[key] = (techMap[key] || 0) + 1;
    });
  });
  const topTechs = Object.entries(techMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  if (loading) return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ color: 'var(--text-muted)' }}>Loading dashboard…</div>
    </div>
  );

  return (
    <div className="page-content">
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 4 }}>Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
          Overview of your workforce and project allocations
        </p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard icon="bi-people" iconBg="rgba(108,138,255,0.12)" iconColor="var(--accent)"
            label="Total Employees" value={employees.length} />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon="bi-check-circle" iconBg="rgba(52,211,153,0.1)" iconColor="var(--success)"
            label="Available" value={available} sub={`${busy} currently allocated`} />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon="bi-kanban" iconBg="rgba(167,139,250,0.12)" iconColor="var(--accent2)"
            label="Active Projects" value={activeProjects} sub={`${projects.length} total`} />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon="bi-star" iconBg="rgba(251,191,36,0.1)" iconColor="var(--warning)"
            label="Avg. Rating" value={avgRating} sub="across all staff" />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card-dark">
            <h6 style={{ fontWeight: 600, marginBottom: 16 }}>Recent Projects</h6>
            {projects.length === 0 ? (
              <div className="empty-state"><i className="bi bi-kanban" />No projects yet</div>
            ) : (
              <table className="table-dark-custom">
                <thead>
                  <tr><th>Project</th><th>Status</th><th>Team</th><th>Start</th></tr>
                </thead>
                <tbody>
                  {projects.slice(0, 5).map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.requiredTechnologies}</div>
                      </td>
                      <td><span className={`badge-status badge-${p.status.toLowerCase().replace(' ', '')}`}>{p.status}</span></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{p.allocations?.length || 0} members</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(p.startDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card-dark">
            <h6 style={{ fontWeight: 600, marginBottom: 16 }}>Top Technologies</h6>
            {topTechs.length === 0 ? (
              <div className="empty-state" style={{ padding: 24 }}><i className="bi bi-code-slash" />No data</div>
            ) : topTechs.map(([tech, count]) => (
              <div key={tech} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{tech}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{count} emp.</span>
                </div>
                <div style={{ height: 5, background: 'var(--bg-card2)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (count / employees.length) * 100)}%`, background: 'var(--accent)', borderRadius: 10 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
