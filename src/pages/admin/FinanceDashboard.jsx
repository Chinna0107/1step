import React, { useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getUserByRole } from '../../utils/tokenUtils'
import { useFinanceSummary, useFinanceData, useFinanceAlerts, useWallets, useFinanceControl } from '../../hooks/useFinance'
import '../../pages/dashboard.css'

const fmt    = n => Number(parseFloat(n)||0).toLocaleString('en-IN')
const fmtVal = n => { const v = parseFloat(n)||0; if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }
const today      = new Date().toISOString().split('T')[0]
const monthStart = today.slice(0, 7) + '-01'
const CATEGORIES = ['Rent','Utilities','Salary','Maintenance','Marketing','Other']

// ── Balance Top-Up Modal ──────────────────────────────────────
function BalanceModal({ wallets, onClose, onDone }) {
  const { topUpBalance, topUpWallet, msg, error, busy } = useFinanceControl()
  const [mode,    setMode]    = useState('cash')   // 'cash' | 'bank' | 'wallet'
  const [amount,  setAmount]  = useState('')
  const [remarks, setRemarks] = useState('')
  const [walletId, setWalletId] = useState('')

  const handle = async e => {
    e.preventDefault()
    let ok
    if (mode === 'wallet') ok = await topUpWallet(walletId, amount, remarks)
    else                   ok = await topUpBalance(mode, amount, remarks)
    if (ok) { onDone(); setTimeout(onClose, 800) }
  }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:420, boxShadow:'0 24px 60px rgba(0,0,0,0.2)', overflow:'hidden' }}>
        <div style={{ background:'linear-gradient(135deg,#402070,#c02040)', padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ color:'#fff', fontWeight:800, fontSize:15 }}>💰 Add Balance</div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', width:30, height:30, borderRadius:'50%', cursor:'pointer', fontSize:16 }}>✕</button>
        </div>
        <form onSubmit={handle} style={{ padding:20, display:'flex', flexDirection:'column', gap:14 }}>
          {msg   && <div style={{ background:'#d1fae5', color:'#059669', padding:'8px 12px', borderRadius:8, fontSize:13, fontWeight:600 }}>✅ {msg}</div>}
          {error && <div style={{ background:'#fee2e2', color:'#dc2626', padding:'8px 12px', borderRadius:8, fontSize:13, fontWeight:600 }}>❌ {error}</div>}

          {/* Type selector */}
          <div style={{ display:'flex', gap:8 }}>
            {[
              { key:'cash',   label:'💵 Cash',   color:'#059669' },
              { key:'bank',   label:'🏦 Bank',   color:'#2563eb' },
              { key:'wallet', label:'💼 Wallet', color:'#402070' },
            ].map(t => (
              <button key={t.key} type="button" onClick={() => setMode(t.key)}
                style={{ flex:1, padding:'10px 0', borderRadius:10, border:`2px solid ${mode===t.key ? t.color : '#e2e8f0'}`,
                  background: mode===t.key ? t.color : '#f8fafc', color: mode===t.key ? '#fff' : '#64748b',
                  fontWeight:700, fontSize:13, cursor:'pointer' }}>
                {t.label}
              </button>
            ))}
          </div>

          {mode === 'wallet' && (
            <div className="dash-form-group">
              <label>Select Wallet *</label>
              <select required value={walletId} onChange={e => setWalletId(e.target.value)}>
                <option value="">Choose wallet</option>
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name} — ₹{fmt(w.balance)}</option>
                ))}
              </select>
            </div>
          )}

          <div className="dash-form-group">
            <label>Amount (₹) *</label>
            <input required type="number" min="1" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div className="dash-form-group">
            <label>Remarks</label>
            <input placeholder="Optional" value={remarks} onChange={e => setRemarks(e.target.value)} />
          </div>
          <button type="submit" disabled={busy}
            style={{ padding:'12px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#402070,#c02040)', color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer' }}>
            {busy ? 'Processing...' : '✅ Add Balance'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────
export default function FinanceDashboard() {
  const user = getUserByRole('admin')
  const [tab,      setTab]      = useState('overview')
  const [from,     setFrom]     = useState(monthStart)
  const [to,       setTo]       = useState(today)
  const [showBal,  setShowBal]  = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [expForm,  setExpForm]  = useState({ category:'', amount:'', date:today, note:'' })
  const [saving,   setSaving]   = useState(false)
  const [expMsg,   setExpMsg]   = useState('')

  const { data: summary, loading: sl, refetch: refetchSummary } = useFinanceSummary()
  const { ledger, expenses, expSummary, serviceSummary, daily, totals, loading, refetch } = useFinanceData(from, to)
  const { alerts } = useFinanceAlerts()
  const { wallets, loading: wl, addMoney, msg: wMsg, error: wErr } = useWallets()

  const maxDaily = Math.max(1, ...daily.map(d => d.amount))

  const handleAddExp = async e => {
    e.preventDefault(); setSaving(true); setExpMsg('')
    try {
      const { api } = await import('../../utils/api')
      const { getTokenByRole } = await import('../../utils/tokenUtils')
      await api('/finance/expenses', { method:'POST', headers:{ Authorization:`Bearer ${getTokenByRole('admin')}` }, body:JSON.stringify(expForm) })
      setExpMsg('✅ Expense added'); setExpForm({ category:'', amount:'', date:today, note:'' }); setShowForm(false)
      refetch(true)
    } catch (err) { setExpMsg('❌ ' + err.message) }
    setSaving(false)
  }

  const STATS = [
    { label: 'Cash in Hand',  value: fmtVal(summary?.cashInHand    ?? 0), color: '#059669', bg: '#d1fae5', icon: '💵' },
    { label: 'Bank Balance',  value: fmtVal(summary?.bankBalance   ?? 0), color: '#2563eb', bg: '#dbeafe', icon: '🏦' },
    { label: 'Wallet Total',  value: fmtVal(summary?.walletBalance ?? 0), color: '#7c3aed', bg: '#ede9fe', icon: '💼' },
    { label: 'Today Inflow',  value: fmtVal(summary?.todayInflow   ?? 0), color: '#059669', bg: '#d1fae5', icon: '📈' },
    { label: 'Today Profit',  value: fmtVal(summary?.todayProfit   ?? 0), color: '#d97706', bg: '#fef3c7', icon: '💸' },
    { label: 'Net Profit',    value: fmtVal(totals.netProfit       ?? 0), color: (totals.netProfit ?? 0) >= 0 ? '#059669' : '#dc2626', bg: (totals.netProfit ?? 0) >= 0 ? '#d1fae5' : '#fee2e2', icon: '🏆' },
  ]

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <div>
            <h1>💰 Finance — {user?.branch || 'Branch'}</h1>
            <p style={{ margin:0, fontSize:13, color:'#9ca3af' }}>Branch financial control</p>
          </div>
          <div className="dash-topbar-right" style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <input type="date" value={from} max={to} onChange={e => setFrom(e.target.value)}
              style={{ padding:'7px 10px', border:'1.5px solid #e0e0f0', borderRadius:8, fontSize:13, fontFamily:'inherit' }} />
            <span style={{ color:'#9ca3af', fontSize:13 }}>to</span>
            <input type="date" value={to} min={from} max={today} onChange={e => setTo(e.target.value)}
              style={{ padding:'7px 10px', border:'1.5px solid #e0e0f0', borderRadius:8, fontSize:13, fontFamily:'inherit' }} />
            <button className="dash-btn dash-btn-primary" onClick={() => refetch(true)} style={{ padding:'7px 16px' }}>🔍 Apply</button>
            <button onClick={() => setShowBal(true)}
              style={{ padding:'7px 16px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#059669,#047857)', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>
              + Add Balance
            </button>
          </div>
        </div>

        <div className="dash-main">

          {/* Alerts */}
          {alerts.map((a, i) => (
            <div key={i} style={{ background: a.type==='danger' ? '#fee2e2' : '#fef3c7', color: a.type==='danger' ? '#dc2626' : '#d97706', padding:'10px 16px', borderRadius:10, marginBottom:10, fontSize:13, fontWeight:600 }}>
              ⚠️ {a.msg}
            </div>
          ))}

          {/* Stats — 3 per row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            {STATS.map(s => (
              <div key={s.label} style={{
                background: '#fff',
                borderRadius: 16,
                padding: '20px 22px',
                boxShadow: '0 2px 12px rgba(64,32,112,0.08)',
                borderLeft: `4px solid ${s.color}`,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                minWidth: 0,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px rgba(64,32,112,0.13)` }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(64,32,112,0.08)' }}>
                {/* Icon bubble */}
                <div style={{ width: 48, height: 48, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {s.icon}
                </div>
                {/* Text */}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.5rem)', fontWeight: 900, color: sl || loading ? '#d1d5db' : s.color, lineHeight: 1.1, wordBreak: 'break-word' }}>
                    {sl || loading ? '—' : s.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Wallets row */}
          {!wl && wallets.length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12, marginBottom:20 }}>
              {wallets.map(w => (
                <div key={w.id} style={{ background:'#f8fafc', borderRadius:12, padding:'14px 16px', border:'1.5px solid #e2e8f0' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', marginBottom:4 }}>{w.name}</div>
                  <div style={{ fontSize:20, fontWeight:900, color:'#402070' }}>₹{fmt(w.balance)}</div>
                  <div style={{ fontSize:11, color:'#94a3b8', marginTop:4 }}>
                    ↑ ₹{fmt(w.today_inflow)} today · ↓ ₹{fmt(w.today_outflow)} today
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
            {[
              { key:'overview', label:'📊 Overview' },
              { key:'services', label:'🔧 Services' },
              { key:'daily',    label:'📅 Daily' },
              { key:'expenses', label:'📉 Expenses' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ padding:'9px 18px', borderRadius:10, border:'none', fontWeight:700, fontSize:13, cursor:'pointer',
                  background: tab===t.key ? 'linear-gradient(135deg,#402070,#c02040)' : '#f0f2f8',
                  color: tab===t.key ? '#fff' : '#64748b' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              <div className="dash-card">
                <div className="dash-card-header"><h2>📊 Period Summary</h2><span style={{ fontSize:12, color:'#9ca3af' }}>{from} → {to}</span></div>
                <div className="dash-card-body" style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {[
                    { label:'Total Transactions', value: ledger.reduce((s,l) => s+l.txn, 0),          color:'#402070' },
                    { label:'Total Amount',        value:`₹${fmt(totals.totalCashIn   ?? 0)}`,         color:'#059669' },
                    { label:'Customer Charges',    value:`₹${fmt(totals.totalCharges  ?? 0)}`,         color:'#d97706' },
                    { label:'Gross Profit',        value:`₹${fmt(totals.totalProfit   ?? 0)}`,         color:'#d4af37' },
                    { label:'Total Expenses',      value:`₹${fmt(totals.totalExpenses ?? 0)}`,         color:'#dc2626' },
                    { label:'Net Profit',          value:`₹${fmt(totals.netProfit     ?? 0)}`,         color: totals.netProfit >= 0 ? '#059669' : '#dc2626' },
                  ].map(r => (
                    <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f1f5f9' }}>
                      <span style={{ fontSize:13, color:'#64748b', fontWeight:600 }}>{r.label}</span>
                      <strong style={{ fontSize:14, color:r.color }}>{loading ? '—' : r.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dash-card">
                <div className="dash-card-header"><h2>📉 Expense Breakdown</h2></div>
                <div className="dash-card-body">
                  {loading ? <div className="dash-loading">Loading...</div> : expSummary.length === 0 ? (
                    <div className="dash-empty">No expenses in this period</div>
                  ) : expSummary.map((s, i) => {
                    const colors = ['#402070','#c02040','#d4af37','#059669','#0ea5e9','#f59e0b']
                    const pct = Math.round(s.total / (totals.totalExpenses || 1) * 100)
                    return (
                      <div key={s.category} style={{ marginBottom:14 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:13 }}>
                          <span style={{ fontWeight:600, color:'#374151' }}>{s.category}</span>
                          <span style={{ fontWeight:800, color:'#dc2626' }}>₹{fmt(s.total)} <span style={{ color:'#9ca3af', fontWeight:400 }}>({pct}%)</span></span>
                        </div>
                        <div style={{ height:8, background:'#f1f5f9', borderRadius:999, overflow:'hidden' }}>
                          <div style={{ width:`${pct}%`, height:'100%', background:colors[i%colors.length], borderRadius:999 }} />
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
                    <thead><tr><th>Service</th><th>Transactions</th><th>Total Amount</th><th>Profit</th><th>Avg / Txn</th></tr></thead>
                    <tbody>
                      {serviceSummary.map(s => (
                        <tr key={s.service_type}>
                          <td><strong>{s.service_type}</strong></td>
                          <td style={{ fontWeight:700 }}>{s.txn}</td>
                          <td style={{ color:'#059669', fontWeight:700 }}>₹{fmt(s.amount)}</td>
                          <td style={{ color:'#d4af37', fontWeight:800 }}>₹{fmt(s.profit)}</td>
                          <td style={{ color:'#64748b', fontSize:12 }}>{s.txn ? fmtVal(s.amount/s.txn) : '—'}</td>
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
              <div style={{ padding:'16px 20px' }}>
                {loading ? <div className="dash-loading">Loading...</div> : daily.length === 0 ? (
                  <div className="dash-empty">No data for this period</div>
                ) : daily.map(d => {
                  const pct = Math.round(d.amount / maxDaily * 100)
                  return (
                    <div key={d.day} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                      <div style={{ width:80, fontSize:12, color:'#64748b', flexShrink:0 }}>
                        {new Date(d.day).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}
                      </div>
                      <div style={{ flex:1, height:24, background:'#f1f5f9', borderRadius:6, overflow:'hidden' }}>
                        <div style={{ width:`${pct}%`, height:'100%', background:'linear-gradient(90deg,#402070,#c02040)', borderRadius:6, minWidth:4 }} />
                      </div>
                      <div style={{ width:110, textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:13, fontWeight:800, color:'#1a0a2e' }}>{fmtVal(d.amount)}</div>
                        <div style={{ fontSize:11, color:'#94a3b8' }}>{d.txn} txns · ₹{fmt(d.profit)} profit</div>
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
              {expMsg && <div className={`dash-alert ${expMsg.startsWith('✅') ? 'dash-alert-success' : 'dash-alert-error'}`} style={{ marginBottom:12 }}>{expMsg}</div>}
              <div className="dash-card">
                <div className="dash-card-header">
                  <h2>📉 Expenses ({expenses.length})</h2>
                  <button className="dash-btn dash-btn-primary dash-btn-sm" onClick={() => setShowForm(v => !v)}>
                    {showForm ? '✕ Cancel' : '+ Add Expense'}
                  </button>
                </div>
                {showForm && (
                  <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', background:'#f8fafc' }}>
                    <form onSubmit={handleAddExp}>
                      <div className="dash-form-grid">
                        <div className="dash-form-group">
                          <label>Category *</label>
                          <select required value={expForm.category} onChange={e => setExpForm(f => ({...f, category:e.target.value}))}>
                            <option value="">Select</option>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="dash-form-group">
                          <label>Amount (₹) *</label>
                          <input required type="number" min="1" placeholder="0" value={expForm.amount} onChange={e => setExpForm(f => ({...f, amount:e.target.value}))} />
                        </div>
                        <div className="dash-form-group">
                          <label>Date *</label>
                          <input required type="date" value={expForm.date} onChange={e => setExpForm(f => ({...f, date:e.target.value}))} />
                        </div>
                        <div className="dash-form-group">
                          <label>Note</label>
                          <input placeholder="Optional" value={expForm.note} onChange={e => setExpForm(f => ({...f, note:e.target.value}))} />
                        </div>
                      </div>
                      <div style={{ fontSize:12, color:'#9ca3af', marginBottom:10 }}>🏦 Branch: <strong style={{ color:'#402070' }}>{user?.branch}</strong> (auto-assigned)</div>
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
                            <td style={{ fontSize:12 }}>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                            <td><span style={{ background:'#ede9fe', color:'#402070', padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:700 }}>{e.category}</span></td>
                            <td style={{ color:'#dc2626', fontWeight:700 }}>₹{fmt(e.amount)}</td>
                            <td style={{ color:'#9ca3af', fontSize:12 }}>{e.note || '—'}</td>
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

      {showBal && (
        <BalanceModal
          wallets={wallets}
          onClose={() => setShowBal(false)}
          onDone={() => { refetchSummary(true) }}
        />
      )}
    </div>
  )
}
