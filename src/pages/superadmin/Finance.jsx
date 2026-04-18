import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import { useBranches } from '../../hooks/useSuperAdmin'
import { SkeletonTable, SkeletonRows, SkeletonStats } from '../../components/superadmin/Skeleton'
import './superadmin.css'
import './Dashboard.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin')}` })
const fmt    = n => Number(n).toLocaleString('en-IN')
const fmtVal = n => { const v = parseFloat(n); if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }

const CATEGORIES = ['Rent', 'Utilities', 'Salary', 'Maintenance', 'Marketing', 'Other']
const emptyExp   = { branch: '', category: '', amount: '', date: new Date().toISOString().split('T')[0], note: '' }

export default function Finance() {
  const [tab, setTab]           = useState('ledger')
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(emptyExp)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')
  const [error, setError]       = useState('')
  const { branches }            = useBranches()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const refetch = useCallback(() => {
    setLoading(true)
    api('/dashboard/finance', { headers: auth() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const handleAddExp = async e => {
    e.preventDefault()
    setSaving(true); setMsg(''); setError('')
    try {
      await api('/dashboard/expenses', { method: 'POST', headers: auth(), body: JSON.stringify(form) })
      setMsg('Expense added'); setForm(emptyExp); setShowForm(false); refetch()
    } catch (err) { setError(err.message) }
    setSaving(false)
  }

  const ledger     = data?.ledger     ?? []
  const expenses   = data?.expenses   ?? []
  const expSummary = data?.expSummary ?? []
  const totals     = data?.totals     ?? {}

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-topbar-title">Financial Control</h1>
            <p className="dash-topbar-sub">Track real money movement across all branches</p>
          </div>
          <div className="dash-topbar-right">
            {['ledger','cash','expenses'].map(t => (
              <button key={t} className="sa-btn sa-btn-sm"
                style={{ background: tab === t ? 'linear-gradient(135deg,#402070,#c02040)' : '#f4f5fb',
                         color: tab === t ? '#fff' : '#666', border: '1px solid #e8eaf0' }}
                onClick={() => setTab(t)}>
                {t === 'ledger' ? '🏦 Ledger' : t === 'cash' ? '💵 Cash' : '📉 Expenses'}
              </button>
            ))}
          </div>
        </div>

        <div className="dash-main">

          <div className="dash-stats-row">
            {loading ? <SkeletonStats count={4} /> : (
              <>
                {[
                  { label: 'Total Cash In',   value: fmtVal(totals.totalCashIn   ?? 0), color: '#10b981' },
                  { label: 'Total Profit',    value: fmtVal(totals.totalProfit   ?? 0), color: '#d4af37' },
                  { label: 'Total Expenses',  value: fmtVal(totals.totalExpenses ?? 0), color: '#c02040' },
                  { label: 'Active Branches', value: ledger.length,                     color: '#402070' },
                ].map(s => (
                  <div key={s.label} className="dash-stat" style={{ '--c': s.color }}>
                    <div className="dash-stat-icon" style={{ fontSize: 22 }}>💰</div>
                    <div className="dash-stat-body">
                      <span className="dash-stat-label">{s.label}</span>
                      <span className="dash-stat-value">{s.value}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {tab === 'ledger' && (
            <>
              <div className="dash-section-label">🏦 Branch Transaction Ledger — Today</div>
              <div className="sa-card">
                <div className="sa-card-header"><h2>Daily Ledger — All Branches</h2></div>
                <div className="sa-table-wrap">
                  {loading ? <SkeletonTable rows={3} cols={5} /> : (
                    <table className="sa-table">
                      <thead><tr><th>Branch</th><th>Transactions</th><th>Total Amount</th><th>Profit</th><th>Status</th></tr></thead>
                      <tbody>
                        {ledger.map(l => (
                          <tr key={l.branch}>
                            <td><strong>{l.branch}</strong></td>
                            <td>{l.txn}</td>
                            <td style={{ color: '#059669', fontWeight: 700 }}>{fmtVal(l.cash_in)}</td>
                            <td style={{ color: '#d4af37', fontWeight: 800 }}>{fmtVal(l.profit)}</td>
                            <td><span className="dash-badge badge-green">✅ Active</span></td>
                          </tr>
                        ))}
                        {!ledger.length && <tr><td colSpan={5} className="sa-empty">No transactions today</td></tr>}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}

          {tab === 'cash' && (
            <>
              <div className="dash-section-label">💵 Cash Register — Branch-wise</div>
              {loading ? <SkeletonRows rows={4} /> : (
                <div className="dash-grid-3">
                  {ledger.map(l => (
                    <div key={l.branch} className="dash-card">
                      <div className="dash-card-head"><span>🏦</span><h3>{l.branch}</h3></div>
                      <div className="dash-card-body">
                        <div className="dash-kv-list">
                          <div className="dash-kv"><span>Total Amount</span><span className="kv-green">{fmtVal(l.cash_in)}</span></div>
                          <div className="dash-kv"><span>Profit</span><span className="kv-gold">{fmtVal(l.profit)}</span></div>
                          <div className="dash-kv"><span>Transactions</span><span>{l.txn}</span></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!ledger.length && <p style={{ color: '#9ca3af', fontSize: 13 }}>No data today</p>}
                </div>
              )}
            </>
          )}

          {tab === 'expenses' && (
            <>
              <div className="dash-section-label">📉 Expense Management</div>

              {!loading && expSummary.length > 0 && (
                <div className="dash-grid-2" style={{ marginBottom: 16 }}>
                  {expSummary.map(s => (
                    <div key={s.category} className="dash-card">
                      <div className="dash-card-head"><span>📌</span><h3>{s.category}</h3></div>
                      <div className="dash-card-body">
                        <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#c02040' }}>{fmtVal(s.total)}</span>
                        <span style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginTop: 4 }}>This month</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {msg   && <div className="sa-alert sa-alert-success" style={{ marginBottom: 12 }}>✅ {msg}</div>}
              {error && <div className="sa-alert sa-alert-error"   style={{ marginBottom: 12 }}>❌ {error}</div>}

              <div className="sa-card">
                <div className="sa-card-header">
                  <h2>All Expenses ({expenses.length})</h2>
                  <button className="sa-btn sa-btn-primary sa-btn-sm" onClick={() => setShowForm(v => !v)}>
                    {showForm ? '✕ Cancel' : '+ Add Expense'}
                  </button>
                </div>
                {showForm && (
                  <div className="sa-card-body" style={{ borderBottom: '1px solid #f0f2f8' }}>
                    <form onSubmit={handleAddExp}>
                      <div className="sa-form-grid">
                        <div className="sa-form-group">
                          <label>Branch *</label>
                          <select required value={form.branch} onChange={e => set('branch', e.target.value)}>
                            <option value="">Select branch</option>
                            {branches.map(b => <option key={b.id} value={b.city}>{b.city}</option>)}
                          </select>
                        </div>
                        <div className="sa-form-group">
                          <label>Category *</label>
                          <select required value={form.category} onChange={e => set('category', e.target.value)}>
                            <option value="">Select category</option>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="sa-form-group">
                          <label>Amount (₹) *</label>
                          <input required type="number" min="1" placeholder="0" value={form.amount} onChange={e => set('amount', e.target.value)} />
                        </div>
                        <div className="sa-form-group">
                          <label>Date *</label>
                          <input required type="date" value={form.date} onChange={e => set('date', e.target.value)} />
                        </div>
                        <div className="sa-form-group" style={{ gridColumn: '1 / -1' }}>
                          <label>Note</label>
                          <input placeholder="Optional note" value={form.note} onChange={e => set('note', e.target.value)} />
                        </div>
                      </div>
                      <button type="submit" className="sa-btn sa-btn-primary" disabled={saving}>{saving ? 'Saving...' : '✅ Add Expense'}</button>
                    </form>
                  </div>
                )}
                <div className="sa-table-wrap">
                  {loading ? <SkeletonTable rows={5} cols={5} /> : (
                    <table className="sa-table">
                      <thead><tr><th>Branch</th><th>Category</th><th>Amount</th><th>Date</th><th>Note</th></tr></thead>
                      <tbody>
                        {expenses.map(e => (
                          <tr key={e.id}>
                            <td><strong>{e.branch}</strong></td>
                            <td><span className="dash-badge badge-purple">{e.category}</span></td>
                            <td style={{ color: '#dc2626', fontWeight: 700 }}>₹{fmt(e.amount)}</td>
                            <td>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                            <td style={{ color: '#9ca3af', fontSize: 12 }}>{e.note || '—'}</td>
                          </tr>
                        ))}
                        {!expenses.length && <tr><td colSpan={5} className="sa-empty">No expenses recorded</td></tr>}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
