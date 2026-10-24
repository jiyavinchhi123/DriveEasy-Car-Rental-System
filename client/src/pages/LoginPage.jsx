import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/authService';
import ErrorMessage from '../components/ErrorMessage';

/**
 * LoginPage Component
 * Public entry route (/): handles credential validation, calls backend authentication service,
 * and redirects authenticated customers/managers to /fleet.
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customer, isAuthenticated, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // If already authenticated, automatically redirect to /fleet or intended location
  useEffect(() => {
    if (isAuthenticated) {
      const destination = location.state?.from?.pathname || '/fleet';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Client-side required field validation
  const validateForm = () => {
    const errors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailPattern.test(email.trim())) {
      errors.email = 'Please provide a valid email address (e.g. user@driveeasy.com).';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Connect to reusable authentication service -> POST /api/v1/auth/login
      const result = await loginUser(email, password);

      // Strict enforcement: Never accept arbitrary credentials without valid server confirmation
      if (!result.success) {
        setServerError(result.error || 'Authentication rejected by backend server.');
        setLoading(false);
        return;
      }

      // Server successfully verified credentials and issued JWT token
      const customerData = result.data?.customer;
      const token = result.data?.token;

      if (!customerData || !token) {
        setServerError('Server response was missing required authentication payload.');
        setLoading(false);
        return;
      }

      // Persist in AuthContext & localStorage (passwords are NEVER stored)
      login(customerData, token);

      setSuccessMsg(`Login verified as ${customerData.role.toUpperCase()}. Redirecting to fleet...`);

      // Redirect to /fleet or originally requested protected route
      setTimeout(() => {
        const targetPath = location.state?.from?.pathname || '/fleet';
        navigate(targetPath, { replace: true });
      }, 600);
    } catch (err) {
      setServerError('Network failure: Unable to reach the backend authentication service on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to prefill examination credentials for the 3 distinct roles
  const handleQuickFill = (roleType) => {
    if (roleType === 'admin') {
      setEmail('admin@driveeasy.com');
      setPassword('admin123');
    } else if (roleType === 'fleet_manager') {
      setEmail('manager@driveeasy.com');
      setPassword('manager123');
    } else {
      setEmail('customer@driveeasy.com');
      setPassword('customer123');
    }
    setFieldErrors({});
    setServerError('');
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2rem auto' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            margin: '0 auto 0.75rem',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)'
          }}>
            🔑
          </div>
          <h2>DriveEasy Login</h2>
          <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Sign in to access fleet reservation and bookings
          </p>
        </div>

        {/* Server & Authentication Error Banner */}
        {serverError && (
          <ErrorMessage
            message={serverError}
            onRetry={() => setServerError('')}
          />
        )}

        {/* Success Feedback */}
        {successMsg && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            fontSize: '0.88rem'
          }}>
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email Input */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="loginEmailInput"
              style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}
            >
              Email Address <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="loginEmailInput"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. customer@driveeasy.com"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.7rem 0.85rem',
                border: `1px solid ${fieldErrors.email ? 'var(--danger)' : 'var(--border-color)'}`,
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            />
            {fieldErrors.email && (
              <span style={{ color: 'var(--danger)', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem' }}>
                {fieldErrors.email}
              </span>
            )}
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="loginPasswordInput"
              style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}
            >
              Password <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="loginPasswordInput"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.7rem 0.85rem',
                border: `1px solid ${fieldErrors.password ? 'var(--danger)' : 'var(--border-color)'}`,
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            />
            {fieldErrors.password && (
              <span style={{ color: 'var(--danger)', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem' }}>
                {fieldErrors.password}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem' }}
            disabled={loading}
            id="btn-login-submit"
          >
            {loading ? 'Authenticating with Backend...' : 'Sign In ➔'}
          </button>
        </form>

        {/* Examination Testing Quick-Fill Panel */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            🧪 Quick-Fill Test Credentials by Role:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handleQuickFill('customer')}
              style={{ fontSize: '0.76rem', padding: '0.3rem 0.6rem' }}
            >
              👤 Customer
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handleQuickFill('fleet_manager')}
              style={{ fontSize: '0.76rem', padding: '0.3rem 0.6rem' }}
            >
              🚙 Fleet Manager
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handleQuickFill('admin')}
              style={{ fontSize: '0.76rem', padding: '0.3rem 0.6rem' }}
            >
              🛡️ Administrator
            </button>
          </div>
          <p style={{ marginTop: '0.65rem', fontSize: '0.75rem', color: 'var(--text-light)' }}>
            Each button loads valid registered credentials verified by the backend API.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
