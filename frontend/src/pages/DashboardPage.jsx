import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export function DashboardPage() {
  const { user, token, logout, selectedTenantId, setSelectedTenantId, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, projects: 0, tasks: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tenants, setTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(false);

  useEffect(() => {
    // If super admin, fetch list of tenants and auto-select the first one
    if (!authLoading && user && user.role === 'super_admin' && !user.tenantId) {
      setLoadingTenants(true);
      console.log('Fetching tenants for super admin...');
      apiService.listTenants(token)
        .then(response => {
          console.log('Tenants response:', response);
          // Response structure: { tenants: [...], pagination: {...} } OR just array for legacy
          const tenantsList = Array.isArray(response) ? response : (response.tenants || []);
          console.log('Tenants list:', tenantsList);
          setTenants(tenantsList);
          // Auto-select first tenant if not already selected
          if (tenantsList.length > 0 && !selectedTenantId) {
            console.log('Auto-selecting first tenant:', tenantsList[0].id);
            setSelectedTenantId(tenantsList[0].id);
          }
          setLoadingTenants(false);
        })
        .catch(err => {
          console.error('Failed to load tenants:', err);
          setError('Failed to load tenants: ' + err.message);
          setLoadingTenants(false);
        });
    }
  }, [authLoading, user, token, selectedTenantId, setSelectedTenantId]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Determine which tenant to fetch data for
        const effectiveTenantId = user?.tenantId || selectedTenantId;
        
        // If no tenant selected, clear stats
        if (!effectiveTenantId) {
          setStats({ users: 0, projects: 0, tasks: 0 });
          setLoading(false);
          return;
        }

        console.log('Fetching stats for tenant:', effectiveTenantId);
        const usersResponse = await apiService.listTenantUsers(token, effectiveTenantId);
        console.log('Users response:', usersResponse);
        const projectsResponse = await apiService.listProjects(token, effectiveTenantId);
        console.log('Projects response:', projectsResponse);
        
        // Handle paginated responses
        const usersList = Array.isArray(usersResponse) ? usersResponse : (usersResponse.users || []);
        const projectsList = Array.isArray(projectsResponse) ? projectsResponse : (projectsResponse.projects || []);
        
        // Get tasks from all projects
        let tasksCount = 0;
        try {
          if (projectsList && projectsList.length > 0) {
            const allTasks = await Promise.all(
              projectsList.map(p => apiService.listTasks(token, p.id).catch(() => []))
            );
            // Handle paginated task responses
            const tasksList = allTasks.map(t => Array.isArray(t) ? t : (t.tasks || [])).flat();
            tasksCount = tasksList.length;
          }
        } catch (err) {
          console.log('Could not fetch tasks:', err);
        }
        
        setStats({
          users: usersList.length || 0,
          projects: projectsList.length || 0,
          tasks: tasksCount,
        });
      } catch (err) {
        console.error('Stats fetch error:', err);
        setError('Failed to load stats: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    if (token && user) {
      fetchStats();
    }
  }, [token, user, selectedTenantId]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page">
      <nav className="topbar">
        <h1>Dashboard</h1>
        <div>
          {(user?.role === 'tenant_admin' || user?.role === 'super_admin') && (
            <button onClick={() => navigate('/settings')} className="btn btn-secondary" style={{ marginRight: 10 }}>Settings</button>
          )}
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </nav>
      {/* Super Admin Tenant Selector */}
      {user && user.role === 'super_admin' && !user.tenantId && (
        <div className="card" style={{ marginBottom: 24, backgroundColor: '#fef3c7', borderColor: '#f59e0b' }}>
          <h3 style={{ marginTop: 0, color: '#92400e' }}>🔐 Super Admin Mode</h3>
          <p style={{ color: '#78350f' }}>Select a tenant to view and manage their data:</p>
          {loadingTenants ? (
            <p>Loading tenants...</p>
          ) : tenants.length > 0 ? (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {tenants.map(tenant => (
                <button
                  key={tenant.id}
                  onClick={() => {
                    console.log('Selecting tenant:', tenant.id, tenant.name);
                    setSelectedTenantId(tenant.id);
                  }}
                  className={selectedTenantId === tenant.id ? 'btn btn-primary' : 'btn btn-secondary'}
                >
                  {tenant.name} ({tenant.subdomain})
                </button>
              ))}
            </div>
          ) : (
            <p>No tenants available</p>
          )}
          {selectedTenantId && (
            <p style={{ color: '#92400e', marginTop: 12, fontWeight: 'bold' }}>
              ✓ Selected: {tenants.find(t => t.id === selectedTenantId)?.name}
            </p>
          )}
        </div>
      )}
      {loading ? <p>Loading...</p> : error ? <div className="alert error">{error}</div> : (
        <>
          {(user?.tenantId || selectedTenantId) ? (
            <div className="grid grid-3" style={{ marginBottom: 24 }}>
              <div className="card">
                <p className="link-muted" style={{ margin: 0 }}>Users</p>
                <p className="stat-value">{stats.users}</p>
                {user?.role === 'super_admin' ? (
                  <button onClick={() => navigate('/users')} className="btn btn-secondary">View Users</button>
                ) : (
                  <button onClick={() => navigate('/users')} className="btn btn-primary">Manage Users</button>
                )}
              </div>
              <div className="card">
                <p className="link-muted" style={{ margin: 0 }}>Projects</p>
                <p className="stat-value">{stats.projects}</p>
                {user?.role === 'super_admin' ? (
                  <button onClick={() => navigate('/projects')} className="btn btn-secondary">View Projects</button>
                ) : (
                  <button onClick={() => navigate('/projects')} className="btn btn-primary">Manage Projects</button>
                )}
              </div>
              <div className="card">
                <p className="link-muted" style={{ margin: 0 }}>Tasks</p>
                <p className="stat-value">{stats.tasks}</p>
                {user?.role === 'super_admin' ? (
                  <button onClick={() => navigate('/tasks')} className="btn btn-secondary">View Tasks</button>
                ) : (
                  <button onClick={() => navigate('/tasks')} className="btn btn-primary">View Tasks</button>
                )}
              </div>
            </div>
          ) : null}
          <div className="card">
            <h3>Account Info</h3>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>Tenant:</strong> {user?.tenantId || 'N/A (Superadmin)'}</p>
          </div>

          {user?.tenant && (
            <div className="card" style={{ marginTop: 20, borderColor: '#bfdbfe' }}>
              <h3 style={{ color: '#1d4ed8', marginTop: 0 }}>Subscription Plan</h3>
              <div className="grid grid-2" style={{ marginBottom: 12 }}>
                <div>
                  <p className="link-muted" style={{ margin: '0 0 4px 0' }}>Current Plan</p>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1d4ed8' }}>
                    {user.tenant.subscriptionPlan?.toUpperCase() || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="link-muted" style={{ margin: '0 0 4px 0' }}>Tenant Name</p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{user.tenant.name}</p>
                </div>
              </div>

              <div className="grid grid-2" style={{ gap: 14 }}>
                <div className="card" style={{ boxShadow: 'none', borderColor: '#e5e7eb' }}>
                  <p className="link-muted" style={{ margin: '0 0 6px 0', textTransform: 'uppercase', fontSize: 12 }}>Users</p>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{stats.users} / {user.tenant.maxUsers}</p>
                  <div className="progress-track">
                    <div
                      className="progress-bar"
                      style={{
                        backgroundColor: stats.users >= user.tenant.maxUsers * 0.8 ? '#f59e0b' : '#22c55e',
                        width: `${Math.min(100, (stats.users / user.tenant.maxUsers) * 100)}%`
                      }}
                    />
                  </div>
                </div>
                <div className="card" style={{ boxShadow: 'none', borderColor: '#e5e7eb' }}>
                  <p className="link-muted" style={{ margin: '0 0 6px 0', textTransform: 'uppercase', fontSize: 12 }}>Projects</p>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{stats.projects} / {user.tenant.maxProjects}</p>
                  <div className="progress-track">
                    <div
                      className="progress-bar"
                      style={{
                        backgroundColor: stats.projects >= user.tenant.maxProjects * 0.8 ? '#f59e0b' : '#22c55e',
                        width: `${Math.min(100, (stats.projects / user.tenant.maxProjects) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              {stats.users >= user.tenant.maxUsers && (
                <div className="alert error" style={{ marginTop: 12 }}>
                  ⚠️ User limit reached. Contact support to upgrade your plan.
                </div>
              )}
              {stats.projects >= user.tenant.maxProjects && (
                <div className="alert error" style={{ marginTop: 8 }}>
                  ⚠️ Project limit reached. Contact support to upgrade your plan.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}