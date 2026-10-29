import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, usersAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('hirenova_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('hirenova_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('hirenova_token', token);
    } else {
      localStorage.removeItem('hirenova_token');
    }
  }, [token]);

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('hirenova_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hirenova_user');
    }
  }, [user]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hirenova_token');
    localStorage.removeItem('hirenova_user');
  }, []);

  // Validate session on app launch
  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token, logout]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const toggleBookmark = async (jobId) => {
    if (!user) {
      throw new Error('Please log in to save jobs');
    }
    const res = await usersAPI.toggleSaveJob(jobId);
    if (res.success) {
      const savedJobIds = user.savedJobs ? [...user.savedJobs] : [];
      const updatedSaved = res.isSaved
        ? [...savedJobIds, jobId]
        : savedJobIds.filter((id) => (typeof id === 'string' ? id : id._id) !== jobId);

      setUser((prev) => ({
        ...prev,
        savedJobs: updatedSaved,
      }));
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        toggleBookmark,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
