import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export function UsersPage() {
  const { user, token, logout, loading: authLoading, selectedTenantId } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: '', fullName: '', role: 'user' });
  const [submitError, setSubmitError] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  useEffect(() => {
    // Only fetch users after auth is done loading, we have token, user, and either user has tenantId or super admin has selected one
    if (!authLoading) {
      const effectiveTenantId = user?.tenantId || selectedTenantId;
      if (token && user && effectiveTenantId) {
        fetchUsers();
      } else if (!token) {
        setLoading(false);
        setError('Not authenticated');
      } else if (token && user && !effectiveTenantId) {
        setLoading(false);
        setError('Please select a tenant to manage users (Dashboard > Select Tenant)');
      }
    }
  }, [authLoading, token, user, selectedTenantId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(''); // Clear error before fetching
      const effectiveTenantId = user?.tenantId || selectedTenantId;
      const response = await apiService.listTenantUsers(token, effectiveTenantId);
      // Response structure: { users: [...], total: N, pagination: {...} } OR just array for legacy
      const usersList = Array.isArray(response) ? response : (response.users || []);
      setUsers(usersList);
    } catch (err) {
      setError('Failed to load users: ' + (err.message || 'Unknown error'));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      // Generate a random temporary password
      const tempPassword = Math.random().toString(36).slice(-10) + 'T1!';
      const effectiveTenantId = user?.tenantId || selectedTenantId;
      await apiService.addUser(token, formData.email, tempPassword, formData.fullName, formData.role, effectiveTenantId);
      // Show the temporary password to the admin
      setNewUserPassword(tempPassword);
      setFormData({ email: '', fullName: '', role: 'user' });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setSubmitError(err.message || 'Failed to add user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await apiService.deleteUser(token, userId);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user: ' + err.message);
    }
  };

  return (
    <div className="page">
      <nav className="topbar">
        <h1>{user?.role === 'super_admin' ? 'View Users' : 'Manage Users'}</h1>
        <div>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ marginRight: 10 }}>Dashboard</button>
          <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-secondary">Logout</button>
        </div>
      </nav>

      {newUserPassword && (
        <div className="alert success" style={{ marginBottom: 20 }}>
          <h3 style={{ marginTop: 0 }}>✓ User Created Successfully</h3>
          <div className="card" style={{ margin: '10px 0', boxShadow: 'none' }}>
            <p style={{ marginTop: 0, marginBottom: 6 }}><strong>Temporary Password:</strong></p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <code style={{ backgroundColor: '#f5f5f5', padding: '10px 12px', borderRadius: 6, fontFamily: 'monospace', fontSize: 16, flex: 1, wordBreak: 'break-all' }}>{newUserPassword}</code>
              <button
                onClick={() => { navigator.clipboard.writeText(newUserPassword); alert('Password copied!'); }}
                className="btn btn-primary"
              >
                Copy
              </button>
            </div>
          </div>
          <p className="link-muted">Share this password with the new user. They must change it on their first login.</p>
          <button onClick={() => setNewUserPassword('')} className="btn btn-secondary">Dismiss</button>
        </div>
      )}

      {user?.role === 'super_admin' && <div className="alert" style={{ color: '#065f46', borderColor: '#86efac', background: '#f0fdf4' }}>📊 Read-only view - Super Admin cannot modify users</div>}

      {user?.role !== 'super_admin' && user?.role !== 'tenant_admin' && <div className="alert" style={{ color: '#b45309', borderColor: '#fcd34d', background: '#fffbeb' }}>Only tenant admins can manage users</div>}

      {user?.role !== 'super_admin' && showForm && (
        <form onSubmit={handleAddUser} className="card" style={{ marginBottom: 20 }}>
          {submitError && <div className="alert error">{submitError}</div>}
          <div className="form-group">
            <label>Email</label>
            <input className="input" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input className="input" type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select className="input" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
              <option value="user">user</option>
              <option value="tenant_admin">tenant_admin</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary">Add User</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {!showForm && user?.role === 'tenant_admin' && (
        <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ marginBottom: 20 }}>+ Add User</button>
      )}

      {error && <div className="alert error">{error}</div>}
      {loading ? <p>Loading...</p> : (
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.fullName}</td>
                <td><span className="badge">{u.role}</span></td>
                <td className="table-actions">
                  {user?.role === 'tenant_admin' && (
                    <button onClick={() => handleDeleteUser(u.id)} className="btn btn-link" style={{ color: '#ef4444' }}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}