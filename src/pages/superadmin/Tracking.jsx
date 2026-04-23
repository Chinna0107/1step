import React, { useState, useEffect, useMemo } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { useTracking } from '../../hooks/useSuperAdmin'
import { SkeletonTable, SkeletonRows } from '../../components/superadmin/Skeleton'
import { MdRefresh, MdFilterList, MdClear, MdTrendingUp, MdWarning, MdPeople, MdStorefront } from 'react-icons/md'
import './superadmin.css'
import './Dashboard.css'

const fmtVal = n => { const v = parseFloat(n); if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${v.toLocaleString('en-IN')}` }

export default function Tracking() {
  const [tab, setTab]               = useState('employees')
  const [filterBranch, setFilterBranch]   = useState('')
  const [filterEmp, setFilterEmp]         = useState('')
  const [filterService, setFilterService] = useState('')
  const { data, loading, refetch: load } = useTracking()

  const branches  = data?.branches    ?? []
  const employees = data?.employees   ?? []
  const alerts    = data?.alerts      ?? []
  const topBranch = data?.topBranch   ?? null
  const topEmp    = data?.topEmployee ?? null

  // Unique values for filter dropdowns
  const branchOptions  = useMemo(() => [...new Set(employees.map(e => e.branch).filter(Boolean))], [employees])
  const serviceOptions = useMemo(() => [...new Set(alerts.map(a => a.service).filter(Boolean))], [alerts])

  // Filtered employees
  const filteredEmployees = useMemo(() => employees.filter(e => {
    if (filterBranch  && e.branch !== filterBranch) return false
    if (filterEmp     && !e.name.toLowerCase().includes(filterEmp.toLowerCase())) return false
    return true
  }), [employees, filterBranch, filterEmp])

  // Filtered branches
  const filteredBranches = useMemo(() => branches.filter(b => {
    if (filterBranch && b.name !== filterBranch) return false
    return true
  }), [branches, filterBranch])

  // Filtered alerts
  const filteredAlerts = useMemo(() => alerts.filter(a => {
    if (filterBranch  && a.branch !== filterBranch) return false
    if (filterEmp     && !a.msg.toLowerCase().includes(filterEmp.toLowerCase())) return false
    if (filterService && !a.msg.toLowerCase().includes(filterService.toLowerCase())) return false
    return true
  }), [alerts, filterBranch, filterEmp, filterService])

  const hasFilter = filterBranch || filterEmp || filterService

  const clearFilters = () => { setFilterBranch(''); setFilterEmp(''); setFilterService('') }

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
            <button className="dash-icon-btn" onClick={load} title="Refresh"><MdRefresh size={18} /></button>
            {['employees', 'branches', 'alerts'].map(t => (
              <button key={t} className="sa-btn sa-btn-sm"
                style={{ background: tab === t ? 'linear-gradient(135deg,#402070,#c02040)' : '#f4f5fb', color: tab === t ? '#fff' : '#666', border: '1px solid #e8eaf0' }}
                onClick={() => setTab(t)}>
                {t === 'employees' ? <><MdPeople size={13} /> Employees</> : t === 'branches' ? <><MdStorefront size={13} /> Branches</> : <><MdWarning size={13} /> Alerts</>}
              </button>
            ))}
          </div>
        </div>

        <div className="dash-main">

          {/* ── Summary Cards ── */}
          <div className="dash-grid-3" style={{ marginBottom: 20 }}>
            <div className="dash-card">
              <div className="dash-card-head"><span><MdStorefront /></span><h3>Top Branch</h3></div>
              <div className="dash-card-body">
                {loading ? <SkeletonRows rows={3} /> : topBranch ? (
                  <div className="dash-highlight-box">
                    <span className="dash-highlight-name">{topBranch.name}</span>
                    <span className="dash-highlight-val">{fmtVal(topBranch.value)}</span>
                    <span className="dash-highlight-sub">{topBranch.txn} txn · {topBranch.pct}% of target</span>
                  </div>
                ) : <p style={{ color: '#9ca3af', fontSize: 13 }}>No data yet</p>}
              </div>
            </div>
            <div className="dash-card">
              <div className="dash-card-head"><span><MdTrendingUp /></span><h3>Top Employee</h3></div>
              <div className="dash-card-body">
                {loading ? <SkeletonRows rows={3} /> : topEmp ? (
                  <div className="dash-highlight-box">
                    <span className="dash-highlight-name">🏆 {topEmp.name}</span>
                    <span className="dash-highlight-val">{fmtVal(topEmp.value)}</span>
                    <span className="dash-highlight-sub">{topEmp.txn} txn · {topEmp.branch}</span>
                  </div>
                ) : <p style={{ color: '#9ca3af', fontSize: 13 }}>No data yet</p>}
              </div>
            </div>
            <div className="dash-card">
              <div className="dash-card-head"><span><MdWarning /></span><h3>Active Alerts</h3></div>
              <div className="dash-card-body">
                {loading ? <SkeletonRows rows={3} /> : (
                  <div className="dash-highlight-box">
                    <span className="dash-highlight-name" style={{ color: '#dc2626' }}>{alerts.filter(a => a.type === 'error').length} Critical</span>
                    <span className="dash-highlight-val" style={{ color: '#d97706', fontSize: '1.4rem' }}>{alerts.filter(a => a.type === 'warn').length} Warnings</span>
                    <span className="dash-highlight-sub">Total {alerts.length} alerts today</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Filters ── */}
          <div className="sa-card" style={{ marginBottom: 20 }}>
            <div className="sa-card-header">
              <h2><MdFilterList style={{ verticalAlign: 'middle', marginRight: 6 }} />Filters</h2>
              {hasFilter && (
                <button className="sa-btn sa-btn-sm sa-btn-warning" onClick={clearFilters}>
                  <MdClear size={13} /> Clear Filters
                </button>
              )}
            </div>
            <div className="sa-card-body">
              <div className="sa-form-grid" style={{ marginBottom: 0 }}>
                <div className="sa-form-group">
                  <label>Branch</label>
                  <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
                    <option value="">All Branches</option>
                    {branchOptions.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="sa-form-group">
                  <label>Employee Name</label>
                  <input placeholder="Search employee..." value={filterEmp} onChange={e => setFilterEmp(e.target.value)} />
                </div>
                <div className="sa-form-group">
                  <label>Service / Alert Keyword</label>
                  <input placeholder="e.g. Card Withdrawal..." value={filterService} onChange={e => setFilterService(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Employee Tab ── */}
          {tab === 'employees' && (
            <>
              <div className="dash-section-label"><MdPeople /> Employee Performance vs Target
                <span style={{ marginLeft: 8, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>
                  {filteredEmployees.length} of {employees.length} shown
                </span>
              </div>
              <div className="sa-card">
                <div className="sa-card-header"><h2>Employee Tracking</h2></div>
                <div className="sa-table-wrap">
                  {loading ? <SkeletonTable rows={5} cols={6} /> : (
                    <table className="sa-table">
                      <thead><tr><th>#</th><th>Employee</th><th>Branch</th><th>Txn</th><th>Target</th><th>Achievement</th><th>Value</th></tr></thead>
                      <tbody>
                        {filteredEmployees.map((e, i) => (
                          <tr key={e.id}>
                            <td style={{ color: '#94a3b8', fontSize: 12 }}>{i + 1}</td>
                            <td><strong>{e.name}</strong></td>
                            <td><span style={{ background: '#ede9fe', color: '#402070', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{e.branch}</span></td>
                            <td><strong style={{ color: e.txn === 0 ? '#dc2626' : '#1a0a2e' }}>{e.txn}</strong></td>
                            <td style={{ color: '#64748b' }}>{e.target}</td>
                            <td style={{ minWidth: 160 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ flex: 1, height: 8, background: '#f0f2f8', borderRadius: 999, overflow: 'hidden' }}>
                                  <div style={{ width: `${e.pct}%`, height: '100%', borderRadius: 999, transition: 'width 0.8s ease', background: e.pct >= 80 ? '#10b981' : e.pct >= 50 ? '#d97706' : '#ef4444' }} />
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 800, color: e.pct >= 80 ? '#059669' : e.pct >= 50 ? '#d97706' : '#dc2626', minWidth: 36 }}>{e.pct}%</span>
                              </div>
                            </td>
                            <td style={{ color: '#059669', fontWeight: 700 }}>{fmtVal(e.value)}</td>
                          </tr>
                        ))}
                        {!filteredEmployees.length && <tr><td colSpan={7} className="sa-empty">No employees match the filter</td></tr>}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── Branches Tab ── */}
          {tab === 'branches' && (
            <>
              <div className="dash-section-label"><MdStorefront /> Branch Performance vs Target
                <span style={{ marginLeft: 8, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>
                  {filteredBranches.length} of {branches.length} shown
                </span>
              </div>
              <div className="sa-card">
                <div className="sa-card-header"><h2>Branch Tracking</h2></div>
                <div className="sa-table-wrap">
                  {loading ? <SkeletonTable rows={3} cols={6} /> : (
                    <table className="sa-table">
                      <thead><tr><th>Branch</th><th>Txn Today</th><th>Target</th><th>Achievement</th><th>Revenue</th><th>Status</th></tr></thead>
                      <tbody>
                        {filteredBranches.map(b => (
                          <tr key={b.name}>
                            <td><strong>{b.name}</strong></td>
                            <td><strong style={{ color: b.txn === 0 ? '#dc2626' : '#1a0a2e' }}>{b.txn}</strong></td>
                            <td style={{ color: '#64748b' }}>{b.target}</td>
                            <td style={{ minWidth: 160 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ flex: 1, height: 8, background: '#f0f2f8', borderRadius: 999, overflow: 'hidden' }}>
                                  <div style={{ width: `${b.pct}%`, height: '100%', borderRadius: 999, transition: 'width 0.8s ease', background: b.pct >= 90 ? '#10b981' : b.pct >= 70 ? '#d97706' : '#ef4444' }} />
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 800, minWidth: 36 }}>{b.pct}%</span>
                              </div>
                            </td>
                            <td style={{ color: '#059669', fontWeight: 700 }}>{fmtVal(b.value)}</td>
                            <td><span className={`dash-badge ${b.status === 'top' ? 'badge-gold' : 'badge-green'}`}>{b.status === 'top' ? '🥇 Top' : '✅ Good'}</span></td>
                          </tr>
                        ))}
                        {!filteredBranches.length && <tr><td colSpan={6} className="sa-empty">No branches match the filter</td></tr>}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── Alerts Tab ── */}
          {tab === 'alerts' && (
            <>
              <div className="dash-section-label"><MdWarning /> Alerts
                <span style={{ marginLeft: 8, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>
                  {filteredAlerts.length} of {alerts.length} shown
                </span>
              </div>
              <div className="sa-card">
                <div className="sa-card-header"><h2>All Alerts ({filteredAlerts.length})</h2></div>
                <div className="dash-card-body">
                  {loading ? <SkeletonRows rows={4} /> : filteredAlerts.length ? (
                    <div className="dash-alerts" style={{ gap: 10 }}>
                      {filteredAlerts.map((a, i) => (
                        <div key={i} className={`dash-alert dash-alert-${a.type === 'error' ? 'error' : 'warn'}`}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{a.msg}</span>
                          <span className="dash-badge badge-purple" style={{ flexShrink: 0, marginLeft: 12 }}>{a.branch}</span>
                        </div>
                      ))}
                    </div>
                  ) : <div className="dash-alert dash-alert-info">✅ No alerts match the filter</div>}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
