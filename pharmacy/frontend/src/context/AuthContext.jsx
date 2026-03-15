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
    if (token) {
        setUser({ 
            token: token,
            username: username,
            isAdmin: true // All users in this context are treated as admins
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

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('username', normalizedUsername);
      
      setUser({ 
        token: response.data.access,
        username: username,
        isAdmin: true // Successfully getting a token for an admin-only portal implies admin status
      });
      toast.success('Successfully logged in!');
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
    setUser(null);
    toast.success('Logged out.');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
