import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Navbar Component
 * Navigation header with logo, stage indicator, and page links
 */
const Navbar = () => {
  const location = useLocation();

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

        {/* Navigation Links */}
        <nav>
          <ul className="nav-links">
            <li>
              <Link
                to="/"
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                id="nav-link-home"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <span className="badge badge-primary" title="Foundation Ready">
                Stage 1 Active
              </span>
            </li>
            <li>
              <a
                href="#health-monitor"
                className="btn btn-outline btn-sm"
                id="nav-btn-health"
              >
                Health Check
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
