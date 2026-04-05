import React from 'react';

const EntryDetailModal = ({ isOpen, onClose, entry, onDelete, onEdit, onToggleStatus, onMarkPaid, onLendMoney, onExportHistory, mode = 'deliveries' }) => {
  if (!isOpen || !entry) return null;

  const formatWeight = (weightKG, unit) => {
    if (unit === 'Tons') return (weightKG / 1000).toFixed(2);
    if (unit === 'Quintals') return (weightKG / 100).toFixed(2);
    return weightKG.toFixed(2);
  };

  const totalUpad = parseFloat(entry.totalBijaneApeli || entry.totalLended) || 0;
  const totalAmount = parseFloat(entry.totalAmount) || 0;
  const netAmount = totalAmount - totalUpad;

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="modal-content glass-card animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1100px', padding: '0' }}>
        {/* Header */}
        <div style={{ 
          padding: '24px 32px', 
          borderBottom: '1px solid var(--glass-border)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              {entry.isMaster ? 'Master Account' : `#${String(entry.srNo).padStart(3, '0')}`} - {entry.firstName} {entry.lastName}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              📍 {entry.village} {entry.deliveryDate && `| 📅 ${new Date(entry.deliveryDate).toLocaleDateString()}`}
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', padding: '10px', borderRadius: '50%', width: '40px', height: '40px' }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Left Column: Primary Info */}
          <div>
            <h4 style={{ color: 'var(--primary-light)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>
              {entry.isMaster ? 'Account Summary' : 'Basic Information'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {!entry.isMaster ? (
                <>
                  {mode !== 'diesel' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Contractor:</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{entry.contractor || 'N/A'}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Tractor:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{entry.tractorNumber || 'N/A'}</span>
                  </div>
                  {mode !== 'diesel' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Type:</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{entry.sugarcaneType || 'N/A'}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Weight:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{formatWeight(entry.totalWeightKG || 0, 'Tons')} Tons</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Transactions:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{entry.transactions?.length || 0}</span>
                  </div>
                </>
              )}
              
              {(mode === 'bijane_apeli' || mode === 'lending') && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--secondary)' }}>Receiver:</span>
                  <span style={{ color: 'var(--secondary)', fontWeight: '600' }}>{entry.receiverName || entry.giverName || entry.lenderName || 'N/A'}</span>
                </div>
              )}
              {entry.remark && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Note:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.85rem', fontStyle: 'italic' }}>"{entry.remark}"</span>
                </div>
              )}
            </div>


            {!entry.isMaster && mode !== 'diesel' && (
              <>
                <h4 style={{ color: 'var(--primary-light)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '16px', marginTop: '24px', letterSpacing: '1px' }}>Weight Metrics</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Weight:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{formatWeight(entry.totalWeightKG, entry.unit)} {entry.unit}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Rate:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>₹ {entry.rate} / {entry.unit}</span>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Right Column: Financials & Status */}
          <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,215,0,0.02)', border: '1px solid rgba(255,215,0,0.1)' }}>
            <h4 style={{ color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>Financial Overview</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: entry.isMaster ? '12px' : '16px' }}>
              {entry.isMaster ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Delivery (Gross):</span>
                    <span style={{ color: '#4CAF50', fontWeight: '600' }}>₹ {(entry.totalDeliveries || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>BIJANE APELI:</span>
                    <span style={{ color: '#FFD700', fontWeight: '600' }}>+ ₹ {(entry.totalBijaneApeli || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Upad (Deductions):</span>
                    <span style={{ color: '#ff453a', fontWeight: '600' }}>- ₹ {(entry.totalInternalUpad || 0).toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Amount:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '1.2rem' }}>₹ {totalAmount.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Upad:</span>
                    <span style={{ color: '#ff453a', fontWeight: '600' }}>- ₹ {totalUpad.toLocaleString()}</span>
                  </div>
                </>
              )}
              
              <div style={{ height: '1px', background: 'var(--glass-border)', margin: '4px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>Net Balance:</span>
                <span style={{ color: entry.totalAmount < 0 ? '#ff453a' : 'var(--secondary)', fontWeight: '800', fontSize: '1.4rem' }}>
                  ₹ {(entry.isMaster ? entry.totalAmount : netAmount).toLocaleString()}
                </span>
              </div>

              {!entry.isMaster && (
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>CURRENT STATUS</span>
                  <span style={{ 
                    color: entry.status === 'Paid' ? '#34c759' : entry.status === 'Done' ? '#ff9500' : 'var(--primary-light)',
                    fontWeight: '700',
                    fontSize: '1rem'
                  }}>
                    {entry.status?.toUpperCase() || 'ACTIVE'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Diesel Transaction History */}
        {mode === 'diesel' && entry.transactions && entry.transactions.length > 0 && (
          <div style={{ padding: '0 32px 32px 32px' }}>
            <h4 style={{ color: 'var(--primary-light)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>Tractor Record History</h4>
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>Type / Remark</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--glass-border)' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.transactions.map((t, i) => (
                    <tr key={i} style={{ borderBottom: i === entry.transactions.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{new Date(t.deliveryDate).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{t.entryType === 'diesel' ? '⛽ Fueling' : '💸 Advance (Upad)'}</div>
                        {t.remark && <div style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontStyle: 'italic' }}>"{t.remark}"</div>}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: t.entryType === 'diesel' ? '#ff453a' : 'var(--secondary)', fontWeight: '600' }}>
                        ₹ {parseFloat(t.amount || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* Action Buttons Footer */}
        <div style={{ 
          padding: '24px 32px', 
          borderTop: '1px solid var(--glass-border)', 
          display: 'flex', 
          gap: '12px', 
          flexWrap: 'wrap',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          {!entry.isMaster && (
            <>
              <button 
                onClick={() => {
                  let customDays = 15;
                  if (entry.status !== 'Done') {
                    const input = window.prompt('Remind for payment after how many days?', '15');
                    if (input === null) return;
                    const parsed = parseInt(input);
                    customDays = isNaN(parsed) ? 15 : parsed;
                  }
                  onToggleStatus(entry.id, customDays);
                  onClose();
                }}
                className="btn"
                style={{ 
                  flex: 1,
                  background: entry.status === 'Done' ? 'rgba(76, 175, 80, 0.2)' : 'var(--primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {entry.status === 'Done' ? '↩️ Mark Active' : '✅ Mark Done'}
              </button>

              {entry.status === 'Done' && (
                <button 
                  onClick={() => { onMarkPaid(entry.id); onClose(); }}
                  className="btn"
                  style={{ background: 'rgba(52, 199, 89, 0.2)', color: '#34c759', flex: 1 }}
                >
                  💎 Mark Paid
                </button>
              )}

              <button 
                onClick={() => {
                  const input = window.prompt(`How much Upad amount are you giving to ${entry.firstName}?`, '0');
                  if (input === null || input.trim() === '') return;
                  const amount = parseFloat(input);
                  if (!isNaN(amount)) {
                    onLendMoney(entry.id, amount);
                    onClose();
                  }
                }}
                className="btn"
                style={{ background: 'rgba(255, 215, 0, 0.1)', color: 'var(--secondary)', flex: 1 }}
              >
                🤝 Give Upad
              </button>
            </>
          )}

          <div style={{ width: '100%', display: 'flex', gap: '12px', marginTop: '4px' }}>
            {!entry.isMaster && (
              <>
                <button 
                  onClick={() => { onEdit(entry); onClose(); }}
                  className="btn"
                  style={{ flex: 1, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)' }}
                >
                  ✏️ Edit Record
                </button>
                <button 
                  onClick={() => { if(window.confirm('Are you sure you want to delete this entry?')) { onDelete(entry.id); onClose(); } }}
                  className="btn delete-btn"
                  style={{ flex: 1 }}
                >
                  🗑️ Delete
                </button>
              </>
            )}
            {(mode === 'deliveries' || entry.isMaster) && (
              <button 
                onClick={() => { onExportHistory(entry); onClose(); }}
                className="btn"
                style={{ flex: 1, background: 'rgba(76, 175, 80, 0.1)', color: 'var(--primary-light)' }}
              >
                ⬇️ History
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryDetailModal;
