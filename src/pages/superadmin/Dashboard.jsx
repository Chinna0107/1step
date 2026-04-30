import React from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { useDashboardStats } from '../../hooks/useSuperAdmin'
import { getUserByRole } from '../../utils/tokenUtils'
import { SkeletonStats, SkeletonTable, SkeletonRows } from '../../components/superadmin/Skeleton'
import {
  MdTrendingUp, MdAccountBalanceWallet, MdMonetizationOn,
  MdPeople, MdLock, MdRefresh
} from 'react-icons/md'
import './Dashboard.css'

const fmt = (n) => Number(n).toLocaleString('en-IN')
const fmtVal = (n) => {
  const v = parseFloat(n)
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`
  if (v >= 100000)   return `₹${(v / 100000).toFixed(1)}L`
  if (v >= 1000)     return `₹${(v / 1000).toFixed(1)}K`
  return `₹${fmt(v)}`
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="dash-stat" style={{ '--c': color }}>
      <div className="dash-stat-icon">{icon}</div>
      <div className="dash-stat-body">
        <span className="dash-stat-label">{label}</span>
        <span className="dash-stat-value">{value}</span>
        {sub && <span className="dash-stat-sub">{sub}</span>}
      </div>
    </div>
  )
}

function SectionCard({ icon, title, badge, children }) {
  return (
    <div className="dash-card">
      <div className="dash-card-head">
        <span className="dash-card-icon">{icon}</span>
        <h3>{title}</h3>
        {badge && <span className="dash-card-badge">{badge}</span>}
      </div>
      <div className="dash-card-body">{children}</div>
    </div>
  )
}

function Skeleton() {
  return <div style={{ height: 20, background: '#f0f2f8', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
}

export default function SuperAdminDashboard() {
  const { stats: d, loading, refetch } = useDashboardStats()
  const user = getUserByRole('superadmin')

  const s         = d?.stats       ?? {}
  const platforms = d?.platforms   ?? []
  const employees = d?.employees   ?? []
  const branches  = d?.branches    ?? []
  const attendance = d?.attendance ?? []

  const topBranch   = branches[0]   ?? null
  const topEmployee = employees[0]  ?? null

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">

        {/* Topbar */}
        <div className="dash-topbar">
          <div>
            <h1 className="dash-topbar-title">Dashboard</h1>
            <p className="dash-topbar-sub">Real-time business snapshot</p>
          </div>
          <div className="dash-topbar-right">
            <button className="dash-icon-btn" title="Refresh" onClick={refetch}><MdRefresh size={18} /></button>
            <div className="dash-user-chip">
              <div className="dash-user-avatar">{(user?.name || 'S')[0]}</div>
              <span>{user?.name || 'Super Admin'}</span>
              <span className="dash-role-badge"><MdLock size={10} /> Super Admin</span>
            </div>
          </div>
        </div>

        <div className="dash-main">

          {/* ── 1. Overview Stats ── */}
          <div className="dash-section-label">📊 Dashboard Overview</div>
          <div className="dash-stats-row">
            {loading ? <SkeletonStats count={4} /> : (
              <>
                <StatCard icon={<MdTrendingUp />}           color="#402070"
                  label="Transactions Today"
                  value={fmt(s.txnToday ?? 0)}
                  sub={`Month: ${fmt(s.txnMonth ?? 0)}`} />
                <StatCard icon={<MdAccountBalanceWallet />} color="#c02040"
                  label="Total Txn Value"
                  value={fmtVal(s.valueToday ?? 0)}
                  sub={`Month: ${fmtVal(s.valueMonth ?? 0)}`} />
                <StatCard icon={<MdMonetizationOn />}       color="#d4af37"
                  label="Total Profit"
                  value={fmtVal(s.profitToday ?? 0)}
                  sub={`Month: ${fmtVal(s.profitMonth ?? 0)}`} />
                <StatCard icon={<MdPeople />}               color="#10b981"
                  label="Active Employees"
                  value={fmt(s.totalEmployees ?? 0)}
                  sub="Across all branches" />
              </>
            )}
          </div>

          {/* ── 2. Performance Insights ── */}
          <div className="dash-section-label">📈 Performance Insights</div>
          <div className="dash-grid-2">

            <SectionCard icon="🏢" title="Platform Performance" badge="Today">
              {loading ? <SkeletonRows rows={4} /> : platforms.length ? (
                <div className="dash-platform-list">
                  {platforms.map(p => (
                    <div key={p.name} className="dash-platform-row">
                      <span className="dash-platform-name">{p.name}</span>
                      <div className="dash-platform-bar-wrap">
                        <div className="dash-platform-bar" style={{ width: `${p.pct}%`, background: 'linear-gradient(90deg,#402070,#c02040)' }} />
                      </div>
                      <span className="dash-platform-val">{p.txn} txn</span>
                      <span className="dash-platform-val2">{fmtVal(p.value)}</span>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: '#9ca3af', fontSize: 13 }}>No platform transactions today</p>}
            </SectionCard>

            <SectionCard icon="👨‍💼" title="Top Employee Performance" badge="Today">
              {loading ? <SkeletonTable rows={4} cols={4} /> : employees.length ? (
                <table className="dash-table">
                  <thead><tr><th>Employee</th><th>Branch</th><th>Txn</th><th>Value</th></tr></thead>
                  <tbody>
                    {employees.map(e => (
                      <tr key={e.id}>
                        <td><strong>{e.badge} {e.name}</strong></td>
                        <td>{e.branch}</td>
                        <td>{e.txn}</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>{fmtVal(e.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p style={{ color: '#9ca3af', fontSize: 13 }}>No employee transactions today</p>}
            </SectionCard>
          </div>

          {/* ── 3. Branch Management ── */}
          <div className="dash-section-label">🏢 Branch Management</div>
          <SectionCard icon="📍" title="Branch Analytics" badge="Today">
            {loading ? <SkeletonTable rows={3} cols={4} /> : branches.length ? (
              <table className="dash-table">
                <thead><tr><th>Branch</th><th>Transactions</th><th>Revenue</th><th>Status</th></tr></thead>
                <tbody>
                  {branches.map(b => (
                    <tr key={b.name}>
                      <td><strong>{b.name}</strong></td>
                      <td>{b.txn}</td>
                      <td style={{ color: '#059669', fontWeight: 700 }}>{fmtVal(b.value)}</td>
                      <td>
                        <span className={`dash-badge ${b.status === 'top' ? 'badge-gold' : 'badge-green'}`}>
                          {b.status === 'top' ? '🥇 Top Branch' : '✅ Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ color: '#9ca3af', fontSize: 13 }}>No branch data for today</p>}
          </SectionCard>

          {/* ── 4. Performance Tracking ── */}
          <div className="dash-section-label">🏆 Performance Tracking</div>
          <div className="dash-grid-3">
            <SectionCard icon="🥇" title="Top Branch">
              {loading ? <SkeletonRows rows={3} /> : topBranch ? (
                <div className="dash-highlight-box">
                  <span className="dash-highlight-name">{topBranch.name}</span>
                  <span className="dash-highlight-val">{fmtVal(topBranch.value)}</span>
                  <span className="dash-highlight-sub">{topBranch.txn} transactions today</span>
                </div>
              ) : <p style={{ color: '#9ca3af', fontSize: 13 }}>No data yet</p>}
            </SectionCard>

            <SectionCard icon="👨‍💼" title="Top Employee">
              {loading ? <SkeletonRows rows={3} /> : topEmployee ? (
                <div className="dash-highlight-box">
                  <span className="dash-highlight-name">🏆 {topEmployee.name}</span>
                  <span className="dash-highlight-val">{fmtVal(topEmployee.value)}</span>
                  <span className="dash-highlight-sub">{topEmployee.txn} transactions · {topEmployee.branch}</span>
                </div>
              ) : <p style={{ color: '#9ca3af', fontSize: 13 }}>No data yet</p>}
            </SectionCard>

            <SectionCard icon="⚠️" title="Alerts">
              <div className="dash-alerts">
                {loading ? <SkeletonRows rows={3} /> : (
                  <>
                    {branches.filter(b => b.txn === 0).map(b => (
                      <div key={b.name} className="dash-alert dash-alert-error">
                        🚫 {b.name} — No transactions today
                      </div>
                    ))}
                    {attendance.filter(a => {
                      if (!a.check_in) return false
                      const [h, m] = a.check_in.split(':').map(Number)
                      return h * 60 + m > 9 * 60 + 15
                    }).map(a => (
                      <div key={a.id} className="dash-alert dash-alert-warn">
                        ⏰ {a.employee_name} — Late check-in at {a.check_in}
                      </div>
                    ))}
                    {branches.length === 0 && attendance.length === 0 && (
                      <div className="dash-alert dash-alert-info">✅ All systems normal</div>
                    )}
                  </>
                )}
              </div>
            </SectionCard>
          </div>

          {/* ── 5. Employee Attendance ── */}
          <div className="dash-section-label">👨‍💼 Employee Management</div>
          <SectionCard icon="✅" title="Attendance Today">
            {loading ? <SkeletonTable rows={4} cols={6} /> : attendance.length ? (
              <table className="dash-table">
                <thead><tr><th>Employee</th><th>Branch</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th></tr></thead>
                <tbody>
                  {attendance.map(a => {
                    const late = a.check_in && (() => { const [h,m] = a.check_in.split(':').map(Number); return h*60+m > 9*60+15 })()
                    const hrs  = a.minutes ? `${Math.floor(a.minutes/60)}h ${a.minutes%60}m` : '—'
                    return (
                      <tr key={a.id}>
                        <td><strong>{a.employee_name}</strong></td>
                        <td>{a.branch || '—'}</td>
                        <td>{a.check_in || '—'}</td>
                        <td>{a.check_out || '—'}</td>
                        <td>{hrs}</td>
                        <td>
                          <span className={`dash-badge ${late ? 'badge-red' : 'badge-green'}`}>
                            {late ? '⏰ Late' : '✅ On Time'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : <p style={{ color: '#9ca3af', fontSize: 13 }}>No attendance records for today</p>}
          </SectionCard>

          {/* ── 6. Reports ── */}
          <div className="dash-section-label">🧾 Reports & Downloads</div>
          <div className="dash-reports-grid">
            {[
              { icon: '📅', label: 'Daily Transactions' },
              { icon: '🏢', label: 'Branch Reports' },
              { icon: '💰', label: 'Profit Reports' },
              { icon: '👨‍💼', label: 'Employee Performance' },
              { icon: '📊', label: 'Platform Reports' },
              { icon: '🧾', label: 'GST Reports' },
            ].map(r => (
              <div key={r.label} className="dash-report-card">
                <span className="dash-report-icon">{r.icon}</span>
                <span className="dash-report-label">{r.label}</span>
                <div className="dash-report-btns">
                  <button className="dash-dl-btn">Excel</button>
                  <button className="dash-dl-btn">PDF</button>
                  <button className="dash-dl-btn">CSV</button>
                </div>
              </div>
            ))}
          </div>

          {/* ── 7. Security ── */}
          <div className="dash-section-label">🔐 Security & Control</div>
          <div className="dash-grid-2">
            <SectionCard icon="🔓" title="User Access Control">
              <div className="dash-kv-list">
                <div className="dash-kv"><span>Total Users</span><span className="kv-green">{loading ? <span className="sa-skeleton sa-skeleton-line short" style={{display:'inline-block',width:40,height:12}} /> : fmt(s.totalUsers ?? 0)}</span></div>
                <div className="dash-kv"><span>Active Users</span><span className="kv-green">{loading ? <span className="sa-skeleton sa-skeleton-line short" style={{display:'inline-block',width:40,height:12}} /> : fmt(s.activeUsers ?? 0)}</span></div>
                <div className="dash-kv"><span>Total Admins</span><span className="kv-gold">{loading ? <span className="sa-skeleton sa-skeleton-line short" style={{display:'inline-block',width:40,height:12}} /> : fmt(s.totalAdmins ?? 0)}</span></div>
                <div className="dash-kv"><span>Role-Based Access</span><span className="kv-gold">RBAC Enabled</span></div>
              </div>
            </SectionCard>
            <SectionCard icon="📜" title="Summary">
              <div className="dash-kv-list">
                <div className="dash-kv"><span>Txn Today</span><span className="kv-green">{loading ? '—' : fmt(s.txnToday ?? 0)}</span></div>
                <div className="dash-kv"><span>Txn This Month</span><span className="kv-green">{loading ? '—' : fmt(s.txnMonth ?? 0)}</span></div>
                <div className="dash-kv"><span>Profit Today</span><span className="kv-gold">{loading ? '—' : fmtVal(s.profitToday ?? 0)}</span></div>
                <div className="dash-kv"><span>Profit This Month</span><span className="kv-gold">{loading ? '—' : fmtVal(s.profitMonth ?? 0)}</span></div>
              </div>
            </SectionCard>
          </div>

        </div>
      </div>
    </div>
  )
}
