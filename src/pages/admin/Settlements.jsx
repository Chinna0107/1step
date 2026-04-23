import React, { useEffect, useState, useCallback } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import '../../pages/dashboard.css'
import { useSettlements } from '../../hooks/useFinance'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })
const fmt  = n => `₹${Number(n || 0).toLocaleString('en-IN')}`
const empty = { platform: '', amount: '', note: '' }

export default function Settlements() {
  const [all, setAll]           = useState([])
  const [tab, setTab]           = useState('pending')
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(empty)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')
  const [err, setErr]           = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const refetch = useCallback(() => {
    setLoading(true)
    api('/finance/settlements', { headers: auth() })
      .then(d => { setAll(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const handleAdd = async e => {
    e.preventDefault(); setSaving(true); setMsg(''); setErr('')
    try {
      await api('/finance/settlements', { method: 'POST', headers: auth(), body: JSON.stringify(form) })
      setMsg('Settlement added'); setForm(empty); setShowForm(false); refetch()
    } catch (e) { setErr(e.message) }
    setSaving(false)
  }

  const markReceived = async id => {
    try {
      await api(`/finance/settlements/${id}/receive`, { method: 'PATCH', headers: auth() })
      refetch()
    } catch (e) { alert(e.message) }
  }

  const rows    = all.filter(s => s.status?.toLowerCase() === tab)
  const pending = all.filter(s => s.status?.toLowerCase() === 'pending')
  const done    = all.filter(s => s.status?.toLowerCase() === 'received')

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <h1>🤝 Settlements</h1>
          <div className="dash-topbar-right">
            <button className="dash-btn dash-btn-primary" onClick={() => { setShowForm(v => !v); setMsg(''); setErr('') }}>
              {showForm ? '✕ Cancel' : '+ Add Settlement'}
            </button>
          </div>
        </div>
        <div className="dash-main">

          {msg && <div className="dash-alert dash-alert-success">✅ {msg}</div>}
          {err && <div className="dash-alert dash-alert-error">❌ {err}</div>}

          {/* Add Form */}
          {showForm && (
            <div className="dash-card" style={{ marginBottom: 20 }}>
              <div className="dash-card-header"><h2>New Settlement</h2></div>
              <div className="dash-card-body">
                <form onSubmit={handleAdd}>
                  <div className="dash-form-grid">
                    <div className="dash-form-group">
                      <label>Platform Name *</label>
                      <input required placeholder="e.g. Bankit, Finkeda" value={form.platform} onChange={e => set('platform', e.target.value)} />
                    </div>
                    <div className="dash-form-group">
                      <label>Amount (₹) *</label>
                      <input required type="number" min="1" value={form.amount} onChange={e => set('amount', e.target.value)} />
                    </div>
                    <div className="dash-form-group">
                      <label>Note</label>
                      <input placeholder="Optional" value={form.note} onChange={e => set('note', e.target.value)} />
                    </div>
                  </div>
                  <button type="submit" className="dash-btn dash-btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : '✅ Add'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Summary */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div className="dash-stat" style={{ flex: '0 0 auto', minWidth: 160, borderLeftColor: '#d97706' }}>
              <div className="dash-stat-label">Pending</div>
              <div className="dash-stat-value" style={{ color: '#d97706', fontSize: '1.4rem' }}>
                {fmt(pending.reduce((s, r) => s + parseFloat(r.amount || 0), 0))}
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{pending.length} entries</div>
            </div>
            <div className="dash-stat" style={{ flex: '0 0 auto', minWidth: 160, borderLeftColor: '#059669' }}>
              <div className="dash-stat-label">Received</div>
              <div className="dash-stat-value" style={{ color: '#059669', fontSize: '1.4rem' }}>
                {fmt(done.reduce((s, r) => s + parseFloat(r.amount || 0), 0))}
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{done.length} entries</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="dash-tabs">
            <button className={`dash-tab ${tab === 'pending'  ? 'active' : ''}`} onClick={() => setTab('pending')}>
              ⏳ Pending ({pending.length})
            </button>
            <button className={`dash-tab ${tab === 'received' ? 'active' : ''}`} onClick={() => setTab('received')}>
              ✅ Completed ({done.length})
            </button>
          </div>

          <div className="dash-card">
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Platform</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Note</th>
                      <th>Date</th>
                      {tab === 'pending' && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(r => (
                      <tr key={r.id}>
                        <td><strong>{r.platform}</strong></td>
                        <td style={{ fontWeight: 700, color: '#402070' }}>{fmt(r.amount)}</td>
                        <td>
                          <span className={`dash-status ${r.status?.toLowerCase() === 'pending' ? 'pending' : 'active'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: '#9ca3af' }}>{r.note || '—'}</td>
                        <td style={{ fontSize: 12, color: '#6b7280' }}>{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                        {tab === 'pending' && (
                          <td>
                            <button className="dash-btn dash-btn-success dash-btn-sm" onClick={() => markReceived(r.id)}>
                              ✅ Mark Received
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {!rows.length && <tr><td colSpan={6} className="dash-empty">No {tab} settlements</td></tr>}
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
