import React, { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import '../../pages/dashboard.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })
const fmt    = n => Number(n).toLocaleString('en-IN')
const fmtVal = n => { const v = parseFloat(n); if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }
const today  = new Date().toISOString().split('T')[0]

export default function AdminReports() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [from, setFrom]       = useState(today)
  const [to, setTo]           = useState(today)

  const load = () => {
    setLoading(true)
    const p = new URLSearchParams({ from, to })
    api(`/dashboard/reports?${p}`, { headers: auth() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const txns   = data?.transactions ?? []
  const totals = data?.totals       ?? {}

  const exportCSV = () => {
    if (!txns.length) return alert('No data to export')
    const h = 'ID,Date,Employee,Branch,Service,Platform,Amount,Commission%,Profit'
    const r = txns.map(t => `${t.id},${new Date(t.created_at).toLocaleDateString()},${t.employee_name||''},${t.branch||''},${t.service_type||''},${t.platform||''},${t.amount},${t.commission_pct},${t.profit}`)
    const blob = new Blob([h + '\n' + r.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `report_${from}_${to}.csv`; a.click()
  }

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <h1>Reports & Downloads</h1>
          <div className="dash-topbar-right">
            <button className="dash-btn dash-btn-primary" onClick={exportCSV}>📊 Export CSV</button>
            <button className="dash-btn" style={{ background: '#fee2e2', color: '#dc2626', border: 'none' }} onClick={() => alert('PDF export coming soon')}>📄 PDF</button>
          </div>
        </div>
        <div className="dash-main">

          <div className="dash-stats">
            <div className="dash-stat"><div className="dash-stat-label">Transactions</div><div className="dash-stat-value">{loading ? '—' : fmt(totals.count ?? 0)}</div></div>
            <div className="dash-stat"><div className="dash-stat-label">Total Value</div><div className="dash-stat-value">{loading ? '—' : fmtVal(totals.amount ?? 0)}</div></div>
            <div className="dash-stat"><div className="dash-stat-label">Total Profit</div><div className="dash-stat-value">{loading ? '—' : fmtVal(totals.profit ?? 0)}</div></div>
          </div>

          <div className="dash-card">
            <div className="dash-card-body" style={{ padding: '16px 22px' }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div className="dash-form-group"><label>From</label><input type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
                <div className="dash-form-group"><label>To</label><input type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
                <button className="dash-btn dash-btn-primary" onClick={load}>🔍 Generate</button>
              </div>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-header">
              <h2>Transaction Report ({txns.length} records)</h2>
              <span style={{ fontSize: 13, color: '#9ca3af' }}>
                Value: <strong style={{ color: '#059669' }}>{fmtVal(totals.amount ?? 0)}</strong> · Profit: <strong style={{ color: '#d4af37' }}>{fmtVal(totals.profit ?? 0)}</strong>
              </span>
            </div>
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : (
                <table className="dash-table">
                  <thead><tr><th>#</th><th>Date</th><th>Employee</th><th>Service</th><th>Platform</th><th>Amount</th><th>Commission</th><th>Profit</th></tr></thead>
                  <tbody>
                    {txns.map(t => (
                      <tr key={t.id}>
                        <td style={{ fontFamily: 'monospace', color: '#402070', fontWeight: 700, fontSize: 12 }}>#{t.id}</td>
                        <td style={{ fontSize: 12 }}>{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                        <td><strong>{t.employee_name || '—'}</strong></td>
                        <td>{t.service_type || '—'}</td>
                        <td>{t.platform || '—'}</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>₹{fmt(t.amount)}</td>
                        <td style={{ color: '#d4af37' }}>{t.commission_pct}%</td>
                        <td style={{ color: '#402070', fontWeight: 800 }}>₹{fmt(t.profit)}</td>
                      </tr>
                    ))}
                    {!txns.length && <tr><td colSpan={8} className="dash-empty">No data — adjust date range</td></tr>}
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
