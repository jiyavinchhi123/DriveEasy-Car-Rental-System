import React, { useState } from 'react';
import { createBookingApi } from '../services/bookingService';

/**
 * BookingForm Component
 * Controlled vehicle reservation form sending real POST /api/v1/bookings requests.
 * 
 * @param {object} selectedVehicle - Selected vehicle from fleet { _id, model, type, pricePerDay, available }
 * @param {string} pickupDate - Controlled pickup date state (YYYY-MM-DD)
 * @param {string} returnDate - Controlled return date state (YYYY-MM-DD)
 * @param {function} onPickupDateChange - Callback for updating pickup date
 * @param {function} onReturnDateChange - Callback for updating return date
 * @param {function} onBookingSuccess - Callback to refresh fleet after successful booking
 * @param {function} onCancel - Callback to clear selected vehicle
 */
const BookingForm = ({
  selectedVehicle,
  pickupDate,
  returnDate,
  onPickupDateChange,
  onReturnDateChange,
  onBookingSuccess,
  onCancel
}) => {
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Calculate rental duration in days
  const calculateDays = () => {
    if (!pickupDate || !returnDate) return 0;
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const days = calculateDays();
  const totalPrice = selectedVehicle ? days * Number(selectedVehicle.pricePerDay || 0) : 0;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    // 1. Validate vehicle selection
    if (!selectedVehicle) {
      setFormError('Please select a vehicle from the fleet below before submitting.');
      return;
    }

    // 2. Validate availability flag (client check, backend is final authority)
    if (!selectedVehicle.available) {
      setFormError(`'${selectedVehicle.model}' is currently unavailable for booking.`);
      return;
    }

    // 3. Validate required dates
    if (!pickupDate || !returnDate) {
      setFormError('Both pickup date and return date are required.');
      return;
    }

    const start = new Date(pickupDate);
    const end = new Date(returnDate);

    // 4. Validate returnDate > pickupDate
    if (end <= start) {
      setFormError('Return date must be strictly later than pickup date.');
      return;
    }

    setSubmitting(true);

    try {
      const vehicleId = selectedVehicle._id || selectedVehicle.id;

      // Submit POST /api/v1/bookings with JWT Bearer token
      const result = await createBookingApi({
        vehicleId,
        pickupDate,
        returnDate
      });

      if (!result.success) {
        setFormError(result.error || 'Failed to create booking. Please check dates or try another car.');
        setSubmitting(false);
        return;
      }

      setSuccessMessage(`Booking confirmed for ${selectedVehicle.model}! Reservation ID: #${result.data?._id || 'Success'}`);

      // Notify parent to refresh fleet availability from real API
      if (onBookingSuccess) {
        onBookingSuccess(result.data);
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        if (onCancel) onCancel();
        setSuccessMessage('');
      }, 2500);
    } catch (err) {
      setFormError('Network communication error with backend bookings service.');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="card booking-form-card" style={{ border: '2px solid var(--primary-light)', background: '#ffffff' }}>
      <div className="card-header">
        <div>
          <h3>Reserve Your Vehicle</h3>
          <p style={{ fontSize: '0.85rem' }}>Select dates to calculate instant price estimate and submit booking</p>
        </div>
        {selectedVehicle && (
          <span className={`badge ${selectedVehicle.available ? 'badge-primary' : 'badge-danger'}`}>
            {selectedVehicle.available ? 'Vehicle Selected' : 'Selected (Unavailable)'}
          </span>
        )}
      </div>

      {/* Error feedback */}
      {formError && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.88rem'
        }}>
          ⚠️ {formError}
        </div>
      )}

      {/* Success feedback */}
      {successMessage && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.88rem'
        }}>
          ✅ {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Selected Vehicle Display */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
            Selected Vehicle
          </label>
          {selectedVehicle ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--primary-light)',
              border: '1px solid #bfdbfe',
              padding: '0.75rem 1rem',
              borderRadius: '8px'
            }}>
              <div>
                <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>
                  {selectedVehicle.model}
                </strong>
                <span style={{ marginLeft: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  ({selectedVehicle.type})
                </span>
                {!selectedVehicle.available && (
                  <span className="badge badge-danger" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>
                    Unavailable
                  </span>
                )}
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                ₹{selectedVehicle.pricePerDay} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>/day</span>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'var(--bg-main)',
              border: '1px dashed var(--border-color)',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              fontSize: '0.9rem'
            }}>
              👉 No vehicle selected yet. Click <strong>"Book Now"</strong> on any available vehicle card below.
            </div>
          )}
        </div>

        {/* Date Inputs Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div>
            <label
              htmlFor="pickupDateInput"
              style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}
            >
              📅 Pickup Date
            </label>
            <input
              id="pickupDateInput"
              type="date"
              min={today}
              value={pickupDate}
              onChange={(e) => onPickupDateChange(e.target.value)}
              disabled={submitting}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div>
            <label
              htmlFor="returnDateInput"
              style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}
            >
              📅 Return Date
            </label>
            <input
              id="returnDateInput"
              type="date"
              min={pickupDate || today}
              value={returnDate}
              onChange={(e) => onReturnDateChange(e.target.value)}
              disabled={submitting}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        {/* Price & Duration Summary */}
        <div style={{
          background: 'var(--bg-main)',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Rental Duration:</span>
            <strong>{days > 0 ? `${days} day${days > 1 ? 's' : ''}` : '0 days (select valid dates)'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontWeight: 600 }}>Estimated Total:</span>
            <strong style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>
              ₹{totalPrice.toLocaleString()}
            </strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          {selectedVehicle && onCancel && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onCancel}
              disabled={submitting}
            >
              Clear Selection
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!selectedVehicle || !selectedVehicle.available || !pickupDate || !returnDate || submitting}
            id="btn-confirm-booking"
          >
            {submitting ? 'Submitting to Backend...' : 'Confirm Reservation ➔'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
