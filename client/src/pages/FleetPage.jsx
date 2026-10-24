import React, { useState, useEffect } from 'react';
import VehicleCard from '../components/VehicleCard';
import BookingForm from '../components/BookingForm';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { fetchVehicles } from '../services/vehicleService';

/**
 * FleetPage Component
 * Fetches real vehicle fleet from backend GET /api/v1/vehicles on mount.
 * Implements client-side filtering (.filter()) without re-fetching,
 * and refreshes fleet state when a reservation is confirmed.
 */
const FleetPage = () => {
  // Required states
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Client-side filter state: 'All', 'Hatchback', 'Sedan', 'SUV'
  const [activeFilter, setActiveFilter] = useState('All');

  // Controlled booking form state
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  /**
   * Fetch vehicles from real Express/MongoDB API: GET /api/v1/vehicles
   */
  const loadFleet = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchVehicles();

      if (!result.success) {
        setError(result.error || 'Failed to retrieve vehicles from the backend server.');
        setVehicles([]);
      } else {
        const fleetData = Array.isArray(result.data) ? result.data : [];
        setVehicles(fleetData);
      }
    } catch (err) {
      setError('Unable to reach the backend vehicle API. Ensure server is running on port 5000.');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    loadFleet();
  }, []);

  // Handle vehicle selection when user clicks "Book Now" on a VehicleCard
  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Callback when a booking is created successfully -> refresh fleet availability from API
  const handleBookingSuccess = () => {
    loadFleet();
    setSelectedVehicle(null);
    setPickupDate('');
    setReturnDate('');
  };

  // Client-side filtering with .filter() without triggering additional API calls
  const filterCategories = ['All', 'Hatchback', 'Sedan', 'SUV'];
  const filteredVehicles = activeFilter === 'All'
    ? vehicles
    : vehicles.filter((v) => v.type && v.type.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="fleet-page">
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2>Available Vehicle Fleet</h2>
        <p style={{ maxWidth: '650px', margin: '0.4rem auto 0' }}>
          Select a vehicle from our real-time inventory to reserve your rental.
        </p>
      </div>

      {/* Booking Form Component */}
      <div style={{ marginBottom: '3rem' }}>
        <BookingForm
          selectedVehicle={selectedVehicle}
          pickupDate={pickupDate}
          returnDate={returnDate}
          onPickupDateChange={setPickupDate}
          onReturnDateChange={setReturnDate}
          onBookingSuccess={handleBookingSuccess}
          onCancel={() => setSelectedVehicle(null)}
        />
      </div>

      {/* Live State Inspector Banner */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '1rem 1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem' }}>📌</span>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Selection:
          </span>
          <strong style={{ fontSize: '0.9rem', color: selectedVehicle ? 'var(--primary)' : 'var(--text-muted)' }}>
            {selectedVehicle ? `${selectedVehicle.model} (${selectedVehicle.type} • ₹${selectedVehicle.pricePerDay}/day)` : 'No Vehicle Selected'}
          </strong>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem' }}>
          <span>Pickup: <strong>{pickupDate || 'Not Chosen'}</strong></span>
          <span>Return: <strong>{returnDate || 'Not Chosen'}</strong></span>
        </div>
      </div>

      {/* Client-Side Category Filter Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {filterCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn btn-sm ${activeFilter === cat ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Filter: <strong>{activeFilter}</strong> ({filteredVehicles.length} of {vehicles.length} vehicles)
          </span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={loadFleet}
            title="Refresh fleet from database"
          >
            🔄 Refresh Fleet
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <ErrorMessage message={error} onRetry={loadFleet} />
      )}

      {/* Loading State */}
      {loading ? (
        <Loading message="Loading fleet vehicles from database..." />
      ) : filteredVehicles.length === 0 ? (
        /* Empty State */
        <div style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px dashed var(--border-color)',
          marginTop: '1rem'
        }}>
          <h3>No Vehicles Available</h3>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
            {vehicles.length === 0
              ? 'No vehicles currently exist in the database. Please run npm run seed in the server.'
              : `No vehicles found in the '${activeFilter}' category. Try switching filters.`}
          </p>
          {activeFilter !== 'All' && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setActiveFilter('All')}
              style={{ marginTop: '1rem' }}
            >
              Reset to All Vehicles
            </button>
          )}
        </div>
      ) : (
        /* Responsive Grid of VehicleCard Components from real API response */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle._id || vehicle.id}
              model={vehicle.model}
              type={vehicle.type}
              pricePerDay={vehicle.pricePerDay}
              available={vehicle.available}
              onBook={() => handleSelectVehicle(vehicle)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FleetPage;
