import React from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

/**
 * ProtectedRoute Component
 * Guards routes against unauthenticated access and enforces role-based authorization.
 * 
 * @param {Array<string>} allowedRoles - Optional array of authorized roles, e.g. ['admin', 'fleet_manager']
 * @param {React.ReactNode} children - Optional direct child component
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { customer, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading indicator while session state is being restored from localStorage
  if (loading) {
    return <Loading message="Verifying authentication session..." />;
  }

  // 1. Unauthenticated users are redirected directly to "/" (LoginPage)
  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // 2. Role-Based Access Control (RBAC) Guard
  if (allowedRoles && allowedRoles.length > 0) {
    const currentRole = customer?.role || 'customer';
    const isAuthorized = allowedRoles.includes(currentRole);

    if (!isAuthorized) {
      return (
        <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
          <div className="card" style={{ borderTop: '4px solid var(--danger)', padding: '2.5rem 1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🚫</div>
            <h2 style={{ color: 'var(--danger)', marginBottom: '0.75rem' }}>Access Denied</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
              Your account does not possess the required administrative clearance to access this area.
            </p>

            <div style={{
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '1rem',
              fontSize: '0.88rem',
              textAlign: 'left',
              marginBottom: '1.5rem'
            }}>
              <div style={{ marginBottom: '0.35rem' }}>
                <strong>Signed In As:</strong> {customer?.name} (<code>{customer?.email}</code>)
              </div>
              <div style={{ marginBottom: '0.35rem' }}>
                <strong>Your Current Role:</strong> <span className="badge badge-warning">{currentRole}</span>
              </div>
              <div>
                <strong>Allowed Clearance:</strong>{' '}
                {allowedRoles.map((r) => (
                  <span key={r} className="badge badge-primary" style={{ marginRight: '0.35rem' }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Link to="/fleet" className="btn btn-primary btn-sm">
                ⬅ Return to Fleet
              </Link>
              <Link to="/my-bookings" className="btn btn-outline btn-sm">
                View My Bookings
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  // Render nested route via Outlet or direct children
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
