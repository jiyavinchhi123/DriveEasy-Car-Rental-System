/**
 * DriveEasy Car Rental System - Authentication Service
 * Reusable service handling credential verification, authentication requests,
 * and current session details via Express backend API.
 */
import { apiRequest } from './api';

/**
 * Sends login credentials to backend POST /api/v1/auth/login
 * 
 * @param {string} email - Customer email address
 * @param {string} password - Customer account password
 * @returns {Promise<{ success: boolean, data?: { customer: object, token: string }, error?: string }>}
 */
export const loginUser = async (email, password) => {
  if (!email || !password) {
    return {
      success: false,
      error: 'Please enter both email address and password.'
    };
  }

  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: email.trim(),
      password
    })
  });

  if (!response.success) {
    return {
      success: false,
      error: response.error || 'Invalid credentials or server rejected authentication.'
    };
  }

  return {
    success: true,
    data: response.data,
    message: response.raw?.message || 'Login successful'
  };
};

/**
 * Fetches current authenticated customer profile from backend GET /api/v1/auth/me
 */
export const fetchCurrentProfile = async () => {
  return await apiRequest('/auth/me', {
    method: 'GET'
  });
};

export default {
  loginUser,
  fetchCurrentProfile
};
