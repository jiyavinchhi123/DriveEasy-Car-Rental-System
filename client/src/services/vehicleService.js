import { apiRequest } from './api';

/**
 * Fetch vehicle fleet from backend API (GET /api/v1/vehicles)
 * 
 * @param {string} [type] - Optional category filter (e.g. 'SUV', 'Sedan')
 */
export const fetchVehicles = async (type) => {
  const query = type && type.toLowerCase() !== 'all' ? `?type=${encodeURIComponent(type)}` : '';
  return await apiRequest(`/vehicles${query}`, { method: 'GET' });
};

/**
 * Fetch single vehicle by ID
 */
export const fetchVehicleById = async (id) => {
  return await apiRequest(`/vehicles/${id}`, { method: 'GET' });
};

/**
 * Toggle vehicle availability (Admin / Fleet Manager only)
 */
export const toggleVehicleAvailabilityApi = async (id) => {
  return await apiRequest(`/vehicles/${id}/availability`, { method: 'PATCH' });
};

/**
 * Add a new vehicle to fleet (Admin / Fleet Manager only)
 */
export const createVehicleApi = async (vehicleData) => {
  return await apiRequest('/vehicles', {
    method: 'POST',
    body: JSON.stringify(vehicleData)
  });
};

export default {
  fetchVehicles,
  fetchVehicleById,
  toggleVehicleAvailabilityApi,
  createVehicleApi
};
