import React from 'react';

/**
 * ErrorMessage Component
 * Reusable error alert box with optional retry callback
 */
const ErrorMessage = ({ message = 'An error occurred', onRetry }) => {
  return (
    <div
      style={{
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '10px',
        padding: '1.25rem',
        margin: '1rem 0',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem',
        color: '#991b1b'
      }}
      role="alert"
    >
      <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: 0, color: '#991b1b', fontSize: '1rem' }}>
          Error Encountered
        </h4>
        <p style={{ margin: '0.35rem 0 0', color: '#7f1d1d', fontSize: '0.9rem' }}>
          {message}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="btn btn-outline btn-sm"
            style={{
              marginTop: '0.75rem',
              borderColor: '#f87171',
              color: '#991b1b',
              background: '#ffffff'
            }}
          >
            🔄 Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
