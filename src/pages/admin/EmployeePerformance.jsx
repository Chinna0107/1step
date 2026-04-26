import React, { useState, useCallback, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole, getUserByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import { cacheGet, cacheSet, TTL } from '../../utils/cache'
import '../../pages/dashboard.css'

const auth   = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })
const fmt    = n => Number(parseFloat(n) || 0).toLocaleString('en-IN')
const fmtVal = n => { const v = parseFloat(n) || 0; if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }
const today      = new Date().toISOString().split('T')[0]
const monthStart = today.slice(0, 7) + '-01'

function Skel({ w = '100%', h = 14 }) {
  return <div style={{ width: w, height: h, borderRadius: 6, background: 'linear-gradient(90deg,#f0f2f8 25%,#e4e6f0 50%,#f0f2f8 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite linear' }} />
}

const RATING = txn => {
  if (txn >= 30) return { label: 'Excellent', color: '#059669', bg: '#d1fae5', stars: 5 }
  if (txn >= 20) return { label: 'Good',      color: '#2563eb', bg: '#dbeafe', stars: 4 }
  if (txn >= 10) return { label: 'Average',   color: '#d97706', bg: '#fef3c7', stars: 3 }
  if (txn >= 1)  return { label: 'Low',       color: '#f59e0b', bg: '#fef9c3', stars: 2 }
  return           { label: 'No Activity',    color: '#dc2626', bg: '#fee2e2', stars: 1 }
}

