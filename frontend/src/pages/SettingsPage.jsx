import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export function SettingsPage() {
  const { user, token, logout, selectedTenantId } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tenant, setTenant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    status: '',
    subscriptionPlan: '',
    maxUsers: '',
    maxProjects: ''
  });

  const tenantId = user?.role === 'super_admin' ? selectedTenantId : user?.tenantId;
  const isSuperAdmin = user?.role === 'super_admin';
  const isTenantAdmin = user?.role === 'tenant_admin';

  useEffect(() => {
    if (!tenantId) {
      setError('No tenant selected');
      setLoading(false);
      return;
    }

    setLoading(true);
    apiService.getTenant(token, tenantId)
      .then(data => {
        setTenant(data);
        setFormData({
          name: data.name || '',
          status: data.status || '',
          subscriptionPlan: data.subscriptionPlan || '',
          maxUsers: data.maxUsers || '',
          maxProjects: data.maxProjects || ''
        });
        setError('');
      })
      .catch(err => {
        setError(err.message || 'Failed to load tenant details');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, tenantId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updateData = {};
      
      // Tenant admins can only update name
      if (isTenantAdmin) {
        if (formData.name !== tenant.name) {
          updateData.name = formData.name;
        }
      }
      
      // Super admins can update everything
      if (isSuperAdmin) {
        if (formData.name !== tenant.name) updateData.name = formData.name;
        if (formData.status !== tenant.status) updateData.status = formData.status;
        if (formData.subscriptionPlan !== tenant.subscriptionPlan) updateData.subscriptionPlan = formData.subscriptionPlan;
        if (parseInt(formData.maxUsers) !== tenant.maxUsers) updateData.maxUsers = parseInt(formData.maxUsers);
        if (parseInt(formData.maxProjects) !== tenant.maxProjects) updateData.maxProjects = parseInt(formData.maxProjects);
      }

      if (Object.keys(updateData).length === 0) {
        setError('No changes to save');
        return;
      }

      await apiService.updateTenant(token, tenantId, updateData);
      setSuccess('Tenant settings updated successfully!');
      
      // Reload tenant data
      const updated = await apiService.getTenant(token, tenantId);
      setTenant(updated);
      setFormData({
        name: updated.name || '',
        status: updated.status || '',
        subscriptionPlan: updated.subscriptionPlan || '',
        maxUsers: updated.maxUsers || '',
        maxProjects: updated.maxProjects || ''
      });
    } catch (err) {
      setError(err.message || 'Failed to update tenant settings');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <nav className="topbar">
          <h1>Tenant Settings</h1>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">Back to Dashboard</button>
        </nav>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isSuperAdmin && !isTenantAdmin) {
    return (
      <div className="page">
        <nav className="topbar">
          <h1>Tenant Settings</h1>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">Back to Dashboard</button>
        </nav>
        <div className="alert error">You do not have permission to access settings.</div>
      </div>
    );
  }

  return (
    <div className="page">
      <nav className="topbar">
        <h1>{isSuperAdmin ? 'Tenant Management' : 'Tenant Settings'}</h1>
        <div>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ marginRight: 10 }}>Dashboard</button>
          <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-secondary">Logout</button>
        </div>
      </nav>

      {isSuperAdmin && (
        <div className="alert" style={{ color: '#065f46', borderColor: '#86efac', background: '#f0fdf4', marginBottom: 20 }}>
          🔐 Super Admin Mode - You can update all tenant settings including subscription plan and limits
        </div>
      )}

      {isTenantAdmin && (
        <div className="alert" style={{ color: '#b45309', borderColor: '#fcd34d', background: '#fffbeb', marginBottom: 20 }}>
          ℹ️ Tenant Admin - You can only update the tenant name. Contact super admin to change plan or limits.
        </div>
      )}

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert" style={{ color: '#065f46', borderColor: '#86efac', background: '#f0fdf4' }}>{success}</div>}

      {tenant && (
        <div className="card">
          <h2>Tenant Information</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tenant Name *</label>
              <input
                className="input"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={!isTenantAdmin && !isSuperAdmin}
              />
            </div>

            <div className="form-group">
              <label>Subdomain</label>
              <input
                className="input"
                type="text"
                value={tenant.subdomain}
                disabled
                style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
              />
              <small style={{ color: '#6b7280' }}>Subdomain cannot be changed</small>
            </div>

            {isSuperAdmin && (
              <>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      className="input"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="trial">Trial</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Subscription Plan</label>
                    <select
                      className="input"
                      value={formData.subscriptionPlan}
                      onChange={(e) => {
                        const plan = e.target.value;
                        const defaults = {
                          free: { maxUsers: 5, maxProjects: 3 },
                          pro: { maxUsers: 25, maxProjects: 15 },
                          enterprise: { maxUsers: 100, maxProjects: 50 }
                        };
                        setFormData({
                          ...formData,
                          subscriptionPlan: plan,
                          maxUsers: defaults[plan]?.maxUsers || formData.maxUsers,
                          maxProjects: defaults[plan]?.maxProjects || formData.maxProjects
                        });
                      }}
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>

                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Max Users</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={formData.maxUsers}
                      onChange={(e) => setFormData({ ...formData, maxUsers: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Max Projects</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={formData.maxProjects}
                      onChange={(e) => setFormData({ ...formData, maxProjects: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            {!isSuperAdmin && (
              <div className="card" style={{ background: '#f9fafb', marginTop: 20, marginBottom: 20 }}>
                <h3 style={{ marginTop: 0 }}>Current Plan Details</h3>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <p className="link-muted" style={{ margin: '0 0 4px 0' }}>Status</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>{tenant.status}</p>
                  </div>
                  <div>
                    <p className="link-muted" style={{ margin: '0 0 4px 0' }}>Plan</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>{tenant.subscriptionPlan?.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="link-muted" style={{ margin: '0 0 4px 0' }}>Max Users</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>{tenant.maxUsers}</p>
                  </div>
                  <div>
                    <p className="link-muted" style={{ margin: '0 0 4px 0' }}>Max Projects</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>{tenant.maxProjects}</p>
                  </div>
                </div>
              </div>
            )}

            {tenant.stats && (
              <div className="card" style={{ background: '#f0f9ff', marginTop: 20, marginBottom: 20, borderColor: '#bae6fd' }}>
                <h3 style={{ marginTop: 0, color: '#0369a1' }}>Current Usage</h3>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <p className="link-muted" style={{ margin: '0 0 4px 0' }}>Users</p>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 20 }}>
                      {tenant.stats.totalUsers} / {tenant.maxUsers}
                    </p>
                  </div>
                  <div>
                    <p className="link-muted" style={{ margin: '0 0 4px 0' }}>Projects</p>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 20 }}>
                      {tenant.stats.totalProjects} / {tenant.maxProjects}
                    </p>
                  </div>
                  <div>
                    <p className="link-muted" style={{ margin: '0 0 4px 0' }}>Tasks</p>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 20 }}>
                      {tenant.stats.totalTasks}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary">
                {isSuperAdmin ? 'Update Tenant' : 'Update Name'}
              </button>
              <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isSuperAdmin && tenant && (
        <div className="card" style={{ marginTop: 20, background: '#fef3c7', borderColor: '#fcd34d' }}>
          <h3 style={{ marginTop: 0, color: '#92400e' }}>ℹ️ Plan Defaults</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            <div>
              <p style={{ fontWeight: 700, margin: '0 0 8px 0', color: '#059669' }}>FREE</p>
              <p style={{ margin: '4px 0', fontSize: 14 }}>Max Users: 5</p>
              <p style={{ margin: '4px 0', fontSize: 14 }}>Max Projects: 3</p>
            </div>
            <div>
              <p style={{ fontWeight: 700, margin: '0 0 8px 0', color: '#2563eb' }}>PRO</p>
              <p style={{ margin: '4px 0', fontSize: 14 }}>Max Users: 25</p>
              <p style={{ margin: '4px 0', fontSize: 14 }}>Max Projects: 15</p>
            </div>
            <div>
              <p style={{ fontWeight: 700, margin: '0 0 8px 0', color: '#7c3aed' }}>ENTERPRISE</p>
              <p style={{ margin: '4px 0', fontSize: 14 }}>Max Users: 100</p>
              <p style={{ margin: '4px 0', fontSize: 14 }}>Max Projects: 50</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
