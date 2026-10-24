import React, { useState } from 'react';

/**
 * Initial mock data for fleet and booking administration
 */
const INITIAL_ADMIN_FLEET = [
  { id: 'V1', model: 'Maruti Suzuki Swift', type: 'Hatchback', pricePerDay: 1800, available: true, regNo: 'GJ-06-AB-1234' },
  { id: 'V2', model: 'Honda City ZX', type: 'Sedan', pricePerDay: 2800, available: true, regNo: 'GJ-23-CD-5678' },
  { id: 'V3', model: 'Hyundai Verna SX', type: 'Sedan', pricePerDay: 2700, available: false, regNo: 'GJ-01-EF-9012' },
  { id: 'V4', model: 'Mahindra Scorpio-N', type: 'SUV', pricePerDay: 3500, available: true, regNo: 'GJ-05-GH-3456' },
  { id: 'V5', model: 'Tata Harrier XZA', type: 'SUV', pricePerDay: 3800, available: true, regNo: 'GJ-06-IJ-7890' }
];

const INITIAL_ADMIN_BOOKINGS = [
  { id: 'BK-1001', customer: 'Rahul Sharma', email: 'rahul@example.com', car: 'Honda City ZX', dates: '2026-11-01 to 2026-11-04', amount: 8400, status: 'Confirmed' },
  { id: 'BK-1002', customer: 'Priya Patel', email: 'priya@example.com', car: 'Mahindra Scorpio-N', dates: '2026-11-10 to 2026-11-12', amount: 7000, status: 'Pending' },
  { id: 'BK-1003', customer: 'Amit Verma', email: 'amit@example.com', car: 'Hyundai Verna SX', dates: '2026-11-05 to 2026-11-08', amount: 8100, status: 'Pending' },
  { id: 'BK-0994', customer: 'Kavita Joshi', email: 'kavita@example.com', car: 'Maruti Suzuki Swift', dates: '2026-10-15 to 2026-10-17', amount: 3600, status: 'Completed' }
];

/**
 * AdminPanel Component
 * Management dashboard for administrators and fleet operations.
 * Includes sections for Vehicles, Bookings, and Booking-Status Management.
 */
const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'vehicles' | 'status'
  const [fleet, setFleet] = useState(INITIAL_ADMIN_FLEET);
  const [bookings, setBookings] = useState(INITIAL_ADMIN_BOOKINGS);
  const [toastMessage, setToastMessage] = useState('');

  // Show temporary action feedback
  const showFeedback = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Toggle vehicle availability
  const toggleVehicleAvailability = (vehicleId) => {
    setFleet((prev) =>
      prev.map((v) =>
        v.id === vehicleId ? { ...v, available: !v.available } : v
      )
    );
    showFeedback('Vehicle availability updated successfully!');
  };

  // Update booking status
  const updateBookingStatus = (bookingId, newStatus) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      )
    );
    showFeedback(`Booking #${bookingId} status changed to ${newStatus}`);
  };

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
          <h2>Administrator & Fleet Manager Panel</h2>
          <p style={{ marginTop: '0.25rem' }}>
            DriveEasy Car Rental Management • CSPIT Examination Console
          </p>
        </div>
        <span className="badge badge-primary" style={{ padding: '0.4rem 0.8rem' }}>
          🛡️ Admin Privileges Active
        </span>
      </div>

      {/* Toast Feedback Notification */}
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

      {/* KPI Overview Metrics */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Fleet</span>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
            {fleet.length}
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--success)' }}>
            ● {fleet.filter((v) => v.available).length} Available for rent
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Bookings</span>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
            {bookings.length}
          </h3>
          <span style={{ fontSize: '0.78rem', color: '#b45309' }}>
            ● {bookings.filter((b) => b.status === 'Pending').length} Pending approval
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Confirmed Bookings</span>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--success)', marginTop: '0.25rem' }}>
            {bookings.filter((b) => b.status === 'Confirmed').length}
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Active reservations
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Revenue</span>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
            ₹{bookings.reduce((sum, b) => sum + (b.amount || 0), 0).toLocaleString()}
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Across all bookings
          </span>
        </div>
      </div>

      {/* Section Navigation Tabs */}
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
          📋 Bookings Management
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'vehicles' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('vehicles')}
        >
          🚗 Vehicle Fleet Inventory
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
              <h3>All Customer Bookings</h3>
              <p style={{ fontSize: '0.85rem' }}>Review reservations and track customer information</p>
            </div>
            <span className="badge badge-primary">{bookings.length} Records</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Booking ID</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Vehicle</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Dates</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Amount</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600 }}>{b.id}</td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <strong>{b.customer}</strong>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {b.email}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>{b.car}</td>
                    <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem' }}>{b.dates}</td>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                      ₹{b.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <span className={`badge ${
                        b.status === 'Confirmed' ? 'badge-success' :
                        b.status === 'Pending' ? 'badge-warning' :
                        b.status === 'Completed' ? 'badge-primary' : 'badge-danger'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: VEHICLES INVENTORY */}
      {activeTab === 'vehicles' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Fleet Vehicles Inventory</h3>
              <p style={{ fontSize: '0.85rem' }}>Monitor vehicle status, rates, and fleet availability</p>
            </div>
            <span className="badge badge-primary">{fleet.length} Vehicles</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Code</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Model</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Registration</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Rate/Day</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Availability</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Toggle</th>
                </tr>
              </thead>
              <tbody>
                {fleet.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600 }}>{v.id}</td>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600 }}>{v.model}</td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <span className="badge badge-primary">{v.type}</span>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {v.regNo}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>
                      ₹{v.pricePerDay}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      {v.available ? (
                        <span className="badge badge-success">Available</span>
                      ) : (
                        <span className="badge badge-danger">Reserved</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => toggleVehicleAvailability(v.id)}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        {v.available ? 'Mark Reserved' : 'Mark Available'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: BOOKING-STATUS MANAGEMENT */}
      {activeTab === 'status' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Booking Status Management Console</h3>
              <p style={{ fontSize: '0.85rem' }}>Approve, complete, or reject pending rental requests</p>
            </div>
            <span className="badge badge-warning">Action Center</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookings.map((b) => (
              <div
                key={b.id}
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
                    <strong>#{b.id} — {b.customer}</strong>
                    <span className={`badge ${
                      b.status === 'Confirmed' ? 'badge-success' :
                      b.status === 'Pending' ? 'badge-warning' :
                      b.status === 'Completed' ? 'badge-primary' : 'badge-danger'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Vehicle: {b.car} • Dates: {b.dates} • Total: ₹{b.amount.toLocaleString()}
                  </div>
                </div>

                {/* Status action buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {b.status === 'Pending' && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => updateBookingStatus(b.id, 'Confirmed')}
                      style={{ fontSize: '0.78rem' }}
                    >
                      ✓ Approve Booking
                    </button>
                  )}
                  {b.status === 'Confirmed' && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => updateBookingStatus(b.id, 'Completed')}
                      style={{ fontSize: '0.78rem', borderColor: 'var(--success)', color: 'var(--success)' }}
                    >
                      ✓ Mark Completed
                    </button>
                  )}
                  {b.status !== 'Cancelled' && b.status !== 'Completed' && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => updateBookingStatus(b.id, 'Cancelled')}
                      style={{ fontSize: '0.78rem', borderColor: '#fca5a5', color: '#b91c1c' }}
                    >
                      ✕ Reject / Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
