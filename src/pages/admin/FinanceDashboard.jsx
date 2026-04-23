import React, { useEffect, useState, useCallback } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole, getUserByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import '../../pages/dashboard.css'
import { useFinanceSummary, useFinanceData, useFinanceAlerts } from '../../hooks/useFinance'

const auth   = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })
const fmt    = n => Number(parseFloat(n)||0).toLocaleString('en-IN')
const fmtVal = n => { const v = parseFloat(n)||0; if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }
const today      = new Date().toISOString().split('T')[0]
const monthStart = today.slice(0, 7) + '-01'

export default function FinanceDashboard() {
  const [summary, setSummary]   = useState(null)
  const [finance, setFinance]   = useState(null)
  const [alerts, setAlerts]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('overview')
  const [from, setFrom]         = useState(monthStart)
  const [to, setTo]             = useState(today)
  const [showForm, setShowForm] = useState(false)
  const [expForm, setExpForm]   = useState({ category: '', amount: '', date: today, note: '' })
  const [saving, setSaving]     = useState(false)
  const [expMsg, setExpMsg]     = useState('')
  const user = getUserByRole('admin')

  const CATEGORIES = ['Rent','Utilities','Salary','Maintenance','Marketing','Other']
  const setExp = (k, v) => setExpForm(f => ({ ...f, [k]: v }))

  const handleAddExp = async e => {
    e.preventDefault()
    setSaving(true); setExpMsg('')
    try {
      await api('/dashboard/expenses', { method: 'POST', headers: auth(), body: JSON.stringify(expForm) })
      setExpMsg('✅ Expense added')
      setExpForm({ category: '', amount: '', date: today, note: '' })
      setShowForm(false)
      refetch()
    } catch (err) { setExpMsg('❌ ' + err.message) }
    setSaving(false)
  }

  const refetch = useCallback(() => {
    setLoading(true)
    const p = new URLSearchParams({ from, to })
    Promise.all([
      api('/finance/summary', { headers: auth() }),
      api(`/dashboard/finance?${p}`, { headers: auth() }),
      api('/finance/alerts',  { headers: auth() }),
    ]).then(([s, f, a]) => { setSummary(s); setFinance(f); setAlerts(a); setLoading(false) })
      .catch(() => setLoading(false))
  }, [from, to])

  useEffect(() => { refetch() }, [refetch])

  const ledger         = finance?.ledger         ?? []
  const expenses       = finance?.expenses       ?? []
  const expSummary     = finance?.expSummary     ?? []
  const serviceSummary = finance?.serviceSummary ?? []
  const daily          = finance?.daily          ?? []
  const totals         = finance?.totals         ?? {}
  const maxDaily       = Math.max(1, ...daily.map(d => d.amount))

  const STATS = [
    { label: 'Today Inflow',   value: fmtVal(summary?.todayInflow   ?? 0), color: '#10b981', icon: '📈' },
    { label: 'Today Profit',   value: fmtVal(summary?.todayProfit   ?? 0), color: '#d4af37', icon: '💸' },
    { label: 'Today Outflow',  value: fmtVal(summary?.todayOutflow  ?? 0), color: '#dc2626', icon: '📉' },
    { label: 'Wallet Balance', value: fmtVal(summary?.walletBalance ?? 0), color: '#402070', icon: '💼' },
    { label: 'Month Amount',   value: fmtVal(totals.totalCashIn     ?? 0), color: '#059669', icon: '💵' },
    { label: 'Net Profit',     value: fmtVal(totals.netProfit       ?? 0), color: totals.netProfit >= 0 ? '#059669' : '#dc2626', icon: '🏆' },
  ]

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <div>
            <h1>💰 Finance — {user?.branch || 'Branch'}</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>Branch-wise financial records</p>
          </div>
          <div className="dash-topbar-right" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="date" value={from} max={to} onChange={e => setFrom(e.target.value)}
              style={{ padding: '7px 10px', border: '1.5px solid #e0e0f0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }} />
            <span style={{ color: '#9ca3af', fontSize: 13 }}>to</span>
            <input type="date" value={to} min={from} max={today} onChange={e => setTo(e.target.value)}
              style={{ padding: '7px 10px', border: '1.5px solid #e0e0f0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }} />
            <button className="dash-btn dash-btn-primary" onClick={refetch} style={{ padding: '7px 16px' }}>🔍 Apply</button>
          </div>
        </div>

        <div className="dash-main">

          {/* Alerts */}
          {!loading && alerts.map((a, i) => (
            <div key={i} style={{ background: a.type === 'danger' ? '#fee2e2' : '#fef3c7', color: a.type === 'danger' ? '#dc2626' : '#d97706', padding: '10px 16px', borderRadius: 10, marginBottom: 10, fontSize: 13, fontWeight: 600 }}>
              ⚠️ {a.msg}
            </div>
          ))}

          {/* Stats */}
          <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', marginBottom: 20 }}>
            {STATS.map(s => (
              <div key={s.label} className="dash-stat" style={{ borderTop: `3px solid ${s.color}` }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                <div className="dash-stat-label">{s.label}</div>
                <div className="dash-stat-value" style={{ color: s.color }}>{loading ? '—' : s.value}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { key: 'overview', label: '📊 Overview' },
              { key: 'services', label: '🔧 Services' },
              { key: 'daily',    label: '📅 Daily' },
              { key: 'expenses', label: '📉 Expenses' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ padding: '9px 18px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  background: tab === t.key ? 'linear-gradient(135deg,#402070,#c02040)' : '#f0f2f8',
                  color: tab === t.key ? '#fff' : '#64748b' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Summary */}
              <div className="dash-card">
                <div className="dash-card-header"><h2>📊 Period Summary</h2><span style={{ fontSize: 12, color: '#9ca3af' }}>{from} → {to}</span></div>
                <div className="dash-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Total Transactions', value: ledger[0]?.txn ?? 0, color: '#402070' },
                    { label: 'Total Amount',        value: `₹${fmt(totals.totalCashIn ?? 0)}`,   color: '#059669' },
                    { label: 'Customer Charges',    value: `₹${fmt(totals.totalCharges ?? 0)}`,  color: '#d97706' },
                    { label: 'Gross Profit',        value: `₹${fmt(totals.totalProfit ?? 0)}`,   color: '#d4af37' },
                    { label: 'Total Expenses',      value: `₹${fmt(totals.totalExpenses ?? 0)}`, color: '#dc2626' },
                    { label: 'Net Profit',          value: `₹${fmt(totals.netProfit ?? 0)}`,     color: totals.netProfit >= 0 ? '#059669' : '#dc2626' },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{r.label}</span>
                      <strong style={{ fontSize: 14, color: r.color }}>{loading ? '—' : r.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expense Breakdown */}
              <div className="dash-card">
                <div className="dash-card-header"><h2>📉 Expense Breakdown</h2></div>
                <div className="dash-card-body">
                  {loading ? <div className="dash-loading">Loading...</div> : expSummary.length === 0 ? (
                    <div className="dash-empty">No expenses in this period</div>
                  ) : expSummary.map((s, i) => {
                    const colors = ['#402070','#c02040','#d4af37','#059669','#0ea5e9','#f59e0b']
                    const pct = Math.round(s.total / (totals.totalExpenses || 1) * 100)
                    return (
                      <div key={s.category} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                          <span style={{ fontWeight: 600, color: '#374151' }}>{s.category}</span>
                          <span style={{ fontWeight: 800, color: '#dc2626' }}>₹{fmt(s.total)} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({pct}%)</span></span>
                        </div>
                        <div style={{ height: 8, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: colors[i % colors.length], borderRadius: 999 }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── SERVICES ── */}
          {tab === 'services' && (
            <div className="dash-card">
              <div className="dash-card-header"><h2>🔧 Service-wise Revenue</h2></div>
              <div className="dash-table-wrap">
                {loading ? <div className="dash-loading">Loading...</div> : (
                  <table className="dash-table">
                    <thead>
                      <tr><th>Service</th><th>Transactions</th><th>Total Amount</th><th>Profit</th><th>Avg / Txn</th></tr>
                    </thead>
                    <tbody>
                      {serviceSummary.map(s => (
                        <tr key={s.service_type}>
                          <td><strong>{s.service_type}</strong></td>
                          <td style={{ fontWeight: 700 }}>{s.txn}</td>
                          <td style={{ color: '#059669', fontWeight: 700 }}>₹{fmt(s.amount)}</td>
                          <td style={{ color: '#d4af37', fontWeight: 800 }}>₹{fmt(s.profit)}</td>
                          <td style={{ color: '#64748b', fontSize: 12 }}>{s.txn ? fmtVal(s.amount / s.txn) : '—'}</td>
                        </tr>
                      ))}
                      {!serviceSummary.length && <tr><td colSpan={5} className="dash-empty">No data</td></tr>}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── DAILY ── */}
          {tab === 'daily' && (
            <div className="dash-card">
              <div className="dash-card-header"><h2>📅 Daily Revenue Trend</h2></div>
              <div style={{ padding: '16px 20px' }}>
                {loading ? <div className="dash-loading">Loading...</div> : daily.length === 0 ? (
                  <div className="dash-empty">No data for this period</div>
                ) : daily.map(d => {
                  const pct = Math.round(d.amount / maxDaily * 100)
                  return (
                    <div key={d.day} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 80, fontSize: 12, color: '#64748b', flexShrink: 0 }}>
                        {new Date(d.day).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                      <div style={{ flex: 1, height: 24, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#402070,#c02040)', borderRadius: 6, minWidth: 4 }} />
                      </div>
                      <div style={{ width: 110, textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#1a0a2e' }}>{fmtVal(d.amount)}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{d.txn} txns · ₹{fmt(d.profit)} profit</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── EXPENSES ── */}
          {tab === 'expenses' && (
            <>
              {expMsg && <div className={`dash-alert ${expMsg.startsWith('✅') ? 'dash-alert-success' : 'dash-alert-error'}`} style={{ marginBottom: 12 }}>{expMsg}</div>}
              <div className="dash-card">
                <div className="dash-card-header">
                  <h2>📉 Expenses ({expenses.length})</h2>
                  <button className="dash-btn dash-btn-primary dash-btn-sm" onClick={() => setShowForm(v => !v)}>
                    {showForm ? '✕ Cancel' : '+ Add Expense'}
                  </button>
                </div>
                {showForm && (
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <form onSubmit={handleAddExp}>
                      <div className="dash-form-grid">
                        <div className="dash-form-group">
                          <label>Category *</label>
                          <select required value={expForm.category} onChange={e => setExp('category', e.target.value)}>
                            <option value="">Select</option>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="dash-form-group">
                          <label>Amount (₹) *</label>
                          <input required type="number" min="1" placeholder="0" value={expForm.amount} onChange={e => setExp('amount', e.target.value)} />
                        </div>
                        <div className="dash-form-group">
                          <label>Date *</label>
                          <input required type="date" value={expForm.date} onChange={e => setExp('date', e.target.value)} />
                        </div>
                        <div className="dash-form-group">
                          <label>Note</label>
                          <input placeholder="Optional" value={expForm.note} onChange={e => setExp('note', e.target.value)} />
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 10 }}>🏦 Branch: <strong style={{ color: '#402070' }}>{user?.branch}</strong> (auto-assigned)</div>
                      <button type="submit" className="dash-btn dash-btn-primary" disabled={saving}>{saving ? 'Saving...' : '✅ Add Expense'}</button>
                    </form>
                  </div>
                )}
              <div className="dash-table-wrap">
                {loading ? <div className="dash-loading">Loading...</div> : (
                  <table className="dash-table">
                    <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Note</th></tr></thead>
                    <tbody>
                      {expenses.map(e => (
                        <tr key={e.id}>
                          <td style={{ fontSize: 12 }}>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                          <td><span style={{ background: '#ede9fe', color: '#402070', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{e.category}</span></td>
                          <td style={{ color: '#dc2626', fontWeight: 700 }}>₹{fmt(e.amount)}</td>
                          <td style={{ color: '#9ca3af', fontSize: 12 }}>{e.note || '—'}</td>
                        </tr>
                      ))}
                      {!expenses.length && <tr><td colSpan={4} className="dash-empty">No expenses in this period</td></tr>}
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
