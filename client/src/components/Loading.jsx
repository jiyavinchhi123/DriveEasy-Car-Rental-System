import React from 'react';

/**
 * Loading Component
 * Reusable loading indicator with spinner and customizable message
 */
const Loading = ({ message = 'Loading, please wait...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        color: 'var(--text-muted)'
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e2e8f0',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '1rem'
        }}
      />
      <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>{message}</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loading;
