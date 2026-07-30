import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import './Gallery.css'

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    api('/gallery/public')
      .then(data => setImages(data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="gallery-page">
      <div className="gallery-hero">
        <span className="gallery-badge">Our Gallery</span>
        <h1>Moments & Milestones</h1>
        <p>A glimpse into our journey, team, and the communities we serve.</p>
      </div>

      <div className="gallery-container">
        {loading ? (
          <div className="gallery-loading">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="gallery-skeleton" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="gallery-empty">No images yet. Check back soon!</div>
        ) : (
          <div className="gallery-grid">
            {images.map((img, i) => (
              <div key={img.id} className="gallery-item" onClick={() => setLightbox(i)}>
                <img src={img.url} alt={img.caption || ''} loading="lazy" />
                {img.caption && <div className="gallery-caption">{img.caption}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {lightbox !== null && (
        <div className="gallery-lightbox" onClick={() => setLightbox(null)}>
          <button className="lb-close" onClick={() => setLightbox(null)}>✕</button>
          <button className="lb-prev" onClick={e => { e.stopPropagation(); setLightbox(prev => (prev - 1 + images.length) % images.length) }}>‹</button>
          <img src={images[lightbox].url} alt={images[lightbox].caption || ''} onClick={e => e.stopPropagation()} />
          {images[lightbox].caption && <p className="lb-caption">{images[lightbox].caption}</p>}
          <button className="lb-next" onClick={e => { e.stopPropagation(); setLightbox(prev => (prev + 1) % images.length) }}>›</button>
        </div>
      )}
    </div>
  )
}
