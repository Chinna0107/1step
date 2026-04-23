import React, { useEffect, useState, useCallback } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import '../../pages/dashboard.css'
import { useLedger } from '../../hooks/useFinance'

const auth  = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })
const fmt   = n => `₹${Number(n || 0).toLocaleString('en-IN')}`
const today = () => new Date().toISOString().split('T')[0]

export default function Ledger() {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [from, setFrom]       = useState(today())
  const [to, setTo]           = useState(today())

  const refetch = useCallback(() => {
    setLoading(true)
    api(`/finance/ledger?from=${from}&to=${to}`, { headers: auth() })
      .then(d => { setRows(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [from, to])

  useEffect(() => { refetch() }, [refetch])

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <h1>📒 Ledger</h1>
          <div className="dash-topbar-right" style={{ gap: 8 }}>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              style={{ padding: '7px 10px', border: '1.5px solid #e0e0f0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }} />
            <span style={{ color: '#9ca3af', fontSize: 13 }}>to</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              style={{ padding: '7px 10px', border: '1.5px solid #e0e0f0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }} />
            <button className="dash-btn dash-btn-primary dash-btn-sm" onClick={refetch}>Filter</button>
          </div>
        </div>
        <div className="dash-main">
          <div className="dash-card">
            <div className="dash-card-header">
              <h2>All Entries ({rows.length})</h2>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>Auto-saved · Read only</span>
            </div>
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Wallet</th>
                      <th>Balance</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontSize: 12, color: '#6b7280' }}>
                          {new Date(r.created_at).toLocaleDateString('en-IN')}{' '}
                          <span style={{ color: '#9ca3af' }}>{new Date(r.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                            background: r.type === 'credit' ? '#d1fae5' : '#fee2e2',
                            color:      r.type === 'credit' ? '#059669' : '#dc2626',
                          }}>
                            {r.type === 'credit' ? '▲ Credit' : '▼ Debit'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: r.type === 'credit' ? '#059669' : '#dc2626' }}>
                          {r.type === 'credit' ? '+' : '-'}{fmt(r.amount)}
                        </td>
                        <td style={{ fontWeight: 600 }}>{r.wallet_name || r.wallet || '—'}</td>
                        <td style={{ fontWeight: 700, color: '#402070' }}>{fmt(r.balance)}</td>
                        <td style={{ color: '#6b7280', fontSize: 12 }}>{r.remarks || '—'}</td>
                      </tr>
                    ))}
                    {!rows.length && <tr><td colSpan={6} className="dash-empty">No entries for selected range</td></tr>}
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
