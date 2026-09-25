/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('user_role') || 'Admin';
    const department = localStorage.getItem('user_department') || 'Management';
    const fullName = localStorage.getItem('user_fullname') || username || 'User';
    const isAdmin = localStorage.getItem('is_admin') === 'true';

    if (token) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser({ 
            token: token,
            username: username,
            role: role,
            department: department,
            fullName: fullName,
            isAdmin: isAdmin
        });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const normalizedUsername = username.trim().toLowerCase();
    try {
      const response = await api.post('token/', {
        username: normalizedUsername,
        password: password,
      });

      const { access, refresh, role, department, full_name, is_admin } = response.data;

      localStorage.setItem('access_token', access);
      if (refresh) localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('username', normalizedUsername);
      localStorage.setItem('user_role', role || 'Admin');
      localStorage.setItem('user_department', department || 'Management');
      localStorage.setItem('user_fullname', full_name || normalizedUsername);
      localStorage.setItem('is_admin', is_admin ? 'true' : 'false');
      
      setUser({ 
        token: access,
        username: normalizedUsername,
        role: role || 'Admin',
        department: department || 'Management',
        fullName: full_name || normalizedUsername,
        isAdmin: !!is_admin
      });
      toast.success(`Welcome back, ${full_name || username}! (${role || 'User'})`);
      return true;
    } catch (error) {
      console.error("Login failed", error);
      if (error.response && error.response.status === 401) {
        toast.error('Invalid Credentials. Please check your username and password.');
      } else {
        toast.error('Connection issue. Please verify backend state.');
      }
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_department');
    localStorage.removeItem('user_fullname');
    localStorage.removeItem('is_admin');
    setUser(null);
    toast.success('Logged out.');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
