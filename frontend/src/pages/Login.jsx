// src/pages/Login.jsx — Stunning glassmorphism login page
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { label: 'Admin', username: 'admin', password: 'admin123', role: 'admin', icon: '👑', color: '#f59e0b' },
  { label: 'User',  username: 'user',  password: 'user123',  role: 'user',  icon: '👤', color: '#6366f1' },
];

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [shake, setShake]       = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [particles, setParticles] = useState([]);

  // Redirect if already logged in
  useEffect(() => { if (user) navigate(from, { replace: true }); }, [user]);

  // Generate floating particles
  useEffect(() => {
    const pts = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 6,
      opacity: Math.random() * 0.25 + 0.05,
    }));
    setParticles(pts);
  }, []);

  const fillDemo = (acc) => {
    setUsername(acc.username);
    setPassword(acc.password);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      triggerShake();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const loggedUser = await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  return (
    <div className="login-bg">
      {/* Animated gradient orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      {/* Floating particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="login-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Grid overlay */}
      <div className="login-grid" />

      {/* Card */}
      <div className={`login-card ${shake ? 'shake' : ''}`}>

        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">🪑</div>
          <div>
            <div className="login-logo-title">AI Export Advisor</div>
            <div className="login-logo-sub">Sri Venkata Sai Furniture Works</div>
          </div>
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to your workspace</p>
        </div>

        {/* Demo quick-fill chips */}
        <div className="login-demo-label">Quick access</div>
        <div className="login-demo-chips">
          {DEMO_ACCOUNTS.map(acc => (
            <button
              key={acc.role}
              type="button"
              className="login-demo-chip"
              style={{ '--chip-color': acc.color }}
              onClick={() => fillDemo(acc)}
            >
              <span>{acc.icon}</span>
              <span>{acc.label}</span>
              <span className="chip-hint">{acc.username}</span>
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>

          {/* Username */}
          <div className="login-field">
            <label htmlFor="login-username" className="login-field-label">Username</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">👤</span>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                className={`login-input ${error ? 'input-error' : ''}`}
                autoComplete="username"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="login-password" className="login-field-label">Password</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">🔒</span>
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={`login-input ${error ? 'input-error' : ''}`}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="login-show-pass"
                onClick={() => setShowPass(s => !s)}
                tabIndex={-1}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="login-error" role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Submit */}
          <button
            id="login-submit-btn"
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-spinner" />
                Signing in…
              </>
            ) : (
              <>
                <span>🚀</span> Sign In
              </>
            )}
          </button>
        </form>

        {/* Role info */}
        <div className="login-roles">
          {DEMO_ACCOUNTS.map(acc => (
            <div key={acc.role} className="login-role-badge" style={{ '--chip-color': acc.color }}>
              <span>{acc.icon}</span>
              <div>
                <div className="role-name">{acc.label}</div>
                <div className="role-desc">
                  {acc.role === 'admin' ? 'Full access incl. Analytics' : 'Generate & view reports'}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
