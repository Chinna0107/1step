import React, { useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import { useWallets } from '../../hooks/useFinance'
import '../../pages/dashboard.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })
const fmt  = n => Number(parseFloat(n)||0).toLocaleString('en-IN')
const fmtV = n => { const v = parseFloat(n)||0; if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: 380, boxShadow: '0 8px 40px rgba(64,32,112,0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h3 style={{ margin: 0, color: '#402070', fontWeight: 800 }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9ca3af' }}>✕</button>
      </div>
      {children}
    </div>
  </div>
)

export default function Wallets() {
  const { wallets, loading, refetch } = useWallets()
  const [modal, setModal]   = useState(null)
  const [amount, setAmount] = useState('')
  const [remarks, setRemarks] = useState('')
  const [toId, setToId]     = useState('')
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')
  const [err, setErr]       = useState('')

  const reset = () => { setAmount(''); setRemarks(''); setToId(''); setNewName(''); setMsg(''); setErr('') }
  const close = () => { setModal(null); reset() }

  const submit = async () => {
    setSaving(true); setMsg(''); setErr('')
    try {
      const { type, wallet } = modal
      if (type === 'create') {
        await api('/finance/wallets', { method: 'POST', headers: auth(), body: JSON.stringify({ name: newName }) })
        setMsg('Wallet created')
      } else if (type === 'add') {
        await api(`/finance/wallets/${wallet.id}/add`, { method: 'POST', headers: auth(), body: JSON.stringify({ amount, remarks }) })
        setMsg('Money added')
      } else if (type === 'deduct') {
        await api(`/finance/wallets/${wallet.id}/deduct`, { method: 'POST', headers: auth(), body: JSON.stringify({ amount, remarks }) })
        setMsg('Money deducted')
      } else if (type === 'transfer') {
        await api('/finance/wallets/transfer', { method: 'POST', headers: auth(), body: JSON.stringify({ from_id: wallet.id, to_id: toId, amount, remarks }) })
        setMsg('Transfer done')
      }
      refetch(); setTimeout(close, 1000)
    } catch (e) { setErr(e.message) }
    setSaving(false)
  }

  // Group wallets by branch
  const byBranch = wallets.reduce((acc, w) => {
    const b = w.branch || 'Unknown'
    if (!acc[b]) acc[b] = []
    acc[b].push(w)
    return acc
  }, {})

  // Total balance across all wallets
  const totalBalance = wallets.reduce((s, w) => s + parseFloat(w.balance || 0), 0)
  const totalInflow  = wallets.reduce((s, w) => s + parseFloat(w.today_inflow  || 0), 0)
  const totalOutflow = wallets.reduce((s, w) => s + parseFloat(w.today_outflow || 0), 0)

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <div>
            <h1>💼 Platform Wallets</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>
              Each wallet is branch-specific · Balance = Net after platform charges
            </p>
          </div>
          <div className="dash-topbar-right">
            <button className="dash-btn dash-btn-primary" onClick={() => { reset(); setModal({ type: 'create' }) }}>+ New Wallet</button>
          </div>
        </div>

        <div className="dash-main">

          {/* Summary Stats */}
          <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}>
            <div className="dash-stat" style={{ borderTop: '3px solid #402070' }}>
              <div className="dash-stat-label">Total Wallet Balance</div>
              <div className="dash-stat-value" style={{ color: '#402070' }}>{fmtV(totalBalance)}</div>
              <div className="dash-stat-sub">Across all platforms & branches</div>
            </div>
            <div className="dash-stat" style={{ borderTop: '3px solid #059669' }}>
              <div className="dash-stat-label">Today's Inflow</div>
              <div className="dash-stat-value" style={{ color: '#059669' }}>{fmtV(totalInflow)}</div>
              <div className="dash-stat-sub">Customer payments received</div>
            </div>
            <div className="dash-stat" style={{ borderTop: '3px solid #dc2626' }}>
              <div className="dash-stat-label">Today's Outflow</div>
              <div className="dash-stat-value" style={{ color: '#dc2626' }}>{fmtV(totalOutflow)}</div>
              <div className="dash-stat-sub">Platform settlements paid</div>
            </div>
          </div>

          {loading ? <div className="dash-loading">Loading...</div> : (
            Object.entries(byBranch).map(([branch, bWallets]) => (
              <div key={branch} style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#402070', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  🏦 {branch}
                  <span style={{ background: '#ede9fe', color: '#402070', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                    {bWallets.length} wallets · {fmtV(bWallets.reduce((s, w) => s + parseFloat(w.balance||0), 0))} total
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
                  {bWallets.map(w => {
                    const profit = parseFloat(w.today_inflow||0) - parseFloat(w.today_outflow||0)
                    return (
                      <div key={w.id} className="dash-card" style={{ marginBottom: 0, borderTop: `3px solid ${w.wallet_type === 'platform' ? '#402070' : w.wallet_type === 'cash' ? '#059669' : '#0ea5e9'}` }}>
                        <div className="dash-card-header">
                          <div>
                            <h2 style={{ fontSize: 14, margin: 0 }}>
                              {w.wallet_type === 'platform' ? '🏢' : w.wallet_type === 'cash' ? '💵' : '🏦'} {w.name}
                            </h2>
                            {w.platform && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Platform: {w.platform}</div>}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 20, fontWeight: 900, color: parseFloat(w.balance) >= 0 ? '#402070' : '#dc2626' }}>
                              ₹{fmt(w.balance)}
                            </div>
                            <div style={{ fontSize: 10, color: '#9ca3af' }}>Current Balance</div>
                          </div>
                        </div>

                        <div className="dash-card-body" style={{ paddingTop: 8 }}>
                          {/* Today's flow */}
                          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>Today's Flow</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
                              <div>
                                <div style={{ fontSize: 11, color: '#059669', fontWeight: 800 }}>+₹{fmt(w.today_inflow||0)}</div>
                                <div style={{ fontSize: 10, color: '#9ca3af' }}>Inflow</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 800 }}>-₹{fmt(w.today_outflow||0)}</div>
                                <div style={{ fontSize: 10, color: '#9ca3af' }}>Outflow</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 11, color: profit >= 0 ? '#d4af37' : '#dc2626', fontWeight: 800 }}>
                                  {profit >= 0 ? '+' : ''}₹{fmt(profit)}
                                </div>
                                <div style={{ fontSize: 10, color: '#9ca3af' }}>Net Profit</div>
                              </div>
                            </div>
                          </div>

                          {/* Month stats */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 12 }}>
                            <span>Month In: <strong style={{ color: '#059669' }}>₹{fmt(w.month_inflow||0)}</strong></span>
                            <span>Month Out: <strong style={{ color: '#dc2626' }}>₹{fmt(w.month_outflow||0)}</strong></span>
                            <span>Txns: <strong style={{ color: '#402070' }}>{w.today_txns||0}</strong></span>
                          </div>

                          {/* Actions */}
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="dash-btn dash-btn-success dash-btn-sm" style={{ flex: 1 }}
                              onClick={() => { reset(); setModal({ type: 'add', wallet: w }) }}>➕ Add</button>
                            <button className="dash-btn dash-btn-danger dash-btn-sm" style={{ flex: 1 }}
                              onClick={() => { reset(); setModal({ type: 'deduct', wallet: w }) }}>➖ Deduct</button>
                            <button className="dash-btn dash-btn-sm" style={{ flex: 1, background: '#f0f2f8', color: '#402070', border: 'none' }}
                              onClick={() => { reset(); setModal({ type: 'transfer', wallet: w }) }}>🔄</button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}

          {!loading && !wallets.length && (
            <div className="dash-empty" style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
              No wallets found. Wallets are auto-created when transactions are recorded, or create one manually.
            </div>
          )}
        </div>
      </div>

      {modal && (
        <Modal title={
          modal.type === 'create'   ? '➕ New Wallet' :
          modal.type === 'add'      ? `➕ Add Money — ${modal.wallet.name}` :
          modal.type === 'deduct'   ? `➖ Deduct — ${modal.wallet.name}` :
                                      `🔄 Transfer from ${modal.wallet.name}`
        } onClose={close}>
          {msg && <div className="dash-alert dash-alert-success" style={{ marginBottom: 12 }}>✅ {msg}</div>}
          {err && <div className="dash-alert dash-alert-error"   style={{ marginBottom: 12 }}>❌ {err}</div>}

          {modal.type === 'create' ? (
            <div className="dash-form-group" style={{ marginBottom: 16 }}>
              <label>Wallet Name</label>
              <input placeholder="e.g. Bankit, Finkeda, N1PAY" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
          ) : (
            <>
              {modal.type !== 'transfer' && (
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 12 }}>
                  <div style={{ color: '#64748b' }}>Current Balance</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#402070' }}>₹{fmt(modal.wallet.balance)}</div>
                  <div style={{ color: '#9ca3af', marginTop: 4, fontSize: 11 }}>
                    Note: Balance = Net after platform charges deducted
                  </div>
                </div>
              )}
              <div className="dash-form-group" style={{ marginBottom: 12 }}>
                <label>Amount (₹)</label>
                <input type="number" min="1" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              {modal.type === 'transfer' && (
                <div className="dash-form-group" style={{ marginBottom: 12 }}>
                  <label>Transfer To</label>
                  <select value={toId} onChange={e => setToId(e.target.value)}>
                    <option value="">Select wallet</option>
                    {wallets.filter(w => w.id !== modal.wallet.id).map(w => (
                      <option key={w.id} value={w.id}>{w.name} — {w.branch} (₹{fmt(w.balance)})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="dash-form-group" style={{ marginBottom: 16 }}>
                <label>Remarks</label>
                <input placeholder="Optional" value={remarks} onChange={e => setRemarks(e.target.value)} />
              </div>
            </>
          )}
          <button className="dash-btn dash-btn-primary" style={{ width: '100%' }} onClick={submit} disabled={saving}>
            {saving ? 'Processing...' : 'Confirm'}
          </button>
        </Modal>
      )}
    </div>
  )
}
