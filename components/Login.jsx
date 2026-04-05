"use client";

import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';

const Login = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Using a default email so the user only has to enter the "Business Key" (password)
      await login('admin@madhuvan.farm', password);
    } catch (err) {
      console.error(err);
      // Expose the actual Supabase error message
      setError(`❌ ${err.message || 'Connection Error'}`);
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'radial-gradient(circle at center, #0a2e0a 0%, #051605 100%)',
      position: 'fixed',
      inset: 0,
      zIndex: 99999
    }}>
      <div className="glass-card animate-fade-in" style={{ 
        width: '90%', 
        maxWidth: '400px', 
        padding: '50px 40px', 
        textAlign: 'center',
        border: '1px solid rgba(255, 215, 0, 0.2)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        background: 'rgba(10, 30, 30, 0.9)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🌿</div>
          <h1 style={{ 
            fontSize: '2.2rem', 
            fontWeight: '800', 
            background: 'linear-gradient(135deg, #FFD700, #4CAF50)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            marginBottom: '5px'
          }}>
            MADHUVAN FARM
          </h1>
          <p style={{ color: 'var(--primary-light)', opacity: 0.7, fontSize: '0.9rem', letterSpacing: '2px' }}>
            BUSINESS REGISTER
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ position: 'relative', marginBottom: '25px' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Enter Business Key" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              style={{ 
                width: '100%', 
                padding: '16px 20px', 
                paddingRight: '50px',
                textAlign: 'center',
                fontSize: '1.2rem',
                letterSpacing: (showPassword || !password) ? '0' : '8px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                color: 'white',
                transition: 'var(--transition-normal)'
              }}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ 
                position: 'absolute', 
                right: '15px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                opacity: 0.6
              }}
            >
              {showPassword ? "👁️" : "🙈"}
            </button>
          </div>

          {error && <p style={{ color: '#ff453a', fontSize: '0.85rem', marginBottom: '20px' }}>{error}</p>}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem', fontWeight: '700', borderRadius: '12px', background: 'var(--secondary)', color: '#051605' }}
          >
            Unlock Dashboard
          </button>
        </form>

        <p style={{ 
          color: 'var(--text-secondary)', 
          marginTop: '30px', 
          fontSize: '0.8rem',
          opacity: 0.6
        }}>
          Authorized Access Only
        </p>
      </div>
    </div>
  );
};

export default Login;
