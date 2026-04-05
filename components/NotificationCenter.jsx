import React from 'react';

const NotificationCenter = ({ isOpen, onClose, overdueRecords, onMarkPaid }) => {
  if (!isOpen) return null;

  return (
    <div className="notification-overlay" onClick={onClose} style={{ pointerEvents: 'auto', background: 'rgba(0,0,0,0.8)', zIndex: 9999, position: 'fixed', inset: 0 }}>
      <div 
        className="notification-dropdown shadow-glow" 
        onClick={e => e.stopPropagation()}
        style={{ 
          background: '#0a1e1e', 
          backgroundColor: '#0a1e1e', 
          opacity: 1,
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          border: '3px solid #FFD700',
          position: 'absolute',
          top: '10%',
          right: '50%',
          transform: 'translateX(50%)',
          width: '90%',
          maxWidth: '500px',
          zIndex: 10000
        }}
      >
        <header style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary)', margin: 0 }}>
            🔔 Payment Alerts
          </h3>
          <span style={{ background: '#ff453a', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
            {overdueRecords.length} Overdue
          </span>
        </header>

        <div className="notification-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {overdueRecords.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p>No overdue payments at the moment. Good job!</p>
            </div>
          ) : (
            overdueRecords.map(e => {
              const daysPassed = Math.floor((Date.now() - e.doneDate) / (1000 * 60 * 60 * 24));
              return (
                <div key={e.id} className="notification-item" style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div style={{ fontWeight: '600' }}>
                      {e.firstName} {e.lastName}
                    </div>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      background: (e.source === 'BIJANE_APELI' || e.source === 'BIJANE APELI') ? 'rgba(255, 215, 0, 0.15)' : e.source === 'Bijethi Lidhel' ? 'rgba(255, 69, 58, 0.15)' : 'rgba(76, 175, 80, 0.15)', 
                      color: (e.source === 'BIJANE_APELI' || e.source === 'BIJANE APELI') ? '#FFD700' : e.source === 'Bijethi Lidhel' ? '#ff453a' : '#4CAF50', 
                      padding: '2px 8px', 
                      borderRadius: '8px',
                      fontWeight: '700',
                      textTransform: 'uppercase'
                    }}>
                      {e.source}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    📍 {e.village} | <b>{daysPassed} Days Overdue</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--secondary)', fontWeight: '700', fontSize: '1.1rem' }}>
                      ₹ {e.totalAmount.toLocaleString()}
                    </span>
                    <button 
                      onClick={() => onMarkPaid(e.id)}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px' }}
                    >
                      Mark Paid
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <footer style={{ padding: '15px', textAlign: 'center' }}>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Close Panel
          </button>
        </footer>
      </div>
    </div>
  );
};

export default NotificationCenter;
