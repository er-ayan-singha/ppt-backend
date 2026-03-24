import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ onLogout }) {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">⚡ SlideVault</Link>
      <div className="navbar-center">Designed for MTech AI 2024–2026</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="navbar-dot" title="Server online" />
        <button className="btn-logout" onClick={onLogout}>Sign Out</button>
      </div>
    </nav>
  );
}
