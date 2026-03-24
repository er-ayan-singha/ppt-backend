import React, { useEffect, useState } from 'react';
import { getPresentations } from '../api';
import PresentationCard from '../components/PresentationCard';
import UploadModal from '../components/UploadModal';

export default function Home() {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getPresentations()
      .then(({ data }) => setPresentations(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUploaded = (newPres) => setPresentations((prev) => [newPres, ...prev]);
  const handleDeleted = (id) => setPresentations((prev) => prev.filter((p) => p._id !== id));

  return (
    <main className="home">
      <div className="home-header">
        <div className="home-header-text">
          <h1>Your Presentations</h1>
          <p>Upload, store and present your slides from anywhere</p>
        </div>
        <div className="home-header-right">
          <img src="/robot.png" alt="AI Robot" className="robot-img" />
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            ⬆ Upload
          </button>
        </div>
      </div>

      {!loading && presentations.length > 0 && (
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-icon">📊</span>
            <div>
              <div className="stat-value">{presentations.length}</div>
              <div className="stat-label">Presentations</div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="loading">Loading your presentations...</p>
      ) : presentations.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📭</div>
          <h2>No presentations yet</h2>
          <p>Upload your first .pptx file to get started</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>⬆ Upload Presentation</button>
        </div>
      ) : (
        <div className="grid">
          {presentations.map((p) => (
            <PresentationCard key={p._id} presentation={p} onDeleted={handleDeleted} />
          ))}
          <div className="upload-btn-large" onClick={() => setShowModal(true)}>
            <div className="upload-btn-large-icon">➕</div>
            <span>Add Presentation</span>
          </div>
        </div>
      )}

      {showModal && (
        <UploadModal onClose={() => setShowModal(false)} onUploaded={handleUploaded} />
      )}

      <div className="dev-badge">✦ developed by AYAN SINGHA</div>
    </main>
  );
}
