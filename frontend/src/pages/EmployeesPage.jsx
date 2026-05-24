import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const EMPTY_FORM = { name: '', email: '', technology: '', experienceYears: 1, rating: 4.0 };

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

function EmployeeModal({ emp, onClose, onSaved }) {
  const [form, setForm] = useState(emp
    ? { name: emp.name, email: emp.email, technology: emp.technology, experienceYears: emp.experienceYears, rating: emp.rating, isAvailable: emp.isAvailable }
    : EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (emp) { await api.put(`/api/employees/${emp.id}`, form); toast.success('Employee updated'); }
      else { await api.post('/api/employees', form); toast.success('Employee added'); }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving employee');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h5 style={{ fontWeight: 700, margin: 0 }}>{emp ? 'Edit Employee' : 'Add Employee'}</h5>
          <button className="btn-ghost" style={{ padding: '4px 8px' }} onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-6">
              <label className="form-label-dark">Full Name</label>
              <input className="form-control-dark" value={form.name} onChange={e => f('name', e.target.value)} required placeholder="Jane Smith" />
            </div>
            <div className="col-6">
              <label className="form-label-dark">Email</label>
              <input className="form-control-dark" type="email" value={form.email} onChange={e => f('email', e.target.value)} required placeholder="jane@company.com" />
            </div>
            <div className="col-12">
              <label className="form-label-dark">Technology / Skills</label>
              <input className="form-control-dark" value={form.technology} onChange={e => f('technology', e.target.value)} required placeholder="React, Node.js, PostgreSQL" />
            </div>
            <div className="col-6">
              <label className="form-label-dark">Experience (years)</label>
              <input className="form-control-dark" type="number" min="0" max="40" value={form.experienceYears} onChange={e => f('experienceYears', +e.target.value)} required />
            </div>
            <div className="col-6">
              <label className="form-label-dark">Rating (1–5)</label>
              <input className="form-control-dark" type="number" step="0.1" min="1" max="5" value={form.rating} onChange={e => f('rating', +e.target.value)} required />
            </div>
            {emp && (
              <div className="col-12">
                <label className="form-label-dark">Availability</label>
                <select className="form-select-dark" value={form.isAvailable} onChange={e => f('isAvailable', e.target.value === 'true')}>
                  <option value="true">Available</option>
                  <option value="false">Allocated / Busy</option>
                </select>
              </div>
            )}
          </div>
          <hr className="divider" />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-accent" disabled={loading}>
              {loading ? 'Saving…' : emp ? 'Update' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [filters, setFilters] = useState({ technology: '', minRating: '', minExperience: '', isAvailable: '' });

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.technology) params.technology = filters.technology;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.minExperience) params.minExperience = filters.minExperience;
      if (filters.isAvailable !== '') params.isAvailable = filters.isAvailable;
      const { data } = await api.get('/api/employees', { params });
      setEmployees(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove ${name}?`)) return;
    try { await api.delete(`/api/employees/${id}`); toast.success('Employee removed'); load(); }
    catch { toast.error('Could not delete employee'); }
  };

  const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontWeight: 700, marginBottom: 2 }}>Employees</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>{employees.length} employees found</p>
        </div>
        <button className="btn-accent" onClick={() => { setEditEmp(null); setShowModal(true); }}>
          <i className="bi bi-person-plus" /> Add Employee
        </button>
      </div>

      <div className="filter-strip mb-4">
        <div style={{ flex: 2, minWidth: 150 }}>
          <label className="form-label-dark">Technology</label>
          <input className="form-control-dark" placeholder="e.g. React" value={filters.technology}
            onChange={e => setFilters(p => ({ ...p, technology: e.target.value }))} />
        </div>
        <div style={{ flex: 1, minWidth: 110 }}>
          <label className="form-label-dark">Min Rating</label>
          <input className="form-control-dark" type="number" step="0.5" min="1" max="5" placeholder="e.g. 4"
            value={filters.minRating} onChange={e => setFilters(p => ({ ...p, minRating: e.target.value }))} />
        </div>
        <div style={{ flex: 1, minWidth: 110 }}>
          <label className="form-label-dark">Min Exp (yrs)</label>
          <input className="form-control-dark" type="number" min="0" placeholder="e.g. 2"
            value={filters.minExperience} onChange={e => setFilters(p => ({ ...p, minExperience: e.target.value }))} />
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <label className="form-label-dark">Availability</label>
          <select className="form-select-dark" value={filters.isAvailable}
            onChange={e => setFilters(p => ({ ...p, isAvailable: e.target.value }))}>
            <option value="">All</option>
            <option value="true">Available</option>
            <option value="false">Busy</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <button className="btn-accent" onClick={load}><i className="bi bi-search" /> Search</button>
          <button className="btn-ghost" onClick={() => { setFilters({ technology:'', minRating:'', minExperience:'', isAvailable:'' }); setTimeout(load, 0); }}>Clear</button>
        </div>
      </div>

      <div className="card-dark" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state"><i className="bi bi-arrow-clockwise" />Loading…</div>
        ) : employees.length === 0 ? (
          <div className="empty-state"><i className="bi bi-person-x" />No employees match your filters</div>
        ) : (
          <table className="table-dark-custom">
            <thead>
              <tr><th>Employee</th><th>Technology</th><th>Experience</th><th>Rating</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar">{initials(emp.name)}</div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{emp.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="tag-row">
                      {(emp.technology || '').split(',').map(t => t.trim()).filter(Boolean).slice(0, 3).map(t => (
                        <span key={t} className="badge-tech">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{emp.experienceYears} yr{emp.experienceYears !== 1 ? 's' : ''}</td>
                  <td><Stars rating={emp.rating} /></td>
                  <td>
                    {emp.isAvailable
                      ? <span className="badge-available"><i className="bi bi-check-circle" style={{ marginRight: 4 }} />Available</span>
                      : <span className="badge-busy"><i className="bi bi-clock" style={{ marginRight: 4 }} />Allocated</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-sm-icon" onClick={() => { setEditEmp(emp); setShowModal(true); }}><i className="bi bi-pencil" /></button>
                      <button className="btn-danger-ghost" onClick={() => handleDelete(emp.id, emp.name)}><i className="bi bi-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <EmployeeModal emp={editEmp} onClose={() => { setShowModal(false); setEditEmp(null); }} onSaved={() => { setShowModal(false); setEditEmp(null); load(); }} />}
    </div>
  );
}
