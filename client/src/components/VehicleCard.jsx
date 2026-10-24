import React from 'react';

/**
 * VehicleCard Component
 * Reusable card displaying vehicle details with availability status and booking action
 * 
 * @param {string} model - Vehicle model name (e.g. "Toyota Corolla")
 * @param {string} type - Vehicle category ("Hatchback", "Sedan", "SUV")
 * @param {number|string} pricePerDay - Daily rental cost (e.g. 45 or "45")
 * @param {boolean} available - Vehicle rental availability flag
 * @param {function} onBook - Optional callback invoked when "Book Now" is clicked
 */
const VehicleCard = ({
  model,
  type,
  pricePerDay,
  available,
  onBook
}) => {
  const handleBookClick = () => {
    if (onBook && typeof onBook === 'function') {
      onBook({ model, type, pricePerDay, available });
    }
  };

  // Helper icon by vehicle type
  const getTypeIcon = (vType) => {
    switch (vType?.toLowerCase()) {
      case 'suv':
        return '🚙';
      case 'sedan':
        return '🚗';
      case 'hatchback':
        return '🚘';
      default:
        return '🏎️';
    }
  };

  return (
    <div
      className="card vehicle-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Vehicle Header / Category & Status */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.85rem'
        }}>
          <span className="badge badge-primary">
            {getTypeIcon(type)} {type}
          </span>
          {available ? (
            <span className="badge badge-success">
              <span className="pulse-dot online" style={{ width: 6, height: 6 }} /> Available
            </span>
          ) : (
            <span className="badge badge-danger">
              <span className="pulse-dot offline" style={{ width: 6, height: 6 }} /> Not Available
            </span>
          )}
        </div>

        {/* Vehicle Model */}
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          {model}
        </h3>

        {/* Specifications List */}
        <div style={{
          background: 'var(--bg-main)',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          margin: '0.75rem 0 1.25rem',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Category:</span>
            <span style={{ fontWeight: 600 }}>{type}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Status:</span>
            <span style={{ fontWeight: 600, color: available ? 'var(--success)' : 'var(--danger)' }}>
              {available ? 'Ready for Dispatch' : 'Currently Reserved'}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing & Booking Action */}
      <div style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '1rem',
        marginTop: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
            Daily Rate
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
            ₹{pricePerDay}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / day</span>
        </div>

        {/* Conditional Button / Badge based on availability prop */}
        {available ? (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleBookClick}
            aria-label={`Book ${model}`}
          >
            Book Now ➔
          </button>
        ) : (
          <span
            className="badge badge-danger"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
          >
            Not Available
          </span>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
