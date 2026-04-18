import React, { useState, useEffect, useCallback } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import '../../pages/dashboard.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })
const fmt    = n => Number(n).toLocaleString('en-IN')
const fmtVal = n => { const v = parseFloat(n); if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }

const CATEGORIES = ['Rent','Utilities','Salary','Maintenance','Marketing','Other']
const empty = { branch: '', category: '', amount: '', date: new Date().toISOString().split('T')[0], note: '' }

export default function AdminFinance() {
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('ledger')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(empty)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')
  const [error, setError]       = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const refetch = useCallback(() => {
    setLoading(true)
    api('/dashboard/finance', { headers: auth() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const handleAdd = async e => {
    e.preventDefault(); setSaving(true); setMsg(''); setError('')
    try {
      await api('/dashboard/expenses', { method: 'POST', headers: auth(), body: JSON.stringify(form) })
      setMsg('Expense added'); setForm(empty); setShowForm(false); refetch()
    } catch (err) { setError(err.message) }
    setSaving(false)
  }

  const ledger   = data?.ledger     ?? []
  const expenses = data?.expenses   ?? []
  const totals   = data?.totals     ?? {}

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <h1>Financial Control</h1>
          <div className="dash-topbar-right">
            {['ledger','cash','expenses'].map(t => (
              <button key={t} className={`dash-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'ledger' ? '🏦 Ledger' : t === 'cash' ? '💵 Cash' : '📉 Expenses'}
              </button>
            ))}
          </div>
        </div>
        <div className="dash-main">

          <div className="dash-stats">
            <div className="dash-stat"><div className="dash-stat-label">Total Cash In</div><div className="dash-stat-value">{loading ? '—' : fmtVal(totals.totalCashIn ?? 0)}</div></div>
            <div className="dash-stat"><div className="dash-stat-label">Total Profit</div><div className="dash-stat-value">{loading ? '—' : fmtVal(totals.totalProfit ?? 0)}</div></div>
            <div className="dash-stat"><div className="dash-stat-label">Total Expenses</div><div className="dash-stat-value">{loading ? '—' : fmtVal(totals.totalExpenses ?? 0)}</div></div>
          </div>

          {tab === 'ledger' && (
            <div className="dash-card">
              <div className="dash-card-header"><h2>🏦 Daily Ledger — Today</h2></div>
              <div className="dash-table-wrap">
                {loading ? <div className="dash-loading">Loading...</div> : (
                  <table className="dash-table">
                    <thead><tr><th>Branch</th><th>Transactions</th><th>Total Amount</th><th>Profit</th></tr></thead>
                    <tbody>
                      {ledger.map(l => (
                        <tr key={l.branch}>
                          <td><strong>{l.branch}</strong></td>
                          <td>{l.txn}</td>
                          <td style={{ color: '#059669', fontWeight: 700 }}>{fmtVal(l.cash_in)}</td>
                          <td style={{ color: '#d4af37', fontWeight: 800 }}>{fmtVal(l.profit)}</td>
                        </tr>
                      ))}
                      {!ledger.length && <tr><td colSpan={4} className="dash-empty">No transactions today</td></tr>}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {tab === 'cash' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
              {loading ? <div className="dash-loading">Loading...</div> : ledger.map(l => (
                <div key={l.branch} className="dash-card" style={{ marginBottom: 0 }}>
                  <div className="dash-card-header"><h2>🏦 {l.branch}</h2></div>
                  <div className="dash-card-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>Total Amount</span><strong style={{ color: '#059669' }}>{fmtVal(l.cash_in)}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>Profit</span><strong style={{ color: '#d4af37' }}>{fmtVal(l.profit)}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>Transactions</span><strong>{l.txn}</strong></div>
                    </div>
                  </div>
                </div>
              ))}
              {!loading && !ledger.length && <div className="dash-empty">No data today</div>}
            </div>
          )}

          {tab === 'expenses' && (
            <>
              {msg   && <div className="dash-alert dash-alert-success">✅ {msg}</div>}
              {error && <div className="dash-alert dash-alert-error">❌ {error}</div>}
              <div className="dash-card">
                <div className="dash-card-header">
                  <h2>All Expenses ({expenses.length})</h2>
                  <button className="dash-btn dash-btn-primary" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => setShowForm(v => !v)}>
                    {showForm ? '✕ Cancel' : '+ Add Expense'}
                  </button>
                </div>
                {showForm && (
                  <div className="dash-card-body" style={{ borderBottom: '1px solid #f0f2f8' }}>
                    <form onSubmit={handleAdd}>
                      <div className="dash-form-grid">
                        <div className="dash-form-group"><label>Branch *</label><input required placeholder="Branch name" value={form.branch} onChange={e => set('branch', e.target.value)} /></div>
                        <div className="dash-form-group"><label>Category *</label>
                          <select required value={form.category} onChange={e => set('category', e.target.value)}>
                            <option value="">Select</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="dash-form-group"><label>Amount *</label><input required type="number" min="1" value={form.amount} onChange={e => set('amount', e.target.value)} /></div>
                        <div className="dash-form-group"><label>Date *</label><input required type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
                        <div className="dash-form-group"><label>Note</label><input placeholder="Optional" value={form.note} onChange={e => set('note', e.target.value)} /></div>
                      </div>
                      <button type="submit" className="dash-btn dash-btn-primary" disabled={saving}>{saving ? 'Saving...' : '✅ Add'}</button>
                    </form>
                  </div>
                )}
                <div className="dash-table-wrap">
                  {loading ? <div className="dash-loading">Loading...</div> : (
                    <table className="dash-table">
                      <thead><tr><th>Branch</th><th>Category</th><th>Amount</th><th>Date</th><th>Note</th></tr></thead>
                      <tbody>
                        {expenses.map(e => (
                          <tr key={e.id}>
                            <td><strong>{e.branch}</strong></td>
                            <td><span style={{ background: '#ede9fe', color: '#402070', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{e.category}</span></td>
                            <td style={{ color: '#dc2626', fontWeight: 700 }}>₹{fmt(e.amount)}</td>
                            <td>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                            <td style={{ color: '#9ca3af', fontSize: 12 }}>{e.note || '—'}</td>
                          </tr>
                        ))}
                        {!expenses.length && <tr><td colSpan={5} className="dash-empty">No expenses recorded</td></tr>}
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
