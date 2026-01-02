import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export function TasksPage() {
  const { user, token, logout, loading: authLoading, selectedTenantId } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', projectId, priority: 'medium', status: 'todo' });
  const [submitError, setSubmitError] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');
  const [hasUserSelectedProject, setHasUserSelectedProject] = useState(false);

  useEffect(() => {
    // Only fetch data after auth is done loading, we have token, user, and either user has tenantId or super admin has selected one
    if (!authLoading) {
      const effectiveTenantId = user?.tenantId || selectedTenantId;
      if (token && user && effectiveTenantId) {
        fetchData();
      } else if (!token) {
        setLoading(false);
        setError('Not authenticated');
      } else if (token && user && !effectiveTenantId) {
        setLoading(false);
        setError('Please select a tenant to manage tasks (Dashboard > Select Tenant)');
      }
    }
  }, [authLoading, token, user, selectedTenantId, selectedProjectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(''); // Clear error before fetching
      const effectiveTenantId = user?.tenantId || selectedTenantId;
      const projectsList = await apiService.listProjects(token, effectiveTenantId);
      // Response structure: { projects: [...], total, pagination } OR just array for legacy
      const projectsData = Array.isArray(projectsList) ? projectsList : (projectsList.projects || []);
      setProjects(projectsData);
      
      // Auto-select first project only on initial load for super admin (if user hasn't manually selected)
      let projectToLoad = selectedProjectId;
      if (!projectToLoad && projectsData.length > 0 && user?.role === 'super_admin' && !hasUserSelectedProject) {
        projectToLoad = projectsData[0].id;
        setSelectedProjectId(projectsData[0].id);
        setHasUserSelectedProject(true);
      }
      
      // Fetch tasks - either from a specific project or from all projects
      if (projectToLoad) {
        // Fetch tasks from specific project
        const tasksList = await apiService.listTasks(token, projectToLoad);
        // Response structure: { tasks: [...], total, pagination } OR just array for legacy
        const tasksData = Array.isArray(tasksList) ? tasksList : (tasksList.tasks || []);
        setTasks(tasksData);
      } else if (projectsData.length > 0) {
        // Fetch tasks from all projects when "All Projects" is selected
        const allTasks = [];
        for (const project of projectsData) {
          try {
            const tasksList = await apiService.listTasks(token, project.id);
            const tasksData = Array.isArray(tasksList) ? tasksList : (tasksList.tasks || []);
            allTasks.push(...tasksData);
          } catch (err) {
            console.log('Failed to fetch tasks for project', project.id);
          }
        }
        // Sort all tasks by creation date (newest first)
        allTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTasks(allTasks);
      } else {
        setTasks([]);
      }
    } catch (err) {
      setError('Failed to load data: ' + (err.message || 'Unknown error'));
      setProjects([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      if (!formData.projectId) {
        setSubmitError('Please select a project');
        return;
      }
      await apiService.createTask(token, formData.title, formData.description, formData.projectId, formData.priority, formData.status);
      setFormData({ title: '', description: '', projectId: selectedProjectId, priority: 'medium', status: 'todo' });
      setShowForm(false);
      // Refresh data to show the new task
      await fetchData();
    } catch (err) {
      setSubmitError(err.message || 'Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await apiService.deleteTask(token, taskId);
      // Refresh data to remove the deleted task
      await fetchData();
    } catch (err) {
      alert('Failed to delete task: ' + err.message);
    }
  };

  const handleUpdateStatus = async (taskId, status) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      await apiService.updateTask(token, taskId, task.title, task.description, status, task.priority);
      // Refresh data to show the updated status
      await fetchData();
    } catch (err) {
      alert('Failed to update task: ' + err.message);
    }
  };

  return (
    <div className="page">
      <nav className="topbar">
        <h1>{user?.role === 'super_admin' ? 'View Tasks' : 'Tasks'}</h1>
        <div>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ marginRight: 10 }}>Dashboard</button>
          <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-secondary">Logout</button>
        </div>
      </nav>

      <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <label style={{ fontWeight: 700 }}>Filter by Project:</label>
        <select value={selectedProjectId} onChange={(e) => { 
          setSelectedProjectId(e.target.value);
          setHasUserSelectedProject(true);
        }} className="input" style={{ width: '240px' }}>
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {user?.role === 'super_admin' && <div className="alert" style={{ color: '#065f46', borderColor: '#86efac', background: '#f0fdf4' }}>📊 Read-only view - Super Admin cannot modify tasks</div>}

      {user?.role !== 'super_admin' && showForm && (
        <form onSubmit={handleCreateTask} className="card" style={{ marginBottom: 20 }}>
          {submitError && <div className="alert error">{submitError}</div>}
          <div className="form-group">
            <label>Project</label>
            <select className="input" value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })} required>
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Task Title</label>
            <input className="input" type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="input" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ minHeight: 60 }} />
          </div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Priority</label>
              <select className="input" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                <option>low</option>
                <option>medium</option>
                <option>high</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option>todo</option>
                <option>in_progress</option>
                <option>completed</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary">Create Task</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {!showForm && user?.role !== 'super_admin' && (
        <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ marginBottom: 20 }}>+ Create Task</button>
      )}

      {error && <div className="alert error">{error}</div>}
      {loading ? <p>Loading...</p> : (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Project</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{projects.find((p) => p.id === task.projectId)?.name || 'N/A'}</td>
                <td><span className="badge">{task.priority}</span></td>
                <td>
                  {user?.role !== 'super_admin' ? (
                    <select value={task.status} onChange={(e) => handleUpdateStatus(task.id, e.target.value)} className="input" style={{ width: '150px' }}>
                      <option>todo</option>
                      <option>in_progress</option>
                      <option>completed</option>
                    </select>
                  ) : (
                    <span className="badge">{task.status}</span>
                  )}
                </td>
                <td className="table-actions">
                  {user?.role !== 'super_admin' && (
                    <button onClick={() => handleDeleteTask(task.id)} className="btn btn-link" style={{ color: '#ef4444' }}>Delete</button>
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