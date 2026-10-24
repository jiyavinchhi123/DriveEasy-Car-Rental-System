import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchVehicles, toggleVehicleAvailabilityApi } from '../services/vehicleService';
import { fetchAllBookingsApi, updateBookingStatusApi } from '../services/bookingService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

/**
 * AdminPanel Component (Lazy Loaded via React.lazy)
 * Connects directly to backend API for fleet inventory, customer reservations,
 * and booking status decisions.
 */
const AdminPanel = () => {
  const { customer, role } = useAuth();

  const [fleet, setFleet] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'vehicles' | 'status'
  const [toastMessage, setToastMessage] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const showFeedback = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  /**
   * Load real data from MongoDB backend via authorized API endpoints
   */
  const loadAdminData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [bookingsRes, fleetRes] = await Promise.all([
        fetchAllBookingsApi(),
        fetchVehicles()
      ]);

      if (!bookingsRes.success && bookingsRes.status === 403) {
        setError('Forbidden: Your account does not possess sufficient administrative privileges.');
        setLoading(false);
        return;
      }

      setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
      setFleet(Array.isArray(fleetRes.data) ? fleetRes.data : []);
    } catch (err) {
      setError('Failed to communicate with administration API services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  /**
   * Toggle vehicle availability in MongoDB via PATCH /api/v1/vehicles/:id/availability
   */
  const handleToggleAvailability = async (vehicleId) => {
    setUpdatingId(vehicleId);
    try {
      const res = await toggleVehicleAvailabilityApi(vehicleId);
      if (res.success) {
        showFeedback(res.message || 'Vehicle availability updated in database.');
        // Refresh fleet
        const refreshedFleet = await fetchVehicles();
        if (refreshedFleet.success) {
          setFleet(refreshedFleet.data);
        }
      } else {
        alert(res.error || 'Failed to update vehicle availability.');
      }
    } catch (err) {
      alert('Error updating vehicle availability.');
    } finally {
      setUpdatingId(null);
    }
  };

  /**
   * Update booking status in MongoDB via PATCH /api/v1/bookings/:id/status
   */
  const handleUpdateStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      const res = await updateBookingStatusApi(bookingId, newStatus);
      if (res.success) {
        showFeedback(`Booking status successfully changed to '${newStatus}'.`);
        // Refresh bookings and fleet in parallel
        loadAdminData();
      } else {
        alert(res.error || 'Failed to update booking status.');
      }
    } catch (err) {
      alert('Error updating booking status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const isAdmin = role === 'admin';
  const isManager = role === 'fleetManager' || role === 'fleet_manager';

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return <Loading message="Loading Administrator and Fleet Console data from database..." />;
  }

  return (
    <div className="admin-panel-page">
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h2>{isAdmin ? 'System Administrator Console' : 'Fleet Operations Console'}</h2>
          <p style={{ marginTop: '0.25rem' }}>
            Logged in as <strong>{customer?.name}</strong> •{' '}
            <span style={{ color: 'var(--text-muted)' }}>
              {isAdmin ? 'Full Administrative & Fleet Management Clearance' : 'Fleet Operations & Booking Approval Clearance'}
            </span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={loadAdminData}
            title="Refresh database records"
          >
            🔄 Refresh Data
          </button>
          <span className={`badge ${isAdmin ? 'badge-danger' : 'badge-warning'}`} style={{ padding: '0.4rem 0.8rem' }}>
            {isAdmin ? '🛡️ Administrator' : '🚙 Fleet Manager'}
          </span>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          ✅ {toastMessage}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <ErrorMessage message={error} onRetry={loadAdminData} />
      )}

      {/* Dynamic KPI Overview Cards Calculated from Real MongoDB Data */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Fleet (MongoDB)</span>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
            {fleet.length}
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--success)' }}>
            ● {fleet.filter((v) => v.available).length} Available for rent
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Reservations</span>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
            {bookings.length}
          </h3>
          <span style={{ fontSize: '0.78rem', color: '#b45309' }}>
            ● {bookings.filter((b) => b.status === 'reserved').length} Active reserved
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ongoing Rentals</span>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--warning)', marginTop: '0.25rem' }}>
            {bookings.filter((b) => b.status === 'ongoing').length}
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Vehicles out on road
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Booked Revenue</span>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
            ₹{bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0).toLocaleString()}
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Across all customer bookings
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.5rem'
      }}>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'bookings' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('bookings')}
        >
          📋 Customer Bookings ({bookings.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'vehicles' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('vehicles')}
        >
          🚗 Fleet Inventory ({fleet.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'status' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('status')}
        >
          ⚡ Status Decision Console
        </button>
      </div>

      {/* SECTION 1: BOOKINGS MANAGEMENT */}
      {activeTab === 'bookings' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Customer Bookings in Database</h3>
              <p style={{ fontSize: '0.85rem' }}>Populated with customer and vehicle details from MongoDB</p>
            </div>
            <span className="badge badge-primary">{bookings.length} Records</span>
          </div>

          {bookings.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No customer bookings found in MongoDB.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>ID</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Customer</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Vehicle</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Dates</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Amount</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {b._id.slice(-6)}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <strong>{b.customerId?.name || 'Customer'}</strong>
                        <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {b.customerId?.email}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        {b.vehicleId?.model || 'Vehicle'} ({b.vehicleId?.type})
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem' }}>
                        {formatDate(b.pickupDate)} to {formatDate(b.returnDate)}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                        ₹{b.totalPrice?.toLocaleString() || '0'}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <span className={`badge ${
                          b.status === 'completed' ? 'badge-success' :
                          b.status === 'ongoing' ? 'badge-warning' :
                          b.status === 'cancelled' ? 'badge-danger' : 'badge-primary'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: FLEET INVENTORY */}
      {activeTab === 'vehicles' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Fleet Inventory Management</h3>
              <p style={{ fontSize: '0.85rem' }}>Toggle vehicle availability flags directly in MongoDB</p>
            </div>
            <span className="badge badge-primary">{fleet.length} Vehicles</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Model</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Registration</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Rate/Day</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Availability</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {fleet.map((v) => (
                  <tr key={v._id || v.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600 }}>{v.model}</td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <span className="badge badge-primary">{v.type}</span>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {v.registrationNumber || 'GJ-06-REG'}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>
                      ₹{v.pricePerDay}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      {v.available ? (
                        <span className="badge badge-success">Available</span>
                      ) : (
                        <span className="badge badge-danger">Unavailable</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        disabled={updatingId === v._id}
                        onClick={() => handleToggleAvailability(v._id)}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        {v.available ? 'Mark Unavailable' : 'Mark Available'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: STATUS DECISION CONSOLE */}
      {activeTab === 'status' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Booking Status Decision Console</h3>
              <p style={{ fontSize: '0.85rem' }}>
                Approve, advance to ongoing, complete, or cancel bookings in MongoDB
              </p>
            </div>
            <span className="badge badge-warning">Live MongoDB Action Center</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookings.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No bookings to manage.</p>
            ) : (
              bookings.map((b) => (
                <div
                  key={b._id}
                  style={{
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <strong>#{b._id.slice(-6)} — {b.customerId?.name || 'Customer'}</strong>
                      <span className={`badge ${
                        b.status === 'completed' ? 'badge-success' :
                        b.status === 'ongoing' ? 'badge-warning' :
                        b.status === 'cancelled' ? 'badge-danger' : 'badge-primary'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Vehicle: <strong>{b.vehicleId?.model}</strong> ({b.vehicleId?.type}) •{' '}
                      Dates: {formatDate(b.pickupDate)} to {formatDate(b.returnDate)} • Total: ₹{b.totalPrice?.toLocaleString()}
                    </div>
                  </div>

                  {/* Real Status Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {b.status === 'reserved' && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={updatingId === b._id}
                        onClick={() => handleUpdateStatus(b._id, 'ongoing')}
                        style={{ fontSize: '0.78rem' }}
                      >
                        🚗 Dispatch (Ongoing)
                      </button>
                    )}
                    {b.status === 'ongoing' && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        disabled={updatingId === b._id}
                        onClick={() => handleUpdateStatus(b._id, 'completed')}
                        style={{ fontSize: '0.78rem', borderColor: 'var(--success)', color: 'var(--success)' }}
                      >
                        ✓ Mark Completed
                      </button>
                    )}
                    {b.status !== 'cancelled' && b.status !== 'completed' && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        disabled={updatingId === b._id}
                        onClick={() => handleUpdateStatus(b._id, 'cancelled')}
                        style={{ fontSize: '0.78rem', borderColor: '#fca5a5', color: '#b91c1c' }}
                      >
                        ✕ Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
