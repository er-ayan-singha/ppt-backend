import React from 'react';
import { useNavigate } from 'react-router-dom';
import { deletePresentation } from '../api';

export default function PresentationCard({ presentation, onDeleted }) {
  const navigate = useNavigate();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this presentation?')) return;
    try {
      await deletePresentation(presentation._id);
      onDeleted(presentation._id);
    } catch {
      alert('Failed to delete');
    }
  };

  const date = new Date(presentation.uploadedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="card" onClick={() => navigate(`/present/${presentation._id}`)}>
      <div className="card-thumb">
        <div className="card-thumb-placeholder">
          <span className="ppt-icon">📊</span>
          <span className="ppt-label">PPTX</span>
        </div>
      </div>
      <div className="card-info">
        <h3>{presentation.title}</h3>
        <div className="card-meta">
          <span>📅 {date}</span>
        </div>
      </div>
      <div className="card-actions">
        <button className="btn-delete" onClick={handleDelete} title="Delete">🗑</button>
      </div>
    </div>
  );
}
