import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const [tenantName, setTenantName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminFullName, setAdminFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerTenant } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerTenant(tenantName, subdomain, adminEmail, adminPassword, adminFullName);
      alert('Tenant registered successfully! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <h2>Register New Tenant</h2>
        {error && <div className="alert error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="grid">
          <div className="form-group">
            <label>Tenant Name</label>
            <input className="input" type="text" value={tenantName} onChange={(e) => setTenantName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Subdomain</label>
            <input className="input" type="text" value={subdomain} onChange={(e) => setSubdomain(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Admin Email</label>
            <input className="input" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Admin Password</label>
            <input className="input" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required minLength={8} />
            <small className="link-muted" style={{ display: 'block', marginTop: 6 }}>
              Password must be at least 8 characters long
            </small>
          </div>
          <div className="form-group">
            <label>Admin Full Name</label>
            <input className="input" type="text" value={adminFullName} onChange={(e) => setAdminFullName(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary full-width">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="link-muted" style={{ marginTop: 12 }}>
          <a href="/login">Already have an account? Login</a>
        </p>
      </div>
    </div>
  );
}