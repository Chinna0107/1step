import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import { SkeletonTable, SkeletonRows } from '../../components/superadmin/Skeleton'
import './superadmin.css'
import './Dashboard.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin')}` })
const fmtVal = n => { const v = parseFloat(n); if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${v.toLocaleString('en-IN')}` }
const COLORS = ['#402070','#c02040','#d4af37','#10b981','#0284c7','#7c3aed']

export default function Insights() {
  const [period, setPeriod] = useState('today')
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api(`/dashboard/insights?period=${period}`, { headers: auth() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [period])

  const branches  = data?.branches  ?? []
  const platforms = data?.platforms ?? []
  const employees = data?.employees ?? []

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-topbar-title">Performance Insights</h1>
            <p className="dash-topbar-sub">Real-time business performance</p>
          </div>
          <div className="dash-topbar-right">
            {['today','week','month'].map(p => (
              <button key={p} className="sa-btn sa-btn-sm"
                style={{ background: period === p ? 'linear-gradient(135deg,#402070,#c02040)' : '#f4f5fb',
                         color: period === p ? '#fff' : '#666', border: '1px solid #e8eaf0' }}
                onClick={() => setPeriod(p)}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="dash-main">

          {/* Branch Leaderboard */}
          <div className="dash-section-label">📈 Branch Performance — {period.charAt(0).toUpperCase()+period.slice(1)} Leaderboard</div>
          <div className="sa-card">
            <div className="sa-card-header"><h2>Branch Leaderboard</h2></div>
            <div className="sa-table-wrap">
              {loading ? <SkeletonTable rows={3} cols={4} /> : branches.length ? (
                <table className="sa-table">
                  <thead><tr><th>Rank</th><th>Branch</th><th>Transactions</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {branches.map((b, i) => (
                      <tr key={b.name}>
                        <td><span className="dash-badge badge-gold">{b.medal} #{i+1}</span></td>
                        <td><strong>{b.name}</strong></td>
                        <td>{b.txn}</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>{fmtVal(b.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <div className="sa-empty">No branch data for this period</div>}
            </div>
          </div>

          {/* Platform Performance */}
          <div className="dash-section-label">🏢 Platform Performance</div>
          <div className="dash-grid-2">
            <div className="dash-card">
              <div className="dash-card-head"><span className="dash-card-icon">📊</span><h3>Transaction Share by Platform</h3></div>
              <div className="dash-card-body">
                {loading ? <SkeletonRows rows={4} /> : platforms.length ? (
                  <div className="dash-platform-list">
                    {platforms.map((p, i) => (
                      <div key={p.name} className="dash-platform-row">
                        <span className="dash-platform-name">{p.name}</span>
                        <div className="dash-platform-bar-wrap">
                          <div className="dash-platform-bar" style={{ width: `${p.pct}%`, background: COLORS[i % COLORS.length] }} />
                        </div>
                        <span className="dash-platform-val">{p.pct}%</span>
                        <span className="dash-platform-val2">{fmtVal(p.value)}</span>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ color: '#9ca3af', fontSize: 13 }}>No platform data</p>}
              </div>
            </div>

            <div className="dash-card">
              <div className="dash-card-head"><span className="dash-card-icon">📋</span><h3>Platform Summary</h3></div>
              <div className="dash-card-body">
                {loading ? <SkeletonTable rows={4} cols={4} /> : (
                  <table className="dash-table">
                    <thead><tr><th>Platform</th><th>Txn</th><th>Value</th><th>Share</th></tr></thead>
                    <tbody>
                      {platforms.map(p => (
                        <tr key={p.name}>
                          <td><strong>{p.name}</strong></td>
                          <td>{p.txn}</td>
                          <td style={{ color: '#059669', fontWeight: 700 }}>{fmtVal(p.value)}</td>
                          <td><span className="dash-badge badge-purple">{p.pct}%</span></td>
                        </tr>
                      ))}
                      {!platforms.length && <tr><td colSpan={4} className="sa-empty">No data</td></tr>}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Employee Performance */}
          <div className="dash-section-label">👨💼 Employee Performance</div>
          <div className="sa-card">
            <div className="sa-card-header"><h2>Employee Leaderboard — Txn Count + Value</h2></div>
            <div className="sa-table-wrap">
              {loading ? <SkeletonTable rows={5} cols={6} /> : (
                <table className="sa-table">
                  <thead><tr><th>Rank</th><th>Employee</th><th>Branch</th><th>Txn</th><th>Value</th><th>Performance</th></tr></thead>
                  <tbody>
                    {employees.map((e, i) => (
                      <tr key={e.id}>
                        <td><span className="dash-badge badge-gold">#{i+1}</span></td>
                        <td><strong>{e.badge} {e.name}</strong></td>
                        <td>{e.branch || '—'}</td>
                        <td>{e.txn}</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>{fmtVal(e.value)}</td>
                        <td style={{ minWidth: 120 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: '#f0f2f8', borderRadius: 999, overflow: 'hidden' }}>
                              <div style={{ width: `${e.pct}%`, height: '100%', background: 'linear-gradient(90deg,#402070,#c02040)', borderRadius: 999 }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#402070' }}>{e.pct}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!employees.length && <tr><td colSpan={6} className="sa-empty">No employee data</td></tr>}
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
