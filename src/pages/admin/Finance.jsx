import React, { useState, useEffect, useCallback } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import '../../pages/dashboard.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })
const fmt    = n => Number(n).toLocaleString('en-IN')
const fmtVal = n => { const v = parseFloat(n); if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }

const CATEGORIES = ['Rent','Utilities','Salary','Maintenance','Marketing','Other']
const empty = { branch: '', category: '', amount: '', date: new Date(Date.now() + 5.5 * 3600000).toISOString().split('T')[0], note: '' }
const today = new Date(Date.now() + 5.5 * 3600000).toISOString().split('T')[0]
const monthStart = today.slice(0, 7) + '-01'

export default function AdminFinance() {
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('ledger')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(empty)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')
  const [error, setError]       = useState('')
  
  // Filter states
  const [filters, setFilters] = useState({
    from: monthStart,
    to: today,
    wallet_id: '',
    type: '',
    category: '',
    min_amount: '',
    max_amount: '',
    employee_id: ''
  })
  
  const [employees, setEmployees] = useState([])
  const [wallets, setWallets] = useState([])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }))

  const refetch = useCallback(() => {
    setLoading(true)
    Promise.all([
      api('/finance/summary', { headers: auth() }),
      loadTabData()
    ])
      .then(([summaryData]) => { 
        setData(summaryData); 
        setLoading(false) 
      })
      .catch(() => setLoading(false))
  }, [tab, filters])
  
  const loadTabData = useCallback(async () => {
    try {
      if (tab === 'ledger') {
        const params = new URLSearchParams()
        if (filters.from) params.append('from', filters.from)
        if (filters.to) params.append('to', filters.to)
        if (filters.wallet_id) params.append('wallet_id', filters.wallet_id)
        if (filters.type) params.append('type', filters.type)
        
        const ledgerData = await api(`/finance/ledger?${params.toString()}`, { headers: auth() })
        setData(prev => ({ ...prev, ledger: ledgerData }))
      } else if (tab === 'control') {
        const params = new URLSearchParams()
        if (filters.from) params.append('from', filters.from)
        if (filters.to) params.append('to', filters.to)
        if (filters.category) params.append('category', filters.category)
        if (filters.min_amount) params.append('min_amount', filters.min_amount)
        if (filters.max_amount) params.append('max_amount', filters.max_amount)
        
        const controlData = await api(`/finance/control?${params.toString()}`, { headers: auth() })
        setData(prev => ({ ...prev, ...controlData }))
      } else if (tab === 'performance') {
        const params = new URLSearchParams()
        if (filters.from) params.append('from', filters.from)
        if (filters.to) params.append('to', filters.to)
        if (filters.employee_id) params.append('employee_id', filters.employee_id)
        
        const perfData = await api(`/finance/performance?${params.toString()}`, { headers: auth() })
        setData(prev => ({ ...prev, ...perfData }))
      }
    } catch (error) {
      console.error('Error loading tab data:', error)
    }
  }, [tab, filters])
  
  const loadEmployees = useCallback(async () => {
    try {
      const empData = await api('/master/employees', { headers: auth() })
      setEmployees(empData)
    } catch (error) {
      console.error('Error loading employees:', error)
    }
  }, [])
  
  const loadWallets = useCallback(async () => {
    try {
      const walletData = await api('/finance/wallets', { headers: auth() })
      setWallets(walletData)
    } catch (error) {
      console.error('Error loading wallets:', error)
    }
  }, [])

  useEffect(() => { 
    refetch()
    loadEmployees()
    loadWallets()
  }, [refetch, loadEmployees, loadWallets])
  
  useEffect(() => {
    if (tab !== 'expenses') {
      loadTabData()
    }
  }, [tab, loadTabData])

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
            {['ledger','control','performance','expenses'].map(t => (
              <button key={t} className={`dash-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'ledger' ? '🏦 Ledger' : t === 'control' ? '📊 Control' : t === 'performance' ? '📈 Performance' : '📉 Expenses'}
              </button>
            ))}
          </div>
        </div>
        <div className="dash-main">

          <div className="dash-stats">
            <div className="dash-stat"><div className="dash-stat-label">Wallet Balance</div><div className="dash-stat-value">{loading ? '—' : fmtVal(data?.walletBalance ?? 0)}</div></div>
            <div className="dash-stat"><div className="dash-stat-label">Today Profit</div><div className="dash-stat-value">{loading ? '—' : fmtVal(data?.todayProfit ?? 0)}</div></div>
            <div className="dash-stat"><div className="dash-stat-label">Today Inflow</div><div className="dash-stat-value">{loading ? '—' : fmtVal(data?.todayInflow ?? 0)}</div></div>
            <div className="dash-stat"><div className="dash-stat-label">Today Outflow</div><div className="dash-stat-value">{loading ? '—' : fmtVal(data?.todayOutflow ?? 0)}</div></div>
          </div>

          {/* Filters */}
          {(tab === 'ledger' || tab === 'control' || tab === 'performance') && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>From:</label>
                <input type="date" value={filters.from} onChange={e => setFilter('from', e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }} />
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>To:</label>
                <input type="date" value={filters.to} onChange={e => setFilter('to', e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }} />
              </div>
              
              {tab === 'ledger' && (
                <>
                  <select value={filters.wallet_id} onChange={e => setFilter('wallet_id', e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}>
                    <option value="">All Wallets</option>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                  <select value={filters.type} onChange={e => setFilter('type', e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}>
                    <option value="">All Types</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                </>
              )}
              
              {tab === 'control' && (
                <>
                  <select value={filters.category} onChange={e => setFilter('category', e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}>
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="number" placeholder="Min Amount" value={filters.min_amount} onChange={e => setFilter('min_amount', e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, width: 100 }} />
                  <input type="number" placeholder="Max Amount" value={filters.max_amount} onChange={e => setFilter('max_amount', e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, width: 100 }} />
                </>
              )}
              
              {tab === 'performance' && (
                <select value={filters.employee_id} onChange={e => setFilter('employee_id', e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}>
                  <option value="">All Employees</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                </select>
              )}
              
              <button onClick={loadTabData} className="dash-btn dash-btn-primary dash-btn-sm">
                🔍 Apply Filters
              </button>
              
              <button onClick={() => setFilters({ from: monthStart, to: today, wallet_id: '', type: '', category: '', min_amount: '', max_amount: '', employee_id: '' })}
                style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', color: '#64748b', fontSize: 12, cursor: 'pointer' }}>
                ✕ Clear
              </button>
            </div>
          )}

          {tab === 'ledger' && (
            <div className="dash-card">
              <div className="dash-card-header"><h2>🏦 Ledger Entries</h2></div>
              <div className="dash-table-wrap">
                {loading ? <div className="dash-loading">Loading...</div> : (
                  <table className="dash-table">
                    <thead><tr><th>Date</th><th>Wallet</th><th>Type</th><th>Amount</th><th>Balance</th><th>Remarks</th><th>Reference</th></tr></thead>
                    <tbody>
                      {(data?.ledger || []).map(l => (
                        <tr key={l.id}>
                          <td style={{ fontSize: 12 }}>{new Date(l.created_at).toLocaleString('en-IN')}</td>
                          <td><strong>{l.wallet_name}</strong></td>
                          <td>
                            <span style={{ 
                              background: l.type === 'credit' ? '#d1fae5' : '#fee2e2', 
                              color: l.type === 'credit' ? '#059669' : '#dc2626', 
                              padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 
                            }}>
                              {l.type === 'credit' ? '+ Credit' : '- Debit'}
                            </span>
                          </td>
                          <td style={{ color: l.type === 'credit' ? '#059669' : '#dc2626', fontWeight: 700 }}>₹{fmt(l.amount)}</td>
                          <td style={{ fontWeight: 700 }}>₹{fmt(l.balance)}</td>
                          <td style={{ fontSize: 12, color: '#64748b' }}>{l.remarks || '—'}</td>
                          <td style={{ fontSize: 11, color: '#9ca3af' }}>{l.ref_type || '—'}</td>
                        </tr>
                      ))}
                      {!(data?.ledger || []).length && <tr><td colSpan={7} className="dash-empty">No ledger entries found</td></tr>}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {tab === 'control' && (
            <>
              <div className="dash-card">
                <div className="dash-card-header"><h2>📊 Expense Categories</h2></div>
                <div className="dash-table-wrap">
                  {loading ? <div className="dash-loading">Loading...</div> : (
                    <table className="dash-table">
                      <thead><tr><th>Category</th><th>Count</th><th>Total Amount</th><th>Average</th></tr></thead>
                      <tbody>
                        {(data?.categories || []).map(c => (
                          <tr key={c.category}>
                            <td><strong>{c.category}</strong></td>
                            <td>{c.count}</td>
                            <td style={{ color: '#dc2626', fontWeight: 700 }}>₹{fmt(c.total_amount)}</td>
                            <td style={{ color: '#64748b' }}>₹{fmt(c.avg_amount)}</td>
                          </tr>
                        ))}
                        {!(data?.categories || []).length && <tr><td colSpan={4} className="dash-empty">No expense data found</td></tr>}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
              
              <div className="dash-card">
                <div className="dash-card-header"><h2>💰 Detailed Expenses</h2></div>
                <div className="dash-table-wrap">
                  {loading ? <div className="dash-loading">Loading...</div> : (
                    <table className="dash-table">
                      <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Note</th><th>Created By</th></tr></thead>
                      <tbody>
                        {(data?.expenses || []).map(e => (
                          <tr key={e.id}>
                            <td>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                            <td><span style={{ background: '#ede9fe', color: '#0d1f3d', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{e.category}</span></td>
                            <td style={{ color: '#dc2626', fontWeight: 700 }}>₹{fmt(e.amount)}</td>
                            <td style={{ color: '#9ca3af', fontSize: 12 }}>{e.note || '—'}</td>
                            <td style={{ fontSize: 12 }}>{e.created_by_name || '—'}</td>
                          </tr>
                        ))}
                        {!(data?.expenses || []).length && <tr><td colSpan={5} className="dash-empty">No expenses found</td></tr>}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}

          {tab === 'performance' && (
            <>
              {data?.branchSummary && data.branchSummary.length > 0 && (
                <div className="dash-card">
                  <div className="dash-card-header"><h2>🏢 Branch Summary</h2></div>
                  <div className="dash-table-wrap">
                    <table className="dash-table">
                      <thead><tr><th>Branch</th><th>Employees</th><th>Transactions</th><th>Total Amount</th><th>Total Profit</th></tr></thead>
                      <tbody>
                        {data.branchSummary.map(b => (
                          <tr key={b.branch}>
                            <td><strong>{b.branch}</strong></td>
                            <td>{b.employee_count}</td>
                            <td>{b.total_transactions}</td>
                            <td style={{ color: '#059669', fontWeight: 700 }}>₹{fmt(b.total_amount)}</td>
                            <td style={{ color: '#d4af37', fontWeight: 700 }}>₹{fmt(b.total_profit)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="dash-card">
                <div className="dash-card-header"><h2>👥 Employee Performance</h2></div>
                <div className="dash-table-wrap">
                  {loading ? <div className="dash-loading">Loading...</div> : (
                    <table className="dash-table">
                      <thead><tr><th>Employee</th><th>Branch</th><th>Transactions</th><th>Total Amount</th><th>Total Profit</th><th>Avg Amount</th><th>Avg Profit</th></tr></thead>
                      <tbody>
                        {(data?.performance || []).map(p => (
                          <tr key={p.employee_id}>
                            <td><strong>{p.employee_name}</strong></td>
                            <td>{p.branch}</td>
                            <td style={{ fontWeight: 700, color: '#0d1f3d' }}>{p.transaction_count}</td>
                            <td style={{ color: '#059669', fontWeight: 700 }}>₹{fmt(p.total_amount)}</td>
                            <td style={{ color: '#d4af37', fontWeight: 700 }}>₹{fmt(p.total_profit)}</td>
                            <td style={{ color: '#64748b' }}>₹{fmt(p.avg_transaction_amount)}</td>
                            <td style={{ color: '#64748b' }}>₹{fmt(p.avg_profit_per_transaction)}</td>
                          </tr>
                        ))}
                        {!(data?.performance || []).length && <tr><td colSpan={7} className="dash-empty">No performance data found</td></tr>}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
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
                            <td><span style={{ background: '#ede9fe', color: '#0d1f3d', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{e.category}</span></td>
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
