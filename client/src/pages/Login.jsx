import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      if (username === 'ayan' && password === 'ayan') {
        localStorage.setItem('auth', 'true');
        onLogin();
      } else {
        setError('Invalid credentials. Please try again.');
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }
      setLoading(false);
    }, 700);
  };

  return (
    <div className="login-page">
      {/* Animated orbs */}
      <div className="login-orb orb1" />
      <div className="login-orb orb2" />
      <div className="login-orb orb3" />

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <div key={i} className="particle" style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 8}s`,
          animationDuration: `${6 + Math.random() * 6}s`,
          width: `${2 + Math.random() * 4}px`,
          height: `${2 + Math.random() * 4}px`,
          top: `${Math.random() * 100}%`,
        }} />
      ))}

      <div className={`login-card ${shake ? 'shake' : ''}`}>
        {/* Top accent bar */}
        <div className="login-card-bar" />

        {/* Left decorative panel */}
        <div className="login-left">
          <div className="login-left-content">
            <div className="login-left-icon">📊</div>
            <h2>SlideVault</h2>
            <p>Your AI-powered presentation platform for MTech AI 2024–2026</p>
            <div className="login-left-dots">
              <span /><span /><span />
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="login-right">
          <div className="login-header">
            <h1>Welcome back</h1>
            <p>Sign in to access your presentations</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Username */}
            <div className="login-field">
              <label>Username</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">👤</span>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label>Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">🔒</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPass((s) => !s)}
                  tabIndex={-1}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {/* Password strength dots */}
              <div className="pass-strength">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`pass-dot ${password.length > i * 2 ? 'active' : ''}`}
                  />
                ))}
                <span>{password.length === 0 ? '' : password.length < 4 ? 'Weak' : password.length < 6 ? 'Fair' : 'Strong'}</span>
              </div>
            </div>

            {error && (
              <div className="login-error">
                <span>⚠</span> {error}
              </div>
            )}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <span className="login-spinner" />
              ) : (
                <>Sign In <span>→</span></>
              )}
            </button>
          </form>

          <p className="login-credit">✦ developed by AYAN SINGHA</p>
        </div>
      </div>
    </div>
  );
}
