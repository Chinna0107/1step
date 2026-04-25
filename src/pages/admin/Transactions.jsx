import React, { useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useAdminTransactions } from '../../hooks/useFinance'
import { MdPrint, MdFilterList, MdRefresh } from 'react-icons/md'
import PrintReceipt from '../../components/PrintReceipt'
import '../../pages/dashboard.css'

const fmt    = n => Number(n).toLocaleString('en-IN')
const fmtVal = n => { const v = parseFloat(n); if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }
const today  = new Date().toISOString().split('T')[0]

export default function AdminTransactions() {
  const [from, setFrom]         = useState(today)
  const [to, setTo]             = useState(today)
  const [printTxn, setPrintTxn] = useState(null)

  const { transactions: txns, totals, loading, refetch } = useAdminTransactions(from, to)

  const load = () => refetch()

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <h1>Transaction Management</h1>
          <div className="dash-topbar-right">
            <button className="dash-btn" style={{ background: '#f0f2f8', color: '#402070', border: 'none', padding: '7px 14px' }} onClick={load}><MdRefresh /></button>
            <span className="dash-badge">{loading ? '...' : txns.length} Records</span>
          </div>
        </div>
        <div className="dash-main">

          {/* Summary */}
          <div className="dash-stats">
            <div className="dash-stat"><div className="dash-stat-label">Total Transactions</div><div className="dash-stat-value">{loading ? '—' : fmt(totals.count ?? 0)}</div></div>
            <div className="dash-stat"><div className="dash-stat-label">Total Value</div><div className="dash-stat-value">{loading ? '—' : fmtVal(totals.amount ?? 0)}</div></div>
            <div className="dash-stat"><div className="dash-stat-label">Total Profit</div><div className="dash-stat-value">{loading ? '—' : fmtVal(totals.profit ?? 0)}</div></div>
          </div>

          {/* Filters */}
          <div className="dash-card">
            <div className="dash-card-body" style={{ padding: '16px 22px' }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div className="dash-form-group">
                  <label>From Date</label>
                  <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
                </div>
                <div className="dash-form-group">
                  <label>To Date</label>
                  <input type="date" value={to} onChange={e => setTo(e.target.value)} />
                </div>
                <button className="dash-btn dash-btn-primary" onClick={load}><MdFilterList /> Filter</button>
                <button className="dash-btn" style={{ background: '#f0f2f8', color: '#666', border: 'none' }}
                  onClick={() => { setFrom(today); setTo(today); setTimeout(load, 0) }}>Today</button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h2>Transactions</h2>
              <div style={{ fontSize: 13, color: '#9ca3af' }}>
                Total: <strong style={{ color: '#059669' }}>{fmtVal(totals.amount ?? 0)}</strong> · Profit: <strong style={{ color: '#d4af37' }}>{fmtVal(totals.profit ?? 0)}</strong>
              </div>
            </div>
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : (
                <table className="dash-table">
                  <thead>
                    <tr><th>#</th><th>Date</th><th>Employee</th><th>Customer</th><th>Service</th><th>Platform</th><th>Amount</th><th>Charges</th><th>Settled</th><th>Print</th></tr>
                  </thead>
                  <tbody>
                    {txns.map(t => (
                      <tr key={t.id}>
                        <td style={{ fontFamily: 'monospace', color: '#402070', fontWeight: 700, fontSize: 12 }}>#{t.id}</td>
                        <td style={{ fontSize: 12 }}>{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                        <td><strong>{t.employee_name || '—'}</strong></td>
                        <td style={{ fontSize: 12 }}>{t.cust_name || '—'}</td>
                        <td>{t.service_type || '—'}</td>
                        <td>{t.platform ? <span style={{ background: '#ede9fe', color: '#402070', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{t.platform}</span> : '—'}</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>₹{fmt(t.amount)}</td>
                        <td style={{ color: '#dc2626', fontWeight: 600 }}>₹{fmt(t.charges_amount || 0)}</td>
                        <td style={{ color: '#402070', fontWeight: 800 }}>₹{fmt(t.settled_amount || t.profit || 0)}</td>
                        <td>
                          <button onClick={() => setPrintTxn(t)}
                            style={{ background: 'linear-gradient(135deg,#402070,#c02040)', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
                            <MdPrint size={14} /> Print
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!txns.length && <tr><td colSpan={10} className="dash-empty">No transactions found</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>

      {printTxn && <PrintReceipt txn={printTxn} onClose={() => setPrintTxn(null)} />}
    </div>
  )
}
