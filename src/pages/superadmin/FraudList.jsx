import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import '../../pages/dashboard.css'
import './superadmin.css'

const auth  = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin')}` })
const empty = { name: '', mobile: '', reason: '' }

export default function FraudList() {
  const [list, setList]       = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm]       = useState(empty)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState('')
  const [err, setErr]         = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const load = useCallback(async () => {
    setLoading(true)
    try { setList(await api('/fraud', { headers: auth() })) }
    catch (e) { setErr(e.message) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = async e => {
    e.preventDefault(); setSaving(true); setMsg(''); setErr('')
    try {
      await api('/fraud', { method: 'POST', headers: auth(), body: JSON.stringify(form) })
      setMsg('✅ Added to fraud list'); setForm(empty); setShowForm(false); load()
    } catch (e) { setErr(e.message) }
    setSaving(false)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove "${name}" from fraud list?`)) return
    try {
      await api(`/fraud/${id}`, { method: 'DELETE', headers: auth() })
      setMsg('Removed from fraud list'); load()
    } catch (e) { setErr(e.message) }
  }

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-topbar-title">🚨 Fraud List</h1>
            <p className="dash-topbar-sub">Blocked individuals — checked during customer onboarding</p>
          </div>
          <div className="dash-topbar-right">
            <button className="dash-btn dash-btn-primary" onClick={() => { setShowForm(v => !v); setMsg(''); setErr('') }}>
              {showForm ? '✕ Cancel' : '+ Add to Fraud List'}
            </button>
          </div>
        </div>

        <div className="dash-main">
          {msg && <div className="dash-alert dash-alert-success" style={{ marginBottom: 12 }}>{msg}</div>}
          {err && <div className="dash-alert dash-alert-error"   style={{ marginBottom: 12 }}>❌ {err}</div>}

          {showForm && (
            <div className="sa-card" style={{ marginBottom: 20 }}>
              <div className="sa-card-header"><h2>New Fraud Entry</h2></div>
              <div className="sa-card-body">
                <form onSubmit={handleAdd}>
                  <div className="dash-form-grid">
                    <div className="dash-form-group">
                      <label>Full Name *</label>
                      <input required placeholder="Person's full name" value={form.name}
                        onChange={e => set('name', e.target.value)} />
                    </div>
                    <div className="dash-form-group">
                      <label>Mobile Number *</label>
                      <input required placeholder="10-digit mobile" maxLength={10} value={form.mobile}
                        onChange={e => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} />
                      {form.mobile && !/^\d{10}$/.test(form.mobile) && (
                        <span style={{ fontSize: 11, color: '#dc2626' }}>Must be 10 digits</span>
                      )}
                    </div>
                    <div className="dash-form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Reason / Notes</label>
                      <input placeholder="Why is this person flagged? (optional)" value={form.reason}
                        onChange={e => set('reason', e.target.value)} />
                    </div>
                  </div>
                  <button type="submit" className="dash-btn dash-btn-primary" style={{ marginTop: 12 }}
                    disabled={saving || (form.mobile && !/^\d{10}$/.test(form.mobile))}>
                    {saving ? 'Saving...' : '🚨 Add to Fraud List'}
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="sa-card">
            <div className="sa-card-header">
              <h2>Fraud Entries ({list.length})</h2>
              <button className="dash-btn dash-btn-sm" onClick={load}
                style={{ background: '#f0f2f8', color: '#0d1f3d', border: 'none' }}>↻ Refresh</button>
            </div>
            <div className="sa-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : list.length === 0 ? (
                <div className="sa-empty" style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                  No fraud entries yet
                </div>
              ) : (
                <table className="sa-table">
                  <thead>
                    <tr><th>Name</th><th>Mobile</th><th>Reason</th><th>Added By</th><th>Date</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {list.map(f => (
                      <tr key={f.id}>
                        <td><strong style={{ color: '#dc2626' }}>🚨 {f.name}</strong></td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{f.mobile}</td>
                        <td style={{ fontSize: 12, color: '#6b7280' }}>{f.reason || '—'}</td>
                        <td style={{ fontSize: 12 }}>{f.added_by_name || '—'}</td>
                        <td style={{ fontSize: 12, color: '#9ca3af' }}>{new Date(f.created_at).toLocaleDateString('en-IN')}</td>
                        <td>
                          <button onClick={() => handleDelete(f.id, f.name)}
                            style={{ padding: '4px 12px', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                            Remove
                          </button>
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
