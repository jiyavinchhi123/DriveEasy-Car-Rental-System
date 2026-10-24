/**
 * DriveEasy Car Rental System - Universal Frontend API Client
 * 
 * Features:
 * - Configurable base URL via VITE_API_BASE_URL (defaults to http://localhost:5000/api/v1)
 * - Automatic Bearer token header injection
 * - Clean handling of non-2xx HTTP responses and malformed JSON payloads
 * - Automatic 401 handling: purges expired sessions and notifies application
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

/**
 * Retrieve stored JWT token from localStorage
 */
export const getAuthToken = () => {
  try {
    return localStorage.getItem('driveeasy_token');
  } catch (err) {
    return null;
  }
};

/**
 * Universal request wrapper
 * 
 * @param {string} endpoint - Path relative to base URL (e.g. '/vehicles' or '/bookings')
 * @param {object} options - Fetch options (method, headers, body)
 * @returns {Promise<{ success: boolean, status: number, data?: any, error?: string, raw?: any }>}
 */
export const apiRequest = async (endpoint, options = {}) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // Automatically attach Bearer token if available
  const token = getAuthToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);

    // Parse JSON body safely handling empty or malformed returns
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => null);
      data = text ? { message: text } : null;
    }

    // 401 Unauthorized Handling: Clear expired session and broadcast event
    if (response.status === 401) {
      try {
        localStorage.removeItem('driveeasy_token');
        localStorage.removeItem('driveeasy_customer');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('driveeasy:unauthorized'));
        }
      } catch (e) {
        // Ignore storage access errors
      }
    }

    if (!response.ok) {
      const errorMessage = data?.message || `Request failed with HTTP status ${response.status}`;
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
      data: data?.data !== undefined ? data.data : data,
      raw: data
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error.message || 'Network error: Backend server is unreachable.',
      data: null
    };
  }
};

/**
 * Health check endpoint
 */
export const checkApiHealth = async () => {
  return await apiRequest('/health', { method: 'GET' });
};

export default {
  API_BASE_URL,
  getAuthToken,
  apiRequest,
  checkApiHealth
};
