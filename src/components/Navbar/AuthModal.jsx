import React, { useState } from 'react';
import api from '../../api/axiosConfig';

const AuthModal = ({ isOpen, onClose, isLoginView, setIsLoginView, setUser }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLoginView ? '/auth/login' : '/auth/signup';
    try {
      const res = await api.post(endpoint, formData);
      if (isLoginView) {
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
        onClose();
      } else {
        alert("Account created! Please login.");
        setIsLoginView(true);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Auth Error");
    }
  };

  const inputStyle = {
    width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
    borderRadius: 'var(--radius-md)', padding: '13px 16px', fontSize: 13,
    outline: 'none', color: 'var(--text-primary)',
    transition: 'border-color var(--transition-base), box-shadow var(--transition-base)',
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <div className="animate-fade-in" style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
    }}>
      <div className="animate-scale-in" style={{
        width: 400, background: 'var(--bg-glass)', backdropFilter: 'blur(24px) saturate(1.5)',
        border: '1px solid var(--border-glass)', padding: 32,
        borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-lg)',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 20, right: 20,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 18, fontWeight: 300,
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
        >
          ×
        </button>

        <h2 style={{
          fontSize: 24, fontWeight: 900, color: 'var(--text-primary)',
          marginBottom: 4, textTransform: 'uppercase', letterSpacing: '-0.02em',
        }}>
          {isLoginView ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{
          fontSize: 10, color: 'var(--text-muted)', fontWeight: 700,
          marginBottom: 28, textTransform: 'uppercase', letterSpacing: '0.2em',
        }}>
          {isLoginView ? 'Login to access your permanent brain' : 'Join to start building your memory'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!isLoginView && (
            <input
              type="text" placeholder="Full Name" style={inputStyle}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onFocus={e => { e.target.style.borderColor = 'var(--border-accent)'; e.target.style.boxShadow = 'var(--shadow-glow-cyan)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-glass)'; e.target.style.boxShadow = 'none'; }}
            />
          )}
          <input
            type="email" placeholder="Email Address" style={inputStyle}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            onFocus={e => { e.target.style.borderColor = 'var(--border-accent)'; e.target.style.boxShadow = 'var(--shadow-glow-cyan)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border-glass)'; e.target.style.boxShadow = 'none'; }}
          />
          <input
            type="password" placeholder="Password" style={inputStyle}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            onFocus={e => { e.target.style.borderColor = 'var(--border-accent)'; e.target.style.boxShadow = 'var(--shadow-glow-cyan)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border-glass)'; e.target.style.boxShadow = 'none'; }}
          />

          <button
            type="submit"
            style={{
              width: '100%', padding: '14px 0', borderRadius: 'var(--radius-lg)',
              background: 'var(--accent-cyan)', color: '#000', border: 'none',
              fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em',
              cursor: 'pointer', marginTop: 8,
              transition: 'all var(--transition-base)',
              boxShadow: '0 4px 16px rgba(6,182,212,0.3)',
            }}
            onMouseEnter={e => { e.target.style.transform = 'scale(1.02)'; e.target.style.boxShadow = '0 8px 24px rgba(6,182,212,0.4)'; }}
            onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 4px 16px rgba(6,182,212,0.3)'; }}
          >
            {isLoginView ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: 'var(--text-muted)' }}>
          {isLoginView ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLoginView(!isLoginView)}
            style={{
              color: 'var(--accent-cyan)', fontWeight: 700, background: 'none',
              border: 'none', cursor: 'pointer', textDecoration: 'none',
              transition: 'opacity var(--transition-fast)',
            }}
            onMouseEnter={e => e.target.style.opacity = '0.8'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            {isLoginView ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;