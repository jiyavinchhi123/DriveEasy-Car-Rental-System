import React from 'react';
import { Link } from 'react-router-dom';

/**
 * NotFoundPage Component
 * 404 Error page for undefined frontend routes
 */
const NotFoundPage = () => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '5rem 1rem',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
        404
      </div>
      <h2>Page Not Found</h2>
      <p style={{ margin: '1rem 0 2rem' }}>
        The route you are looking for does not exist in DriveEasy Car Rental System.
      </p>
      <Link to="/" className="btn btn-primary" id="btn-404-home">
        ⬅ Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
