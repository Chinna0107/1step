import React, { useEffect, useState, useCallback } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole, getUserByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import { cacheGet, cacheSet } from '../../utils/cache'
import { MdTrendingUp, MdAccountBalanceWallet, MdMonetizationOn, MdPeople, MdRefresh } from 'react-icons/md'
import '../../pages/dashboard.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })
const fmt    = n => Number(n).toLocaleString('en-IN')
const fmtVal = n => { const v = parseFloat(n); if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }

function Skel({ w = '100%', h = 16 }) {
  return <div style={{ width: w, height: h, borderRadius: 6, background: 'linear-gradient(90deg,#f0f2f8 25%,#e4e6f0 50%,#f0f2f8 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite linear' }} />
}

export default function AdminDashboard() {
  const CACHE_KEY = 'admin_stats'
  const [data, setData]       = useState(() => cacheGet(CACHE_KEY))
  const [loading, setLoading] = useState(!cacheGet(CACHE_KEY))
  const user = getUserByRole('admin')

  const refetch = useCallback((force = false) => {
    if (!force) {
      const cached = cacheGet(CACHE_KEY)
      if (cached) { setData(cached); setLoading(false); return }
    }
    setLoading(true)
    api('/dashboard/admin/stats', { headers: auth() })
      .then(d => { cacheSet(CACHE_KEY, d); setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const s   = data?.stats      ?? {}
  const emp = data?.employees  ?? []
  const att = data?.attendance ?? []
  const top = emp[0] ?? null
  const low = emp.filter(e => e.txn === 0)
  const late = att.filter(a => a.late)

  return (
    <div className="dash-page">
      <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <div>
            <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Branch: {user?.branch || 'All Branches'}</p>
          </div>
          <div className="dash-topbar-right">
            <button className="dash-btn dash-btn-primary" onClick={() => refetch(true)} style={{ padding: '7px 14px' }}>
              <MdRefresh /> Refresh
            </button>
            <span className="dash-badge">Admin Portal</span>
          </div>
        </div>

        <div className="dash-main">

          {/* Stats */}
          <div className="dash-stats">
            {loading ? [1,2,3,4].map(i => (
              <div key={i} className="dash-stat"><Skel h={12} w="60%" /><div style={{marginTop:8}}><Skel h={28} w="45%" /></div></div>
            )) : (
              <>
                <div className="dash-stat">
                  <div className="dash-stat-icon"><MdTrendingUp size={22}/></div>
                  <div className="dash-stat-label">Transactions Today</div>
                  <div className="dash-stat-value">{fmt(s.txnToday ?? 0)}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Month: {fmt(s.txnMonth ?? 0)}</div>
                </div>
                <div className="dash-stat">
                  <div className="dash-stat-icon"><MdAccountBalanceWallet size={22}/></div>
                  <div className="dash-stat-label">Transaction Value</div>
                  <div className="dash-stat-value">{fmtVal(s.valueToday ?? 0)}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Month: {fmtVal(s.valueMonth ?? 0)}</div>
                </div>
                <div className="dash-stat">
                  <div className="dash-stat-icon"><MdMonetizationOn size={22}/></div>
                  <div className="dash-stat-label">Branch Profit</div>
                  <div className="dash-stat-value">{fmtVal(s.profitToday ?? 0)}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Month: {fmtVal(s.profitMonth ?? 0)}</div>
                </div>
                <div className="dash-stat">
                  <div className="dash-stat-icon"><MdPeople size={22}/></div>
                  <div className="dash-stat-label">Employees</div>
                  <div className="dash-stat-value">{fmt(s.activeEmployees ?? 0)}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Total: {fmt(s.totalEmployees ?? 0)}</div>
                </div>
              </>
            )}
          </div>

          {/* Highlights row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div className="dash-card" style={{ marginBottom: 0 }}>
              <div className="dash-card-header"><h2>🥇 Top Employee</h2></div>
              <div className="dash-card-body">
                {loading ? <Skel /> : top ? (
                  <>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#402070' }}>🏆 {top.name}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#c02040', margin: '6px 0' }}>{fmtVal(top.value)}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{top.txn} transactions today</div>
                  </>
                ) : <div style={{ color: '#9ca3af', fontSize: 13 }}>No transactions today</div>}
              </div>
            </div>
            <div className="dash-card" style={{ marginBottom: 0 }}>
              <div className="dash-card-header"><h2>👥 Customers</h2></div>
              <div className="dash-card-body">
                {loading ? <Skel /> : (
                  <>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#402070' }}>{fmt(s.custToday ?? 0)}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>New today</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#059669', marginTop: 8 }}>Total: {fmt(s.custTotal ?? 0)}</div>
                  </>
                )}
              </div>
            </div>
            <div className="dash-card" style={{ marginBottom: 0 }}>
              <div className="dash-card-header"><h2>⚠️ Alerts</h2></div>
              <div className="dash-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {loading ? <Skel /> : (
                  <>
                    {low.length > 0 && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>🚨 {low.length} employee(s) with 0 transactions</div>}
                    {late.length > 0 && <div style={{ background: '#fef3c7', color: '#d97706', padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>⏰ {late.length} late check-in(s) today</div>}
                    {low.length === 0 && late.length === 0 && <div style={{ color: '#9ca3af', fontSize: 13 }}>✅ All clear</div>}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Employee Performance */}
          <div className="dash-card">
            <div className="dash-card-header"><h2>📊 Employee Performance — Today</h2></div>
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : (
                <table className="dash-table">
                  <thead><tr><th>Rank</th><th>Employee</th><th>Transactions</th><th>Value</th><th>Profit</th><th>Performance</th></tr></thead>
                  <tbody>
                    {emp.map((e, i) => (
                      <tr key={e.id}>
                        <td><span style={{ background: i === 0 ? '#fef3c7' : '#f0f2f8', color: i === 0 ? '#b8860b' : '#6b7280', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>#{i+1}</span></td>
                        <td><strong>{e.badge} {e.name}</strong></td>
                        <td>{e.txn}</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>{fmtVal(e.value)}</td>
                        <td style={{ color: '#d4af37', fontWeight: 700 }}>{fmtVal(e.profit)}</td>
                        <td style={{ minWidth: 120 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: '#f0f2f8', borderRadius: 999, overflow: 'hidden' }}>
                              <div style={{ width: `${e.pct}%`, height: '100%', background: e.pct >= 80 ? '#10b981' : e.pct >= 50 ? '#d97706' : '#ef4444', borderRadius: 999 }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#402070' }}>{e.pct}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!emp.length && <tr><td colSpan={6} className="dash-empty">No employee data today</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Attendance Today */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h2>✅ Attendance — Today</h2>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>
                {loading ? '...' : `${att.filter(a => a.status === 'Present').length} Present · ${late.length} Late`}
              </span>
            </div>
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : (
                <table className="dash-table">
                  <thead><tr><th>Employee</th><th>Check In</th><th>Check Out</th><th>Minutes</th><th>Status</th></tr></thead>
                  <tbody>
                    {att.map(a => (
                      <tr key={a.id}>
                        <td>
                          <strong>{a.employee_name}</strong>
                          {a.late && <span style={{ marginLeft: 8, background: '#fef3c7', color: '#d97706', padding: '2px 7px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>⏰ Late</span>}
                        </td>
                        <td style={{ color: a.late ? '#d97706' : '#374151', fontWeight: a.late ? 700 : 400 }}>{a.check_in || '—'}</td>
                        <td>{a.check_out || '—'}</td>
                        <td style={{ fontWeight: 700, color: (a.minutes || 0) > 500 ? '#059669' : '#374151' }}>{a.minutes || 0} min</td>
                        <td><span className={`dash-status ${a.status?.toLowerCase()}`}>{a.status}</span></td>
                      </tr>
                    ))}
                    {!att.length && <tr><td colSpan={5} className="dash-empty">No attendance records today</td></tr>}
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
