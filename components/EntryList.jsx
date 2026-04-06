import React from 'react';

const EntryList = ({ entries, activeTab, onTabChange, onDelete, onEdit, onToggleStatus, onMarkPaid, onLendMoney, onExport, onExportMasterHistory, onExportHistory, onSelectEntry, onViewBill, mode = 'deliveries' }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const formatWeight = (weightKG, unit) => {
    if (unit === 'Tons') return (weightKG / 1000).toFixed(2);
    if (unit === 'Quintals') return (weightKG / 100).toFixed(2);
    return weightKG.toFixed(2);
  };

  // Filter entries based on the active tab and search term
  const filteredEntries = React.useMemo(() => {
    return entries.filter(e => {
      // 1. Tab filtering
      const tabMatch = activeTab === 'Active' ? (e.status !== 'Done' && e.status !== 'Paid') :
                       activeTab === 'Completed' ? (e.status === 'Done') :
                       (e.status === 'Paid');
      
      if (!tabMatch) return false;

      // 2. Search filtering
      if (!searchTerm.trim()) return true;
      
      const search = searchTerm.toLowerCase().trim();
      const firstName = (e.firstName || '').toLowerCase();
      const lastName = (e.lastName || '').toLowerCase();
      const fullName = `${firstName} ${lastName}`;
      const village = (e.village || '').toLowerCase();
      const srNo = String(e.srNo || '').toLowerCase();
      const tractor = (e.tractorNumber || '').toLowerCase();
      const contractor = (e.contractor || '').toLowerCase();
      const receiver = (e.receiverName || e.giverName || e.lenderName || '').toLowerCase();

      return fullName.includes(search) || 
             firstName.includes(search) || 
             lastName.includes(search) || 
             village.includes(search) || 
             srNo.includes(search) || 
             tractor.includes(search) ||
             contractor.includes(search) ||
             receiver.includes(search);
    });
  }, [entries, activeTab, searchTerm]);

  // Get unique values for suggestions
  const suggestions = React.useMemo(() => {
    const sets = {
      srNos: new Set(),
      tractors: new Set(),
      contractors: new Set(),
      receivers: new Set(),
      villages: new Set()
    };

    entries.forEach(e => {
      if (e.srNo) sets.srNos.add(String(e.srNo));
      if (e.tractorNumber) sets.tractors.add(e.tractorNumber);
      if (e.contractor) sets.contractors.add(e.contractor);
      if (e.village) sets.villages.add(e.village);
      const rec = e.receiverName || e.giverName || e.lenderName;
      if (rec) sets.receivers.add(rec);
    });

    return [...sets.srNos, ...sets.tractors, ...sets.contractors, ...sets.receivers, ...sets.villages];
  }, [entries]);

  return (
    <div className="table-container">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {mode !== 'master_data' && (
            <div className="tab-container glass-card" style={{ padding: '4px', display: 'flex', gap: '4px' }}>
              <button 
                className={`tab-btn ${activeTab === 'Active' ? 'active' : ''}`}
                onClick={() => onTabChange('Active')}
              >
                Active
              </button>
              <button 
                className={`tab-btn ${activeTab === 'Completed' ? 'active' : ''}`}
                onClick={() => onTabChange('Completed')}
              >
                Completed
              </button>
              <button 
                className={`tab-btn ${activeTab === 'Paid' ? 'active' : ''}`}
                onClick={() => onTabChange('Paid')}
              >
                Paid
              </button>
            </div>
          )}

          <div style={{ flex: 1, position: 'relative', maxWidth: '500px', minWidth: '300px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input 
                type="text" 
                placeholder="Search by name, village, Sr No, tractor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
                style={{ 
                  paddingLeft: '45px', 
                  paddingRight: '45px', 
                  marginBottom: 0,
                  width: '100%',
                  fontSize: '1rem',
                  border: searchTerm ? '1px solid var(--secondary)' : '1px solid var(--glass-border)'
                }}
              />
              <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.7, fontSize: '1.2rem' }}>🔍</span>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  style={{ 
                    position: 'absolute', 
                    right: '10px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    background: 'rgba(255,255,255,0.1)', 
                    border: 'none', 
                    color: 'white', 
                    cursor: 'pointer', 
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    zIndex: 10,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  ✕
                </button>
              )}
              {/* Custom Suggestions Dropdown */}
              {searchTerm.trim().length > 0 && suggestions.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 && (
                <div className="glass-card shadow-glow" style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '10px',
                  maxHeight: '250px',
                  overflowY: 'auto',
                  zIndex: 2000,
                  padding: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(10, 30, 30, 0.98)',
                  backdropFilter: 'blur(30px)',
                  borderRadius: '12px'
                }}>
                  {suggestions
                    .filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
                    .slice(0, 10) 
                    .map((s, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSearchTerm(s)}
                      style={{ 
                        padding: '12px 18px', 
                        cursor: 'pointer',
                        borderRadius: '8px',
                        transition: 'all 0.2s',
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem',
                        marginBottom: '2px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(255,215,0,0.15)';
                        e.currentTarget.style.color = 'var(--secondary)';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      ✨ {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={mode === 'master_data' ? onExportMasterHistory : onExport}
            className="btn export-btn"
            style={{ fontWeight: '600', background: mode === 'master_data' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)' }}
          >
            {mode === 'master_data' ? '📥 Download All Master Data' : '📄 Export All'}
          </button>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', opacity: 0.8 }}>
        <p style={{ color: 'var(--text-secondary)' }}>No {activeTab.toLowerCase()} {mode === 'borrowing' ? 'Bijethi Lidhel' : (mode === 'bijane_apeli' || mode === 'lending') ? 'BIJANE APELI' : 'accounts'} found.</p>
        </div>
      ) : (
        <table className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <thead>
            <tr>
              <th style={{ width: '100px' }}>Sr No</th>
              <th>{mode === 'diesel' ? 'Tractor Details' : 'Khedut Name'}</th>
              {mode === 'master_data' ? (
                <>
                  <th style={{ textAlign: 'right' }}>Delivery (₹)</th>
                  <th style={{ textAlign: 'right' }}>BIJANE APELI (₹)</th>
                  <th style={{ textAlign: 'right' }}>Upad (₹)</th>
                </>
              ) : mode === 'diesel' ? (
                <th style={{ textAlign: 'right' }}>Upad (₹)</th>
              ) : (

                (mode === 'bijane_apeli' || mode === 'lending') && <th>Receiver</th>
              )}
              <th style={{ textAlign: 'right' }}>{mode === 'master_data' ? 'Net Balance (₹)' : mode === 'diesel' ? 'Total Expense (₹)' : 'Total Amount'}</th>

              <th style={{ textAlign: 'right', width: '50px' }}></th>

            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((account, index) => (
              <tr 
                key={account.id} 
                className={`animate-fade-in clickable-row ${account.status === 'Done' ? 'status-done-row' : ''}`}
                style={{ 
                  animationDelay: `${0.05 * index}s`,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onClick={() => onSelectEntry(account)}
              >
                <td className="sr-no">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {account.status === 'Done' && <span style={{ marginRight: '8px', color: '#ff9500' }}>⏳</span>}
                    {account.status === 'Paid' && <span style={{ marginRight: '8px', color: '#34c759' }}>💎</span>}
                    #{String(account.srNo).padStart(3, '0')}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: '600', color: account.status === 'Done' ? 'var(--text-secondary)' : 'var(--text-primary)', fontSize: '1rem' }}>
                    {mode === 'diesel' ? account.tractorNumber : `${account.firstName} ${account.lastName}`}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary-light)' }}>
                    📍 {account.village || 'N/A'}
                  </div>
                </td>

                {mode === 'master_data' ? (
                  <>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', color: '#4CAF50', fontWeight: '600' }}>
                        ₹ {(account.totalDeliveries || 0).toLocaleString()}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', color: '#FFD700', fontWeight: '600' }}>
                        ₹ {(account.totalBijaneApeli || 0).toLocaleString()}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', color: '#ff453a', fontWeight: '600' }}>
                        ₹ {(account.totalInternalUpad || 0).toLocaleString()}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: (account.totalAmount < 0) ? '#ff453a' : 'var(--secondary)' }}>
                        ₹ {(account.totalAmount || 0).toLocaleString()}
                      </div>
                    </td>
                  </>
                ) : mode === 'diesel' ? (
                  <>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1rem', color: '#ff453a', fontWeight: '600' }}>
                        ₹ {(account.totalBijaneApeli || 0).toLocaleString()}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: '800', color: (account.totalAmount - (account.totalBijaneApeli || 0)) < 0 ? '#ff453a' : '#4CAF50' }}>
                        ₹ {(account.totalAmount - (account.totalBijaneApeli || 0)).toLocaleString()}
                      </div>
                    </td>
                  </>
                ) : (


                  <>
                    {(mode === 'bijane_apeli' || mode === 'lending') && (
                      <td>
                        <div style={{ fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: '600' }}>
                          👤 {account.receiverName || account.giverName || account.lenderName || 'N/A'}
                        </div>
                      </td>
                    )}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--secondary)' }}>
                        ₹ {((parseFloat(account.totalAmount) || 0) - (parseFloat(account.totalBijaneApeli || account.totalLended) || 0)).toLocaleString()}
                      </div>
                    </td>
                  </>
                )}

                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {mode === 'master_data' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onViewBill(account); }}
                      className="btn-icon"
                      title="Generate Bill"
                      style={{ 
                        marginRight: '12px', 
                        fontSize: '1.2rem', 
                        opacity: 0.7, 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        transition: 'opacity 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
                    >
                      🧾
                    </button>
                  )}
                  <span style={{ opacity: 0.3 }}>›</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EntryList;
