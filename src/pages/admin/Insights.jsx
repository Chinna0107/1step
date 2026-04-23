import React, { useEffect, useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import '../../pages/dashboard.css'
import { useAdminStats } from '../../hooks/useFinance'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })
const fmtVal = n => { const v = parseFloat(n); if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${Number(v).toLocaleString('en-IN')}` }

export default function AdminInsights() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/dashboard/admin/stats', { headers: auth() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const emp = data?.employees ?? []
  const top = emp[0] ?? null
  const low = emp.filter(e => e.txn === 0)

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar"><h1>Performance Insights</h1></div>
        <div className="dash-main">

          {/* Top / Low highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div className="dash-card" style={{ marginBottom: 0 }}>
              <div className="dash-card-header"><h2>🏆 Top Employee Today</h2></div>
              <div className="dash-card-body">
                {loading ? <div className="dash-loading">Loading...</div> : top ? (
                  <>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#402070' }}>🏆 {top.name}</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#c02040', margin: '6px 0' }}>{fmtVal(top.value)}</div>
                    <div style={{ fontSize: 13, color: '#9ca3af' }}>{top.txn} transactions · {fmtVal(top.profit)} profit</div>
                  </>
                ) : <div style={{ color: '#9ca3af', fontSize: 13 }}>No data yet</div>}
              </div>
            </div>
            <div className="dash-card" style={{ marginBottom: 0 }}>
              <div className="dash-card-header"><h2>🚨 Non-Performance Alerts</h2></div>
              <div className="dash-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {loading ? <div className="dash-loading">Loading...</div> : low.length ? low.map(e => (
                  <div key={e.id} style={{ background: '#fee2e2', color: '#dc2626', padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                    🚨 {e.name} — 0 transactions today
                  </div>
                )) : <div style={{ color: '#059669', fontSize: 13, fontWeight: 600 }}>✅ All employees are performing</div>}
              </div>
            </div>
          </div>

          {/* Employee leaderboard */}
          <div className="dash-card">
            <div className="dash-card-header"><h2>👨💼 Employee Leaderboard — Today</h2></div>
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : (
                <table className="dash-table">
                  <thead><tr><th>Rank</th><th>Employee</th><th>Txn Count</th><th>Value</th><th>Profit</th><th>Achievement</th></tr></thead>
                  <tbody>
                    {emp.map((e, i) => (
                      <tr key={e.id}>
                        <td><span style={{ background: i < 3 ? '#fef3c7' : '#f0f2f8', color: i < 3 ? '#b8860b' : '#6b7280', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                        </span></td>
                        <td><strong>{e.name}</strong></td>
                        <td>{e.txn}</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>{fmtVal(e.value)}</td>
                        <td style={{ color: '#d4af37', fontWeight: 700 }}>{fmtVal(e.profit)}</td>
                        <td style={{ minWidth: 140 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 8, background: '#f0f2f8', borderRadius: 999, overflow: 'hidden' }}>
                              <div style={{ width: `${e.pct}%`, height: '100%', background: e.pct >= 80 ? '#10b981' : e.pct >= 50 ? '#d97706' : '#ef4444', borderRadius: 999 }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700 }}>{e.pct}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!emp.length && <tr><td colSpan={6} className="dash-empty">No data today</td></tr>}
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
