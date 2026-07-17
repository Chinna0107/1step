import React, { useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useAdminExpenses } from '../../hooks/useFinance'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import '../../pages/dashboard.css'

const fmt   = n => Number(parseFloat(n)||0).toLocaleString('en-IN')
const today = new Date().toISOString().split('T')[0]
const CATS  = ['Rent', 'Utilities', 'Salary', 'Maintenance', 'Marketing', 'Other']
const empty = { date: today, amount: '', category: '', note: '' }

export default function Expenses() {
  const { expenses, expSummary, totals, loading, msg: hookMsg, error: hookErr, refetch } = useAdminExpenses()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(empty)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')
  const [err, setErr]           = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAdd = async e => {
    e.preventDefault(); setSaving(true); setMsg(''); setErr('')
    try {
      const r = await api('/finance/expenses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getTokenByRole('admin')}` },
        body: JSON.stringify(form),
      })
      setMsg(`✅ Expense added & ₹${fmt(form.amount)} deducted from Bank (balance: ₹${fmt(r.bank_balance)})`)
      setForm(empty); setShowForm(false); refetch()
    } catch (ex) { setErr(ex.message) }
    setSaving(false)
  }

  const displayMsg = msg
  const displayErr = err || hookErr

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <h1>📉 Expenses</h1>
          <div className="dash-topbar-right">
            <button className="dash-btn dash-btn-primary" onClick={() => { setShowForm(v => !v); setMsg(''); setErr('') }}>
              {showForm ? '✕ Cancel' : '+ Add Expense'}
            </button>
          </div>
        </div>
        <div className="dash-main">

          {displayMsg && <div className="dash-alert dash-alert-success" style={{ marginBottom: 12 }}>{displayMsg}</div>}
          {displayErr && <div className="dash-alert dash-alert-error"   style={{ marginBottom: 12 }}>❌ {displayErr}</div>}

          {/* Add Form */}
          {showForm && (
            <div className="dash-card" style={{ marginBottom: 20 }}>
              <div className="dash-card-header">
                <h2>New Expense</h2>
                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>🏦 Deducts from Bank Account</span>
              </div>
              <div className="dash-card-body">
                <form onSubmit={handleAdd}>
                  <div className="dash-form-grid">
                    <div className="dash-form-group">
                      <label>Date *</label>
                      <input required type="date" value={form.date} onChange={e => set('date', e.target.value)} />
                    </div>
                    <div className="dash-form-group">
                      <label>Amount (₹) *</label>
                      <input required type="number" min="1" placeholder="0" value={form.amount} onChange={e => set('amount', e.target.value)} />
                    </div>
                    <div className="dash-form-group">
                      <label>Category *</label>
                      <select required value={form.category} onChange={e => set('category', e.target.value)}>
                        <option value="">Select</option>
                        {CATS.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="dash-form-group">
                      <label>Note</label>
                      <input placeholder="Optional" value={form.note} onChange={e => set('note', e.target.value)} />
                    </div>
                  </div>
                  <button type="submit" className="dash-btn dash-btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : '✅ Add Expense'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', marginBottom: 20 }}>
            <div className="dash-stat" style={{ borderTop: '3px solid #dc2626' }}>
              <div className="dash-stat-label">Total Expenses</div>
              <div className="dash-stat-value" style={{ color: '#dc2626' }}>₹{fmt(totals.totalExpenses ?? 0)}</div>
              <div className="dash-stat-sub">This month</div>
            </div>
            {expSummary.map(s => (
              <div key={s.category} className="dash-stat" style={{ borderTop: '3px solid #9ca3af' }}>
                <div className="dash-stat-label">{s.category}</div>
                <div className="dash-stat-value" style={{ color: '#374151', fontSize: '1.1rem' }}>₹{fmt(s.total)}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h2>All Expenses ({expenses.length})</h2>
              <button className="dash-btn dash-btn-sm" onClick={refetch} style={{ background: '#f0f2f8', color: '#0d1f3d', border: 'none' }}>↻ Refresh</button>
            </div>
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : (
                <table className="dash-table">
                  <thead>
                    <tr><th>Date</th><th>Amount</th><th>Category</th><th>Note</th></tr>
                  </thead>
                  <tbody>
                    {expenses.map(e => (
                      <tr key={e.id}>
                        <td style={{ fontSize: 12 }}>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                        <td style={{ fontWeight: 700, color: '#dc2626' }}>₹{fmt(e.amount)}</td>
                        <td><span style={{ background: '#ede9fe', color: '#0d1f3d', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{e.category}</span></td>
                        <td style={{ fontSize: 12, color: '#9ca3af' }}>{e.note || '—'}</td>
                      </tr>
                    ))}
                    {!expenses.length && <tr><td colSpan={4} className="dash-empty">No expenses recorded</td></tr>}
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
