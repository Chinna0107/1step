import { useState, useEffect } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import './superadmin.css'

export default function SuperAdminGallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')

  const token = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin')}` })

  const fetchImages = async () => {
    setLoading(true)
    try {
      const data = await api('/gallery', { headers: token() })
      setImages(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchImages() }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    setMsg(''); setError('')
    const fd = new FormData()
    fd.append('image', file)
    fd.append('caption', caption)
    try {
      await api('/gallery', { method: 'POST', headers: token(), body: fd })
      setMsg('Image uploaded successfully')
      setFile(null)
      setCaption('')
      e.target.reset()
      fetchImages()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return
    try {
      await api(`/gallery/${id}`, { method: 'DELETE', headers: token() })
      setMsg('Image deleted')
      fetchImages()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="sa-topbar">
          <h1>Gallery Management</h1>
        </div>
        <div className="sa-main">
          {msg   && <div className="sa-alert sa-alert-success">✅ {msg}</div>}
          {error && <div className="sa-alert sa-alert-error">❌ {error}</div>}

          {/* Upload Form */}
          <div className="sa-card" style={{ marginBottom: 28 }}>
            <div className="sa-card-header"><h2>Upload Image</h2></div>
            <div className="sa-card-body">
              <form onSubmit={handleUpload}>
                <div className="sa-form-grid">
                  <div className="sa-form-group">
                    <label>Image File *</label>
                    <input type="file" accept="image/*" required
                      onChange={e => setFile(e.target.files[0])} />
                  </div>
                  <div className="sa-form-group">
                    <label>Caption (optional)</label>
                    <input placeholder="e.g. Team Event 2024" value={caption}
                      onChange={e => setCaption(e.target.value)} />
                  </div>
                </div>
                <button type="submit" className="sa-btn sa-btn-primary" disabled={uploading} style={{ marginTop: 12 }}>
                  {uploading ? 'Uploading...' : '⬆ Upload'}
                </button>
              </form>
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="sa-card">
            <div className="sa-card-header"><h2>All Images ({images.length})</h2></div>
            <div className="sa-card-body">
              {loading ? (
                <div className="sa-loading">Loading...</div>
              ) : images.length === 0 ? (
                <div className="sa-empty">No images uploaded yet</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                  {images.map(img => (
                    <div key={img.id} style={{ borderRadius: 12, overflow: 'hidden', background: '#f0f2f8', position: 'relative' }}>
                      <img src={img.url} alt={img.caption || ''} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                      {img.caption && (
                        <div style={{ padding: '8px 10px', fontSize: 12, fontWeight: 600, color: '#374151' }}>{img.caption}</div>
                      )}
                      <button
                        onClick={() => handleDelete(img.id)}
                        className="sa-btn sa-btn-danger sa-btn-sm"
                        style={{ margin: '0 10px 10px', width: 'calc(100% - 20px)' }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
