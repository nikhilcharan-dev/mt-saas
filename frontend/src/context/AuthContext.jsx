import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTenantId, setSelectedTenantId] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      // Don't set token yet, validate first
      validateToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (tok) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/auth/me`, { headers: { Authorization: `Bearer ${tok}` } });
      if (res.ok) {
        const data = await res.json();
        // Extract tenantId from tenant object if it exists
        const userData = data.data;
        if (userData.tenant) {
          userData.tenantId = userData.tenant.id;
        }
        // Set both token and user at the same time
        setToken(tok);
        setUser(userData);
      } else {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Token validation failed', err);
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, tenantSubdomain) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, tenantSubdomain })
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      const error = new Error(errorData.message || 'Login failed');
      error.code = errorData.code;
      throw error;
    }
    
    const data = await res.json();
    const userData = data.data.user;
    // Extract tenantId from tenant object if it exists
    if (userData.tenant) {
      userData.tenantId = userData.tenant.id;
    }
    localStorage.setItem('authToken', data.data.token);
    setToken(data.data.token);
    setUser(userData);
    
    // Also fetch complete user data from /me endpoint to ensure all tenant data is loaded
    try {
      const meRes = await fetch(`${apiUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${data.data.token}` }
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        const completeUserData = meData.data;
        if (completeUserData.tenant) {
          completeUserData.tenantId = completeUserData.tenant.id;
        }
        setUser(completeUserData);
      }
    } catch (err) {
      console.log('Could not fetch complete user data after login', err);
    }
    
    return data.data;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setSelectedTenantId(null);
  };

  const registerTenant = async (tenantName, subdomain, adminEmail, adminPassword, adminFullName) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await fetch(`${apiUrl}/api/auth/register-tenant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantName, subdomain, adminEmail, adminPassword, adminFullName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, registerTenant, loading, selectedTenantId, setSelectedTenantId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be in AuthProvider');
  return ctx;
}