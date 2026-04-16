import React from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { useSuperAdminDashboard } from '../../hooks/useSuperAdmin'
import { getUserByRole } from '../../utils/tokenUtils'
import { MdPeople, MdGroup, MdAdminPanelSettings, MdVerifiedUser, MdLock } from 'react-icons/md'
import './superadmin.css'

export default function SuperAdminDashboard() {
  const { data, loading, error } = useSuperAdminDashboard()
  const user = getUserByRole('superadmin')

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="sa-topbar">
          <h1>Dashboard</h1>
          <div className="sa-topbar-right">
            <span style={{ fontSize: 14, color: '#666' }}>Welcome, <strong>{user?.name || 'Super Admin'}</strong></span>
            <span className="sa-badge"><MdLock style={{verticalAlign:'middle',marginRight:4}}/>Super Admin</span>
          </div>
        </div>

        <div className="sa-main">
          {error && <div className="sa-alert sa-alert-error">{error}</div>}

          <div className="sa-stats-grid">
            <div className="sa-stat-card">
              <div className="sa-stat-label"><MdPeople style={{verticalAlign:'middle',marginRight:4}}/>Total Users</div>
              <div className="sa-stat-value">{loading ? '—' : data?.stats?.totalUsers ?? 0}</div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-label"><MdGroup style={{verticalAlign:'middle',marginRight:4}}/>Total Employees</div>
              <div className="sa-stat-value">{loading ? '—' : data?.stats?.totalEmployees ?? 0}</div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-label"><MdAdminPanelSettings style={{verticalAlign:'middle',marginRight:4}}/>Total Admins</div>
              <div className="sa-stat-value">{loading ? '—' : data?.stats?.totalAdmins ?? 0}</div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-label"><MdVerifiedUser style={{verticalAlign:'middle',marginRight:4}}/>Active Users</div>
              <div className="sa-stat-value">{loading ? '—' : data?.stats?.activeUsers ?? 0}</div>
            </div>
          </div>

          <div className="sa-card">
            <div className="sa-card-header">
              <h2>All Staff</h2>
            </div>
            <div className="sa-table-wrap">
              {loading ? (
                <div className="sa-loading">Loading...</div>
              ) : (
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.staff?.length ? data.staff.map(u => (
                      <tr key={u.id}>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td>
                          {u.is_superadmin && <span className="sa-status admin">SuperAdmin</span>}
                          {!u.is_superadmin && u.is_admin && <span className="sa-status admin">Admin</span>}
                          {!u.is_admin && u.is_employee && <span className="sa-status active">Employee</span>}
                        </td>
                        <td><span className={`sa-status ${u.is_active ? 'active' : 'inactive'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="sa-empty">No staff found</td></tr>
                    )}
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
