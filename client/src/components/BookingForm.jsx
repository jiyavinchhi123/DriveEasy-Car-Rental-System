import React, { useState } from 'react';

/**
 * BookingForm Component
 * Reusable booking reservation form handling vehicle selection, pickup/return dates,
 * dynamic duration calculation, and validation.
 * 
 * @param {object} selectedVehicle - Selected vehicle data { model, type, pricePerDay }
 * @param {string} pickupDate - Current pickup date state (YYYY-MM-DD)
 * @param {string} returnDate - Current return date state (YYYY-MM-DD)
 * @param {function} onPickupDateChange - Callback for updating pickup date
 * @param {function} onReturnDateChange - Callback for updating return date
 * @param {function} onSubmit - Callback when booking reservation is confirmed
 * @param {function} onCancel - Optional callback to cancel selection
 */
const BookingForm = ({
  selectedVehicle,
  pickupDate,
  returnDate,
  onPickupDateChange,
  onReturnDateChange,
  onSubmit,
  onCancel
}) => {
  const [formError, setFormError] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

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

  // Handle form submission with date validation
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    setSubmittedSuccess(false);

    if (!selectedVehicle) {
      setFormError('Please select a vehicle from the fleet first.');
      return;
    }

    if (!pickupDate || !returnDate) {
      setFormError('Both pickup date and return date are required.');
      return;
    }

    const start = new Date(pickupDate);
    const end = new Date(returnDate);

    if (end <= start) {
      setFormError('Return date must be at least one day after the pickup date.');
      return;
    }

    const bookingPayload = {
      vehicle: selectedVehicle,
      pickupDate,
      returnDate,
      days,
      totalPrice,
      status: 'Confirmed'
    };

    if (onSubmit) {
      onSubmit(bookingPayload);
    }

    setSubmittedSuccess(true);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="card booking-form-card" style={{ border: '2px solid var(--primary-light)', background: '#ffffff' }}>
      <div className="card-header">
        <div>
          <h3>Reserve Your Vehicle</h3>
          <p style={{ fontSize: '0.85rem' }}>Select dates to calculate instant price estimate</p>
        </div>
        {selectedVehicle && (
          <span className="badge badge-primary">
            Vehicle Selected
          </span>
        )}
      </div>

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

      {submittedSuccess && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.88rem'
        }}>
          ✅ Reservation request captured! Booking will be processed in Stage 4.
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

        {/* Real-time State & Price Summary */}
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

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          {selectedVehicle && onCancel && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onCancel}
            >
              Clear Selection
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!selectedVehicle || !pickupDate || !returnDate}
            id="btn-confirm-booking"
          >
            Confirm Reservation
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
