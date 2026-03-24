import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPresentation } from '../api';

export default function Present() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    getPresentation(id)
      .then(({ data }) => setPresentation(data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const slides = presentation?.slides || [];
  const total = slides.length;
  const useOfficeViewer = total === 0; // Fallback to Office Online if no slides

  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);
  const next = useCallback(() => setCurrent((c) => Math.min(total - 1, c + 1)), [total]);

  useEffect(() => {
    if (useOfficeViewer) return; // Office viewer has its own controls
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev();
      if (e.key === 'Escape') setFullscreen(false);
      if (e.key === 'f') setFullscreen((f) => !f);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev, useOfficeViewer]);

  if (loading) return <p className="loading">Loading presentation...</p>;
  if (!presentation) return null;

  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(presentation.cloudinaryUrl)}`;

  return (
    <div className={`presenter ${fullscreen ? 'fullscreen' : ''}`}>
      <div className="presenter-header">
        <button className="btn-secondary" onClick={() => navigate('/')}>← Back</button>
        <h2>📊 {presentation.title}</h2>
        <div className="presenter-header-actions">
          {!useOfficeViewer && <span className="slide-counter-header">{current + 1} / {total}</span>}
          <a href={presentation.cloudinaryUrl} target="_blank" rel="noreferrer" className="btn-secondary">⬇ Download</a>
          <button className="btn-secondary" onClick={() => setFullscreen((f) => !f)}>
            {fullscreen ? '⊠ Exit' : '⛶ Fullscreen'}
          </button>
        </div>
      </div>

      {useOfficeViewer ? (
        // Office Online viewer fallback
        <div className="slide-wrapper">
          <iframe
            src={officeViewerUrl}
            title={presentation.title}
            className="office-viewer"
            frameBorder="0"
            allowFullScreen
          />
        </div>
      ) : (
        // Custom slide viewer with images
        <>
          <div className="slide-wrapper">
            <button className="slide-nav-btn slide-nav-prev" onClick={prev} disabled={current === 0}>‹</button>
            <div className="slide-stage">
              {slides[current] && (
                <img
                  key={current}
                  src={slides[current]}
                  alt={`Slide ${current + 1}`}
                  className="slide-img"
                />
              )}
            </div>
            <button className="slide-nav-btn slide-nav-next" onClick={next} disabled={current === total - 1}>›</button>
          </div>

          <div className="thumbnails">
            {slides.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Slide ${i + 1}`}
                className={`thumb ${i === current ? 'active' : ''}`}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
