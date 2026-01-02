import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subdomain, setSubdomain] = useState('demo');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tenantRequired, setTenantRequired] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTenantRequired(false);
    setLoading(true);
    try {
      // Send subdomain if provided, regardless of email
      // This allows logging in with same email to different tenants
      const subdomainToUse = subdomain || undefined;
      await login(email, password, subdomainToUse);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      // Check if this is a tenant-required error
      if (err.code === 'TENANT_REQUIRED' || errorMsg.includes('tenant subdomain')) {
        setTenantRequired(true);
        setError('This email is associated with a specific tenant. Please enter the tenant subdomain above.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <h2>Login</h2>
        {error && <div className="alert error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="grid">
          <div className="form-group">
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Tenant Subdomain {tenantRequired && <span style={{ color: 'red' }}>*</span>}</label>
            <input 
              className="input" 
              type="text" 
              value={subdomain} 
              onChange={(e) => setSubdomain(e.target.value)}
              placeholder="e.g., demo, acme, etc."
            />
            {tenantRequired && <small style={{ color: '#666', marginTop: 4 }}>Required for this email</small>}
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary full-width">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="link-muted" style={{ marginTop: 12 }}>
          <a href="/register">Don't have an account? Register</a>
        </p>
        <div className="card" style={{ marginTop: 16 }}>
          <h4 style={{ marginTop: 0, marginBottom: 8 }}>Demo Credentials</h4>
          <p style={{ margin: '4px 0' }}><strong>Super Admin:</strong> superadmin@system.com / Admin@123 (no subdomain)</p>
          <p style={{ margin: '4px 0' }}><strong>Tenant Admin:</strong> admin@demo.com / Demo@123 (subdomain: demo)</p>
          <p style={{ margin: '4px 0' }}><strong>User:</strong> user1@demo.com / User@123 (subdomain: demo)</p>
        </div>
      </div>
    </div>
  );
}