import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { useSuperAdminSecurity } from '../../hooks/useSuperAdmin'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import { SkeletonStats, SkeletonTable } from '../../components/superadmin/Skeleton'
import './superadmin.css'
import './Dashboard.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin')}` })

const ROLES = [
  { role: 'Super Admin', permissions: ['Full Access', 'User Management', 'Reports', 'Config', 'Security'], color: '#1a365d' },
  { role: 'Admin',       permissions: ['Branch Management', 'Employee Management', 'Reports', 'Attendance'], color: '#0d1f3d' },
  { role: 'Employee',    permissions: ['Transactions', 'Customer Info', 'Services', 'Attendance'], color: '#10b981' },
]

export default function Security() {
  const [tab, setTab]         = useState('users')
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg]         = useState('')
  const [error, setError]     = useState('')

  const refetch = useCallback(() => {
    setLoading(true)
    api('/dashboard/security/users', { headers: auth() })
      .then(d => { setUsers(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const toggleFreeze = async (id, isActive) => {
    setMsg(''); setError('')
    try {
      await api(`/dashboard/users/${id}/toggle`, { method: 'PATCH', headers: auth() })
      setMsg(`User ${isActive ? 'frozen' : 'unfrozen'} successfully`)
      refetch()
    } catch (e) { setError(e.message) }
  }

  const roleOf = u => u.is_superadmin ? 'Super Admin' : u.is_admin ? 'Admin' : 'Employee'

  const active = users.filter(u => u.is_active).length
  const frozen = users.filter(u => !u.is_active).length
  const admins = users.filter(u => u.is_admin && !u.is_superadmin).length
  const empls  = users.filter(u => u.is_employee).length

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-topbar-title">Security & Control</h1>
            <p className="dash-topbar-sub">Access control, audit logs & login history</p>
          </div>
          <div className="dash-topbar-right">
            {['users','rbac'].map(t => (
              <button key={t} className="sa-btn sa-btn-sm"
                style={{ background: tab === t ? 'linear-gradient(135deg,#0d1f3d,#1a365d)' : '#f4f5fb',
                         color: tab === t ? '#fff' : '#666', border: '1px solid #e8eaf0' }}
                onClick={() => setTab(t)}>
                {t === 'users' ? '🔓 Users' : '🔑 RBAC'}
              </button>
            ))}
          </div>
        </div>

        <div className="dash-main">

          <div className="dash-stats-row">
            {loading ? <SkeletonStats count={4} /> : (
              <>
                {[
                  { label: 'Active Users',    value: active, color: '#10b981' },
                  { label: 'Frozen Accounts', value: frozen, color: '#1a365d' },
                  { label: 'Total Admins',    value: admins, color: '#0d1f3d' },
                  { label: 'Total Employees', value: empls,  color: '#d4af37' },
                ].map(s => (
                  <div key={s.label} className="dash-stat" style={{ '--c': s.color }}>
                    <div className="dash-stat-icon" style={{ fontSize: 22 }}>🔐</div>
                    <div className="dash-stat-body">
                      <span className="dash-stat-label">{s.label}</span>
                      <span className="dash-stat-value">{s.value}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {msg   && <div className="sa-alert sa-alert-success" style={{ marginBottom: 12 }}>✅ {msg}</div>}
          {error && <div className="sa-alert sa-alert-error"   style={{ marginBottom: 12 }}>❌ {error}</div>}

          {tab === 'users' && (
            <>
              <div className="dash-section-label">🔓 Freeze / Unfreeze User Accounts</div>
              <div className="sa-card">
                <div className="sa-card-header"><h2>All Users ({loading ? '...' : users.length})</h2></div>
                <div className="sa-table-wrap">
                  {loading ? <SkeletonTable rows={5} cols={8} /> : (
                    <table className="sa-table">
                      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Branch</th><th>Mobile</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id}>
                            <td><strong>{u.name}</strong></td>
                            <td style={{ fontSize: 12, color: '#6b7280' }}>{u.email}</td>
                            <td><span className={`sa-status ${u.is_superadmin ? 'admin' : u.is_admin ? 'admin' : 'active'}`}>{roleOf(u)}</span></td>
                            <td>{u.branch || '—'}</td>
                            <td style={{ fontSize: 12 }}>{u.mobile || '—'}</td>
                            <td style={{ fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                            <td>
                              <span className={`sa-status ${u.is_active ? 'active' : 'inactive'}`}>
                                {u.is_active ? '✅ Active' : '🔒 Frozen'}
                              </span>
                            </td>
                            <td>
                              {!u.is_superadmin && (
                                <button
                                  className={`sa-btn sa-btn-sm ${u.is_active ? 'sa-btn-danger' : 'sa-btn-warning'}`}
                                  onClick={() => toggleFreeze(u.id, u.is_active)}>
                                  {u.is_active ? '🔒 Freeze' : '🔓 Unfreeze'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {!users.length && <tr><td colSpan={8} className="sa-empty">No users found</td></tr>}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}

          {tab === 'rbac' && (
            <>
              <div className="dash-section-label">🔑 Role-Based Access Control (RBAC)</div>
              <div className="dash-grid-3">
                {ROLES.map(r => (
                  <div key={r.role} className="dash-card">
                    <div className="dash-card-head">
                      <span style={{ fontSize: 20 }}>🔑</span>
                      <h3 style={{ color: r.color }}>{r.role}</h3>
                    </div>
                    <div className="dash-card-body">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {r.permissions.map(p => (
                          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
                            <span style={{ color: '#10b981', fontWeight: 700 }}>✅</span> {p}
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 16, padding: '8px 12px', background: '#f4f5fb', borderRadius: 8, fontSize: 12, color: '#9ca3af' }}>
                        {loading ? '...' : users.filter(u => roleOf(u) === r.role).length} user(s) with this role
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
