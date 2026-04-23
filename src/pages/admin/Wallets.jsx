import React, { useEffect, useState, useCallback } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import '../../pages/dashboard.css'
import { useWallets } from '../../hooks/useFinance'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })
const fmt  = n => `₹${Number(n || 0).toLocaleString('en-IN')}`

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: 360, boxShadow: '0 8px 40px rgba(64,32,112,0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h3 style={{ margin: 0, color: '#402070', fontWeight: 800 }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9ca3af' }}>✕</button>
      </div>
      {children}
    </div>
  </div>
)

export default function Wallets() {
  const [wallets, setWallets]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null) // { type: 'add'|'deduct'|'transfer'|'create', wallet }
  const [amount, setAmount]     = useState('')
  const [remarks, setRemarks]   = useState('')
  const [toId, setToId]         = useState('')
  const [newName, setNewName]   = useState('')
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')
  const [err, setErr]           = useState('')

  const refetch = useCallback(() => {
    setLoading(true)
    api('/finance/wallets', { headers: auth() })
      .then(d => { setWallets(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { refetch() }, [refetch])

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

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <h1>💼 Wallets</h1>
          <div className="dash-topbar-right">
            <button className="dash-btn dash-btn-primary" onClick={() => { reset(); setModal({ type: 'create' }) }}>+ New Wallet</button>
          </div>
        </div>
        <div className="dash-main">
          {loading ? <div className="dash-loading">Loading...</div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
              {wallets.map(w => (
                <div key={w.id} className="dash-card" style={{ marginBottom: 0 }}>
                  <div className="dash-card-header">
                    <h2>🏦 {w.name}</h2>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{w.branch}</span>
                  </div>
                  <div className="dash-card-body">
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#402070', marginBottom: 16 }}>{fmt(w.balance)}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="dash-btn dash-btn-success dash-btn-sm" onClick={() => { reset(); setModal({ type: 'add', wallet: w }) }}>➕ Add</button>
                      <button className="dash-btn dash-btn-danger  dash-btn-sm" onClick={() => { reset(); setModal({ type: 'deduct', wallet: w }) }}>➖ Deduct</button>
                      <button className="dash-btn dash-btn-secondary dash-btn-sm" onClick={() => { reset(); setModal({ type: 'transfer', wallet: w }) }}>🔄 Transfer</button>
                    </div>
                  </div>
                </div>
              ))}
              {!wallets.length && <div className="dash-empty">No wallets found. Create one.</div>}
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
                      <option key={w.id} value={w.id}>{w.name} ({fmt(w.balance)})</option>
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
