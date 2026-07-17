import React, { useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useLedger } from '../../hooks/useFinance'
import '../../pages/dashboard.css'

const fmt   = n => Number(parseFloat(n)||0).toLocaleString('en-IN')
const fmtV  = n => { const v = parseFloat(n)||0; if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }
const today = new Date().toISOString().split('T')[0]

export default function Ledger() {
  const [from, setFrom] = useState(today)
  const [to, setTo]     = useState(today)
  const { rows, loading, refetch } = useLedger(from, to)

  const totalCredit = rows.filter(r => r.type === 'credit').reduce((s, r) => s + parseFloat(r.amount||0), 0)
  const totalDebit  = rows.filter(r => r.type === 'debit' ).reduce((s, r) => s + parseFloat(r.amount||0), 0)

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <div>
            <h1>📒 Ledger</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>Auto-recorded · Every transaction creates 2 entries (inflow + outflow)</p>
          </div>
          <div className="dash-topbar-right" style={{ gap: 8 }}>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              style={{ padding: '7px 10px', border: '1.5px solid #e0e0f0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }} />
            <span style={{ color: '#9ca3af', fontSize: 13 }}>to</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              style={{ padding: '7px 10px', border: '1.5px solid #e0e0f0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }} />
            <button className="dash-btn dash-btn-primary dash-btn-sm" onClick={refetch}>Apply</button>
          </div>
        </div>
        <div className="dash-main">

          {/* Summary */}
          <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 20 }}>
            <div className="dash-stat" style={{ borderTop: '3px solid #059669' }}>
              <div className="dash-stat-label">Total Credits</div>
              <div className="dash-stat-value" style={{ color: '#059669' }}>{fmtV(totalCredit)}</div>
              <div className="dash-stat-sub">Inflows recorded</div>
            </div>
            <div className="dash-stat" style={{ borderTop: '3px solid #dc2626' }}>
              <div className="dash-stat-label">Total Debits</div>
              <div className="dash-stat-value" style={{ color: '#dc2626' }}>{fmtV(totalDebit)}</div>
              <div className="dash-stat-sub">Outflows recorded</div>
            </div>
            <div className="dash-stat" style={{ borderTop: '3px solid #0d1f3d' }}>
              <div className="dash-stat-label">Net</div>
              <div className="dash-stat-value" style={{ color: totalCredit - totalDebit >= 0 ? '#059669' : '#dc2626' }}>{fmtV(totalCredit - totalDebit)}</div>
              <div className="dash-stat-sub">{rows.length} entries</div>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-header">
              <h2>All Entries ({rows.length})</h2>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>Auto-saved · Read only</span>
            </div>
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : (
                <table className="dash-table">
                  <thead>
                    <tr><th>Date & Time</th><th>Type</th><th>Amount</th><th>Wallet / Platform</th><th>Balance After</th><th>Remarks</th></tr>
                  </thead>
                  <tbody>
                    {rows.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontSize: 12, color: '#6b7280' }}>
                          {new Date(r.created_at).toLocaleDateString('en-IN')}
                          <span style={{ color: '#9ca3af', marginLeft: 6 }}>{new Date(r.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                        <td>
                          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: r.type === 'credit' ? '#d1fae5' : '#fee2e2', color: r.type === 'credit' ? '#059669' : '#dc2626' }}>
                            {r.type === 'credit' ? '▲ Credit' : '▼ Debit'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: r.type === 'credit' ? '#059669' : '#dc2626' }}>
                          {r.type === 'credit' ? '+' : '-'}₹{fmt(r.amount)}
                        </td>
                        <td style={{ fontWeight: 600 }}>{r.wallet_name || '—'}</td>
                        <td style={{ fontWeight: 700, color: '#0d1f3d' }}>₹{fmt(r.balance)}</td>
                        <td style={{ color: '#6b7280', fontSize: 12, maxWidth: 200 }}>{r.remarks || '—'}</td>
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
