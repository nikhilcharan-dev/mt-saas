import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export function ProjectsPage() {
  const { user, token, logout, loading: authLoading, selectedTenantId } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    // Only fetch projects after auth is done loading, we have token, user, and either user has tenantId or super admin has selected one
    if (!authLoading) {
      const effectiveTenantId = user?.tenantId || selectedTenantId;
      if (token && user && effectiveTenantId) {
        fetchProjects();
      } else if (!token) {
        setLoading(false);
        setError('Not authenticated');
      } else if (token && user && !effectiveTenantId) {
        setLoading(false);
        setError('Please select a tenant to manage projects (Dashboard > Select Tenant)');
      }
    }
  }, [authLoading, token, user, selectedTenantId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(''); // Clear error before fetching
      const effectiveTenantId = user?.tenantId || selectedTenantId;
      const response = await apiService.listProjects(token, effectiveTenantId);
      // Response structure: { projects: [...], total: N, pagination: {...} } OR just array for legacy
      const projectsList = Array.isArray(response) ? response : (response.projects || []);
      setProjects(projectsList);
    } catch (err) {
      setError('Failed to load projects: ' + (err.message || 'Unknown error'));
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      const effectiveTenantId = user?.tenantId || selectedTenantId;
      await apiService.createProject(token, formData.name, formData.description, 'active', effectiveTenantId);
      setFormData({ name: '', description: '' });
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      console.error('Project creation error:', err);
      setSubmitError(err.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await apiService.deleteProject(token, projectId);
      fetchProjects();
    } catch (err) {
      alert('Failed to delete project: ' + err.message);
    }
  };

  const handleUpdateStatus = async (projectId, status) => {
    try {
      const proj = projects.find((p) => p.id === projectId);
      await apiService.updateProject(token, projectId, proj.name, proj.description, status);
      fetchProjects();
    } catch (err) {
      alert('Failed to update project: ' + err.message);
    }
  };

  return (
    <div className="page">
      <nav className="topbar">
        <h1>{user?.role === 'super_admin' ? 'View Projects' : 'Projects'}</h1>
        <div>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ marginRight: 10 }}>Dashboard</button>
          <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-secondary">Logout</button>
        </div>
      </nav>

      {user?.role === 'super_admin' && <div className="alert" style={{ color: '#065f46', borderColor: '#86efac', background: '#f0fdf4' }}>📊 Read-only view - Super Admin cannot modify projects</div>}

      {user?.role !== 'super_admin' && showForm && (
        <form onSubmit={handleCreateProject} className="card" style={{ marginBottom: 20 }}>
          {submitError && <div className="alert error">{submitError}</div>}
          <div className="form-group">
            <label>Project Name</label>
            <input className="input" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="input" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ minHeight: 80 }} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary">Create Project</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {!showForm && user?.role !== 'super_admin' && (
        <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ marginBottom: 20 }}>+ Create Project</button>
      )}

      {error && <div className="alert error">{error}</div>}
      {loading ? <p>Loading...</p> : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {projects.map((proj) => (
            <div key={proj.id} className="card">
              <h3 style={{ marginTop: 0 }}>{proj.name}</h3>
              <p style={{ minHeight: 40 }}>{proj.description}</p>
              <p><strong>Status:</strong> <span className="badge">{proj.status}</span></p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                <button onClick={() => navigate(`/tasks?projectId=${proj.id}`)} className="btn btn-primary">View Tasks</button>
                {user?.role !== 'super_admin' && (
                  <>
                    <select value={proj.status} onChange={(e) => handleUpdateStatus(proj.id, e.target.value)} className="input" style={{ width: '140px' }}>
                      <option>active</option>
                      <option>archived</option>
                    </select>
                    <button onClick={() => handleDeleteProject(proj.id)} className="btn btn-link" style={{ color: '#ef4444' }}>Delete</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}