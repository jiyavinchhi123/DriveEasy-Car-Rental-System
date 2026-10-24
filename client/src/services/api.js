/**
 * DriveEasy Car Rental System - Frontend API Service Module
 * Configurable API client for communicating with Express Backend
 */

// Load configurable base URL from Vite environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

/**
 * Helper to retrieve stored JWT token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('driveeasy_token');
};

/**
 * Universal request wrapper
 * Automatically handles JSON parsing, headers, and authorization
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // Attach Bearer token if available
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || `Request failed with status ${response.status}`;
      return {
        success: false,
        status: response.status,
        error: errorMessage,
        data: null
      };
    }

    return {
      success: true,
      status: response.status,
      data: data?.data || data,
      raw: data
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error.message || 'Network error: Unable to reach backend server',
      data: null
    };
  }
};

/**
 * Health check service call
 * Calls GET /api/v1/health
 */
export const checkApiHealth = async () => {
  return await apiRequest('/health', { method: 'GET' });
};

export default {
  API_BASE_URL,
  apiRequest,
  checkApiHealth,
  getAuthToken
};
