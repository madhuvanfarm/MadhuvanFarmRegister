import React from 'react';

const SummaryModal = ({ isOpen, onClose, stats, counts, financial }) => {
  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px', padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2 style={{ fontSize: '2rem', background: 'linear-gradient(135deg, #FFD700, #4CAF50)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700' }}>
              Dashboard Summary
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Global Business Metrics</p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer', padding: '10px 15px', borderRadius: '10px', fontSize: '1.2rem' }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
          <div className="glass-card" style={{ padding: '25px', textAlign: 'center', borderLeft: '4px solid #4CAF50' }}>
            <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '10px' }}>TOTAL INWARD</span>
            <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#4CAF50' }}>
              {stats.inwardTons} <small style={{ fontSize: '0.9rem' }}>Tons</small>
            </span>
          </div>

          <div className="glass-card" style={{ padding: '25px', textAlign: 'center', borderLeft: '4px solid #FFD700' }}>
            <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: '600', marginBottom: '10px' }}>TOTAL BIJANE APELI</span>
            <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--secondary)' }}>
              {stats.outwardTons} <small style={{ fontSize: '0.9rem' }}>Tons</small>
            </span>
          </div>

          <div className="glass-card" style={{ padding: '25px', textAlign: 'center', borderLeft: '4px solid #ff453a' }}>
            <span style={{ display: 'block', fontSize: '0.9rem', color: '#ff453a', fontWeight: '600', marginBottom: '10px' }}>NET BALANCE</span>
            <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ff453a' }}>
              {stats.balanceTons} <small style={{ fontSize: '0.9rem' }}>Tons</small>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Deliveries: <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{stats.deliveryTons} Tons</span>
          </div>
          <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Bijethi Lidhel: <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{stats.borrowTons} Tons</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div className="glass-card" style={{ padding: '25px' }}>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>Account Distribution</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-primary)' }}>Deliveries (Sellers)</span>
                <span style={{ fontWeight: '700', padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>{counts.deliveries}</span>
              </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-primary)' }}>BIJANE APELI (Sellers)</span>
                <span style={{ fontWeight: '700', padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>{counts.bijane_apeli ?? 0}</span>
              </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-primary)' }}>Bijethi Lidhel (Sources)</span>
                <span style={{ fontWeight: '700', padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>{counts.borrowing}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-primary)' }}>Diesel Register (Tractors)</span>
                <span style={{ fontWeight: '700', padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>{counts.diesel || 0}</span>
              </div>
            </div>

          </div>

          <div className="glass-card" style={{ padding: '25px' }}>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>Financial Overview</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-primary)' }}>Amt. to Pay (Deliveries)</span>
                <span style={{ color: '#4CAF50', fontWeight: '700' }}>₹ {(financial?.deliveryNet || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-primary)' }}>Amt. to Pay (Bijethi Lidhel)</span>
                <span style={{ color: '#ff453a', fontWeight: '700' }}>₹ {(financial?.borrowDues || 0).toLocaleString()}</span>
              </div>
              
              <div style={{ marginTop: '5px', paddingTop: '10px', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>BIJANE APELI Register (₹)</span>
                  <span style={{ color: 'var(--secondary)', fontWeight: '700' }}>₹ {(financial.bijaneApeliRegisterAmount ?? 0).toLocaleString()}</span>
                </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Total Upad (Delivery) (₹)</span>
                  <span style={{ color: 'var(--secondary)', fontWeight: '700' }}>₹ {(financial.deliveryAdvance ?? 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Total Diesel Expense (₹)</span>
                  <span style={{ color: '#ff453a', fontWeight: '700' }}>₹ {(financial.totalDieselExpense ?? 0).toLocaleString()}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={onClose} style={{ minWidth: '150px' }}>
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryModal;
