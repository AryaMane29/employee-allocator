import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const EMPTY_FORM = {
  name: '', description: '', requiredTechnologies: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '', status: 'Active'
};

function ProjectModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState(project ? {
    name: project.name, description: project.description,
    requiredTechnologies: project.requiredTechnologies,
    startDate: project.startDate?.split('T')[0],
    endDate: project.endDate?.split('T')[0] || '',
    status: project.status
  } : EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, endDate: form.endDate || null };
      if (project) { await api.put(`/api/projects/${project.id}`, payload); toast.success('Project updated'); }
      else { await api.post('/api/projects', payload); toast.success('Project created'); }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h5 style={{ fontWeight: 700, margin: 0 }}>{project ? 'Edit Project' : 'New Project'}</h5>
          <button className="btn-ghost" style={{ padding: '4px 8px' }} onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label-dark">Project Name</label>
              <input className="form-control-dark" value={form.name} onChange={e => f('name', e.target.value)} required placeholder="e.g. E-Commerce Platform" />
            </div>
            <div className="col-12">
              <label className="form-label-dark">Description</label>
              <textarea className="form-control-dark" rows={2} value={form.description} onChange={e => f('description', e.target.value)} placeholder="Brief project overview…" />
            </div>
            <div className="col-12">
              <label className="form-label-dark">Required Technologies</label>
              <input className="form-control-dark" value={form.requiredTechnologies} onChange={e => f('requiredTechnologies', e.target.value)} required placeholder="React, Node.js, PostgreSQL" />
            </div>
            <div className="col-6">
              <label className="form-label-dark">Start Date</label>
              <input className="form-control-dark" type="date" value={form.startDate} onChange={e => f('startDate', e.target.value)} required />
            </div>
            <div className="col-6">
              <label className="form-label-dark">End Date (optional)</label>
              <input className="form-control-dark" type="date" value={form.endDate} onChange={e => f('endDate', e.target.value)} />
            </div>
            {project && (
              <div className="col-12">
                <label className="form-label-dark">Status</label>
                <select className="form-select-dark" value={form.status} onChange={e => f('status', e.target.value)}>
                  <option>Active</option>
                  <option>On Hold</option>
                  <option>Completed</option>
                </select>
              </div>
            )}
          </div>
          <hr className="divider" />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-accent" disabled={loading}>
              {loading ? 'Saving…' : project ? 'Update' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get('/api/projects'); setProjects(data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete project "${name}"?`)) return;
    try { await api.delete(`/api/projects/${id}`); toast.success('Project deleted'); load(); }
    catch { toast.error('Could not delete project'); }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontWeight: 700, marginBottom: 2 }}>Projects</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>{projects.length} total projects</p>
        </div>
        <button className="btn-accent" onClick={() => { setEditProject(null); setShowModal(true); }}>
          <i className="bi bi-plus-lg" /> New Project
        </button>
      </div>

      {loading ? (
        <div className="empty-state"><i className="bi bi-arrow-clockwise" />Loading…</div>
      ) : projects.length === 0 ? (
        <div className="card-dark">
          <div className="empty-state"><i className="bi bi-kanban" />No projects yet!</div>
        </div>
      ) : (
        <div className="row g-3">
          {projects.map(p => (
            <div key={p.id} className="col-md-6 col-lg-4">
              <div className="card-dark" style={{ height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                    <span className={`badge-status badge-${p.status.toLowerCase().replace(' ','')}`}>{p.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-sm-icon" onClick={() => { setEditProject(p); setShowModal(true); }}><i className="bi bi-pencil" /></button>
                    <button className="btn-danger-ghost" onClick={() => handleDelete(p.id, p.name)}><i className="bi bi-trash" /></button>
                  </div>
                </div>
                {p.description && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{p.description.length > 80 ? p.description.slice(0,80)+'…' : p.description}</p>}
                <div className="tag-row" style={{ marginBottom: 14 }}>
                  {(p.requiredTechnologies||'').split(',').map(t=>t.trim()).filter(Boolean).slice(0,4).map(t=>(
                    <span key={t} className="badge-tech">{t}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span><i className="bi bi-calendar3" style={{ marginRight: 4 }} />{new Date(p.startDate).toLocaleDateString()}</span>
                  <span><i className="bi bi-people" style={{ marginRight: 4 }} />{p.allocations?.length || 0} members</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editProject}
          onClose={() => { setShowModal(false); setEditProject(null); }}
          onSaved={() => { setShowModal(false); setEditProject(null); load(); }}
        />
      )}
    </div>
  );
}
