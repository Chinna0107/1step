import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import { SkeletonTable, SkeletonRows } from '../../components/superadmin/Skeleton'
import './superadmin.css'
import './Dashboard.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin')}` })
const fmtVal = n => { const v = parseFloat(n); if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${v.toLocaleString('en-IN')}` }

export default function Tracking() {
  const [tab, setTab]         = useState('branches')
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/dashboard/tracking', { headers: auth() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const branches  = data?.branches    ?? []
  const employees = data?.employees   ?? []
  const alerts    = data?.alerts      ?? []
  const topBranch = data?.topBranch   ?? null
  const topEmp    = data?.topEmployee ?? null

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-topbar-title">Performance Tracking</h1>
            <p className="dash-topbar-sub">Top performers, alerts & inactive detection</p>
          </div>
          <div className="dash-topbar-right">
            {['branches','employees','alerts'].map(t => (
              <button key={t} className="sa-btn sa-btn-sm"
                style={{ background: tab === t ? 'linear-gradient(135deg,#402070,#c02040)' : '#f4f5fb',
                         color: tab === t ? '#fff' : '#666', border: '1px solid #e8eaf0' }}
                onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="dash-main">

          <div className="dash-grid-3" style={{ marginBottom: 0 }}>
            <div className="dash-card">
              <div className="dash-card-head"><span>🥇</span><h3>Top Branch</h3></div>
              <div className="dash-card-body">
                {loading ? <SkeletonRows rows={3} /> : topBranch ? (
                  <div className="dash-highlight-box">
                    <span className="dash-highlight-name">{topBranch.name}</span>
                    <span className="dash-highlight-val">{fmtVal(topBranch.value)}</span>
                    <span className="dash-highlight-sub">{topBranch.txn} txn · {topBranch.pct}% target</span>
                  </div>
                ) : <p style={{ color: '#9ca3af', fontSize: 13 }}>No data yet</p>}
              </div>
            </div>
            <div className="dash-card">
              <div className="dash-card-head"><span>👨💼</span><h3>Top Employee</h3></div>
              <div className="dash-card-body">
                {loading ? <SkeletonRows rows={3} /> : topEmp ? (
                  <div className="dash-highlight-box">
                    <span className="dash-highlight-name">🏆 {topEmp.name}</span>
                    <span className="dash-highlight-val">{fmtVal(topEmp.value)}</span>
                    <span className="dash-highlight-sub">{topEmp.txn} txn · {topEmp.pct}% target · {topEmp.branch}</span>
                  </div>
                ) : <p style={{ color: '#9ca3af', fontSize: 13 }}>No data yet</p>}
              </div>
            </div>
            <div className="dash-card">
              <div className="dash-card-head"><span>⚠️</span><h3>Active Alerts</h3></div>
              <div className="dash-card-body">
                {loading ? <SkeletonRows rows={3} /> : (
                  <div className="dash-highlight-box">
                    <span className="dash-highlight-name" style={{ color: '#dc2626' }}>
                      {alerts.filter(a => a.type === 'error').length} Critical
                    </span>
                    <span className="dash-highlight-val" style={{ color: '#d97706', fontSize: '1.4rem' }}>
                      {alerts.filter(a => a.type === 'warn').length} Warnings
                    </span>
                    <span className="dash-highlight-sub">Total {alerts.length} alerts</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {tab === 'branches' && (
            <>
              <div className="dash-section-label">🏢 Branch Performance vs Target</div>
              <div className="sa-card">
                <div className="sa-card-header"><h2>Branch Tracking</h2></div>
                <div className="sa-table-wrap">
                  {loading ? <SkeletonTable rows={3} cols={6} /> : (
                    <table className="sa-table">
                      <thead><tr><th>Branch</th><th>Txn Today</th><th>Target</th><th>Achievement</th><th>Revenue</th><th>Status</th></tr></thead>
                      <tbody>
                        {branches.map(b => (
                          <tr key={b.name}>
                            <td><strong>{b.name}</strong></td>
                            <td>{b.txn}</td>
                            <td>{b.target}</td>
                            <td style={{ minWidth: 140 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ flex: 1, height: 8, background: '#f0f2f8', borderRadius: 999, overflow: 'hidden' }}>
                                  <div style={{ width: `${b.pct}%`, height: '100%', background: b.pct >= 90 ? '#10b981' : b.pct >= 70 ? '#d97706' : '#ef4444', borderRadius: 999 }} />
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 700 }}>{b.pct}%</span>
                              </div>
                            </td>
                            <td style={{ color: '#059669', fontWeight: 700 }}>{fmtVal(b.value)}</td>
                            <td><span className={`dash-badge ${b.status === 'top' ? 'badge-gold' : 'badge-green'}`}>{b.status === 'top' ? '🥇 Top' : '✅ Good'}</span></td>
                          </tr>
                        ))}
                        {!branches.length && <tr><td colSpan={6} className="sa-empty">No branch data today</td></tr>}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}

          {tab === 'employees' && (
            <>
              <div className="dash-section-label">👨💼 Employee Performance vs Target</div>
              <div className="sa-card">
                <div className="sa-card-header"><h2>Employee Tracking</h2></div>
                <div className="sa-table-wrap">
                  {loading ? <SkeletonTable rows={5} cols={6} /> : (
                    <table className="sa-table">
                      <thead><tr><th>Employee</th><th>Branch</th><th>Txn</th><th>Target</th><th>Achievement</th><th>Value</th></tr></thead>
                      <tbody>
                        {employees.map(e => (
                          <tr key={e.id}>
                            <td><strong>{e.name}</strong></td>
                            <td>{e.branch}</td>
                            <td>{e.txn}</td>
                            <td>{e.target}</td>
                            <td style={{ minWidth: 140 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ flex: 1, height: 8, background: '#f0f2f8', borderRadius: 999, overflow: 'hidden' }}>
                                  <div style={{ width: `${e.pct}%`, height: '100%', background: e.pct >= 80 ? '#10b981' : e.pct >= 50 ? '#d97706' : '#ef4444', borderRadius: 999 }} />
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 700 }}>{e.pct}%</span>
                              </div>
                            </td>
                            <td style={{ color: '#059669', fontWeight: 700 }}>{fmtVal(e.value)}</td>
                          </tr>
                        ))}
                        {!employees.length && <tr><td colSpan={6} className="sa-empty">No employee data today</td></tr>}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}

          {tab === 'alerts' && (
            <>
              <div className="dash-section-label">⚠️ Low Performance & Inactive Alerts</div>
              <div className="sa-card">
                <div className="sa-card-header"><h2>All Alerts ({alerts.length})</h2></div>
                <div className="dash-card-body">
                  {loading ? <SkeletonRows rows={4} /> : alerts.length ? (
                    <div className="dash-alerts" style={{ gap: 10 }}>
                      {alerts.map((a, i) => (
                        <div key={i} className={`dash-alert dash-alert-${a.type}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{a.msg}</span>
                          <span className="dash-badge badge-purple" style={{ flexShrink: 0, marginLeft: 12 }}>{a.branch}</span>
                        </div>
                      ))}
                    </div>
                  ) : <div className="dash-alert dash-alert-info">✅ No alerts — all systems normal</div>}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
