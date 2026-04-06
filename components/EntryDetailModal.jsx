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
        {/* Header (Fixed) */}
        <div style={{ 
          padding: '16px 24px', 
          borderBottom: '1px solid var(--glass-border)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.03)',
          flexShrink: 0
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              {entry.isMaster ? 'Account Summary' : `#${String(entry.srNo).padStart(3, '0')} - ${entry.firstName} ${entry.lastName}`}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
              📍 {entry.village} {entry.deliveryDate && `| 📅 ${new Date(entry.deliveryDate).toLocaleDateString()}`}
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: '50%', width: '36px', height: '36px' }}
          >
            ✕
          </button>
        </div>

        {/* Static Info Section (No Scroll) */}
        <div style={{ padding: '20px 24px 10px 24px', flexShrink: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Left Column: Primary Info */}
            <div>
              <h4 style={{ color: 'var(--primary-light)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>
                {entry.isMaster ? 'Ownership Info' : 'Basic Information'}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
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
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Farmer Name:</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{entry.firstName} {entry.lastName}</span>
                    </div>
                  </>
                )}
                
                {(mode === 'bijane_apeli' || mode === 'lending') && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--secondary)' }}>Receiver:</span>
                    <span style={{ color: 'var(--secondary)', fontWeight: '600' }}>{entry.receiverName || entry.giverName || entry.lenderName || 'N/A'}</span>
                  </div>
                )}

                {!entry.isMaster && mode !== 'diesel' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', marginTop: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Rate:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>₹ {entry.rate} / {entry.unit}</span>
                  </div>
                )}
              </div>

              {entry.remark && (
                <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', display: 'block', marginBottom: '2px', textTransform: 'uppercase' }}>Remark</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.8rem', fontStyle: 'italic' }}>&quot;{entry.remark}&quot;</span>
                </div>
              )}
            </div>

            {/* Right Column: Financials & Status */}
            <div className="glass-card" style={{ padding: '12px 16px', background: 'rgba(255,215,0,0.02)', border: '1px solid rgba(255,215,0,0.1)', height: 'fit-content' }}>
              <h4 style={{ color: 'var(--secondary)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Financial Overview</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                {!entry.isMaster && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Gross Total:</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>₹ {totalAmount.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff453a' }}>
                      <span style={{ opacity: 0.8 }}>Total Upad:</span>
                      <span style={{ fontWeight: '700' }}>- ₹ {totalUpad.toLocaleString()}</span>
                    </div>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '4px 0' }}></div>
                  </>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Net Balance:</span>
                  <span style={{ color: (entry.isMaster ? entry.totalAmount : netAmount) < 0 ? '#ff453a' : 'var(--secondary)', fontWeight: '800', fontSize: '1.25rem' }}>
                    ₹ {(entry.isMaster ? entry.totalAmount : netAmount).toLocaleString()}
                  </span>
                </div>

                {!entry.isMaster && (
                  <div style={{ marginTop: '4px', padding: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ color: entry.status === 'Paid' ? '#34c759' : entry.status === 'Done' ? '#ff9500' : 'var(--primary-light)', fontWeight: '800', fontSize: '0.8rem' }}>
                      {entry.status?.toUpperCase() || 'ACTIVE'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <h4 style={{ color: 'var(--primary-light)', fontSize: '0.7rem', textTransform: 'uppercase', marginTop: '20px', marginBottom: '5px', letterSpacing: '1px' }}>
            {mode === 'diesel' ? '⛽ Tractor Record History' : '📜 Delivery & Activity History'}
          </h4>
        </div>

        {/* Scrollable History Section */}
        <div className="modal-body" style={{ padding: '0 24px 20px 24px', flex: 1, overflowY: 'auto' }}>
          {/* Transaction History Log */}
          {entry.transactions && entry.transactions.length > 0 && (
            <div style={{ marginTop: '0' }}>
              <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.8rem' }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                      <th style={{ padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', background: '#1a1a1a', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', background: '#1a1a1a', fontWeight: '600' }}>Description</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', background: '#1a1a1a', fontWeight: '600' }}>Weight / Unit</th>
                      <th style={{ padding: '10px 16px', textAlign: 'right', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', background: '#1a1a1a', fontWeight: '600' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.transactions
                      .slice()
                      .reverse()
                      .filter(t => 
                        t.type !== 'LENDING' && 
                        t.entryType !== 'lending' && 
                        t.type !== 'UPAD' && 
                        t.remark !== 'Advance (Upad) Given'
                      )
                      .map((t, i) => (
                      <tr key={t.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                          {new Date(t.date || t.deliveryDate || Date.now()).toLocaleDateString('en-GB')}
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                            {t.type === 'DELIVERY' || t.entryType === 'delivery' || mode === 'deliveries' ? '🚜 Sugarcane Drop' : 
                             t.type === 'BIJANEPELI' || t.entryType === 'bijane' ? '🤝 BIJANE APELI' : 
                             t.type === 'BORROW' || t.entryType === 'borrowing' || mode === 'borrowing' ? '💰 Borrowed' : 
                             mode === 'diesel' ? '⛽ Fueling' : '📝 Entry'}
                          </div>
                          {t.remark && <div style={{ fontSize: '0.7rem', color: 'var(--primary-light)', fontStyle: 'italic' }}>&quot;{t.remark}&quot;</div>}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                          {t.weight ? (
                            <div style={{ fontWeight: '700' }}>{t.weight} <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.unit || 'Tons'}</span></div>
                          ) : '-'}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: '800', color: (mode === 'diesel' || mode === 'borrowing') ? '#ff453a' : 'var(--secondary)' }}>
                          ₹ {(parseFloat(t.amount || (parseFloat(t.weight) * parseFloat(t.rate))) || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Footer (Fixed) */}
        <div style={{ 
          padding: '12px 24px', 
          borderTop: '1px solid var(--glass-border)', 
          display: 'flex', 
          gap: '8px', 
          flexWrap: 'wrap',
          background: 'rgba(255, 255, 255, 0.03)',
          flexShrink: 0
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
                  flex: 1.5,
                  background: entry.status === 'Done' ? 'rgba(76, 175, 80, 0.2)' : 'var(--primary)',
                  color: 'white',
                  height: '40px',
                  fontSize: '0.85rem'
                }}
              >
                {entry.status === 'Done' ? '↩️ Mark Active' : '✅ Mark Done'}
              </button>

              {entry.status === 'Done' && (
                <button 
                  onClick={() => { onMarkPaid(entry.id); onClose(); }}
                  className="btn"
                  style={{ background: 'rgba(52, 199, 89, 0.2)', color: '#34c759', flex: 1, height: '40px', fontSize: '0.85rem' }}
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
                style={{ background: 'rgba(255, 215, 0, 0.1)', color: 'var(--secondary)', flex: 1, height: '40px', fontSize: '0.85rem' }}
              >
                🤝 Give Upad
              </button>
            </>
          )}

          <div style={{ width: '100%', display: 'flex', gap: '8px', marginTop: '0px' }}>
            {!entry.isMaster && (
              <>
                <button 
                  onClick={() => { onEdit(entry); onClose(); }}
                  className="btn"
                  style={{ flex: 1, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', height: '36px', fontSize: '0.8rem' }}
                >
                  ✏️ Edit
                </button>
                <button 
                  onClick={() => { if(window.confirm('Are you sure you want to delete this entry?')) { onDelete(entry.id); onClose(); } }}
                  className="btn delete-btn"
                  style={{ flex: 1, height: '36px', fontSize: '0.8rem' }}
                >
                  🗑️ Delete
                </button>
              </>
            )}
            <button 
              onClick={() => { onExportHistory(entry); onClose(); }}
              className="btn"
              style={{ flex: 1, background: 'rgba(76, 175, 80, 0.1)', color: 'var(--primary-light)', height: '36px', fontSize: '0.8rem' }}
            >
              ⬇️ Download Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryDetailModal;
