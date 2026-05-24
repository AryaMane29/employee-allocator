import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

function Stars({ rating }) {
  return (
    <span className="stars">
      {[1,2,3,4,5].map(i => (
        <i key={i} className={`bi bi-star${rating >= i ? '-fill' : rating >= i-0.5 ? '-half' : ''}`} />
      ))}
      <span style={{ color: 'var(--text-secondary)', marginLeft: 4, fontSize: '0.78rem' }}>{rating}</span>
    </span>
  );
}

export default function AllocatePage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [projectData, setProjectData] = useState(null);
  const [filters, setFilters] = useState({ technology: '', minRating: '', minExperience: '' });
  const [employees, setEmployees] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roleMap, setRoleMap] = useState({});
  const [allocating, setAllocating] = useState(null);

  useEffect(() => {
    api.get('/api/projects').then(r => setProjects(r.data));
  }, []);

  useEffect(() => {
    if (!selectedProject) { setProjectData(null); return; }
    api.get(`/api/projects/${selectedProject}`).then(r => setProjectData(r.data));
  }, [selectedProject]);

  const searchEmployees = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = { isAvailable: true };
      if (filters.technology) params.technology = filters.technology;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.minExperience) params.minExperience = filters.minExperience;
      const { data } = await api.get('/api/employees', { params });
      setEmployees(data);
    } finally { setLoading(false); }
  };

  const autofillFromProject = () => {
    if (!projectData) return;
    const firstTech = (projectData.requiredTechnologies || '').split(',')[0].trim();
    if (firstTech) setFilters(p => ({ ...p, technology: firstTech }));
  };

  const alreadyAllocated = (empId) =>
    projectData?.allocations?.some(a => a.employeeId === empId);

  const handleAllocate = async (emp) => {
    if (!selectedProject) { toast.error('Select a project first'); return; }
    setAllocating(emp.id);
    try {
      await api.post(`/api/projects/${selectedProject}/allocate`, {
        employeeId: emp.id,
        role: roleMap[emp.id] || 'Developer'
      });
      toast.success(`${emp.name} allocated successfully!`);
      const [projRes] = await Promise.all([
        api.get(`/api/projects/${selectedProject}`)
      ]);
      setProjectData(projRes.data);
      searchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Allocation failed');
    } finally { setAllocating(null); }
  };

  return (
    <div className="page-content">
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 4 }}>Allocate Employees</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
          Search for available employees and assign them to a project
        </p>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          {/* Step 1 */}
          <div className="card-dark mb-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>1</div>
              <h6 style={{ fontWeight: 600, margin: 0 }}>Select Target Project</h6>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <select className="form-select-dark" value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
                  <option value="">— Choose a project —</option>
                  {projects.filter(p => p.status === 'Active').map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              {projectData && (
                <button className="btn-ghost" onClick={autofillFromProject}>
                  <i className="bi bi-magic" /> Auto-fill tech
                </button>
              )}
            </div>
            {projectData && (
              <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg-card2)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{projectData.name}</span>
                  <span className={`badge-status badge-${projectData.status.toLowerCase().replace(' ','')}`}>{projectData.status}</span>
                </div>
                <div className="tag-row">
                  {(projectData.requiredTechnologies||'').split(',').map(t=>t.trim()).filter(Boolean).map(t=>(
                    <span key={t} className="badge-tech">{t}</span>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <i className="bi bi-people" style={{ marginRight: 4 }} />
                  {projectData.allocations?.length || 0} employees currently allocated
                </div>
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div className="card-dark mb-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>2</div>
              <h6 style={{ fontWeight: 600, margin: 0 }}>Filter Available Employees</h6>
            </div>
            <div className="row g-3">
              <div className="col-md-5">
                <label className="form-label-dark">Technology</label>
                <input className="form-control-dark" placeholder="e.g. React" value={filters.technology}
                  onChange={e => setFilters(p => ({ ...p, technology: e.target.value }))} />
              </div>
              <div className="col-md-3">
                <label className="form-label-dark">Min Rating</label>
                <input className="form-control-dark" type="number" step="0.5" min="1" max="5" placeholder="4"
                  value={filters.minRating} onChange={e => setFilters(p => ({ ...p, minRating: e.target.value }))} />
              </div>
              <div className="col-md-3">
                <label className="form-label-dark">Min Exp (yrs)</label>
                <input className="form-control-dark" type="number" min="0" placeholder="2"
                  value={filters.minExperience} onChange={e => setFilters(p => ({ ...p, minExperience: e.target.value }))} />
              </div>
              <div className="col-md-1" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button className="btn-accent" style={{ width: '100%', justifyContent: 'center' }} onClick={searchEmployees}>
                  <i className="bi bi-search" />
                </button>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="card-dark" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>3</div>
              <h6 style={{ fontWeight: 600, margin: 0 }}>
                Matching Employees
                {searched && !loading && <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem', marginLeft: 8 }}>{employees.length} result{employees.length !== 1 ? 's' : ''}</span>}
              </h6>
            </div>
            {!searched ? (
              <div className="empty-state"><i className="bi bi-search" />Use filters above and click Search</div>
            ) : loading ? (
              <div className="empty-state"><i className="bi bi-arrow-clockwise" />Searching…</div>
            ) : employees.length === 0 ? (
              <div className="empty-state"><i className="bi bi-person-x" />No available employees match</div>
            ) : (
              <table className="table-dark-custom">
                <thead>
                  <tr><th>Employee</th><th>Technology</th><th>Exp</th><th>Rating</th><th>Role</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {employees.map(emp => {
                    const allocated = alreadyAllocated(emp.id);
                    return (
                      <tr key={emp.id} style={allocated ? { opacity: 0.5 } : {}}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.72rem' }}>
                              {emp.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{emp.name}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="tag-row">
                            {(emp.technology||'').split(',').map(t=>t.trim()).filter(Boolean).slice(0,2).map(t=>(
                              <span key={t} className="badge-tech">{t}</span>
                            ))}
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{emp.experienceYears}y</td>
                        <td><Stars rating={emp.rating} /></td>
                        <td>
                          <input className="form-control-dark" style={{ width: 120, padding: '5px 10px', fontSize: '0.8rem' }}
                            placeholder="Developer" value={roleMap[emp.id] || ''}
                            onChange={e => setRoleMap(p => ({ ...p, [emp.id]: e.target.value }))}
                            disabled={allocated} />
                        </td>
                        <td>
                          {allocated ? (
                            <span style={{ fontSize: '0.78rem', color: 'var(--success)' }}>
                              <i className="bi bi-check-circle" /> Allocated
                            </span>
                          ) : (
                            <button className="btn-accent" style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                              onClick={() => handleAllocate(emp)}
                              disabled={!selectedProject || allocating === emp.id}>
                              {allocating === emp.id ? '…' : <><i className="bi bi-plus" /> Assign</>}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="col-lg-4">
          <div className="card-dark" style={{ position: 'sticky', top: 80 }}>
            <h6 style={{ fontWeight: 600, marginBottom: 16 }}>
              <i className="bi bi-people" style={{ marginRight: 8, color: 'var(--accent)' }} />
              Current Team
            </h6>
            {!projectData ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Select a project to view its team</div>
            ) : projectData.allocations?.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No one allocated yet</div>
            ) : projectData.allocations.map(a => (
              <div key={a.allocationId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.72rem', flexShrink: 0 }}>
                  {a.employeeName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{a.employeeName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.role} · {a.technology.split(',')[0].trim()}</div>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--warning)' }}>★ {a.rating}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
