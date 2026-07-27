import { useState, useEffect } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import './superadmin.css'

export default function CareersData() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', tagline: '', description: '', features: '', imgFile: null })
  const [submitting, setSubmitting] = useState(false)

  const fetchCareers = async () => {
    setLoading(true)
    try {
      const data = await api('/careers/all', {
        headers: { Authorization: `Bearer ${getTokenByRole('superadmin')}` }
      })
      setRows(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCareers()
  }, [])

  const handleEdit = (job) => {
    setEditingId(job.id)
    setForm({
      title: job.title,
      tagline: job.tagline || '',
      description: job.description || '',
      features: (job.features || []).map(f => f.label).join(', '),
      imgFile: null
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting?')) return
    try {
      await api(`/careers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getTokenByRole('superadmin')}` }
      })
      setMsg('Job deleted successfully')
      fetchCareers()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleToggle = async (id, currentStatus) => {
    try {
      // Find current job
      const job = rows.find(r => r.id === id)
      if (!job) return
      
      await api(`/careers/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getTokenByRole('superadmin')}` },
        body: JSON.stringify({ ...job, is_active: !currentStatus })
      })
      fetchCareers()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    setMsg(''); setError('')
    
    const featuresArr = form.features.split(',').map(f => f.trim()).filter(Boolean).map(f => ({ label: f }))

    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('tagline', form.tagline)
    formData.append('description', form.description)
    formData.append('features', JSON.stringify(featuresArr))
    if (form.imgFile) formData.append('img', form.imgFile)

    try {
      if (editingId) {
        const existingJob = rows.find(r => r.id === editingId)
        formData.append('is_active', existingJob ? existingJob.is_active : true)
        
        await api(`/careers/${editingId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${getTokenByRole('superadmin')}` },
          body: formData
        })
        setMsg('Job updated successfully')
      } else {
        formData.append('is_active', true)
        
        await api('/careers', {
          method: 'POST',
          headers: { Authorization: `Bearer ${getTokenByRole('superadmin')}` },
          body: formData
        })
        setMsg('Job created successfully')
      }
      setForm({ title: '', tagline: '', description: '', features: '', imgFile: null })
      setShowForm(false)
      setEditingId(null)
      fetchCareers()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const active = rows.filter(s => s.is_active)
  const inactive = rows.filter(s => !s.is_active)

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="sa-topbar">
          <h1>Manage Careers</h1>
          <div className="sa-topbar-right">
            <button className="sa-btn sa-btn-primary" onClick={() => {
              setShowForm(v => !v)
              if (editingId) {
                setEditingId(null)
                setForm({ title: '', tagline: '', description: '', features: '', imgFile: null })
              }
            }}>
              {showForm ? '✕ Cancel' : '+ Post Job'}
            </button>
          </div>
        </div>

        <div className="sa-main">
          {msg   && <div className="sa-alert sa-alert-success">✅ {msg}</div>}
          {error && <div className="sa-alert sa-alert-error">❌ {error}</div>}

          {showForm && (
            <div className="sa-card" style={{ marginBottom: 24 }}>
              <div className="sa-card-header"><h2>{editingId ? 'Edit Job' : 'New Job Posting'}</h2></div>
              <div className="sa-card-body">
                <form onSubmit={handleSubmit}>
                  <div className="sa-form-grid">
                    <div className="sa-form-group">
                      <label>Job Title *</label>
                      <input required placeholder="e.g. Operations Manager" value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div className="sa-form-group">
                      <label>Tagline</label>
                      <input placeholder="e.g. Ensure smooth transactions" value={form.tagline}
                        onChange={e => setForm({ ...form, tagline: e.target.value })} />
                    </div>
                  </div>
                  <div className="sa-form-group" style={{ marginTop: 15 }}>
                    <label>Description *</label>
                    <textarea required placeholder="Job description..." rows="4" value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })} 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}/>
                  </div>
                  <div className="sa-form-grid" style={{ marginTop: 15 }}>
                    <div className="sa-form-group">
                      <label>Features (comma separated)</label>
                      <input placeholder="e.g. Leadership Role, Work from Home" value={form.features}
                        onChange={e => setForm({ ...form, features: e.target.value })} />
                    </div>
                    <div className="sa-form-group">
                      <label>Job Image (Upload)</label>
                      <input type="file" accept="image/*"
                        onChange={e => setForm({ ...form, imgFile: e.target.files[0] })} />
                      {editingId && !form.imgFile && <small style={{ color: '#666' }}>Leave empty to keep existing image</small>}
                    </div>
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <button type="submit" className="sa-btn sa-btn-primary" disabled={submitting}>
                      {submitting ? 'Saving...' : (editingId ? '✅ Update Job' : '✅ Post Job')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <div className="sa-stat-mini" style={{ borderColor: '#059669' }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <div><div className="sa-stat-mini-val">{active.length}</div><div className="sa-stat-mini-label">Active Jobs</div></div>
            </div>
            <div className="sa-stat-mini" style={{ borderColor: '#dc2626' }}>
              <span style={{ fontSize: 20 }}>🚫</span>
              <div><div className="sa-stat-mini-val">{inactive.length}</div><div className="sa-stat-mini-label">Hidden Jobs</div></div>
            </div>
          </div>

          <div className="sa-card">
            <div className="sa-card-header">
              <h2>All Job Postings ({rows.length})</h2>
            </div>
            <div className="sa-table-wrap">
              {loading ? (
                <div className="sa-loading">Loading jobs...</div>
              ) : rows.length === 0 ? (
                <div className="sa-empty">No jobs found</div>
              ) : (
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Tagline</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(s => (
                      <tr key={s.id} style={{ opacity: s.is_active ? 1 : 0.6 }}>
                        <td><strong>{s.title}</strong></td>
                        <td>{s.tagline}</td>
                        <td>
                          <span className={`sa-status ${s.is_active ? 'active' : 'inactive'}`}>
                            {s.is_active ? '✅ Active' : '🚫 Hidden'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="sa-btn sa-btn-primary sa-btn-sm" onClick={() => handleEdit(s)}>
                              Edit
                            </button>
                            <button
                              className={`sa-btn sa-btn-sm ${s.is_active ? 'sa-btn-warning' : 'sa-btn-success'}`}
                              onClick={() => handleToggle(s.id, s.is_active)}>
                              {s.is_active ? 'Hide' : 'Show'}
                            </button>
                            <button className="sa-btn sa-btn-danger sa-btn-sm" onClick={() => handleDelete(s.id)}>
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
