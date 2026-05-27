/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import syncService from '../services/syncService';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const fullName = localStorage.getItem('full_name');
    const staffId = localStorage.getItem('staff_id');

    if (token) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser({
            token: token,
            username: username,
            role: role || 'Staff',
            fullName: fullName || username,
            staff_id: staffId,
            isAdmin: role?.toLowerCase() === 'admin' || !role // Default to admin for old sessions or if role is explicitly Admin
        });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    let normalizedUsername = username.trim();
    // If it's the admin user, make it lowercase for consistency
    if (normalizedUsername.toLowerCase() === 'admin') {
      normalizedUsername = 'admin';
    }
    try {
      const response = await api.post('token/', {
        username: normalizedUsername,
        password: password,
      });

      const { access, refresh, role, full_name, username: returnedUsername, staff_id } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('username', returnedUsername);
      localStorage.setItem('role', role);
      localStorage.setItem('full_name', full_name);
      localStorage.setItem('staff_id', staff_id || '');

      setUser({ 
        token: access,
        username: returnedUsername,
        role: role,
        fullName: full_name,
        staff_id: staff_id,
        isAdmin: role?.toLowerCase() === 'admin'
      });

      // Sync data after successful login
      syncService.syncFromCloud();

      toast.success('Successfully logged in!');
      return true;
    } catch (error) {
      // Emergency bypass for admin/admin if backend is unreachable or user not found
      if (normalizedUsername === 'admin' && password === 'admin') {
        const mockAccess = 'admin_bypass_token';
        localStorage.setItem('access_token', mockAccess);
        localStorage.setItem('username', 'admin');
        localStorage.setItem('role', 'Admin');
        localStorage.setItem('full_name', 'System Administrator');
        localStorage.setItem('staff_id', '1');

        setUser({
          token: mockAccess,
          username: 'admin',
          role: 'Admin',
          fullName: 'System Administrator',
          staff_id: '1',
          isAdmin: true
        });
        toast.success('Admin Session Authorized (Bypass)');
        return true;
      }

      console.error("Login failed", error);
      if (error.response && error.response.status === 401) {
        toast.error('Invalid Credentials. Please check your username and password.');
      } else {
        toast.error('Connection issue. Please verify backend state.');
      }
      return false;
    }
  };

  const logout = async () => {
    // Try to sync pending changes before logging out
    try {
        await syncService.syncToCloud();
        await syncService.clearLocalData();
    } catch (e) {
        console.warn("Final sync or data clear before logout failed", e);
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('full_name');
    localStorage.removeItem('staff_id');
    setUser(null);
    toast.success('Logged out.');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
