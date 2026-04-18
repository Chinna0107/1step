import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import { useBranches } from '../../hooks/useSuperAdmin'
import { SkeletonTable } from '../../components/superadmin/Skeleton'
import './superadmin.css'
import './Dashboard.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin')}` })
const fmt    = n => Number(n).toLocaleString('en-IN')
const fmtVal = n => { const v = parseFloat(n); if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }

const REPORT_TYPES = [
  { id: 'daily',    icon: '📅', label: 'Daily Transaction Report',      desc: 'All transactions for a selected date' },
  { id: 'branch',   icon: '🏢', label: 'Branch-wise Report',            desc: 'Revenue & performance per branch' },
  { id: 'profit',   icon: '💰', label: 'Profit & Commission Report',    desc: 'Net profit and commission breakdown' },
  { id: 'employee', icon: '👨💼', label: 'Employee Performance Report', desc: 'Txn count, value & attendance' },
  { id: 'platform', icon: '📊', label: 'Platform-wise Report',          desc: 'Bankit, Finkeda, NTAR, N1PAY stats' },
  { id: 'gst',      icon: '🧾', label: 'GST Report',                    desc: 'GST-ready transaction summary' },
]

export default function Reports() {
  const [selected, setSelected]   = useState('daily')
  const [filters, setFilters]     = useState({ from: '', to: '', branch: '', platform: '' })
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(false)
  const { branches }              = useBranches()
  const [platforms, setPlatforms] = useState([])

  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }))

  useEffect(() => {
    api('/master/platforms', { headers: auth() })
      .then(d => setPlatforms(d.filter(p => p.is_active)))
      .catch(() => {})
  }, [])

  const generate = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.from)     params.set('from', filters.from)
    if (filters.to)       params.set('to', filters.to)
    if (filters.branch)   params.set('branch', filters.branch)
    if (filters.platform) params.set('platform', filters.platform)
    api(`/dashboard/reports?${params}`, { headers: auth() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { generate() }, [])

  const txns   = data?.transactions ?? []
  const totals = data?.totals       ?? {}

  const handleExport = type => {
    if (!txns.length) return alert('No data to export')
    if (type === 'CSV') {
      const headers = 'ID,Date,Employee,Branch,Platform,Service,Amount,Commission%,Profit'
      const rows = txns.map(t => `${t.id},${new Date(t.created_at).toLocaleDateString()},${t.employee_name||''},${t.branch||''},${t.platform||''},${t.service_type||''},${t.amount},${t.commission_pct},${t.profit}`)
      const blob = new Blob([headers + '\n' + rows.join('\n')], { type: 'text/csv' })
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'report.csv'; a.click()
    } else {
      alert(`${type} export coming soon`)
    }
  }

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-topbar-title">Reports & Downloads</h1>
            <p className="dash-topbar-sub">Generate, filter and export all business reports</p>
          </div>
          <div className="dash-topbar-right">
            <button className="sa-btn sa-btn-primary" onClick={() => handleExport('Excel')}>📥 Export Excel</button>
            <button className="sa-btn sa-btn-sm" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }} onClick={() => handleExport('PDF')}>📄 PDF</button>
            <button className="sa-btn sa-btn-sm" style={{ background: '#d1fae5', color: '#059669', border: '1px solid #a7f3d0' }} onClick={() => handleExport('CSV')}>📊 CSV</button>
          </div>
        </div>

        <div className="dash-main">

          <div className="dash-section-label">📋 Select Report Type</div>
          <div className="dash-reports-grid">
            {REPORT_TYPES.map(r => (
              <div key={r.id} className="dash-report-card"
                style={{ cursor: 'pointer', borderTopColor: selected === r.id ? '#c02040' : '#402070',
                         boxShadow: selected === r.id ? '0 4px 20px rgba(192,32,64,0.2)' : undefined }}
                onClick={() => setSelected(r.id)}>
                <span className="dash-report-icon">{r.icon}</span>
                <span className="dash-report-label">{r.label}</span>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{r.desc}</span>
                {selected === r.id && <span className="dash-badge badge-gold" style={{ marginTop: 4 }}>✅ Selected</span>}
              </div>
            ))}
          </div>

          <div className="dash-section-label">🔍 Filters</div>
          <div className="sa-card">
            <div className="sa-card-body">
              <div className="sa-form-grid">
                <div className="sa-form-group">
                  <label>From Date</label>
                  <input type="date" value={filters.from} onChange={e => set('from', e.target.value)} />
                </div>
                <div className="sa-form-group">
                  <label>To Date</label>
                  <input type="date" value={filters.to} onChange={e => set('to', e.target.value)} />
                </div>
                <div className="sa-form-group">
                  <label>Branch</label>
                  <select value={filters.branch} onChange={e => set('branch', e.target.value)}>
                    <option value="">All Branches</option>
                    {branches.map(b => <option key={b.id} value={b.city}>{b.city}</option>)}
                  </select>
                </div>
                <div className="sa-form-group">
                  <label>Platform</label>
                  <select value={filters.platform} onChange={e => set('platform', e.target.value)}>
                    <option value="">All Platforms</option>
                    {platforms.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="sa-btn sa-btn-primary" onClick={generate}>🔍 Generate Report</button>
                <button className="sa-btn" style={{ background: '#f4f5fb', color: '#666', border: '1px solid #e8eaf0' }}
                  onClick={() => { setFilters({ from: '', to: '', branch: '', platform: '' }); setData(null) }}>Clear</button>
              </div>
            </div>
          </div>

          <div className="dash-section-label">📊 Report Preview — {REPORT_TYPES.find(r => r.id === selected)?.label}</div>
          <div className="sa-card">
            <div className="sa-card-header">
              <h2>Transaction Data ({loading ? '...' : txns.length} records)</h2>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="sa-btn sa-btn-primary sa-btn-sm" onClick={() => handleExport('Excel')}>Excel</button>
                <button className="sa-btn sa-btn-sm" style={{ background: '#fee2e2', color: '#dc2626', border: 'none' }} onClick={() => handleExport('PDF')}>PDF</button>
                <button className="sa-btn sa-btn-sm" style={{ background: '#d1fae5', color: '#059669', border: 'none' }} onClick={() => handleExport('CSV')}>CSV</button>
              </div>
            </div>
            <div className="sa-table-wrap">
              {loading ? <SkeletonTable rows={6} cols={9} /> : (
                <table className="sa-table">
                  <thead><tr><th>#</th><th>Date</th><th>Employee</th><th>Branch</th><th>Platform</th><th>Service</th><th>Amount</th><th>Commission</th><th>Profit</th></tr></thead>
                  <tbody>
                    {txns.map(t => (
                      <tr key={t.id}>
                        <td style={{ fontFamily: 'monospace', color: '#402070', fontWeight: 700 }}>#{t.id}</td>
                        <td>{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                        <td><strong>{t.employee_name || '—'}</strong></td>
                        <td>{t.branch || '—'}</td>
                        <td>{t.platform ? <span className="dash-badge badge-purple">{t.platform}</span> : '—'}</td>
                        <td>{t.service_type || '—'}</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>₹{fmt(t.amount)}</td>
                        <td style={{ color: '#d4af37', fontWeight: 700 }}>{t.commission_pct}%{t.charge_pct > 0 ? `+${t.charge_pct}%` : ''}</td>
                        <td style={{ color: '#402070', fontWeight: 800 }}>₹{fmt(t.profit)}</td>
                      </tr>
                    ))}
                    {!txns.length && <tr><td colSpan={9} className="sa-empty">No transactions found — try adjusting filters</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
            {!loading && txns.length > 0 && (
              <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f2f8', display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9ca3af' }}>
                <span>{txns.length} records</span>
                <span>Total: <strong style={{ color: '#059669' }}>{fmtVal(totals.amount ?? 0)}</strong> | Profit: <strong style={{ color: '#d4af37' }}>{fmtVal(totals.profit ?? 0)}</strong></span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
