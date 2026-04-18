import React, { useEffect, useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import '../../pages/dashboard.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })

export default function AdminSecurity() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg]         = useState('')
  const [error, setError]     = useState('')

  const load = () => {
    setLoading(true)
    api('/dashboard/security/users', { headers: auth() })
      .then(d => { setUsers(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const toggle = async (id, isActive) => {
    setMsg(''); setError('')
    try {
      await api(`/dashboard/users/${id}/toggle`, { method: 'PATCH', headers: auth() })
      setMsg(`User ${isActive ? 'frozen' : 'unfrozen'}`)
      load()
    } catch (e) { setError(e.message) }
  }

  const roleOf = u => u.is_superadmin ? 'Super Admin' : u.is_admin ? 'Admin' : 'Employee'

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar"><h1>Security & Control</h1></div>
        <div className="dash-main">

          {msg   && <div className="dash-alert dash-alert-success">✅ {msg}</div>}
          {error && <div className="dash-alert dash-alert-error">❌ {error}</div>}

          <div className="dash-stats">
            <div className="dash-stat"><div className="dash-stat-label">Total Users</div><div className="dash-stat-value">{users.length}</div></div>
            <div className="dash-stat"><div className="dash-stat-label">Active</div><div className="dash-stat-value" style={{ color: '#059669' }}>{users.filter(u => u.is_active).length}</div></div>
            <div className="dash-stat"><div className="dash-stat-label">Frozen</div><div className="dash-stat-value" style={{ color: '#dc2626' }}>{users.filter(u => !u.is_active).length}</div></div>
          </div>

          <div className="dash-card">
            <div className="dash-card-header"><h2>🔓 User Access Control</h2></div>
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : (
                <table className="dash-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Branch</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td><strong>{u.name}</strong></td>
                        <td style={{ fontSize: 12, color: '#6b7280' }}>{u.email}</td>
                        <td><span className={`dash-status ${u.is_admin ? 'admin' : 'active'}`}>{roleOf(u)}</span></td>
                        <td>{u.branch || '—'}</td>
                        <td style={{ fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                        <td><span className={`dash-status ${u.is_active ? 'active' : 'inactive'}`}>{u.is_active ? '✅ Active' : '🔒 Frozen'}</span></td>
                        <td>
                          {!u.is_superadmin && (
                            <button className={`dash-btn dash-btn-sm ${u.is_active ? 'dash-btn-danger' : 'dash-btn-warning'}`}
                              onClick={() => toggle(u.id, u.is_active)}>
                              {u.is_active ? '🔒 Freeze' : '🔓 Unfreeze'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!users.length && <tr><td colSpan={7} className="dash-empty">No users found</td></tr>}
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
