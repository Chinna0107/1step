import React, { useEffect, useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import '../../pages/dashboard.css'

export default function EmployeePerformance() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    api('/dashboard/employees', { headers: { Authorization: `Bearer ${getTokenByRole('admin')}` } })
      .then(d => { setEmployees(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const getRating = (coins) => {
    if (coins >= 5000) return { stars: '⭐⭐⭐⭐⭐', label: 'Excellent', color: '#059669' }
    if (coins >= 2000) return { stars: '⭐⭐⭐⭐', label: 'Good', color: '#0284c7' }
    if (coins >= 500)  return { stars: '⭐⭐⭐', label: 'Average', color: '#d97706' }
    return { stars: '⭐⭐', label: 'Needs Improvement', color: '#dc2626' }
  }

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <h1>Employee Performance</h1>
        </div>
        <div className="dash-main">
          <div className="dash-card">
            <div className="dash-card-header"><h2>Performance Overview</h2></div>
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : (
                <table className="dash-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Coins Earned</th><th>Rating</th><th>Status</th></tr></thead>
                  <tbody>
                    {employees.length ? employees.map(e => {
                      const r = getRating(e.coins || 0)
                      return (
                        <tr key={e.id}>
                          <td><strong>{e.name}</strong></td>
                          <td>{e.email}</td>
                          <td><span style={{ fontWeight: 700, color: '#b8860b' }}>🪙 {e.coins ?? 0}</span></td>
                          <td>
                            <div>{r.stars}</div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: r.color }}>{r.label}</span>
                          </td>
                          <td><span className={`dash-status ${e.is_active ? 'active' : 'inactive'}`}>{e.is_active ? 'Active' : 'Inactive'}</span></td>
                        </tr>
                      )
                    }) : <tr><td colSpan={5} className="dash-empty">No employees found</td></tr>}
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
