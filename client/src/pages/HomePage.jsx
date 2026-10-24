import React from 'react';
import StatusCard from '../components/StatusCard';

/**
 * HomePage Component
 * Landing Dashboard for Stage 1: Foundation & Starter Shell
 */
const HomePage = () => {
  const stages = [
    { num: 'Stage 1', name: 'Foundation & Shell', status: 'Completed', current: true },
    { num: 'Stage 2', name: 'User Authentication & JWT', status: 'Upcoming', current: false },
    { num: 'Stage 3', name: 'Car Fleet Management', status: 'Upcoming', current: false },
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
          <a href="#health-monitor" className="btn btn-primary" id="btn-hero-test">
            ⚡ Run Health Verification
          </a>
          <a href="#architecture" className="btn btn-outline" id="btn-hero-arch">
            📐 System Architecture
          </a>
        </div>
      </section>

      {/* Grid: Health Check Widget & Stage 1 Deliverables Summary */}
      <div className="grid-2">
        {/* Live Health Monitor Widget */}
        <StatusCard />

        {/* Foundation Deliverables Checklist */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Stage 1 Deliverables</h3>
              <p style={{ fontSize: '0.85rem' }}>Foundation Verification</p>
            </div>
            <span className="badge badge-success">Verified</span>
          </div>

          <table className="info-table">
            <tbody>
              <tr>
                <td className="label">Frontend Stack</td>
                <td className="value">React 18 + Vite (JavaScript / JSX)</td>
              </tr>
              <tr>
                <td className="label">Routing</td>
                <td className="value">React Router DOM (AppRoutes.jsx)</td>
              </tr>
              <tr>
                <td className="label">State Management</td>
                <td className="value">React Context (AuthContext.jsx)</td>
              </tr>
              <tr>
                <td className="label">Backend Server</td>
                <td className="value">Node.js + Express (app.js, server.js)</td>
              </tr>
              <tr>
                <td className="label">Database Layer</td>
                <td className="value">MongoDB + Mongoose (decoupled db.js)</td>
              </tr>
              <tr>
                <td className="label">Authentication Prep</td>
                <td className="value">JWT Bearer Token Middleware</td>
              </tr>
              <tr>
                <td className="label">API Security</td>
                <td className="value">CORS Enabled + Sanitized Errors</td>
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
              <span className={`badge ${stg.current ? 'badge-primary' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
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
