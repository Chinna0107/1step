import React, { useEffect, useState, useCallback } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import '../../pages/dashboard.css'
import { useAdminExpenses } from '../../hooks/useFinance'

const auth  = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })
const fmt   = n => `₹${Number(n || 0).toLocaleString('en-IN')}`
const today = () => new Date().toISOString().split('T')[0]

const CATS    = ['Rent', 'Salary', 'Others']
const PAID_FROM = ['Cash', 'Bank']
const empty   = { date: today(), amount: '', category: '', paid_from: '', note: '' }

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(empty)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')
  const [err, setErr]           = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const refetch = useCallback(() => {
    setLoading(true)
    api('/dashboard/finance', { headers: auth() })
      .then(d => { setExpenses(d?.expenses ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const handleAdd = async e => {
    e.preventDefault(); setSaving(true); setMsg(''); setErr('')
    try {
      // branch is auto-resolved by backend from user token
      const payload = { ...form, branch: 'auto' }
      await api('/dashboard/expenses', { method: 'POST', headers: auth(), body: JSON.stringify(payload) })
      setMsg('Expense added'); setForm(empty); setShowForm(false); refetch()
    } catch (e) { setErr(e.message) }
    setSaving(false)
  }

  const total = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0)

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

          {msg && <div className="dash-alert dash-alert-success">✅ {msg}</div>}
          {err && <div className="dash-alert dash-alert-error">❌ {err}</div>}

          {/* Add Form */}
          {showForm && (
            <div className="dash-card" style={{ marginBottom: 20 }}>
              <div className="dash-card-header"><h2>New Expense</h2></div>
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
                      <label>Paid From *</label>
                      <select required value={form.paid_from} onChange={e => set('paid_from', e.target.value)}>
                        <option value="">Select</option>
                        {PAID_FROM.map(p => <option key={p}>{p}</option>)}
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

          {/* Summary */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div className="dash-stat" style={{ flex: '0 0 auto', minWidth: 160, borderLeftColor: '#dc2626' }}>
              <div className="dash-stat-label">Total Expenses</div>
              <div className="dash-stat-value" style={{ color: '#dc2626', fontSize: '1.4rem' }}>{fmt(total)}</div>
            </div>
            {CATS.map(cat => {
              const catTotal = expenses.filter(e => e.category === cat).reduce((s, e) => s + parseFloat(e.amount || 0), 0)
              return catTotal > 0 ? (
                <div key={cat} className="dash-stat" style={{ flex: '0 0 auto', minWidth: 140, borderLeftColor: '#9ca3af' }}>
                  <div className="dash-stat-label">{cat}</div>
                  <div className="dash-stat-value" style={{ color: '#374151', fontSize: '1.2rem' }}>{fmt(catTotal)}</div>
                </div>
              ) : null
            })}
          </div>

          {/* Table */}
          <div className="dash-card">
            <div className="dash-card-header"><h2>All Expenses ({expenses.length})</h2></div>
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : (
                <table className="dash-table">
                  <thead>
                    <tr><th>Date</th><th>Amount</th><th>Category</th><th>Paid From</th><th>Note</th></tr>
                  </thead>
                  <tbody>
                    {expenses.map(e => (
                      <tr key={e.id}>
                        <td style={{ fontSize: 12 }}>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                        <td style={{ fontWeight: 700, color: '#dc2626' }}>{fmt(e.amount)}</td>
                        <td>
                          <span style={{ background: '#ede9fe', color: '#402070', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {e.category}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: '#6b7280' }}>{e.paid_from || e.note?.includes('Cash') ? 'Cash' : '—'}</td>
                        <td style={{ fontSize: 12, color: '#9ca3af' }}>{e.note || '—'}</td>
                      </tr>
                    ))}
                    {!expenses.length && <tr><td colSpan={5} className="dash-empty">No expenses recorded</td></tr>}
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
