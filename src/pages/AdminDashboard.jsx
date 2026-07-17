import { useNavigate } from 'react-router-dom'
import { FaUserTie, FaCheckCircle, FaSignOutAlt, FaToggleOn, FaToggleOff, FaSync } from 'react-icons/fa'
import { useDashboard } from '../hooks/useDashboard'
import { useAuth } from '../hooks/useAuth'
import { api } from '../utils/api'
import './Dashboard.css'

export default function AdminDashboard() {
  const { data, loading, error, refetch } = useDashboard('admin')
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => { await clearSession(); navigate('/login/employee') }

  const handleToggle = async (id) => {
    const token = localStorage.getItem('ms_token')
    await api(`/dashboard/users/${id}/toggle`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
    })
    refetch()
  }

  if (loading) return <div className="dash-loading"><div className="dash-spinner" /><p>Loading dashboard...</p></div>
  if (error)   return <div className="dash-error"><p>{error}</p><button onClick={refetch}>Retry</button></div>

  return (
    <div className="dashboard">
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <span className="dash-brand-name">1 Step Finance Care</span>
          <span className="dash-role-badge admin">Admin</span>
        </div>
        <nav className="dash-nav">
          <span className="dash-nav-item active"><FaUserTie /> Employees</span>
        </nav>
        <div className="dash-user-info">
          <div className="dash-avatar">{user?.name?.[0] || 'A'}</div>
          <div><strong>{user?.name}</strong><span>{user?.email}</span></div>
        </div>
        <button className="dash-logout" onClick={handleLogout}><FaSignOutAlt /> Logout</button>
      </aside>

      <main className="dash-main">
        <div className="dash-header">
          <h1>Admin Dashboard</h1>
          <button className="dash-refresh" onClick={refetch}><FaSync /> Refresh</button>
        </div>

        <div className="dash-stats">
          <div className="dash-stat-card">
            <FaUserTie size={28} />
            <div><span>{data?.stats?.totalEmployees}</span><p>Total Employees</p></div>
          </div>
          <div className="dash-stat-card">
            <FaCheckCircle size={28} />
            <div><span>{data?.stats?.activeEmployees}</span><p>Active</p></div>
          </div>
        </div>

        <div className="dash-table-wrap">
          <h2>Employee List</h2>
          <table className="dash-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Status</th><th>Joined</th><th>Action</th></tr>
            </thead>
            <tbody>
              {data?.employees?.map(e => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td>{e.email}</td>
                  <td><span className={`badge ${e.is_active ? 'active' : 'inactive'}`}>{e.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>{new Date(e.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="dash-toggle" onClick={() => handleToggle(e.id)}>
                      {e.is_active ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
