import React from 'react';

/**
 * Footer Component
 * Shows University, Exam, and Project metadata
 */
const Footer = () => {
  return (
    <footer className="footer" id="app-footer">
      <div className="container footer-content">
        <p className="footer-title">
          DriveEasy Car Rental System • Full-Stack Web Application
        </p>
        <p className="footer-subtitle">
          Developed for ITUE301 Open-Book Practical Examination • CSPIT, CHARUSAT
        </p>
        <p className="footer-subtitle" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
          MERN Stack Architecture • Node.js, Express, MongoDB, React, Vite
        </p>
      </div>
    </footer>
  );
};

export default Footer;
