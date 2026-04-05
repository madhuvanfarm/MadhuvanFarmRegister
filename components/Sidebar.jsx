import React, { useState } from 'react';

const Sidebar = ({ currentReg, onRegChange, masterData, onUpdateMasterData, onExportFiltered, onLogout, onChangeModule }) => {
  const [openSections, setOpenSections] = useState({
    contractors: true,
    rates: false,
    sugarcaneTypes: false,
    tractorNumbers: false
  });

  const toggleSection = (id) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addItem = (section) => {
    const value = window.prompt(`Enter new ${section.slice(0, -1)}:`);
    if (value && value.trim()) {
      onUpdateMasterData(prev => ({
        ...prev,
        [section]: [...prev[section], value.trim()]
      }));
    }
  };

  const deleteItem = (section, index) => {
    if (window.confirm('Remove this item?')) {
      onUpdateMasterData(prev => ({
        ...prev,
        [section]: prev[section].filter((_, i) => i !== index)
      }));
    }
  };

  const sections = [
    { id: 'contractors', label: 'Contractors', icon: '👷' },
    { id: 'rates', label: 'Rates (₹/Ton)', icon: '💰' },
    { id: 'sugarcaneTypes', label: 'Sugarcane Types', icon: '🌱' },
    { id: 'tractorNumbers', label: 'Tractor Numbers', icon: '🚜' }
  ];

  return (
    <aside className="sidebar" style={{ position: 'fixed', left: 0, top: 0, height: '100vh', width: '280px', color: 'white', background: '#0a1e0a', borderRight: '1px solid rgba(255,215,0,0.2)', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,215,0,0.1)' }}>
        <h4 style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1.5px' }}>Registers</h4>
        <button 
          onClick={() => onRegChange('deliveries')}
          className="sidebar-reg-btn"
          style={{ 
            width: '100%', 
            padding: '12px 15px', 
            borderRadius: '10px', 
            marginBottom: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            fontSize: '0.85rem',
            fontWeight: '600',
            border: currentReg === 'deliveries' ? '1px solid #FFD700' : '1px solid transparent',
            background: currentReg === 'deliveries' ? 'rgba(255,215,0,0.1)' : 'transparent',
            color: currentReg === 'deliveries' ? '#FFD700' : 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            transition: 'var(--transition-normal)'
          }}
        >
          <span>🌿</span> Delivery Register
        </button>
        <button 
          onClick={() => onRegChange('bijane_apeli')}
          className="sidebar-reg-btn"
          style={{ 
            width: '100%', 
            padding: '12px 15px', 
            borderRadius: '10px', 
            marginBottom: '8px',
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            fontSize: '0.85rem',
            fontWeight: '600',
            border: (currentReg === 'bijane_apeli' || currentReg === 'lending') ? '1px solid #FFD700' : '1px solid transparent',
            background: (currentReg === 'bijane_apeli' || currentReg === 'lending') ? 'rgba(255,215,0,0.1)' : 'transparent',
            color: (currentReg === 'bijane_apeli' || currentReg === 'lending') ? '#FFD700' : 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            transition: 'var(--transition-normal)'
          }}
        >
          <span>🤝</span> BIJANE APELI
        </button>
        <button 
          onClick={() => onRegChange('borrowing')}
          className="sidebar-reg-btn"
          style={{ 
            width: '100%', 
            padding: '12px 15px', 
            borderRadius: '10px', 
            marginBottom: '8px',
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            fontSize: '0.85rem',
            fontWeight: '600',
            border: currentReg === 'borrowing' ? '1px solid #FFD700' : '1px solid transparent',
            background: currentReg === 'borrowing' ? 'rgba(255,215,0,0.1)' : 'transparent',
            color: currentReg === 'borrowing' ? '#FFD700' : 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            transition: 'var(--transition-normal)'
          }}
        >
          <span>📉</span> Bijethi Lidhel
        </button>
        <button 
          onClick={() => onRegChange('diesel')}
          className="sidebar-reg-btn"
          style={{ 
            width: '100%', 
            padding: '12px 15px', 
            borderRadius: '10px', 
            marginBottom: '8px',
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            fontSize: '0.85rem',
            fontWeight: '600',
            border: currentReg === 'diesel' ? '1px solid #4CAF50' : '1px solid transparent',
            background: currentReg === 'diesel' ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
            color: currentReg === 'diesel' ? '#4CAF50' : 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            transition: 'var(--transition-normal)'
          }}
        >
          <span>⛽</span> Diesel Register
        </button>

        <button 
          onClick={() => onRegChange('master_data')}
          className="sidebar-reg-btn"
          style={{ 
            width: '100%', 
            padding: '12px 15px', 
            borderRadius: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            fontSize: '0.85rem',
            fontWeight: '600',
            border: currentReg === 'master_data' ? '1px solid #FFD700' : '1px solid transparent',
            background: currentReg === 'master_data' ? 'rgba(255,215,0,0.1)' : 'transparent',
            color: currentReg === 'master_data' ? '#FFD700' : 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            transition: 'var(--transition-normal)'
          }}
        >
          <span>💎</span> Master Data Account
        </button>
      </div>

      <div className="sidebar-header" style={{ padding: '25px 20px 15px', borderBottom: '1px solid rgba(255,215,0,0.1)', marginBottom: '10px' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#FFD700', margin: 0, fontWeight: '800' }}>Management</h2>
        <p style={{ fontSize: '0.75rem', color: '#4CAF50', marginTop: '5px', opacity: 0.8 }}>Master Data Settings</p>
      </div>

      <div style={{ padding: '0 20px', overflowY: 'auto', flex: 1 }}>
        {sections.map(section => (
          <div key={section.id} className="sidebar-section" style={{ marginBottom: '10px', borderBottom: '1px solid rgba(255,215,0,0.05)', paddingBottom: '10px' }}>
            <h4 
              onClick={() => toggleSection(section.id)}
              style={{ 
                color: '#FFD700', 
                fontSize: '0.85rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '10px 0',
                cursor: 'pointer',
                textTransform: 'uppercase', 
                letterSpacing: '1px' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{section.icon}</span> {section.label}
              </div>
              <span style={{ fontSize: '0.7rem', transition: 'var(--transition-normal)', transform: openSections[section.id] ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </h4>
            
            {openSections[section.id] && (
              <div className="sidebar-list animate-fade-in" style={{ paddingBottom: '10px' }}>
                {(masterData[section.id] || []).map((item, index) => (
                  <div key={index} className="sidebar-item" style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {(section.id === 'contractors' || section.id === 'tractorNumbers') && (
                        <button 
                          onClick={() => onExportFiltered(section.id === 'contractors' ? 'contractor' : 'tractorNumber', item)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
                          title={`Download ${item} Report`}
                        >
                          ☁️
                        </button>
                      )}
                      <span>{item}</span>
                    </div>
                    <button 
                      className="delete-mini-btn"
                      onClick={() => deleteItem(section.id, index)}
                      style={{ opacity: 0.5 }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                
                <button 
                  className="sidebar-add-btn"
                  onClick={() => addItem(section.id)}
                  style={{ marginTop: '8px' }}
                >
                  + Add {section.label.slice(0, -1)}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <button 
          onClick={onChangeModule}
          style={{ 
            width: '100%', 
            padding: '12px', 
            borderRadius: '10px', 
            background: 'rgba(76, 175, 80, 0.1)', 
            color: '#4CAF50', 
            border: '1px solid rgba(76, 175, 80, 0.2)', 
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '10px',
            transition: 'var(--transition-normal)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(76, 175, 80, 0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(76, 175, 80, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          🔄 Change Module
        </button>

        <button 
          onClick={onLogout}
          style={{ 
            width: '100%', 
            padding: '12px', 
            borderRadius: '10px', 
            background: 'rgba(255, 69, 58, 0.1)', 
            color: '#ff453a', 
            border: '1px solid rgba(255, 69, 58, 0.2)', 
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'var(--transition-normal)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 69, 58, 0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 69, 58, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          🚪 Logout Session
        </button>
      </div>

      <div style={{ padding: '20px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', borderTop: '1px solid rgba(255,215,0,0.1)' }}>
        MADHUVAN FARM v2.0
      </div>
    </aside>
  );
};

export default Sidebar;
