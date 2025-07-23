// src/pages/auth/LoginPage.tsx
// 🚨 ULTRA SIMPLE: Absolute minimal login page
// File path: src/pages/auth/LoginPage.tsx

import React from 'react';

const LoginPage: React.FC = () => {
  console.log('🔄 ULTRA SIMPLE LoginPage: Rendering basic login page...');

  const handleClick = () => {
    console.log('🔄 ULTRA SIMPLE LoginPage: Login button clicked');
    alert('Login button clicked! Redirecting to dashboard...');
    window.location.href = '/dashboard';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        textAlign: 'center',
        minWidth: '300px'
      }}>
        <h1 style={{ 
          color: '#333', 
          marginBottom: '20px',
          fontSize: '28px' 
        }}>
          🔑 Kairos Login
        </h1>
        
        <p style={{ 
          color: '#666', 
          marginBottom: '30px' 
        }}>
          Click the button below to access your dashboard
        </p>
        
        <button
          onClick={handleClick}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            fontSize: '18px',
            borderRadius: '5px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          🚀 Enter Kairos Dashboard
        </button>

        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#e8f5e8',
          borderRadius: '5px',
          fontSize: '12px',
          color: '#2d5a2d'
        }}>
          ✅ Emergency login page loaded successfully!<br/>
          Time: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;