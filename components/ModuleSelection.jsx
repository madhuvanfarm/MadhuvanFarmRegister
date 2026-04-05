"use client";

import React from 'react';

const ModuleSelection = ({ onSelect, onLogout }) => {
  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'radial-gradient(circle at center, #0a2e0a 0%, #051605 100%)',
      position: 'fixed',
      inset: 0,
      zIndex: 9999
    }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '800', 
          background: 'linear-gradient(135deg, #FFD700, #4CAF50)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px'
        }}>
          MADHUVAN FARM
        </h1>
        <p style={{ color: 'var(--primary-light)', opacity: 0.7, letterSpacing: '2px', fontSize: '0.9rem' }}>
          SELECT BUSINESS MODULE
        </p>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '40px', 
        flexWrap: 'wrap', 
        justifyContent: 'center',
        padding: '20px'
      }}>
        {/* Module Card: Sugarcane */}
        <div 
          onClick={() => onSelect('sugarcane')}
          className="glass-card clickable-row animate-scale-up"
          style={{ 
            width: '300px', 
            padding: '60px 40px', 
            textAlign: 'center',
            cursor: 'pointer',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            background: 'rgba(255, 255, 255, 0.03)',
            transition: 'var(--transition-smooth)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
            e.currentTarget.style.borderColor = '#FFD700';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.2)';
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '30px' }}>🌱</div>
          <h2 style={{ color: 'var(--secondary)', marginBottom: '15px', fontSize: '1.5rem' }}>Sugarcane</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Manage Delivery, BIJANE APELI, and Bijethi Lidhel Registers.
          </p>
          <div className="btn btn-primary" style={{ marginTop: '30px', width: '100%', pointerEvents: 'none' }}>
            Open Dashboard
          </div>
        </div>

        {/* Module Card: Attendance */}
        <div 
          onClick={() => onSelect('attendance')}
          className="glass-card clickable-row animate-scale-up"
          style={{ 
            width: '300px', 
            padding: '60px 40px', 
            textAlign: 'center',
            cursor: 'pointer',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            background: 'rgba(255, 255, 255, 0.03)',
            transition: 'var(--transition-smooth)',
            animationDelay: '0.1s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
            e.currentTarget.style.borderColor = '#FFD700';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.2)';
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '30px' }}>📅</div>
          <h2 style={{ color: 'var(--secondary)', marginBottom: '15px', fontSize: '1.5rem' }}>Attendance</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Daily staff record, worker presence, and labor management.
          </p>
          <div className="btn btn-primary" style={{ marginTop: '30px', width: '100%', pointerEvents: 'none' }}>
            Open Records
          </div>
        </div>
      </div>

      <button 
        onClick={onLogout}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--text-secondary)', 
          marginTop: '60px', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem',
          opacity: 0.6
        }}
      >
        🚪 End Session
      </button>
    </div>
  );
};

export default ModuleSelection;
