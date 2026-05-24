import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', form);
      login(data.token, { username: data.username, email: data.email });
      toast.success(`Welcome back, ${data.username}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(108,138,255,0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <i className="bi bi-diagram-3" style={{ fontSize: '1.6rem', color: 'var(--accent)' }} />
          </div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 4 }}>StaffAlloc</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Manager portal — sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="form-label-dark">Username</label>
            <input className="form-control-dark" type="text" placeholder="admin"
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="form-label-dark">Password</label>
            <input className="form-control-dark" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn-accent" type="submit"
            style={{ width: '100%', justifyContent: 'center', padding: '11px' }} disabled={loading}>
            {loading ? 'Signing in…' : <>Sign in <i className="bi bi-arrow-right" /></>}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: '12px 16px', background: 'var(--bg-card2)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <i className="bi bi-info-circle" style={{ marginRight: 6 }} />
          Default: <strong style={{ color: 'var(--text-secondary)' }}>admin</strong> / <strong style={{ color: 'var(--text-secondary)' }}>Admin@123</strong>
        </div>
      </div>
    </div>
  );
}
