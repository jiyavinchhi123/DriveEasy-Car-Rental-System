import React, { useState, useEffect } from 'react';
import { checkApiHealth } from '../services/api';

/**
 * StatusCard Component
 * Real-time health-check tester widget verifying client-to-server connectivity
 */
const StatusCard = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();

    const result = await checkApiHealth();
    const endTime = performance.now();
    setLatency(Math.round(endTime - startTime));

    if (result.success) {
      setHealthData(result.data);
      setError(null);
    } else {
      setError(result.error || 'Server is not reachable');
      setHealthData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="card" id="health-monitor">
      <div className="card-header">
        <div>
          <h3>Backend & Database Health</h3>
          <p style={{ fontSize: '0.85rem' }}>GET /api/v1/health live monitor</p>
        </div>
        <div>
          {loading ? (
            <span className="badge badge-warning">
              <span className="pulse-dot loading"></span> Checking...
            </span>
          ) : healthData ? (
            <span className="badge badge-success">
              <span className="pulse-dot online"></span> API Online
            </span>
          ) : (
            <span className="badge badge-danger">
              <span className="pulse-dot offline"></span> API Offline
            </span>
          )}
        </div>
      </div>

      <div>
        {loading && (
          <p style={{ padding: '1rem 0' }}>Pinging backend API server...</p>
        )}

        {error && !loading && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}>
              <strong>Connection Error:</strong> {error}
              <p style={{ fontSize: '0.82rem', marginTop: '0.4rem', color: '#7f1d1d' }}>
                Ensure your Express server is running on <code>http://localhost:5000</code> by running <code>npm run dev</code> inside <code>driveeasy/server/</code>.
              </p>
            </div>
          </div>
        )}

        {healthData && !loading && (
          <table className="info-table">
            <tbody>
              <tr>
                <td className="label">Application</td>
                <td className="value">{healthData.application}</td>
              </tr>
              <tr>
                <td className="label">Current Stage</td>
                <td className="value">{healthData.stage}</td>
              </tr>
              <tr>
                <td className="label">Environment</td>
                <td className="value"><code>{healthData.environment}</code></td>
              </tr>
              <tr>
                <td className="label">MongoDB Connection</td>
                <td className="value">
                  {healthData.database?.connected ? (
                    <span className="badge badge-success">Connected</span>
                  ) : (
                    <span className="badge badge-warning">
                      {healthData.database?.status || 'Disconnected'}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="label">Roundtrip Latency</td>
                <td className="value">{latency !== null ? `${latency} ms` : '—'}</td>
              </tr>
              <tr>
                <td className="label">Server Timestamp</td>
                <td className="value" style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>
                  {healthData.timestamp}
                </td>
              </tr>
            </tbody>
          </table>
        )}

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="btn btn-primary btn-sm"
            id="btn-refresh-health"
          >
            {loading ? 'Refreshing...' : '🔄 Re-test Health Endpoint'}
          </button>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Target: <code>http://localhost:5000/api/v1/health</code>
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
