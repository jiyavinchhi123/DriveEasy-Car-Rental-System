import React from 'react';
import { Link } from 'react-router-dom';
import StatusCard from '../components/StatusCard';

/**
 * HomePage Component
 * Landing Dashboard for DriveEasy Car Rental System
 */
const HomePage = () => {
  const stages = [
    { num: 'Stage 1', name: 'Foundation & Shell', status: 'Completed', current: false },
    { num: 'Stage 2', name: 'Frontend Architecture & UI', status: 'Completed', current: true },
    { num: 'Stage 3', name: 'Car Fleet & Backend CRUD', status: 'Upcoming', current: false },
    { num: 'Stage 4', name: 'Rental Booking System', status: 'Upcoming', current: false },
    { num: 'Stage 5', name: 'User & Admin Dashboards', status: 'Upcoming', current: false },
    { num: 'Stage 6', name: 'Payment & Notifications', status: 'Upcoming', current: false },
    { num: 'Stage 7', name: 'Testing & Final Polish', status: 'Upcoming', current: false }
  ];

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-section">
        <div className="hero-pill">
          <span className="badge badge-primary">
            ITUE301 Practical Exam • CSPIT CHARUSAT
          </span>
        </div>
        <h1 className="hero-title">
          Drive<span>Easy</span> Car Rental System
        </h1>
        <p className="hero-subtitle">
          A modern full-stack web application built with React, Vite, Node.js, Express, and MongoDB.
          Clean architecture, modular design, and viva-ready code.
        </p>
        <div className="hero-actions">
          <Link to="/fleet" className="btn btn-primary" id="btn-hero-fleet">
            🚗 Explore Vehicle Fleet ➔
          </Link>
          <Link to="/admin" className="btn btn-outline" id="btn-hero-admin">
            🛡️ Admin Panel
          </Link>
          <a href="#health-monitor" className="btn btn-outline" id="btn-hero-test">
            ⚡ Health Check
          </a>
        </div>
      </section>

      {/* Grid: Health Check Widget & System Deliverables Summary */}
      <div className="grid-2">
        {/* Live Health Monitor Widget */}
        <StatusCard />

        {/* Deliverables Checklist */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Frontend Component Architecture</h3>
              <p style={{ fontSize: '0.85rem' }}>Components & UI Pages Verification</p>
            </div>
            <span className="badge badge-success">Stage 2 Active</span>
          </div>

          <table className="info-table">
            <tbody>
              <tr>
                <td className="label">VehicleCard.jsx</td>
                <td className="value">Props: model, type, pricePerDay, available, onBook</td>
              </tr>
              <tr>
                <td className="label">FleetPage.jsx</td>
                <td className="value">Filter tabs (All, Hatchback, Sedan, SUV) + Grid</td>
              </tr>
              <tr>
                <td className="label">BookingForm.jsx</td>
                <td className="value">Selected car, dates, duration & total price calculation</td>
              </tr>
              <tr>
                <td className="label">LoginPage.jsx</td>
                <td className="value">Client validation, error alerts, AuthContext integration</td>
              </tr>
              <tr>
                <td className="label">MyBookingsPage.jsx</td>
                <td className="value">Booking list, status badges, empty & error states</td>
              </tr>
              <tr>
                <td className="label">AdminPanel.jsx</td>
                <td className="value">KPI metrics, Fleet, Bookings & Status decision console</td>
              </tr>
              <tr>
                <td className="label">Navbar.jsx</td>
                <td className="value">React Router Link SPA navigation (no page reloads)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Architecture Cards */}
      <section id="architecture" style={{ marginTop: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2>Full-Stack System Architecture</h2>
          <p>Decoupled modular design prepared for multi-stage feature expansion</p>
        </div>

        <div className="grid-4">
          <div className="feature-card">
            <div className="feature-icon">⚛️</div>
            <h4>Frontend Client</h4>
            <p style={{ fontSize: '0.88rem' }}>
              Vite dev server, responsive vanilla CSS design system, modular components, and API service client with token support.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h4>Express API</h4>
            <p style={{ fontSize: '0.88rem' }}>
              Express.js application with modular routing (<code>/api/v1</code>), CORS config, and central error handling.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🍃</div>
            <h4>MongoDB & Mongoose</h4>
            <p style={{ fontSize: '0.88rem' }}>
              Decoupled connection helper with auto-recovery, ready for User, Car, and Rental booking schemas.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h4>JWT Security</h4>
            <p style={{ fontSize: '0.88rem' }}>
              Bearer token authorization middleware, environment variables for secrets, and sanitized error responses.
            </p>
          </div>
        </div>
      </section>

      {/* 7-Stage Roadmap */}
      <section style={{ marginTop: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2>7-Stage Development Roadmap</h2>
          <p>Carefully staged full-stack development workflow for ITUE301</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '1rem'
        }}>
          {stages.map((stg, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                padding: '1.25rem',
                borderLeft: stg.current ? '4px solid var(--primary)' : '1px solid var(--border-color)',
                background: stg.current ? '#f0f9ff' : 'var(--bg-card)'
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {stg.num}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0.35rem 0' }}>
                {stg.name}
              </div>
              <span className={`badge ${stg.current ? 'badge-primary' : stg.status === 'Completed' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                {stg.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
