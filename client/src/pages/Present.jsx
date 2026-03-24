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

  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);
  const next = useCallback(() => setCurrent((c) => Math.min(total - 1, c + 1)), [total]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev();
      if (e.key === 'Escape') setFullscreen(false);
      if (e.key === 'f') setFullscreen((f) => !f);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  if (loading) return <p className="loading">Loading presentation...</p>;
  if (!presentation) return null;

  return (
    <div className={`presenter ${fullscreen ? 'fullscreen' : ''}`}>
      <div className="presenter-header">
        <button className="btn-secondary" onClick={() => navigate('/')}>← Back</button>
        <h2>📊 {presentation.title}</h2>
        <div className="presenter-header-actions">
          <span className="slide-counter-header">{current + 1} / {total}</span>
          <a href={presentation.cloudinaryUrl} target="_blank" rel="noreferrer" className="btn-secondary">⬇ Download</a>
          <button className="btn-secondary" onClick={() => setFullscreen((f) => !f)}>
            {fullscreen ? '⊠ Exit' : '⛶ Fullscreen'}
          </button>
        </div>
      </div>

      <div className="slide-wrapper">
        {/* Prev button */}
        <button
          className="slide-nav-btn slide-nav-prev"
          onClick={prev}
          disabled={current === 0}
        >‹</button>

        {/* Slide image */}
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

        {/* Next button */}
        <button
          className="slide-nav-btn slide-nav-next"
          onClick={next}
          disabled={current === total - 1}
        >›</button>
      </div>

      {/* Thumbnail strip */}
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
    </div>
  );
}
