import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar Component
 * Role-aware SPA navigation header.
 * Conditionally renders navigation links according to customer authentication state and role.
 */
const Navbar = () => {
  const navigate = useNavigate();
  const { customer, isAuthenticated, role, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Helper for role badge styling
  const renderRoleBadge = () => {
    if (!customer) return null;
    switch (role) {
      case 'admin':
        return <span className="badge badge-danger">🛡️ Admin</span>;
      case 'fleet_manager':
        return <span className="badge badge-warning">🚙 Fleet Manager</span>;
      default:
        return <span className="badge badge-primary">👤 Customer</span>;
    }
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to={isAuthenticated ? "/fleet" : "/"} className="brand-logo" id="nav-brand-logo">
          <div className="brand-icon">
            🚗
          </div>
          <div className="brand-title">
            Drive<span>Easy</span>
          </div>
        </Link>

        {/* Dynamic Role-Aware Navigation Links */}
        <nav>
          <ul className="nav-links">
            {isAuthenticated ? (
              <>
                {/* Available to all authenticated users */}
                <li>
                  <NavLink
                    to="/fleet"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    id="nav-link-fleet"
                  >
                    Fleet
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/my-bookings"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    id="nav-link-bookings"
                  >
                    My Bookings
                  </NavLink>
                </li>

                {/* Only visible to Admin and Fleet Manager roles */}
                {(role === 'admin' || role === 'fleet_manager') && (
                  <li>
                    <NavLink
                      to="/admin"
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                      id="nav-link-admin"
                    >
                      {role === 'admin' ? 'Admin Panel' : 'Fleet Operations'}
                    </NavLink>
                  </li>
                )}
              </>
            ) : (
              /* Public / Unauthenticated state */
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  id="nav-link-login-tab"
                >
                  Sign In
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        {/* User Identity & Logout Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, display: 'block', color: 'var(--text-main)' }}>
                  {customer?.name}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {renderRoleBadge()}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                id="nav-btn-logout"
              >
                Logout ➔
              </button>
            </div>
          ) : (
            <Link to="/" className="btn btn-primary btn-sm" id="nav-btn-signin">
              Login Account
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
