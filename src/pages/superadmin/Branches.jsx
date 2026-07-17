import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import {
  MdStorefront, MdRefresh, MdAdd, MdTrendingUp,
  MdPeople, MdAccountBalanceWallet, MdMonetizationOn,
  MdCheckCircle, MdCancel, MdLocationOn, MdPerson,
  MdBarChart, MdToday
} from 'react-icons/md'
import './superadmin.css'
import './Dashboard.css'

const auth   = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin')}` })
const fmtVal = n => { const v = parseFloat(n); if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${Number(v).toLocaleString('en-IN')}` }
const fmt    = n => Number(n).toLocaleString('en-IN')

const empty = { name: '', city: '', manager: '', address: '' }

function StatMini({ icon, label, value, color }) {
  return (
    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#081427' }}>{value}</div>
      </div>
    </div>
  )
}

export default function Branches() {
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [msg, setMsg]           = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(empty)
  const [saving, setSaving]     = useState(false)
  const [selected, setSelected] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const refetch = useCallback(() => {
    setLoading(true); setError('')
    api('/dashboard/branches/stats', { headers: auth() })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const handleAdd = async e => {
    e.preventDefault(); setSaving(true); setMsg(''); setError('')
    try {
      await api('/dashboard/branches', { method: 'POST', headers: auth(), body: JSON.stringify(form) })
      setMsg('Branch created successfully'); setForm(empty); setShowForm(false); refetch()
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  const toggleBranch = async (id) => {
    try {
      await api(`/dashboard/branches/${id}/toggle`, { method: 'PATCH', headers: auth() })
      refetch()
    } catch (e) { setError(e.message) }
  }

  const branches = data?.branches ?? []
  const active   = branches.filter(b => b.is_active)
  const totalTxnToday  = branches.reduce((s, b) => s + b.txnToday, 0)
  const totalValToday  = branches.reduce((s, b) => s + b.valToday, 0)
  const totalProfToday = branches.reduce((s, b) => s + b.profToday, 0)
  const maxTxn = Math.max(1, ...branches.map(b => b.txnToday))

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-topbar-title">Branch Management</h1>
            <p className="dash-topbar-sub">Real-time branch intelligence · {data?.today}</p>
          </div>
          <div className="dash-topbar-right">
            <button className="dash-icon-btn" onClick={refetch} title="Refresh"><MdRefresh size={18} /></button>
            <button className="sa-btn sa-btn-primary" onClick={() => setShowForm(v => !v)}>
              <MdAdd /> {showForm ? 'Cancel' : 'Add Branch'}
            </button>
          </div>
        </div>

        <div className="dash-main">
          {msg   && <div className="sa-alert sa-alert-success">✅ {msg}</div>}
          {error && <div className="sa-alert sa-alert-error">❌ {error}</div>}

          {/* ── Summary Stats ── */}
          <div className="dash-stats-row" style={{ marginBottom: 24 }}>
            <div className="dash-stat" style={{ '--c': '#0d1f3d' }}>
              <div className="dash-stat-icon"><MdStorefront /></div>
              <div className="dash-stat-body">
                <span className="dash-stat-label">Active Branches</span>
                <span className="dash-stat-value">{loading ? '—' : active.length}</span>
                <span className="dash-stat-sub">of {branches.length} total</span>
              </div>
            </div>
            <div className="dash-stat" style={{ '--c': '#1a365d' }}>
              <div className="dash-stat-icon"><MdBarChart /></div>
              <div className="dash-stat-body">
                <span className="dash-stat-label">Txns Today</span>
                <span className="dash-stat-value">{loading ? '—' : fmt(totalTxnToday)}</span>
                <span className="dash-stat-sub">across all branches</span>
              </div>
            </div>
            <div className="dash-stat" style={{ '--c': '#059669' }}>
              <div className="dash-stat-icon"><MdAccountBalanceWallet /></div>
              <div className="dash-stat-body">
                <span className="dash-stat-label">Value Today</span>
                <span className="dash-stat-value">{loading ? '—' : fmtVal(totalValToday)}</span>
                <span className="dash-stat-sub">total processed</span>
              </div>
            </div>
            <div className="dash-stat" style={{ '--c': '#d4af37' }}>
              <div className="dash-stat-icon"><MdMonetizationOn /></div>
              <div className="dash-stat-body">
                <span className="dash-stat-label">Profit Today</span>
                <span className="dash-stat-value">{loading ? '—' : fmtVal(totalProfToday)}</span>
                <span className="dash-stat-sub">net earnings</span>
              </div>
            </div>
          </div>

          {/* ── Add Branch Form ── */}
          {showForm && (
            <div className="sa-card" style={{ marginBottom: 24 }}>
              <div className="sa-card-header"><h2>➕ New Branch</h2></div>
              <div className="sa-card-body">
                <form onSubmit={handleAdd}>
                  <div className="sa-form-grid">
                    <div className="sa-form-group"><label>Branch Name *</label><input required placeholder="e.g. Kadapa Main" value={form.name} onChange={e => set('name', e.target.value)} /></div>
                    <div className="sa-form-group"><label>City *</label><input required placeholder="City" value={form.city} onChange={e => set('city', e.target.value)} /></div>
                    <div className="sa-form-group"><label>Branch Manager</label><input placeholder="Manager name" value={form.manager} onChange={e => set('manager', e.target.value)} /></div>
                    <div className="sa-form-group"><label>Address</label><input placeholder="Full address" value={form.address} onChange={e => set('address', e.target.value)} /></div>
                  </div>
                  <button type="submit" className="sa-btn sa-btn-primary" disabled={saving}>{saving ? 'Creating...' : '✅ Create Branch'}</button>
                </form>
              </div>
            </div>
          )}

          {/* ── Branch Cards ── */}
          <div className="dash-section-label"><MdStorefront /> Branch Performance — Today</div>

          {loading ? (
            <div className="sa-loading">Loading branch data...</div>
          ) : branches.length === 0 ? (
            <div className="sa-empty">No branches found</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 24 }}>
              {branches.map((b, i) => (
                <div key={b.id} className="sa-card branch-card"
                  style={{ borderTop: `4px solid ${b.is_active ? (i === 0 ? '#d4af37' : '#0d1f3d') : '#e2e8f0'}`, opacity: b.is_active ? 1 : 0.6, cursor: 'pointer' }}
                  onClick={() => setSelected(selected?.id === b.id ? null : b)}>

                  {/* Card Header */}
                  <div className="sa-card-header" style={{ background: b.is_active ? 'linear-gradient(135deg,rgba(13,31,61,0.04),rgba(26,54,93,0.02))' : '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: b.is_active ? 'linear-gradient(135deg,#0d1f3d,#1a365d)' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>
                        <MdStorefront />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: '#081427' }}>{b.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MdLocationOn size={12} />{b.city}
                          {b.manager && b.manager !== '—' && <><span>·</span><MdPerson size={12} />{b.manager}</>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {i === 0 && b.is_active && <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 800 }}>🥇 TOP</span>}
                      <span className={`sa-status ${b.is_active ? 'active' : 'inactive'}`}>{b.is_active ? '✅ Active' : '🔒 Inactive'}</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="sa-card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                      <StatMini icon={<MdBarChart />}            color="#0d1f3d" label="Txns Today"   value={fmt(b.txnToday)} />
                      <StatMini icon={<MdAccountBalanceWallet />} color="#1a365d" label="Value Today"  value={fmtVal(b.valToday)} />
                      <StatMini icon={<MdMonetizationOn />}       color="#d4af37" label="Profit Today" value={fmtVal(b.profToday)} />
                      <StatMini icon={<MdPeople />}               color="#059669" label="Employees"    value={fmt(b.employees)} />
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                        <span>Today's Performance</span>
                        <span style={{ fontWeight: 700 }}>{maxTxn > 0 ? Math.round(b.txnToday / maxTxn * 100) : 0}%</span>
                      </div>
                      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 999,
                          width: `${maxTxn > 0 ? Math.round(b.txnToday / maxTxn * 100) : 0}%`,
                          background: i === 0 ? 'linear-gradient(90deg,#d4af37,#f59e0b)' : 'linear-gradient(90deg,#0d1f3d,#1a365d)',
                          transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)'
                        }} />
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        👥 {fmt(b.customers)} customers · 📅 {fmt(b.txnMonth)} txns this month
                      </div>
                      <button className={`sa-btn sa-btn-sm ${b.is_active ? 'sa-btn-warning' : 'sa-btn-success'}`}
                        onClick={e => { e.stopPropagation(); toggleBranch(b.id) }}>
                        {b.is_active ? <><MdCancel size={12} /> Deactivate</> : <><MdCheckCircle size={12} /> Activate</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Branch Detail Drill-down ── */}
          {selected && (
            <>
              <div className="dash-section-label"><MdTrendingUp /> {selected.name} — Detailed Analytics</div>
              <div className="dash-grid-3">
                <div className="dash-card">
                  <div className="dash-card-head"><span><MdAccountBalanceWallet /></span><h3>Revenue</h3></div>
                  <div className="dash-card-body">
                    <div className="dash-kv-list">
                      <div className="dash-kv"><span>Value Today</span><span className="kv-green">{fmtVal(selected.valToday)}</span></div>
                      <div className="dash-kv"><span>Value This Month</span><span className="kv-green">{fmtVal(selected.valMonth)}</span></div>
                      <div className="dash-kv"><span>Profit Today</span><span className="kv-gold">{fmtVal(selected.profToday)}</span></div>
                      <div className="dash-kv"><span>Profit This Month</span><span className="kv-gold">{fmtVal(selected.profMonth)}</span></div>
                    </div>
                  </div>
                </div>
                <div className="dash-card">
                  <div className="dash-card-head"><span><MdPeople /></span><h3>People</h3></div>
                  <div className="dash-card-body">
                    <div className="dash-kv-list">
                      <div className="dash-kv"><span>Active Employees</span><span className="kv-green">{fmt(selected.employees)}</span></div>
                      <div className="dash-kv"><span>Total Customers</span><span className="kv-green">{fmt(selected.customers)}</span></div>
                      <div className="dash-kv"><span>Attendance Today</span><span className="kv-gold">{fmt(selected.attendance)}</span></div>
                    </div>
                  </div>
                </div>
                <div className="dash-card">
                  <div className="dash-card-head"><span><MdToday /></span><h3>Today's Activity</h3></div>
                  <div className="dash-card-body">
                    <div className="dash-kv-list">
                      <div className="dash-kv"><span>Transactions</span><span className="kv-green">{fmt(selected.txnToday)}</span></div>
                      <div className="dash-kv"><span>Month Transactions</span><span className="kv-green">{fmt(selected.txnMonth)}</span></div>
                      <div className="dash-kv"><span>City</span><span className="kv-gold">{selected.city}</span></div>
                      <div className="dash-kv"><span>Manager</span><span>{selected.manager}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Comparison Table ── */}
          {!loading && branches.length > 0 && (
            <>
              <div className="dash-section-label"><MdBarChart /> Branch Comparison</div>
              <div className="sa-card">
                <div className="sa-card-header"><h2>All Branches — Side by Side</h2></div>
                <div className="sa-table-wrap">
                  <table className="sa-table">
                    <thead>
                      <tr><th>Branch</th><th>City</th><th>Employees</th><th>Customers</th><th>Txns Today</th><th>Value Today</th><th>Profit Today</th><th>Month Txns</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {branches.map((b, i) => (
                        <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(selected?.id === b.id ? null : b)}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {i === 0 && <span>🥇</span>}
                              {i === 1 && <span>🥈</span>}
                              {i === 2 && <span>🥉</span>}
                              <strong>{b.name}</strong>
                            </div>
                          </td>
                          <td>{b.city}</td>
                          <td>{fmt(b.employees)}</td>
                          <td>{fmt(b.customers)}</td>
                          <td><strong style={{ color: '#0d1f3d' }}>{fmt(b.txnToday)}</strong></td>
                          <td style={{ color: '#059669', fontWeight: 700 }}>{fmtVal(b.valToday)}</td>
                          <td style={{ color: '#d4af37', fontWeight: 700 }}>{fmtVal(b.profToday)}</td>
                          <td>{fmt(b.txnMonth)}</td>
                          <td><span className={`sa-status ${b.is_active ? 'active' : 'inactive'}`}>{b.is_active ? 'Active' : 'Inactive'}</span></td>
                          <td onClick={e => e.stopPropagation()}>
                            <button className={`sa-btn sa-btn-sm ${b.is_active ? 'sa-btn-warning' : 'sa-btn-success'}`} onClick={() => toggleBranch(b.id)}>
                              {b.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
