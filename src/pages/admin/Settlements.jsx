import React, { useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useSettlements } from '../../hooks/useFinance'
import '../../pages/dashboard.css'

const fmt   = n => Number(parseFloat(n)||0).toLocaleString('en-IN')
const empty = { platform: '', amount: '', note: '' }

export default function Settlements() {
  const { settlements: all, loading, msg: hookMsg, error: hookErr, create, receive, refetch } = useSettlements()
  const [tab, setTab]           = useState('pending')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(empty)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')
  const [err, setErr]           = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAdd = async e => {
    e.preventDefault(); setSaving(true); setMsg(''); setErr('')
    try {
      await create(form)
      setMsg('✅ Settlement added'); setForm(empty); setShowForm(false)
    } catch (ex) { setErr(ex.message) }
    setSaving(false)
  }

  const markReceived = async id => {
    try { await receive(id) } catch (ex) { alert(ex.message) }
  }

  const pending  = all.filter(s => s.status?.toLowerCase() === 'pending')
  const done     = all.filter(s => s.status?.toLowerCase() === 'received')
  const rows     = tab === 'pending' ? pending : done

  const pendingAmt  = pending.reduce((s, r) => s + parseFloat(r.amount||0), 0)
  const receivedAmt = done.reduce((s, r) => s + parseFloat(r.amount||0), 0)

  const displayMsg = msg || hookMsg
  const displayErr = err || hookErr

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <div>
            <h1>🤝 Settlements</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>Track platform settlement payments — pending and received</p>
          </div>
          <div className="dash-topbar-right">
            <button className="dash-btn dash-btn-primary" onClick={() => { setShowForm(v => !v); setMsg(''); setErr('') }}>
              {showForm ? '✕ Cancel' : '+ Add Settlement'}
            </button>
          </div>
        </div>
        <div className="dash-main">

          {displayMsg && <div className="dash-alert dash-alert-success" style={{ marginBottom: 12 }}>{displayMsg}</div>}
          {displayErr && <div className="dash-alert dash-alert-error"   style={{ marginBottom: 12 }}>❌ {displayErr}</div>}

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
          <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 20 }}>
            <div className="dash-stat" style={{ borderTop: '3px solid #d97706' }}>
              <div className="dash-stat-label">⏳ Pending</div>
              <div className="dash-stat-value" style={{ color: '#d97706' }}>₹{fmt(pendingAmt)}</div>
              <div className="dash-stat-sub">{pending.length} settlements</div>
            </div>
            <div className="dash-stat" style={{ borderTop: '3px solid #059669' }}>
              <div className="dash-stat-label">✅ Received</div>
              <div className="dash-stat-value" style={{ color: '#059669' }}>₹{fmt(receivedAmt)}</div>
              <div className="dash-stat-sub">{done.length} settlements</div>
            </div>
            <div className="dash-stat" style={{ borderTop: '3px solid #0d1f3d' }}>
              <div className="dash-stat-label">📊 Total</div>
              <div className="dash-stat-value" style={{ color: '#0d1f3d' }}>₹{fmt(pendingAmt + receivedAmt)}</div>
              <div className="dash-stat-sub">{all.length} total</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="dash-tabs">
            <button className={`dash-tab ${tab === 'pending'  ? 'active' : ''}`} onClick={() => setTab('pending')}>⏳ Pending ({pending.length})</button>
            <button className={`dash-tab ${tab === 'received' ? 'active' : ''}`} onClick={() => setTab('received')}>✅ Received ({done.length})</button>
          </div>

          <div className="dash-card">
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Platform</th><th>Amount</th><th>Status</th><th>Note</th><th>Date</th>
                      {tab === 'pending' && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(r => (
                      <tr key={r.id}>
                        <td><strong>{r.platform}</strong></td>
                        <td style={{ fontWeight: 700, color: '#0d1f3d' }}>₹{fmt(r.amount)}</td>
                        <td>
                          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: r.status === 'pending' ? '#fef3c7' : '#d1fae5', color: r.status === 'pending' ? '#d97706' : '#059669' }}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: '#9ca3af' }}>{r.note || '—'}</td>
                        <td style={{ fontSize: 12, color: '#6b7280' }}>{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                        {tab === 'pending' && (
                          <td>
                            <button className="dash-btn dash-btn-success dash-btn-sm" onClick={() => markReceived(r.id)}>✅ Mark Received</button>
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
