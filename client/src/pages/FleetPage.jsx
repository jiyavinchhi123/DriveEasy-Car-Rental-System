import React, { useState, useEffect } from 'react';
import VehicleCard from '../components/VehicleCard';
import BookingForm from '../components/BookingForm';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { apiRequest } from '../services/api';

/**
 * Initial dataset preparing the fleet for live API data in Stage 3
 */
const INITIAL_FLEET = [
  { id: '1', model: 'Maruti Suzuki Swift', type: 'Hatchback', pricePerDay: 1800, available: true },
  { id: '2', model: 'Hyundai i20 Asta', type: 'Hatchback', pricePerDay: 2000, available: true },
  { id: '3', model: 'Honda City ZX', type: 'Sedan', pricePerDay: 2800, available: true },
  { id: '4', model: 'Hyundai Verna SX', type: 'Sedan', pricePerDay: 2700, available: false },
  { id: '5', model: 'Mahindra Scorpio-N', type: 'SUV', pricePerDay: 3500, available: true },
  { id: '6', model: 'Tata Harrier XZA', type: 'SUV', pricePerDay: 3800, available: true },
  { id: '7', model: 'Toyota Fortuner 4x4', type: 'SUV', pricePerDay: 5200, available: false },
  { id: '8', model: 'Tata Tiago EV', type: 'Hatchback', pricePerDay: 2200, available: true }
];

/**
 * FleetPage Component
 * Manages vehicle fleet filtering, selection state, date management,
 * and passes props seamlessly to VehicleCard and BookingForm.
 */
const FleetPage = () => {
  // Vehicle data & API state
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state: 'All', 'Hatchback', 'Sedan', 'SUV'
  const [activeFilter, setActiveFilter] = useState('All');

  // Booking Form state
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [lastConfirmedBooking, setLastConfirmedBooking] = useState(null);

  /**
   * Fetch vehicles from backend API or gracefully fall back to initialized fleet
   * Prepares the component for live API integration without breaking Stage 2 testing
   */
  const loadFleet = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest('/cars');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setVehicles(res.data);
      } else {
        // Use initialized vehicle dataset when /cars endpoint is pending in Stage 3
        setVehicles(INITIAL_FLEET);
      }
    } catch (err) {
      // Graceful fallback to initial fleet for frontend-only verification
      setVehicles(INITIAL_FLEET);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFleet();
  }, []);

  // Handle vehicle selection when "Book Now" is clicked on a VehicleCard
  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    // Smooth scroll up to the booking form
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Handle confirmed booking from BookingForm
  const handleBookingSubmit = (bookingData) => {
    setLastConfirmedBooking(bookingData);
    // Optionally save to local storage for My Bookings preview
    try {
      const existing = JSON.parse(localStorage.getItem('driveeasy_bookings') || '[]');
      existing.unshift({
        id: `BK-${Date.now()}`,
        ...bookingData
      });
      localStorage.setItem('driveeasy_bookings', JSON.stringify(existing));
    } catch (e) {
      console.warn('Could not store booking locally:', e);
    }
  };

  // Filter fleet based on selected vehicle-type tab
  const filterCategories = ['All', 'Hatchback', 'Sedan', 'SUV'];
  const filteredVehicles = activeFilter === 'All'
    ? vehicles
    : vehicles.filter((v) => v.type.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="fleet-page">
      {/* Header section */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2>Explore Our Fleet</h2>
        <p style={{ maxWidth: '600px', margin: '0.4rem auto 0' }}>
          Choose from our selection of premium hatchbacks, sedans, and SUVs. Select your vehicle to reserve instantly.
        </p>
      </div>

      {/* Booking Form with live state inspection */}
      <div style={{ marginBottom: '3rem' }}>
        <BookingForm
          selectedVehicle={selectedVehicle}
          pickupDate={pickupDate}
          returnDate={returnDate}
          onPickupDateChange={setPickupDate}
          onReturnDateChange={setReturnDate}
          onSubmit={handleBookingSubmit}
          onCancel={() => setSelectedVehicle(null)}
        />
      </div>

      {/* Live State Inspector Banner (Viva Friendly) */}
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
            Active State:
          </span>
          <strong style={{ fontSize: '0.9rem', color: selectedVehicle ? 'var(--primary)' : 'var(--text-muted)' }}>
            {selectedVehicle ? `Selected: ${selectedVehicle.model} (₹${selectedVehicle.pricePerDay}/day)` : 'No Vehicle Selected'}
          </strong>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem' }}>
          <span>
            Pickup: <strong>{pickupDate || 'Not Chosen'}</strong>
          </span>
          <span>
            Return: <strong>{returnDate || 'Not Chosen'}</strong>
          </span>
        </div>
      </div>

      {/* Vehicle-Type Filter Tabs: All, Hatchback, Sedan, SUV */}
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

        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredVehicles.length}</strong> vehicle{filteredVehicles.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Error state */}
      {error && (
        <ErrorMessage message={error} onRetry={loadFleet} />
      )}

      {/* Loading state */}
      {loading ? (
        <Loading message="Loading fleet vehicles from database..." />
      ) : filteredVehicles.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px dashed var(--border-color)'
        }}>
          <h3>No vehicles found in this category</h3>
          <p style={{ marginTop: '0.5rem' }}>Try choosing another vehicle type or reset filters.</p>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setActiveFilter('All')}
            style={{ marginTop: '1rem' }}
          >
            Show All Vehicles
          </button>
        </div>
      ) : (
        /* Responsive Grid of Reusable VehicleCard Components */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id || vehicle._id || vehicle.model}
              model={vehicle.model}
              type={vehicle.type}
              pricePerDay={vehicle.pricePerDay}
              available={vehicle.available}
              onBook={() => handleVehicleSelect(vehicle)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FleetPage;
