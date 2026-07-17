import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUsers, FaUserTie, FaUserShield, FaSignOutAlt, FaPlus, FaToggleOn, FaToggleOff, FaSync } from 'react-icons/fa'
import { useDashboard } from '../hooks/useDashboard'
import { useAddEmployee } from '../hooks/useAddEmployee'
import { useAuth } from '../hooks/useAuth'
import { api } from '../utils/api'
import './Dashboard.css'

export default function SuperAdminDashboard() {
  const { data, loading, error, refetch } = useDashboard('superadmin')
  const { addEmployee, loading: adding, error: addErr, success: addOk, setError: setAddErr, setSuccess: setAddOk } = useAddEmployee()
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', mpin: '', is_admin: false })

  const handleLogout = async () => { await clearSession(); navigate('/login/superadmin') }

  const handleToggle = async (id) => {
    const token = localStorage.getItem('ms_token')
    await api(`/dashboard/users/${id}/toggle`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
    })
    refetch()
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const result = await addEmployee(form)
    if (result) { setShowAdd(false); setForm({ name: '', email: '', password: '', mpin: '', is_admin: false }); refetch() }
  }

  if (loading) return <div className="dash-loading"><div className="dash-spinner" /><p>Loading dashboard...</p></div>
  if (error)   return <div className="dash-error"><p>{error}</p><button onClick={refetch}>Retry</button></div>

  return (
    <div className="dashboard">
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <span className="dash-brand-name">1 Step Finance Care</span>
          <span className="dash-role-badge superadmin">Super Admin</span>
        </div>
        <nav className="dash-nav">
          <span className="dash-nav-item active"><FaUserShield /> Overview</span>
          <span className="dash-nav-item" onClick={() => setShowAdd(true)}><FaPlus /> Add Employee</span>
        </nav>
        <div className="dash-user-info">
          <div className="dash-avatar">{user?.name?.[0] || 'S'}</div>
          <div><strong>{user?.name}</strong><span>{user?.email}</span></div>
        </div>
        <button className="dash-logout" onClick={handleLogout}><FaSignOutAlt /> Logout</button>
      </aside>

      <main className="dash-main">
        <div className="dash-header">
          <h1>Super Admin Dashboard</h1>
          <button className="dash-refresh" onClick={refetch}><FaSync /> Refresh</button>
        </div>

        <div className="dash-stats">
          <div className="dash-stat-card">
            <FaUsers size={28} />
            <div><span>{data?.stats?.totalUsers}</span><p>Total Users</p></div>
          </div>
          <div className="dash-stat-card">
            <FaUserTie size={28} />
            <div><span>{data?.stats?.totalEmployees}</span><p>Employees</p></div>
          </div>
          <div className="dash-stat-card">
            <FaUserShield size={28} />
            <div><span>{data?.stats?.totalAdmins}</span><p>Admins</p></div>
          </div>
        </div>

        <div className="dash-table-wrap">
          <h2>All Staff</h2>
          <table className="dash-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {data?.staff?.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>
                    {s.is_superadmin ? <span className="badge superadmin">Super Admin</span>
                      : s.is_admin   ? <span className="badge admin">Admin</span>
                      : <span className="badge employee">Employee</span>}
                  </td>
                  <td><span className={`badge ${s.is_active ? 'active' : 'inactive'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    {!s.is_superadmin && (
                      <button className="dash-toggle" onClick={() => handleToggle(s.id)}>
                        {s.is_active ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAdd && (
          <div className="dash-modal-overlay" onClick={() => setShowAdd(false)}>
            <div className="dash-modal" onClick={e => e.stopPropagation()}>
              <h2>Add New Employee</h2>
              {addErr && <div className="dash-alert error">{addErr}</div>}
              {addOk  && <div className="dash-alert success">{addOk}</div>}
              <form onSubmit={handleAdd}>
                <input required placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                <input required type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                <input required type="password" inputMode="numeric" maxLength={6} placeholder="6-digit MPIN" value={form.mpin} onChange={e => setForm({...form, mpin: e.target.value.replace(/\D/g,'').slice(0,6)})} />
                <label className="dash-checkbox">
                  <input type="checkbox" checked={form.is_admin} onChange={e => setForm({...form, is_admin: e.target.checked})} />
                  Grant Admin Access
                </label>
                <div className="dash-modal-actions">
                  <button type="submit" disabled={adding}>{adding ? 'Adding...' : 'Add Employee'}</button>
                  <button type="button" onClick={() => setShowAdd(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
