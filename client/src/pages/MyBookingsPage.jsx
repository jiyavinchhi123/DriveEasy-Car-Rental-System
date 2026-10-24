import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { fetchMyBookingsApi, updateBookingStatusApi } from '../services/bookingService';

/**
 * MyBookingsPage Component
 * Fetches real customer bookings from GET /api/v1/bookings/my using authenticated token.
 * Renders populated vehicle details, date formatting, and handles loading/error/empty states.
 */
const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  /**
   * Fetch customer bookings from backend API
   */
  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    setActionMessage('');

    try {
      const result = await fetchMyBookingsApi();

      if (!result.success) {
        setError(result.error || 'Failed to fetch your bookings from the server.');
        setBookings([]);
      } else {
        const bookingsList = Array.isArray(result.data) ? result.data : [];
        setBookings(bookingsList);
      }
    } catch (err) {
      setError('Unable to communicate with the bookings service.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // Format date string to readable locale date (e.g. "Nov 1, 2026")
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Status badge styling
  const renderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'reserved':
        return <span className="badge badge-primary">● Reserved</span>;
      case 'ongoing':
        return <span className="badge badge-warning">● Ongoing Trip</span>;
      case 'completed':
        return <span className="badge badge-success">● Completed</span>;
      case 'cancelled':
        return <span className="badge badge-danger">● Cancelled</span>;
      default:
        return <span className="badge badge-outline">{status}</span>;
    }
  };

  // Cancel customer's reservation via PATCH /api/v1/bookings/:id/status
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this vehicle reservation?')) {
      return;
    }

    try {
      const res = await updateBookingStatusApi(bookingId, 'cancelled');
      if (res.success) {
        setActionMessage('Booking was successfully cancelled and the vehicle has been released.');
        loadBookings();
      } else {
        alert(res.error || 'Could not cancel booking.');
      }
    } catch (err) {
      alert('An error occurred while communicating with the server.');
    }
  };

  return (
    <div className="my-bookings-page">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h2>My Reservations</h2>
          <p style={{ marginTop: '0.25rem' }}>
            Track and manage your vehicle rentals (Live MongoDB Records)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={loadBookings}
            disabled={loading}
          >
            🔄 Refresh Bookings
          </button>
          <Link to="/fleet" className="btn btn-primary btn-sm">
            + New Booking
          </Link>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionMessage && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          ✅ {actionMessage}
        </div>
      )}

      {/* Error state */}
      {error && (
        <ErrorMessage message={error} onRetry={loadBookings} />
      )}

      {/* Loading state */}
      {loading ? (
        <Loading message="Loading your bookings from database..." />
      ) : bookings.length === 0 ? (
        /* Empty state */
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚗</div>
          <h3>No Bookings Found</h3>
          <p style={{ maxWidth: '480px', margin: '0.5rem auto 1.5rem', color: 'var(--text-muted)' }}>
            You haven't reserved any vehicles yet. Explore our available fleet to make your first reservation.
          </p>
          <Link to="/fleet" className="btn btn-primary">
            Browse Available Fleet ➔
          </Link>
        </div>
      ) : (
        /* Real Bookings List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {bookings.map((booking) => (
            <div
              key={booking._id || booking.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                borderLeft: booking.status === 'cancelled'
                  ? '4px solid var(--danger)'
                  : booking.status === 'completed'
                  ? '4px solid var(--success)'
                  : '4px solid var(--primary)'
              }}
            >
              {/* Top row: Reservation ID & Status */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reservation ID:</span>{' '}
                  <strong style={{ fontSize: '0.92rem', fontFamily: 'monospace' }}>
                    #{booking._id}
                  </strong>
                </div>
                <div>{renderStatusBadge(booking.status)}</div>
              </div>

              {/* Middle row: Populated vehicle & date details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem',
                alignItems: 'center'
              }}>
                {/* Populated Vehicle Details */}
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                    Reserved Vehicle
                  </span>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>
                    {booking.vehicleId?.model || 'DriveEasy Vehicle'}
                  </strong>
                  <span style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Category: {booking.vehicleId?.type || 'Standard'}
                  </span>
                </div>

                {/* Pickup Date */}
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                    📅 Pickup Date
                  </span>
                  <strong style={{ fontSize: '0.95rem' }}>
                    {formatDate(booking.pickupDate)}
                  </strong>
                </div>

                {/* Return Date */}
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                    📅 Return Date
                  </span>
                  <strong style={{ fontSize: '0.95rem' }}>
                    {formatDate(booking.returnDate)}
                  </strong>
                </div>

                {/* Total Cost */}
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                    Total Rental Cost
                  </span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                    ₹{booking.totalPrice?.toLocaleString() || '0'}
                  </strong>
                </div>
              </div>

              {/* Bottom row: Cancellation Action */}
              {booking.status === 'reserved' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleCancelBooking(booking._id)}
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: '#fca5a5', color: '#b91c1c' }}
                  >
                    Cancel Reservation
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
