import React, { useState } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import { useNotifications } from '../../hooks/useNotifications'
import './superadmin.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin')}` })

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return new Date(date).toLocaleDateString('en-IN')
}

const TARGET_LABELS = { all: '👥 All', admin: '🛡️ Admins Only', employee: '👤 Employees Only' }
const TARGET_COLORS = { all: '#402070', admin: '#059669', employee: '#d97706' }

export default function Notifications() {
  const { notifications, unreadCount } = useNotifications('superadmin')
  const [form, setForm]     = useState({ title: '', message: '', target: 'all', image_url: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')
  const [error, setError]   = useState('')
  const [preview, setPreview] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSend = async (e) => {
    e.preventDefault()
    setSaving(true); setMsg(''); setError('')
    try {
      await api('/notifications', {
        method: 'POST',
        headers: { ...auth(), 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setMsg('Notification sent successfully!')
      setForm({ title: '', message: '', target: 'all', image_url: '' })
      setPreview('')
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this notification?')) return
    try {
      await api(`/notifications/${id}`, { method: 'DELETE', headers: auth() })
      window.location.reload()
    } catch (e) { setError(e.message) }
  }

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="sa-topbar">
          <h1>🔔 Notifications</h1>
          <div className="sa-topbar-right">
            <span style={{ fontSize: 13, color: '#64748b' }}>
              {notifications.length} sent · {unreadCount} unread by staff
            </span>
          </div>
        </div>

        <div className="sa-main">
          {msg   && <div className="sa-alert sa-alert-success">✅ {msg}</div>}
          {error && <div className="sa-alert sa-alert-error">❌ {error}</div>}

          {/* Send Form */}
          <div className="sa-card" style={{ marginBottom: 24 }}>
            <div className="sa-card-header"><h2>📤 Send New Notification</h2></div>
            <div className="sa-card-body">
              <form onSubmit={handleSend}>
                <div className="sa-form-grid">
                  <div className="sa-form-group">
                    <label>Title *</label>
                    <input required placeholder="Notification title" value={form.title}
                      onChange={e => set('title', e.target.value)} />
                  </div>
                  <div className="sa-form-group">
                    <label>Send To *</label>
                    <select value={form.target} onChange={e => set('target', e.target.value)}>
                      <option value="all">👥 All (Admins + Employees)</option>
                      <option value="admin">🛡️ Admins Only</option>
                      <option value="employee">👤 Employees Only</option>
                    </select>
                  </div>
                  <div className="sa-form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Message *</label>
                    <textarea required rows={3} placeholder="Write your message..."
                      value={form.message} onChange={e => set('message', e.target.value)}
                      style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: 14, padding: '10px 12px', borderRadius: 8, border: '1.5px solid rgba(64,32,112,0.2)', width: '100%' }} />
                  </div>
                  <div className="sa-form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Image URL <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
                    <input placeholder="https://example.com/image.jpg"
                      value={form.image_url}
                      onChange={e => { set('image_url', e.target.value); setPreview(e.target.value.trim()) }}
                      style={{ fontFamily: 'monospace', fontSize: 13 }} />
                    {preview && (
                      <div style={{ marginTop: 10, borderRadius: 10, overflow: 'hidden', border: '1.5px solid rgba(64,32,112,0.15)', maxWidth: 360, position: 'relative' }}>
                        <img src={preview} alt="preview"
                          onError={e => { e.target.style.display = 'none' }}
                          onLoad={e => { e.target.style.display = 'block' }}
                          style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'none' }} />
                        <div style={{ position: 'absolute', top: 6, right: 6 }}>
                          <button type="button" onClick={() => { set('image_url', ''); setPreview('') }}
                            style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button type="submit" className="sa-btn sa-btn-primary" disabled={saving}>
                  {saving ? 'Sending...' : '🔔 Send Notification'}
                </button>
              </form>
            </div>
          </div>

          {/* Sent Notifications */}
          <div className="sa-card">
            <div className="sa-card-header"><h2>📋 Sent Notifications ({notifications.length})</h2></div>
            <div style={{ padding: '0 4px' }}>
              {notifications.length === 0 ? (
                <div className="sa-empty" style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>
                  No notifications sent yet
                </div>
              ) : notifications.map(n => (
                <div key={n.id} style={{ display: 'flex', gap: 14, padding: '16px 20px', borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, overflow: 'hidden' }}>
                    {n.image_url ? <img src={n.image_url} alt="" style={{ width: 40, height: 40, objectFit: 'cover' }} onError={e => { e.currentTarget.style.display='none' }} /> : '🔔'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: '#1a0a2e' }}>{n.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: TARGET_COLORS[n.target] + '20', color: TARGET_COLORS[n.target] }}>
                        {TARGET_LABELS[n.target]}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>{n.message}</div>
                    {n.image_url && (
                      <div style={{ marginTop: 10, borderRadius: 10, overflow: 'hidden', maxWidth: 320, border: '1px solid #e2e8f0' }}>
                        <img src={n.image_url} alt="notification"
                          style={{ width: '100%', maxHeight: 160, objectFit: 'cover', display: 'block' }}
                          onError={e => { e.currentTarget.parentElement.style.display = 'none' }} />
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                      {timeAgo(n.created_at)} · by {n.sent_by || '—'}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(n.id)}
                    style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
