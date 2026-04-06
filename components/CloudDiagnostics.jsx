import React from 'react';

const CloudDiagnostics = ({ isOpen, onClose, user, cloudStatus, counts, logs }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#FFD700' }}>Cloud Diagnostics</h2>
          <button onClick={onClose} className="btn-icon" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '15px', borderLeft: '4px solid #4CAF50' }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '5px' }}>AUTHENTICATED USER ID</span>
            <code style={{ fontSize: '0.85rem', color: '#4CAF50', wordBreak: 'break-all' }}>{user?.id || 'Not Authenticated'}</code>
          </div>

          <div className="glass-card" style={{ padding: '15px', borderLeft: '4px solid #FFD700' }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '10px' }}>DATABASE RECORD COUNTS (CLOUD)</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {Object.entries(counts).map(([table, count]) => (
                <div key={table} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <span style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{table.replace('_', ' ')}</span>
                  <span style={{ fontWeight: '700', color: count > 0 ? '#4CAF50' : '#ff453a' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '15px', borderLeft: '4px solid ' + (cloudStatus === 'Connected' ? '#4CAF50' : '#ff453a') }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '5px' }}>CONNECTION HEALTH</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: cloudStatus === 'Connected' ? '#4CAF50' : '#ff453a' }}></span>
              <span style={{ fontWeight: '600' }}>{cloudStatus}</span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '15px', borderLeft: '4px solid #BB86FC' }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '10px' }}>LATEST ACTIVITY LOG</span>
            <div style={{ maxHeight: '250px', overflowY: 'auto', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {logs && logs.length > 0 ? (
                logs.map((log, i) => (
                  <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: log.type === 'error' ? '#ff453a' : 'white' }}>
                    <span style={{ opacity: 0.5 }}>[{log.time}]</span> {log.msg}
                  </div>
                ))
              ) : (
                <div style={{ opacity: 0.3, fontStyle: 'italic' }}>No activity yet...</div>
              )}
            </div>
          </div>

          <div style={{ padding: '15px', background: 'rgba(255, 69, 58, 0.1)', borderRadius: '10px', color: '#ff453a', fontSize: '0.8rem', lineHeight: '1.5' }}>
            <strong>TIP:</strong> If "Record Counts" are 0 but you have data, check your <strong>Supabase RLS Policies</strong>. You must allow <code>authenticated</code> users to <code>SELECT</code> and <code>INSERT</code> on all tables.
          </div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button onClick={onClose} className="btn btn-primary" style={{ minWidth: '150px' }}>Close Diagnostics</button>
        </div>
      </div>
    </div>
  );
};

export default CloudDiagnostics;