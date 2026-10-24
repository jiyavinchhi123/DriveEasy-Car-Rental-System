import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar Component
 * Reusable navigation header utilizing React Router Link components
 * Includes navigation for Fleet, My Bookings, Admin Panel, and Login/Profile
 */
const Navbar = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/fleet', label: 'Fleet' },
    { to: '/my-bookings', label: 'My Bookings' },
    { to: '/admin', label: 'Admin Panel' }
  ];

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" id="nav-brand-logo">
          <div className="brand-icon">
            🚗
          </div>
          <div className="brand-title">
            Drive<span>Easy</span>
          </div>
        </Link>

        {/* Navigation Links using React Router Link */}
        <nav>
          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Auth / Action Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                👤 <strong>{user?.name || user?.email || 'User'}</strong>
              </span>
              <button
                type="button"
                onClick={logout}
                className="btn btn-outline btn-sm"
                id="nav-btn-logout"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={`btn ${location.pathname === '/login' ? 'btn-primary' : 'btn-outline'} btn-sm`}
              id="nav-link-login"
            >
              Login / Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
