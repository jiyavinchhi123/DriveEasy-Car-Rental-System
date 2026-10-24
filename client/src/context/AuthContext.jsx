import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Authentication Context for DriveEasy Car Rental System
 * Uses standard React useState, useEffect, and useContext
 * Prepared for Stage 2/3 JWT Authentication integration
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('driveeasy_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on app mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('driveeasy_user');
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('[AuthContext] Failed to parse stored user profile:', err);
      localStorage.removeItem('driveeasy_user');
      localStorage.removeItem('driveeasy_token');
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * Login handler - persists JWT token and user info
   */
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('driveeasy_token', authToken);
    localStorage.setItem('driveeasy_user', JSON.stringify(userData));
  };

  /**
   * Logout handler - clears session
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('driveeasy_token');
    localStorage.removeItem('driveeasy_user');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to easily consume the AuthContext in any component
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
