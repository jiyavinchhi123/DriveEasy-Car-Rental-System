import { apiRequest } from './api';

/**
 * Submit a new vehicle booking (POST /api/v1/bookings)
 * 
 * @param {object} payload - { vehicleId, pickupDate, returnDate }
 */
export const createBookingApi = async (payload) => {
  return await apiRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

/**
 * Fetch authenticated customer's bookings (GET /api/v1/bookings/my)
 */
export const fetchMyBookingsApi = async () => {
  return await apiRequest('/bookings/my', { method: 'GET' });
};

/**
 * Fetch all bookings across all customers (GET /api/v1/bookings - Admin/Manager only)
 */
export const fetchAllBookingsApi = async () => {
  return await apiRequest('/bookings', { method: 'GET' });
};

/**
 * Update booking status (PATCH /api/v1/bookings/:id/status)
 * 
 * @param {string} id - Booking ObjectId
 * @param {string} status - 'reserved' | 'ongoing' | 'completed' | 'cancelled'
 */
export const updateBookingStatusApi = async (id, status) => {
  return await apiRequest(`/bookings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
};

export default {
  createBookingApi,
  fetchMyBookingsApi,
  fetchAllBookingsApi,
  updateBookingStatusApi
};
