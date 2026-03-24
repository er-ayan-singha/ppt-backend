import React, { useState } from 'react';
import { uploadPresentation } from '../api';

export default function UploadModal({ onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a file');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name.replace(/\.[^.]+$/, ''));

    setLoading(true);
    setError('');
    try {
      const { data } = await uploadPresentation(formData, (p) => {
        setProgress(p);
        if (p === 100) setProcessing(true);
      });
      onUploaded(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Presentation</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title (optional)</label>
            <input
              type="text"
              placeholder="e.g. Q4 Strategy Deck"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>File</label>
            <div
              className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files[0];
                if (f) setFile(f);
              }}
            >
              <input
                type="file"
                accept=".ppt,.pptx"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <div className="drop-zone-icon">📂</div>
              <div className="drop-zone-text">
                Drop your file here or <span>browse</span>
              </div>
              <div className="drop-zone-text" style={{ fontSize: '0.75rem', marginTop: '0.3rem' }}>
                .ppt, .pptx — max 50MB
              </div>
              {file && (
                <div className="drop-zone-file">
                  📎 {file.name}
                </div>
              )}
            </div>
          </div>

          {loading && (
            <div className="progress-wrap">
              <div className="progress-label">
                <span>{processing ? '⚙ Converting slides...' : 'Uploading...'}</span>
                <span>{processing ? 'please wait' : `${progress}%`}</span>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${processing ? 'progress-pulse' : ''}`}
                  style={{ width: processing ? '100%' : `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && <p className="error">⚠ {error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Uploading...' : '⬆ Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
