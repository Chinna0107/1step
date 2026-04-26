import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { useSuperAdminFinance, useBranches, useSuperAdminWallets } from '../../hooks/useSuperAdmin'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import { SkeletonTable, SkeletonStats } from '../../components/superadmin/Skeleton'
import './superadmin.css'
import './Dashboard.css'

const auth   = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin')}` })
const fmt    = n => Number(parseFloat(n)||0).toLocaleString('en-IN')
const fmtVal = n => { const v = parseFloat(n)||0; if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }

const today      = new Date().toISOString().split('T')[0]
const monthStart = today.slice(0, 7) + '-01'

const CATEGORIES = ['Rent','Utilities','Salary','Maintenance','Marketing','Other']
const emptyExp   = { branch: '', category: '', amount: '', date: today, note: '' }

const STAT_COLORS = ['#10b981','#d4af37','#dc2626','#059669','#402070']

export default function Finance() {
  const [tab, setTab]           = useState('overview')
  const [from, setFrom]         = useState(monthStart)
  const [to, setTo]             = useState(today)
  const [branchFilter, setBranchFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(emptyExp)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')
  const [error, setError]       = useState('')
  const { branches }            = useBranches()
  const { ledger, expenses, expSummary, serviceSummary, daily, totals, loading, refetch, addExpense: hookAddExpense } = useSuperAdminFinance(from, to, branchFilter)
  const { byBranch, loading: wLoading, refetch: wRefetch, addMoney, deductMoney } = useSuperAdminWallets()
  const [wMsg, setWMsg]         = useState('')
  const [wAction, setWAction]   = useState(null)
  const [wAmount, setWAmount]   = useState('')
  const [wRemarks, setWRemarks] = useState('')

  const handleWalletAction = async () => {
    if (!wAmount || parseFloat(wAmount) <= 0) return
    const ok = wAction.mode === 'add'
      ? await addMoney(wAction.id, wAmount, wRemarks)
      : await deductMoney(wAction.id, wAmount, wRemarks)
    if (ok) { setWMsg(wAction.mode === 'add' ? '✅ Money added' : '✅ Money deducted'); setWAction(null); setWAmount(''); setWRemarks('') }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAddExp = async e => {
    e.preventDefault()
    setSaving(true); setMsg(''); setError('')
    const ok = await hookAddExpense(form)
    if (ok) { setMsg('✅ Expense added'); setForm(emptyExp); setShowForm(false) }
    else setError('Failed to add expense')
    setSaving(false)
  }


  const maxDaily = Math.max(1, ...daily.map(d => d.amount))

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-topbar-title">💰 Financial Control</h1>
            <p className="dash-topbar-sub">All branches · Real money movement</p>
          </div>
          <div className="dash-topbar-right" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="date" value={from} max={to} onChange={e => setFrom(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit' }} />
            <input type="date" value={to} min={from} max={today} onChange={e => setTo(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit' }} />
            <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit' }}>
              <option value="">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
            <button className="sa-btn sa-btn-primary sa-btn-sm" onClick={refetch}>🔍 Apply</button>
          </div>
        </div>

        <div className="dash-main">

          {/* ── Summary Stats — 3 per row ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {loading ? <SkeletonStats count={6} /> : (
              [
                { label: 'Total Cash In',   value: fmtVal(totals.totalCashIn   ?? 0), color: '#059669', bg: '#d1fae5', icon: '💵' },
                { label: 'Gross Profit',    value: fmtVal(totals.totalProfit   ?? 0), color: '#d97706', bg: '#fef3c7', icon: '📈' },
                { label: 'Total Expenses',  value: fmtVal(totals.totalExpenses ?? 0), color: '#dc2626', bg: '#fee2e2', icon: '📉' },
                { label: 'Net Profit',      value: fmtVal(totals.netProfit     ?? 0), color: (totals.netProfit ?? 0) >= 0 ? '#059669' : '#dc2626', bg: (totals.netProfit ?? 0) >= 0 ? '#d1fae5' : '#fee2e2', icon: '🏆' },
                { label: 'Active Branches', value: ledger.length,                     color: '#7c3aed', bg: '#ede9fe', icon: '🏦' },
                { label: 'Total Txns',      value: ledger.reduce((s, l) => s + l.txn, 0), color: '#0ea5e9', bg: '#e0f2fe', icon: '📊' },
              ].map(s => (
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
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(64,32,112,0.13)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(64,32,112,0.08)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {s.icon}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 'clamp(1.1rem, 1.6vw, 1.5rem)', fontWeight: 900, color: s.color, lineHeight: 1.1, wordBreak: 'break-word' }}>
                      {s.value}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Tabs ── */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { key: 'overview',  label: '📊 Overview' },
              { key: 'branches',  label: '🏦 Branch Ledger' },
              { key: 'services',  label: '🔧 Service-wise' },
              { key: 'daily',     label: '📅 Daily Trend' },
              { key: 'expenses',  label: '📉 Expenses' },
              { key: 'wallets',   label: '💼 Wallets' },
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
              {/* Branch Summary */}
              <div className="sa-card">
                <div className="sa-card-header"><h2>🏦 Branch Performance</h2></div>
                <div className="sa-table-wrap">
                  {loading ? <SkeletonTable rows={3} cols={4} /> : (
                    <table className="sa-table">
                      <thead><tr><th>Branch</th><th>Txns</th><th>Amount</th><th>Profit</th></tr></thead>
                      <tbody>
                        {ledger.map(l => (
                          <tr key={l.branch}>
                            <td><strong>{l.branch}</strong></td>
                            <td>{l.txn}</td>
                            <td style={{ color: '#059669', fontWeight: 700 }}>{fmtVal(l.cash_in)}</td>
                            <td style={{ color: '#d4af37', fontWeight: 800 }}>{fmtVal(l.profit)}</td>
                          </tr>
                        ))}
                        {!ledger.length && <tr><td colSpan={4} className="sa-empty">No data for this period</td></tr>}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Expense Summary */}
              <div className="sa-card">
                <div className="sa-card-header"><h2>📉 Expense Breakdown</h2></div>
                <div className="sa-card-body">
                  {loading ? <SkeletonStats count={4} /> : expSummary.length === 0 ? (
                    <div className="sa-empty">No expenses in this period</div>
                  ) : expSummary.map((s, i) => {
                    const pct = Math.round(s.total / (totals.totalExpenses || 1) * 100)
                    return (
                      <div key={s.category} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                          <span style={{ fontWeight: 600, color: '#374151' }}>{s.category}</span>
                          <span style={{ fontWeight: 800, color: '#dc2626' }}>{fmtVal(s.total)}</span>
                        </div>
                        <div style={{ height: 8, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: STAT_COLORS[i % STAT_COLORS.length], borderRadius: 999 }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── BRANCH LEDGER ── */}
          {tab === 'branches' && (
            <div className="sa-card">
              <div className="sa-card-header">
                <h2>🏦 Branch-wise Ledger — {from} to {to}</h2>
              </div>
              <div className="sa-table-wrap">
                {loading ? <SkeletonTable rows={4} cols={5} /> : (
                  <table className="sa-table">
                    <thead>
                      <tr><th>Branch</th><th>Transactions</th><th>Total Amount</th><th>Customer Charges</th><th>Gross Profit</th><th>Share %</th></tr>
                    </thead>
                    <tbody>
                      {ledger.map(l => (
                        <tr key={l.branch}>
                          <td><strong>{l.branch}</strong></td>
                          <td style={{ fontWeight: 700 }}>{l.txn}</td>
                          <td style={{ color: '#059669', fontWeight: 700 }}>₹{fmt(l.cash_in)}</td>
                          <td style={{ color: '#d97706', fontWeight: 700 }}>₹{fmt(l.charges)}</td>
                          <td style={{ color: '#d4af37', fontWeight: 800 }}>₹{fmt(l.profit)}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 60, height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                                <div style={{ width: `${Math.round(l.cash_in / (totals.totalCashIn || 1) * 100)}%`, height: '100%', background: '#402070', borderRadius: 999 }} />
                              </div>
                              <span style={{ fontSize: 12, color: '#64748b' }}>{Math.round(l.cash_in / (totals.totalCashIn || 1) * 100)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {ledger.length > 0 && (
                        <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                          <td>Total</td>
                          <td>{ledger.reduce((s, l) => s + l.txn, 0)}</td>
                          <td style={{ color: '#059669' }}>₹{fmt(totals.totalCashIn)}</td>
                          <td style={{ color: '#d97706' }}>₹{fmt(totals.totalCharges)}</td>
                          <td style={{ color: '#d4af37' }}>₹{fmt(totals.totalProfit)}</td>
                          <td>100%</td>
                        </tr>
                      )}
                      {!ledger.length && <tr><td colSpan={6} className="sa-empty">No data for this period</td></tr>}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── SERVICE-WISE ── */}
          {tab === 'services' && (
            <div className="sa-card">
              <div className="sa-card-header"><h2>🔧 Service-wise Revenue</h2></div>
              <div className="sa-table-wrap">
                {loading ? <SkeletonTable rows={5} cols={4} /> : (
                  <table className="sa-table">
                    <thead>
                      <tr><th>Service</th><th>Transactions</th><th>Total Amount</th><th>Profit</th><th>Avg / Txn</th></tr>
                    </thead>
                    <tbody>
                      {serviceSummary.map((s, i) => (
                        <tr key={s.service_type}>
                          <td><strong>{s.service_type}</strong></td>
                          <td>{s.txn}</td>
                          <td style={{ color: '#059669', fontWeight: 700 }}>{fmtVal(s.amount)}</td>
                          <td style={{ color: '#d4af37', fontWeight: 800 }}>{fmtVal(s.profit)}</td>
                          <td style={{ color: '#64748b', fontSize: 12 }}>{s.txn ? fmtVal(s.amount / s.txn) : '—'}</td>
                        </tr>
                      ))}
                      {!serviceSummary.length && <tr><td colSpan={5} className="sa-empty">No data</td></tr>}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── DAILY TREND ── */}
          {tab === 'daily' && (
            <div className="sa-card">
              <div className="sa-card-header"><h2>📅 Daily Revenue Trend</h2></div>
              <div style={{ padding: '16px 20px' }}>
                {loading ? <SkeletonStats count={4} /> : daily.length === 0 ? (
                  <div className="sa-empty">No data for this period</div>
                ) : daily.map(d => {
                  const pct = Math.round(d.amount / maxDaily * 100)
                  return (
                    <div key={d.day} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 90, fontSize: 12, color: '#64748b', flexShrink: 0 }}>
                        {new Date(d.day).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                      <div style={{ flex: 1, height: 24, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#402070,#c02040)', borderRadius: 6, minWidth: 4, transition: 'width 0.6s ease' }} />
                      </div>
                      <div style={{ width: 100, textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#1a0a2e' }}>{fmtVal(d.amount)}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{d.txn} txns</div>
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
                            {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
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
                        {!expenses.length && <tr><td colSpan={5} className="sa-empty">No expenses in this period</td></tr>}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── WALLETS ── */}
          {tab === 'wallets' && (
            <>
              {wMsg && <div className="sa-alert sa-alert-success" style={{ marginBottom: 12 }} onClick={() => setWMsg('')}>{wMsg}</div>}
              {wAction && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 340, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#1a0a2e' }}>
                      {wAction.mode === 'add' ? '➕ Add Money' : '➖ Deduct Money'} — {wAction.name}
                    </h3>
                    <input type="number" min="1" placeholder="Amount (₹)" value={wAmount} onChange={e => setWAmount(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }} />
                    <input placeholder="Remarks (optional)" value={wRemarks} onChange={e => setWRemarks(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="sa-btn sa-btn-primary" style={{ flex: 1 }} onClick={handleWalletAction}>Confirm</button>
                      <button className="sa-btn" style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none' }} onClick={() => { setWAction(null); setWAmount(''); setWRemarks('') }}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
              {wLoading ? <SkeletonTable rows={4} cols={8} /> : Object.entries(byBranch).map(([branch, wallets]) => (
                <div key={branch} className="sa-card" style={{ marginBottom: 20 }}>
                  <div className="sa-card-header">
                    <h2>🏦 {branch}</h2>
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                      Total: ₹{fmt(wallets.reduce((s, w) => s + parseFloat(w.balance || 0), 0))}
                    </span>
                  </div>
                  <div className="sa-table-wrap">
                    <table className="sa-table">
                      <thead>
                        <tr>
                          <th>Wallet</th><th>Type</th><th>Balance</th>
                          <th>Today In</th><th>Today Out</th>
                          <th>Month In</th><th>Month Out</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wallets.map(w => (
                          <tr key={w.id}>
                            <td><strong>{w.name}</strong>{w.platform ? <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 6 }}>({w.platform})</span> : null}</td>
                            <td><span className="dash-badge badge-purple" style={{ fontSize: 11 }}>{w.wallet_type || 'platform'}</span></td>
                            <td style={{ fontWeight: 800, color: parseFloat(w.balance) < 1000 ? '#dc2626' : '#059669' }}>₹{fmt(w.balance)}</td>
                            <td style={{ color: '#059669', fontWeight: 600 }}>₹{fmt(w.today_inflow)}</td>
                            <td style={{ color: '#dc2626', fontWeight: 600 }}>₹{fmt(w.today_outflow)}</td>
                            <td style={{ color: '#059669' }}>₹{fmt(w.month_inflow)}</td>
                            <td style={{ color: '#dc2626' }}>₹{fmt(w.month_outflow)}</td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className="sa-btn sa-btn-primary sa-btn-sm" onClick={() => { setWAction({ id: w.id, name: w.name, mode: 'add' }); setWAmount(''); setWRemarks('') }}>+ Add</button>
                                <button className="sa-btn sa-btn-sm" style={{ background: '#fee2e2', color: '#dc2626', border: 'none' }} onClick={() => { setWAction({ id: w.id, name: w.name, mode: 'deduct' }); setWAmount(''); setWRemarks('') }}>− Deduct</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              {!wLoading && Object.keys(byBranch).length === 0 && <div className="sa-empty">No wallets found</div>}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