export default function EmployeePerformance() {
  const user = getUserByRole('admin')
  const [period, setPeriod]   = useState('today')
  const [from,   setFrom]     = useState(monthStart)
  const [to,     setTo]       = useState(today)
  const [data,   setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [view,   setView]     = useState('cards') // 'cards' | 'table'

  const load = useCallback((force = false) => {
    const key = `perf:${period}:${from}:${to}`
    if (!force) {
      const cached = cacheGet(key)
      // Only use cache if it has coins data
      if (cached && cached.employees?.[0]?.coins !== undefined) {
        setData(cached); setLoading(false); return
      }
    }
    setLoading(true)
    const p = period === 'custom' ? `from=${from}&to=${to}` : `from=${period === 'today' ? today : monthStart}&to=${today}`
    api(`/dashboard/admin/stats?${p}`, { headers: auth() })
      .then(d => { cacheSet(key, d, TTL.dashboard); setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [period, from, to])

  useEffect(() => { load() }, [load])

  const employees  = data?.employees  ?? []
  const attendance = data?.attendance ?? []
  const stats      = data?.stats      ?? {}

  const maxTxn   = Math.max(1, ...employees.map(e => e.txn))
  const maxValue = Math.max(1, ...employees.map(e => e.value))

  // Merge attendance into employees
  const attMap = {}
  attendance.forEach(a => { attMap[a.employee_name] = a })

  const enriched = employees.map(e => ({
    ...e,
    att: attMap[e.name] || null,
    rating: RATING(e.txn),
  }))

  const totalTxn    = enriched.reduce((s, e) => s + e.txn, 0)
  const totalValue  = enriched.reduce((s, e) => s + e.value, 0)
  const totalProfit = enriched.reduce((s, e) => s + e.profit, 0)
  const present     = attendance.filter(a => a.status === 'Present').length
  const late        = attendance.filter(a => a.late).length
  const noActivity  = enriched.filter(e => e.txn === 0).length

  return (
    <div className="dash-page">
      <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
      <AdminSidebar />
      <div className="dash-content">

        {/* Topbar */}
        <div className="dash-topbar">
          <div>
            <h1 style={{ margin: 0 }}>📊 Employee Performance</h1>
            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Branch: {user?.branch || '—'}</p>
          </div>
          <div className="dash-topbar-right" style={{ flexWrap: 'wrap', gap: 8 }}>
            {/* Period pills */}
            {['today', 'month', 'custom'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                style={{ padding: '6px 14px', borderRadius: 20, border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                  background: period === p ? 'linear-gradient(135deg,#402070,#c02040)' : '#f0f2f8',
                  color: period === p ? '#fff' : '#64748b' }}>
                {p === 'today' ? '📅 Today' : p === 'month' ? '📆 This Month' : '🗓 Custom'}
              </button>
            ))}
            {period === 'custom' && <>
              <input type="date" value={from} max={to} onChange={e => setFrom(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit' }} />
              <span style={{ color: '#9ca3af', fontSize: 12 }}>to</span>
              <input type="date" value={to} min={from} max={today} onChange={e => setTo(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit' }} />
              <button className="dash-btn dash-btn-primary dash-btn-sm" onClick={() => load(true)}>Apply</button>
            </>}
            {/* View toggle */}
            <div style={{ display: 'flex', background: '#f0f2f8', borderRadius: 8, overflow: 'hidden' }}>
              {[['cards','⊞'],['table','☰']].map(([v, icon]) => (
                <button key={v} onClick={() => setView(v)}
                  style={{ padding: '6px 12px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                    background: view === v ? '#402070' : 'transparent', color: view === v ? '#fff' : '#64748b' }}>
                  {icon}
                </button>
              ))}
            </div>
            <button className="dash-btn" style={{ background: '#f0f2f8', color: '#402070', border: 'none' }} onClick={() => load(true)}>🔄</button>
          </div>
        </div>

        <div className="dash-main">

          {/* Summary stats — 3 per row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Total Transactions', value: loading ? '—' : fmt(totalTxn),    color: '#402070', bg: '#ede9fe', icon: '🔢' },
              { label: 'Total Value',         value: loading ? '—' : fmtVal(totalValue),  color: '#059669', bg: '#d1fae5', icon: '💰' },
              { label: 'Total Profit',        value: loading ? '—' : fmtVal(totalProfit), color: '#d97706', bg: '#fef3c7', icon: '📈' },
              { label: 'Present Today',       value: loading ? '—' : present,          color: '#059669', bg: '#d1fae5', icon: '✅' },
              { label: 'Late Check-ins',      value: loading ? '—' : late,             color: '#f59e0b', bg: '#fef9c3', icon: '⏰' },
              { label: 'No Activity',         value: loading ? '—' : noActivity,       color: '#dc2626', bg: '#fee2e2', icon: '🚨' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 12px rgba(64,32,112,0.08)', borderLeft: `4px solid ${s.color}`, display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</div>
                  <div style={{ fontSize: 'clamp(1.1rem,1.8vw,1.5rem)', fontWeight: 900, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── CARDS VIEW ── */}
          {view === 'cards' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
              {loading
                ? [1,2,3].map(i => (
                    <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(64,32,112,0.08)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <Skel w="60%" h={16} /><Skel w="40%" h={28} /><Skel h={8} /><Skel w="80%" h={12} />
                    </div>
                  ))
                : enriched.map((e, i) => {
                    const att = e.att
                    const txnPct   = Math.round(e.txn   / maxTxn   * 100)
                    const valuePct = Math.round(e.value / maxValue * 100)
                    const barColor = txnPct >= 80 ? '#059669' : txnPct >= 50 ? '#d97706' : txnPct >= 20 ? '#f59e0b' : '#dc2626'
                    return (
                      <div key={e.id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 16px rgba(64,32,112,0.09)', border: '1.5px solid #f0f2f8', transition: 'transform 0.2s, box-shadow 0.2s' }}
                        onMouseEnter={el => { el.currentTarget.style.transform = 'translateY(-3px)'; el.currentTarget.style.boxShadow = '0 8px 28px rgba(64,32,112,0.14)' }}
                        onMouseLeave={el => { el.currentTarget.style.transform = ''; el.currentTarget.style.boxShadow = '0 2px 16px rgba(64,32,112,0.09)' }}>

                        {/* Card header */}
                        <div style={{ background: 'linear-gradient(135deg,#1a0a2e,#402070)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#d4af37' }}>
                              {e.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>
                                {i === 0 ? '🏆 ' : i === 1 ? '⭐ ' : ''}{e.name}
                              </div>
                              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{e.branch || user?.branch || '—'}</div>
                            </div>
                          </div>
                          <div style={{ background: e.rating.bg, color: e.rating.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
                            {e.rating.label}
                          </div>
                        </div>

                        {/* Stats grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #f0f2f8' }}>
                          {[
                            { label: 'Transactions', value: e.txn,          color: '#402070' },
                            { label: 'Value',         value: fmtVal(e.value), color: '#059669' },
                            { label: 'Profit',        value: fmtVal(e.profit),color: '#d97706' },
                          ].map((s, j) => (
                            <div key={s.label} style={{ padding: '12px 14px', textAlign: 'center', borderRight: j < 2 ? '1px solid #f0f2f8' : 'none' }}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{s.label}</div>
                              <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.value}</div>
                            </div>
                          ))}
                        </div>

                        {/* Progress bars */}
                        <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                              <span>Transaction Share</span><span style={{ fontWeight: 700, color: barColor }}>{txnPct}%</span>
                            </div>
                            <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                              <div style={{ width: `${txnPct}%`, height: '100%', background: barColor, borderRadius: 999, transition: 'width 0.8s ease' }} />
                            </div>
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                              <span>Value Share</span><span style={{ fontWeight: 700, color: '#059669' }}>{valuePct}%</span>
                            </div>
                            <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                              <div style={{ width: `${valuePct}%`, height: '100%', background: '#059669', borderRadius: 999, transition: 'width 0.8s ease' }} />
                            </div>
                          </div>
                        </div>

                        {/* Attendance footer */}
                        <div style={{ padding: '10px 18px', background: '#f8fafc', borderTop: '1px solid #f0f2f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                          <div style={{ display: 'flex', gap: 12 }}>
                            <span style={{ color: '#64748b' }}>In: <strong style={{ color: att?.check_in ? (att.late ? '#d97706' : '#059669') : '#dc2626' }}>{att?.check_in || '—'}</strong></span>
                            <span style={{ color: '#64748b' }}>Out: <strong style={{ color: att?.check_out ? '#059669' : '#9ca3af' }}>{att?.check_out || '—'}</strong></span>
                          </div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            {att?.late && <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>⏰ Late</span>}
                            <span style={{ background: att ? '#d1fae5' : '#fee2e2', color: att ? '#059669' : '#dc2626', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>
                              {att ? '✅ Present' : '❌ Absent'}
                            </span>
                            <span style={{ color: '#94a3b8', fontSize: 11 }}>🪙 {e.coins ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })
              }
              {!loading && !enriched.length && (
                <div className="dash-empty" style={{ gridColumn: '1/-1' }}>No employee data for this period</div>
              )}
            </div>
          )}

          {/* ── TABLE VIEW ── */}
          {view === 'table' && (
            <div className="dash-card">
              <div className="dash-card-header">
                <h2>Employee Performance — {period === 'today' ? 'Today' : period === 'month' ? 'This Month' : `${from} → ${to}`}</h2>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{enriched.length} employees</span>
              </div>
              <div className="dash-table-wrap">
                {loading ? <div className="dash-loading">Loading...</div> : (
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Employee</th>
                        <th>Transactions</th>
                        <th>Value</th>
                        <th>Profit</th>
                        <th>Coins</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Attendance</th>
                        <th>Rating</th>
                        <th>Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enriched.map((e, i) => {
                        const txnPct = Math.round(e.txn / maxTxn * 100)
                        const barColor = txnPct >= 80 ? '#059669' : txnPct >= 50 ? '#d97706' : txnPct >= 20 ? '#f59e0b' : '#dc2626'
                        return (
                          <tr key={e.id}>
                            <td>
                              <span style={{ background: i === 0 ? '#fef3c7' : i === 1 ? '#f0f2f8' : '#f8fafc', color: i === 0 ? '#b8860b' : '#6b7280', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
                                {i === 0 ? '🏆' : i === 1 ? '⭐' : `#${i+1}`}
                              </span>
                            </td>
                            <td><strong>{e.name}</strong></td>
                            <td style={{ fontWeight: 700, color: '#402070' }}>{e.txn}</td>
                            <td style={{ color: '#059669', fontWeight: 700 }}>{fmtVal(e.value)}</td>
                            <td style={{ color: '#d97706', fontWeight: 700 }}>{fmtVal(e.profit)}</td>
                            <td style={{ color: '#b8860b', fontWeight: 700 }}>🪙 {e.coins ?? 0}</td>
                            <td style={{ color: e.att?.late ? '#d97706' : '#374151', fontWeight: e.att?.late ? 700 : 400, fontSize: 12 }}>{e.att?.check_in || '—'}</td>
                            <td style={{ fontSize: 12 }}>{e.att?.check_out || '—'}</td>
                            <td>
                              <span style={{ background: e.att ? '#d1fae5' : '#fee2e2', color: e.att ? '#059669' : '#dc2626', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                {e.att ? '✅ Present' : '❌ Absent'}
                              </span>
                              {e.att?.late && <span style={{ marginLeft: 4, background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>⏰</span>}
                            </td>
                            <td>
                              <span style={{ background: e.rating.bg, color: e.rating.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                {e.rating.label}
                              </span>
                            </td>
                            <td style={{ minWidth: 130 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ flex: 1, height: 6, background: '#f0f2f8', borderRadius: 999, overflow: 'hidden' }}>
                                  <div style={{ width: `${txnPct}%`, height: '100%', background: barColor, borderRadius: 999 }} />
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: barColor, width: 32, textAlign: 'right' }}>{txnPct}%</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                      {!enriched.length && <tr><td colSpan={11} className="dash-empty">No employee data for this period</td></tr>}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
