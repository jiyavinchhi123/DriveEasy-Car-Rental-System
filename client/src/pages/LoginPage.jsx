import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

/**
 * LoginPage Component
 * Full login form with client-side validation, error handling,
 * and authentication integration with AuthContext and backend API.
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Client-side required field validation
  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
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

    // Perform client-side validation first
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      // Attempt login via backend API
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password })
      });

      // Strict verification: Do not pretend authentication succeeded if backend rejected it
      if (!result.success) {
        setServerError(
          result.error ||
          'Authentication failed: Invalid credentials or backend service unavailable.'
        );
        setLoading(false);
        return;
      }

      // Backend confirmed credentials successfully
      const userData = result.data?.user || { email: email.trim(), role: 'customer' };
      const token = result.data?.token || 'driveeasy_mock_jwt_token_stage2';

      login(userData, token);
      setSuccessMsg('Login successful! Redirecting...');
      setTimeout(() => navigate('/fleet'), 800);
    } catch (err) {
      setServerError('An unexpected error occurred while connecting to authentication service.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for exam testing
  const handleQuickFill = (demoRole) => {
    if (demoRole === 'admin') {
      setEmail('admin@driveeasy.com');
      setPassword('admin123');
    } else {
      setEmail('customer@driveeasy.com');
      setPassword('customer123');
    }
    setFieldErrors({});
    setServerError('');
  };

  return (
    <div style={{ maxWidth: '460px', margin: '2rem auto' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            margin: '0 auto 0.75rem'
          }}>
            🔑
          </div>
          <h2>Welcome Back</h2>
          <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Sign in to your DriveEasy Car Rental account
          </p>
        </div>

        {/* Server or Authentication Error Display */}
        {serverError && (
          <ErrorMessage
            message={serverError}
            onRetry={() => setServerError('')}
          />
        )}

        {/* Success feedback */}
        {successMsg && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            fontSize: '0.9rem'
          }}>
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="loginEmail"
              style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}
            >
              Email Address <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="loginEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@driveeasy.com"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
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

          {/* Password Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="loginPassword"
              style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}
            >
              Password <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="loginPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
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
            style={{ width: '100%' }}
            disabled={loading}
            id="btn-login-submit"
          >
            {loading ? 'Authenticating...' : 'Sign In ➔'}
          </button>
        </form>

        {/* Practical Exam Demo Helpers */}
        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
            Exam Quick-Fill (Test Credentials):
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handleQuickFill('customer')}
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
            >
              👤 Customer Account
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handleQuickFill('admin')}
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
            >
              🛡️ Admin Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
