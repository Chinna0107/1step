import { useState } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { useMasterTable } from '../../hooks/useSuperAdmin'
import './superadmin.css'

const SERVICE_ICONS = {
  'Card Withdrawal':        '💳',
  'Bill Pay + Withdrawal':  '📄',
  'Only Bill Payment':      '🧾',
  'Money Transfer (DMT)':   '💸',
  'AEPS':                   '🏧',
}

export default function ServicesData() {
  const { rows, loading, error, msg, add, toggle, remove } = useMasterTable('service_types')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ name: '', commission: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    const ok = await add({ name: form.name.trim(), commission: parseFloat(form.commission) || 0 })
    if (ok) { setForm({ name: '', commission: '' }); setShowForm(false) }
    setSubmitting(false)
  }

  const active   = rows.filter(s => s.is_active)
  const inactive = rows.filter(s => !s.is_active)

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="sa-topbar">
          <h1>Manage Services</h1>
          <div className="sa-topbar-right">
            <button className="sa-btn sa-btn-primary" onClick={() => setShowForm(v => !v)}>
              {showForm ? '✕ Cancel' : '+ Add Service'}
            </button>
          </div>
        </div>

        <div className="sa-main">
          {msg   && <div className="sa-alert sa-alert-success">✅ {msg}</div>}
          {error && <div className="sa-alert sa-alert-error">❌ {error}</div>}

          {showForm && (
            <div className="sa-card" style={{ marginBottom: 24 }}>
              <div className="sa-card-header"><h2>New Service Type</h2></div>
              <div className="sa-card-body">
                <form onSubmit={handleSubmit}>
                  <div className="sa-form-grid">
                    <div className="sa-form-group">
                      <label>Service Name *</label>
                      <input required placeholder="e.g. Card Withdrawal" value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="sa-form-group">
                      <label>Commission % *</label>
                      <input required type="number" min="0" step="0.01" placeholder="e.g. 1.20"
                        value={form.commission} onChange={e => setForm({ ...form, commission: e.target.value })} />
                    </div>
                  </div>
                  <button type="submit" className="sa-btn sa-btn-primary" disabled={submitting}>
                    {submitting ? 'Adding...' : '✅ Add Service'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <div className="sa-stat-mini" style={{ borderColor: '#059669' }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <div><div className="sa-stat-mini-val">{active.length}</div><div className="sa-stat-mini-label">Active Services</div></div>
            </div>
            <div className="sa-stat-mini" style={{ borderColor: '#dc2626' }}>
              <span style={{ fontSize: 20 }}>🚫</span>
              <div><div className="sa-stat-mini-val">{inactive.length}</div><div className="sa-stat-mini-label">Blocked Services</div></div>
            </div>
            <div className="sa-stat-mini" style={{ borderColor: '#0d1f3d' }}>
              <span style={{ fontSize: 20 }}>📋</span>
              <div><div className="sa-stat-mini-val">{rows.length}</div><div className="sa-stat-mini-label">Total Services</div></div>
            </div>
          </div>

          <div className="sa-card">
            <div className="sa-card-header">
              <h2>All Service Types ({rows.length})</h2>
              <span style={{ fontSize: 12, color: '#64748b' }}>Blocked services won't appear in employee transactions</span>
            </div>
            <div className="sa-table-wrap">
              {loading ? (
                <div className="sa-loading">Loading services...</div>
              ) : rows.length === 0 ? (
                <div className="sa-empty">No services found</div>
              ) : (
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Commission</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(s => (
                      <tr key={s.id} style={{ opacity: s.is_active ? 1 : 0.55 }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 22 }}>{SERVICE_ICONS[s.name] || '🔧'}</span>
                            <div>
                              <strong style={{ color: s.is_active ? '#081427' : '#94a3b8' }}>{s.name}</strong>
                              {!s.is_active && (
                                <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>🚫 Blocked — hidden from employees</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#0d1f3d', fontSize: 15 }}>{s.commission}%</span>
                        </td>
                        <td>
                          <span className={`sa-status ${s.is_active ? 'active' : 'inactive'}`}>
                            {s.is_active ? '✅ Active' : '🚫 Blocked'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className={`sa-btn sa-btn-sm ${s.is_active ? 'sa-btn-warning' : 'sa-btn-success'}`}
                              onClick={() => toggle(s.id)}>
                              {s.is_active ? '🚫 Block' : '✅ Unblock'}
                            </button>
                            <button className="sa-btn sa-btn-danger sa-btn-sm"
                              onClick={() => { if (window.confirm(`Delete "${s.name}"?`)) remove(s.id) }}>
                              🗑 Delete
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

          {inactive.length > 0 && (
            <div className="sa-card" style={{ borderLeft: '4px solid #dc2626' }}>
              <div className="sa-card-header"><h2>⚠️ Blocked Services</h2></div>
              <div className="sa-card-body">
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px' }}>
                  These services are currently hidden from all employees during transactions.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {inactive.map(s => (
                    <div key={s.id} style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{SERVICE_ICONS[s.name] || '🔧'}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>{s.name}</span>
                      <button onClick={() => toggle(s.id)}
                        style={{ background: '#fff', border: '1px solid #dc2626', color: '#dc2626', borderRadius: 5, padding: '2px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
