import React, { useEffect, useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import { MdGroup, MdVerifiedUser, MdMonetizationOn } from 'react-icons/md'
import '../../pages/dashboard.css'

export default function AdminDashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/dashboard/admin', { headers: { Authorization: `Bearer ${getTokenByRole('admin')}` } })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <h1>Admin Dashboard</h1>
          <div className="dash-topbar-right">
            <span className="dash-badge">Admin Portal</span>
          </div>
        </div>
        <div className="dash-main">
          <div className="dash-stats">
            <div className="dash-stat">
              <div className="dash-stat-icon"><MdGroup size={22}/></div>
              <div className="dash-stat-label">Total Employees</div>
              <div className="dash-stat-value">{loading ? '—' : data?.stats?.totalEmployees ?? 0}</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-icon"><MdVerifiedUser size={22}/></div>
              <div className="dash-stat-label">Active Employees</div>
              <div className="dash-stat-value">{loading ? '—' : data?.stats?.activeEmployees ?? 0}</div>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-header"><h2>All Employees</h2></div>
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : (
                <table className="dash-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Coins</th><th>Status</th><th>Joined</th></tr></thead>
                  <tbody>
                    {data?.employees?.length ? data.employees.map(e => (
                      <tr key={e.id}>
                        <td><strong>{e.name}</strong></td>
                        <td>{e.email}</td>
                        <td><span className={`dash-status ${e.is_admin ? 'admin' : 'active'}`}>{e.is_admin ? 'Admin' : 'Employee'}</span></td>
                        <td>🪙 {e.coins ?? 0}</td>
                        <td><span className={`dash-status ${e.is_active ? 'active' : 'inactive'}`}>{e.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td>{new Date(e.created_at).toLocaleDateString('en-IN')}</td>
                      </tr>
                    )) : <tr><td colSpan={6} className="dash-empty">No employees found</td></tr>}
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
