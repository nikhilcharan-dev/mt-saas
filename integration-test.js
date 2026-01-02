#!/usr/bin/env node

/**
 * Integration Test Script for Multi-Tenant SaaS API
 * Tests all 19 endpoints with demo credentials
 */

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let demoTenantId = '';
let demoProjectId = '';
let demoTaskId = '';
let testUserId = '';

async function makeRequest(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    console.error(`❌ ${method} ${endpoint} - ${response.status}`);
    console.error(`   Error: ${data.message}`);
    return null;
  }

  console.log(`✅ ${method} ${endpoint} - ${response.status}`);
  return data.data || data;
}

async function runTests() {
  console.log('\n🧪 Starting Multi-Tenant SaaS API Integration Tests\n');

  // 1. Health Check
  console.log('--- Health Check ---');
  const health = await makeRequest('GET', '/health');
  if (!health) return;

  // 2. Register New Tenant
  console.log('\n--- Authentication ---');
  const registerRes = await makeRequest('POST', '/auth/register-tenant', {
    tenantName: 'Test Tenant',
    subdomain: `test-${Date.now()}`,
    adminEmail: `admin-${Date.now()}@test.com`,
    adminPassword: 'TestPassword123!',
    adminFullName: 'Test Admin'
  });
  if (!registerRes) return;

  // 3. Login with Demo Tenant
  const loginRes = await makeRequest('POST', '/auth/login', {
    email: 'admin@demo.com',
    password: 'Demo@123',
    tenantSubdomain: 'demo'
  });
  if (!loginRes) return;
  authToken = loginRes.token;

  // Get tenant ID from token
  const tokenPayload = JSON.parse(Buffer.from(authToken.split('.')[1], 'base64'));
  demoTenantId = tokenPayload.tenantId;
  console.log(`   Tenant ID: ${demoTenantId}`);

  // 4. Get Current User
  const meRes = await makeRequest('GET', '/auth/me');
  if (meRes) {
    console.log(`   User: ${meRes.email} (${meRes.role})`);
  }

  // 5. List Tenants (Demo Tenant)
  console.log('\n--- Tenants ---');
  await makeRequest('GET', '/tenants');

  // 6. Get Tenant Details
  await makeRequest('GET', `/tenants/${demoTenantId}`);

  // 7. Update Tenant
  await makeRequest('PUT', `/tenants/${demoTenantId}`, {
    name: 'Demo Tenant (Updated)',
    subscription: 'pro'
  });

  // 8. List Tenant Users
  console.log('\n--- Users ---');
  const usersRes = await makeRequest('GET', `/tenants/${demoTenantId}/users`);
  if (usersRes && usersRes.length > 0) {
    testUserId = usersRes[0].id;
  }

  // 9. Add User
  const addUserRes = await makeRequest('POST', `/tenants/${demoTenantId}/users`, {
    email: `newuser-${Date.now()}@test.com`,
    password: 'NewPassword123!',
    fullName: 'New Test User',
    role: 'user'
  });
  if (addUserRes) {
    testUserId = addUserRes.id;
  }

  // 10. Update User
  if (testUserId) {
    await makeRequest('PUT', `/users/${testUserId}`, {
      fullName: 'Updated Test User',
      role: 'user'
    });
  }

  // 11. Create Project
  console.log('\n--- Projects ---');
  const projectRes = await makeRequest('POST', `/tenants/${demoTenantId}/projects`, {
    name: `Test Project ${Date.now()}`,
    description: 'Test project for integration testing',
    status: 'active'
  });
  if (projectRes) {
    demoProjectId = projectRes.id;
  }

  // 12. List Projects
  await makeRequest('GET', `/tenants/${demoTenantId}/projects`);

  // 13. Update Project
  if (demoProjectId) {
    await makeRequest('PUT', `/projects/${demoProjectId}`, {
      name: `Updated Test Project ${Date.now()}`,
      description: 'Updated description',
      status: 'active'
    });
  }

  // 14. Create Task
  console.log('\n--- Tasks ---');
  if (demoProjectId) {
    const taskRes = await makeRequest('POST', `/projects/${demoProjectId}/tasks`, {
      title: 'Test Task',
      description: 'This is a test task',
      priority: 'high',
      status: 'pending'
    });
    if (taskRes) {
      demoTaskId = taskRes.id;
    }
  }

  // 15. List Tasks
  if (demoProjectId) {
    await makeRequest('GET', `/projects/${demoProjectId}/tasks`);
  }

  // 16. Update Task
  if (demoTaskId) {
    await makeRequest('PUT', `/tasks/${demoTaskId}`, {
      title: 'Updated Test Task',
      description: 'Updated description',
      priority: 'medium',
      status: 'in_progress'
    });
  }

  // 17. Delete Task
  if (demoTaskId) {
    console.log('\n--- Cleanup ---');
    await makeRequest('DELETE', `/tasks/${demoTaskId}`);
  }

  // 18. Delete User
  if (testUserId) {
    await makeRequest('DELETE', `/users/${testUserId}`);
  }

  // 19. Delete Project
  if (demoProjectId) {
    await makeRequest('DELETE', `/projects/${demoProjectId}`);
  }

  // 20. Logout
  console.log('\n--- Logout ---');
  await makeRequest('POST', '/auth/logout');

  console.log('\n✨ All tests completed!\n');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
