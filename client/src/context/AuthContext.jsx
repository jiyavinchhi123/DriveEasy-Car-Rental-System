import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * AuthContext for DriveEasy Car Rental System
 * Holds { customer, token } and exposes login, logout, and session persistence.
 */
const AuthContext = createContext(null);

const STORAGE_KEYS = {
  TOKEN: 'driveeasy_token',
  CUSTOMER: 'driveeasy_customer'
};

export const AuthProvider = ({ children }) => {
  // Authentication state
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.TOKEN) || null);
  const [loading, setLoading] = useState(true);

  // Restore saved session from localStorage on application load
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const storedCustomer = localStorage.getItem(STORAGE_KEYS.CUSTOMER);

      if (storedToken && storedCustomer) {
        const parsedCustomer = JSON.parse(storedCustomer);
        // Ensure no sensitive fields like passwords could have been stored
        if (parsedCustomer && typeof parsedCustomer === 'object') {
          delete parsedCustomer.password;
          setCustomer(parsedCustomer);
          setToken(storedToken);
        } else {
          // Invalidate malformed storage
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.CUSTOMER);
        }
      }
    } catch (err) {
      console.error('[AuthContext] Failed to restore customer session:', err);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.CUSTOMER);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login handler:
   * Saves authenticated customer identity and backend-issued token
   * 
   * @param {object} customerData - { id, name, email, role }
   * @param {string} authToken - Backend-issued JWT string
   */
  const login = (customerData, authToken) => {
    if (!customerData || !authToken) {
      console.error('[AuthContext] Invalid login parameters provided.');
      return;
    }

    // Sanitize to never store passwords in state or localStorage
    const safeCustomer = {
      id: customerData.id,
      name: customerData.name || customerData.email,
      email: customerData.email,
      role: customerData.role || 'customer'
    };

    setCustomer(safeCustomer);
    setToken(authToken);

    try {
      localStorage.setItem(STORAGE_KEYS.TOKEN, authToken);
      localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(safeCustomer));
    } catch (err) {
      console.error('[AuthContext] Error persisting session to localStorage:', err);
    }
  };

  /**
   * Logout handler:
   * Clears in-memory authentication state and localStorage tokens
   */
  const logout = () => {
    setCustomer(null);
    setToken(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.CUSTOMER);
    } catch (err) {
      console.error('[AuthContext] Error clearing localStorage on logout:', err);
    }
  };

  const value = {
    customer,
    token,
    isAuthenticated: !!token && !!customer,
    role: customer?.role || null,
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
 * Custom hook to consume AuthContext
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
