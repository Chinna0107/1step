import React, { useState, useEffect, useCallback, useRef } from 'react'
import EmployeeNavbar from '../../components/employee/EmployeeNavbar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import { MdDownload, MdPictureAsPdf, MdTableChart, MdRefresh, MdFilterList } from 'react-icons/md'
import './EmployeeReports.css'

const auth   = () => ({ Authorization: `Bearer ${getTokenByRole('employee') || getTokenByRole('admin')}` })
const fmt    = n => Number(n).toLocaleString('en-IN')
const fmtVal = n => { const v = parseFloat(n); if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }
const today  = new Date().toISOString().split('T')[0]
const monthStart = today.slice(0, 7) + '-01'

export default function EmployeeReports() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [from, setFrom]       = useState(monthStart)
  const [to, setTo]           = useState(today)
  const [tab, setTab]         = useState('service')
  const printRef              = useRef()

  const load = useCallback(() => {
    setLoading(true)
    const p = new URLSearchParams({ from, to })
    api(`/dashboard/reports?${p}`, { headers: auth() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [from, to])

  useEffect(() => { load() }, [load])

  const txns            = data?.transactions    ?? []
  const totals          = data?.totals          ?? {}
  const platformSummary = data?.platformSummary ?? []
  const serviceSummary  = data?.serviceSummary  ?? []

  // Convert to rows for display
  const serviceRows  = serviceSummary.map(s => ({ name: s.name, count: s.count, amount: s.amount, profit: s.commission ?? 0 }))
  const platformRows = platformSummary.map(p => ({ name: p.name, count: p.count, amount: p.amount, profit: 0 }))

  const maxSvcAmt = Math.max(1, ...serviceRows.map(r => r.amount))
  const maxPltAmt = Math.max(1, ...platformRows.map(r => r.amount))

  const activeRows = tab === 'service' ? serviceRows : platformRows
  const maxAmt     = tab === 'service' ? maxSvcAmt   : maxPltAmt

  // ── Export Excel (CSV) ──
  const exportExcel = () => {
    if (!activeRows.length) return
    const label = tab === 'service' ? 'Service' : 'Platform'
    const header = `${label},Transactions,Total Amount,Total Profit`
    const rows   = activeRows.map(r => `${r.name},${r.count},${r.amount.toFixed(2)},${r.profit.toFixed(2)}`)
    const blob   = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' })
    const a      = document.createElement('a')
    a.href       = URL.createObjectURL(blob)
    a.download   = `${tab}_report_${from}_${to}.csv`
    a.click()
  }

  // ── Export PDF (print) ──
  const exportPDF = () => {
    const label = tab === 'service' ? 'Service' : 'Platform'
    const rows  = activeRows.map(r =>
      `<tr><td>${r.name}</td><td>${r.count}</td><td>₹${fmt(r.amount)}</td><td>₹${fmt(r.profit)}</td></tr>`
    ).join('')
    const html = `
      <html><head><title>${label} Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #1a0a2e; }
        h2   { color: #402070; margin-bottom: 4px; }
        p    { color: #64748b; font-size: 13px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #402070; color: #fff; padding: 10px 14px; text-align: left; }
        td { padding: 9px 14px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) td { background: #f8fafc; }
        .summary { display: flex; gap: 24px; margin-bottom: 20px; }
        .s-box { background: #f0f2f8; border-radius: 8px; padding: 12px 20px; }
        .s-label { font-size: 11px; color: #64748b; text-transform: uppercase; }
        .s-val   { font-size: 20px; font-weight: 800; color: #402070; }
      </style></head><body>
      <h2>MoneySpot — ${label}-wise Report</h2>
      <p>Period: ${from} to ${to}</p>
      <div class="summary">
        <div class="s-box"><div class="s-label">Total Transactions</div><div class="s-val">${fmt(totals.count ?? 0)}</div></div>
        <div class="s-box"><div class="s-label">Total Value</div><div class="s-val">₹${fmt(totals.amount ?? 0)}</div></div>
        <div class="s-box"><div class="s-label">Total Profit</div><div class="s-val">₹${fmt(totals.profit ?? 0)}</div></div>
      </div>
      <table><thead><tr><th>${label}</th><th>Transactions</th><th>Total Amount</th><th>Total Profit</th></tr></thead>
      <tbody>${rows}</tbody></table>
      </body></html>`
    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => { w.print(); w.close() }, 400)
  }

  const COLORS = ['#402070','#c02040','#d4af37','#059669','#0ea5e9','#f59e0b','#8b5cf6','#ec4899']

  return (
    <div className="er-page">
      <EmployeeNavbar />
      <div className="er-content">

        {/* ── Header ── */}
        <div className="er-header">
          <div className="er-header-bg" />
          <div className="er-header-inner">
            <div>
              <div className="er-header-label">My Reports</div>
              <h1 className="er-header-title">Transaction Analytics</h1>
              <div className="er-header-sub">Service-wise & Platform-wise breakdown</div>
            </div>
            <div className="er-header-actions">
              <button className="er-btn er-btn-ghost" onClick={load}><MdRefresh size={16} /> Refresh</button>
              <button className="er-btn er-btn-excel" onClick={exportExcel}><MdTableChart size={16} /> Excel</button>
              <button className="er-btn er-btn-pdf"   onClick={exportPDF}><MdPictureAsPdf size={16} /> PDF</button>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="er-filters">
          <div className="er-filter-icon"><MdFilterList size={18} /></div>
          <div className="er-filter-group">
            <label>From</label>
            <input type="date" value={from} max={to} onChange={e => setFrom(e.target.value)} />
          </div>
          <div className="er-filter-group">
            <label>To</label>
            <input type="date" value={to} min={from} max={today} onChange={e => setTo(e.target.value)} />
          </div>
          <button className="er-btn er-btn-primary" onClick={load}>Generate</button>
        </div>

        {/* ── Summary Cards ── */}
        <div className="er-summary">
          {[
            { label: 'Total Transactions', value: fmt(totals.count ?? 0),          color: '#402070', icon: '📊' },
            { label: 'Total Value',        value: fmtVal(totals.amount ?? 0),       color: '#059669', icon: '💰' },
            { label: 'Total Profit',       value: fmtVal(totals.profit ?? 0),       color: '#d4af37', icon: '📈' },
            { label: 'Services Used',      value: serviceRows.length,               color: '#c02040', icon: '🔧' },
            { label: 'Platforms Used',     value: platformRows.length,              color: '#0ea5e9', icon: '📱' },
          ].map(c => (
            <div key={c.label} className="er-sum-card" style={{ '--c': c.color }}>
              <div className="er-sum-icon">{c.icon}</div>
              <div className="er-sum-val">{loading ? '—' : c.value}</div>
              <div className="er-sum-label">{c.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="er-tabs">
          <button className={`er-tab ${tab === 'service' ? 'active' : ''}`}  onClick={() => setTab('service')}>🔧 Service-wise</button>
          <button className={`er-tab ${tab === 'platform' ? 'active' : ''}`} onClick={() => setTab('platform')}>📱 Platform-wise</button>
          <div className="er-tab-actions">
            <button className="er-btn er-btn-sm er-btn-excel" onClick={exportExcel}><MdDownload size={14} /> Excel</button>
            <button className="er-btn er-btn-sm er-btn-pdf"   onClick={exportPDF}><MdDownload size={14} /> PDF</button>
          </div>
        </div>

        {/* ── Chart + Table ── */}
        {loading ? (
          <div className="er-skeleton-wrap">
            {[1,2,3,4].map(i => <div key={i} className="er-skel" style={{ animationDelay: `${i*80}ms` }} />)}
          </div>
        ) : activeRows.length === 0 ? (
          <div className="er-empty">
            <div className="er-empty-icon">📭</div>
            <div>No transactions found for this period</div>
          </div>
        ) : (
          <>
            {/* Bar Chart */}
            <div className="er-chart-card">
              <div className="er-chart-header">
                <h2>{tab === 'service' ? 'Service' : 'Platform'}-wise Amount Distribution</h2>
                <span className="er-chart-badge">{activeRows.length} {tab === 'service' ? 'services' : 'platforms'}</span>
              </div>
              <div className="er-chart-body">
                {activeRows.map((r, i) => {
                  const pct = Math.round((r.amount / maxAmt) * 100)
                  return (
                    <div key={r.name} className="er-bar-row" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="er-bar-label">{r.name}</div>
                      <div className="er-bar-track">
                        <div className="er-bar-fill" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}>
                          <span className="er-bar-pct">{pct}%</span>
                        </div>
                      </div>
                      <div className="er-bar-meta">
                        <span className="er-bar-amt">{fmtVal(r.amount)}</span>
                        <span className="er-bar-cnt">{r.count} txns</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Donut-style breakdown */}
            <div className="er-breakdown-grid">
              {activeRows.map((r, i) => (
                <div key={r.name} className="er-breakdown-card" style={{ '--bc': COLORS[i % COLORS.length] }}>
                  <div className="er-bc-accent" />
                  <div className="er-bc-name">{r.name}</div>
                  <div className="er-bc-stats">
                    <div>
                      <div className="er-bc-val">₹{fmt(r.amount)}</div>
                      <div className="er-bc-lbl">Amount</div>
                    </div>
                    <div>
                      <div className="er-bc-val er-bc-profit">₹{fmt(r.profit)}</div>
                      <div className="er-bc-lbl">Profit</div>
                    </div>
                    <div>
                      <div className="er-bc-val er-bc-count">{r.count}</div>
                      <div className="er-bc-lbl">Txns</div>
                    </div>
                  </div>
                  <div className="er-bc-bar">
                    <div className="er-bc-bar-fill" style={{ width: `${Math.round(r.amount / maxAmt * 100)}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Table */}
            <div className="er-table-card">
              <div className="er-table-header">
                <h2>Detailed {tab === 'service' ? 'Service' : 'Platform'} Breakdown</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="er-btn er-btn-sm er-btn-excel" onClick={exportExcel}><MdTableChart size={13} /> Excel</button>
                  <button className="er-btn er-btn-sm er-btn-pdf"   onClick={exportPDF}><MdPictureAsPdf size={13} /> PDF</button>
                </div>
              </div>
              <div className="er-table-wrap">
                <table className="er-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{tab === 'service' ? 'Service' : 'Platform'}</th>
                      <th>Transactions</th>
                      <th>Total Amount</th>
                      <th>Total Profit</th>
                      <th>Avg Amount</th>
                      <th>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRows.map((r, i) => (
                      <tr key={r.name} className="er-tr" style={{ animationDelay: `${i * 40}ms` }}>
                        <td><span className="er-rank" style={{ background: COLORS[i % COLORS.length] }}>{i + 1}</span></td>
                        <td><strong>{r.name}</strong></td>
                        <td><span className="er-tag">{r.count}</span></td>
                        <td><span className="er-amt">₹{fmt(r.amount)}</span></td>
                        <td><span className="er-profit">₹{fmt(r.profit)}</span></td>
                        <td style={{ color: '#64748b' }}>₹{fmt(Math.round(r.amount / r.count))}</td>
                        <td>
                          <div className="er-share-bar">
                            <div className="er-share-fill" style={{ width: `${Math.round(r.amount / maxAmt * 100)}%`, background: COLORS[i % COLORS.length] }} />
                            <span className="er-share-pct">{Math.round(r.amount / (totals.amount || 1) * 100)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
