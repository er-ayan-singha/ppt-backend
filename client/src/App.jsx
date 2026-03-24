import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Present from './pages/Present';
import Login from './pages/Login';
import Navbar from './components/Navbar';

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('auth'));

  const handleLogin = () => setAuthed(true);
  const handleLogout = () => {
    localStorage.removeItem('auth');
    setAuthed(false);
  };

  if (!authed) return <Login onLogin={handleLogin} />;

  return (
    <div className="app">
      <Navbar onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/present/:id" element={<Present />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
