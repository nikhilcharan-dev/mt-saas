// Use environment variable for API URL (VITE_API_URL for Vite)
// In Docker: http://backend:5000
// In local dev: http://localhost:5000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
}

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API error');
  }
  return data.data || data;
}

export const apiService = {
  // Tenants
  listTenants: (token) =>
    fetch(`${API_URL}/api/tenants`, {
      headers: getHeaders(token)
    }).then(handleResponse),

  // Users
  addUser: (token, email, password, fullName, role = 'user', tenantId = null) => {
    // Use explicit tenantId or get from token JWT payload
    let tid = tenantId;
    if (!tid) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      tid = payload.tenantId;
    }
    if (!tid) throw new Error('No tenantId available');
    return fetch(`${API_URL}/api/tenants/${tid}/users`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ email, password, fullName, role })
    }).then(handleResponse);
  },

  listTenantUsers: (token, tenantId = null) => {
    let tid = tenantId;
    if (!tid) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      tid = payload.tenantId;
    }
    if (!tid) throw new Error('No tenantId available');
    return fetch(`${API_URL}/api/tenants/${tid}/users`, {
      headers: getHeaders(token)
    }).then(handleResponse);
  },

  updateUser: (token, userId, data) =>
    fetch(`${API_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(data)
    }).then(handleResponse),

  deleteUser: (token, userId) =>
    fetch(`${API_URL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    }).then(handleResponse),

  // Projects
  createProject: (token, name, description, status = 'active', tenantId = null) => {
    // Use explicit tenantId or get from token JWT payload
    let tid = tenantId;
    if (!tid) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      tid = payload.tenantId;
    }
    if (!tid) throw new Error('No tenantId available');
    return fetch(`${API_URL}/api/tenants/${tid}/projects`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ name, description, status })
    }).then(handleResponse);
  },

  listProjects: (token, tenantId = null) => {
    // Use explicit tenantId or get from token JWT payload
    let tid = tenantId;
    if (!tid) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      tid = payload.tenantId;
    }
    if (!tid) throw new Error('No tenantId available');
    return fetch(`${API_URL}/api/tenants/${tid}/projects`, {
      headers: getHeaders(token)
    }).then(handleResponse);
  },

  updateProject: (token, projectId, name, description, status) =>
    fetch(`${API_URL}/api/projects/${projectId}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ name, description, status })
    }).then(handleResponse),

  deleteProject: (token, projectId) =>
    fetch(`${API_URL}/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    }).then(handleResponse),

  // Tasks
  createTask: (token, title, description, projectId, priority = 'medium', status = 'pending') =>
    fetch(`${API_URL}/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ title, description, priority, status })
    }).then(handleResponse),

  listTasks: (token, projectId) =>
    fetch(`${API_URL}/api/projects/${projectId}/tasks`, {
      headers: getHeaders(token)
    }).then(handleResponse),

  updateTask: (token, taskId, title, description, status, priority) =>
    fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ title, description, status, priority })
    }).then(handleResponse),

  deleteTask: (token, taskId) =>
    fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    }).then(handleResponse),

  getTenant: (token, tenantId) =>
    fetch(`${API_URL}/api/tenants/${tenantId}`, {
      headers: getHeaders(token)
    }).then(handleResponse),

  updateTenant: (token, tenantId, data) =>
    fetch(`${API_URL}/api/tenants/${tenantId}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(data)
    }).then(handleResponse)
};