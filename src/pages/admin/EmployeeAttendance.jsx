import React, { useEffect, useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import '../../pages/dashboard.css'
import { useAdminAttendance } from '../../hooks/useFinance'

export default function EmployeeAttendance() {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading]       = useState(true)
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    setLoading(true)
    api(`/dashboard/attendance?view=day&date=${date}`, { headers: { Authorization: `Bearer ${getTokenByRole('admin')}` } })
      .then(d => { setAttendance(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [date])

  const present = attendance.filter(a => a.status === 'Present').length
  const absent  = attendance.filter(a => a.status === 'Absent').length

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <h1>Employee Attendance</h1>
          <div className="dash-topbar-right">
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid rgba(13,31,61,0.2)', fontFamily: 'inherit', fontSize: 13 }} />
          </div>
        </div>
        <div className="dash-main">
          <div className="dash-stats">
            <div className="dash-stat"><div className="dash-stat-icon">📋</div><div className="dash-stat-label">Total Records</div><div className="dash-stat-value">{attendance.length}</div></div>
            <div className="dash-stat"><div className="dash-stat-icon">✅</div><div className="dash-stat-label">Present</div><div className="dash-stat-value" style={{ color: '#059669' }}>{present}</div></div>
            <div className="dash-stat"><div className="dash-stat-icon">❌</div><div className="dash-stat-label">Absent</div><div className="dash-stat-value" style={{ color: '#dc2626' }}>{absent}</div></div>
          </div>

          <div className="dash-card">
            <div className="dash-card-header">
              <h2>Attendance — {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { dateStyle: 'long' })}</h2>
            </div>
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : (
                <table className="dash-table">
                  <thead><tr><th>Employee</th><th>Check In</th><th>Check Out</th><th>Minutes</th><th>Coins Earned</th><th>Status</th></tr></thead>
                  <tbody>
                    {attendance.length ? attendance.map(a => (
                      <tr key={a.id}>
                        <td><strong>{a.employee_name}</strong><br /><span style={{ fontSize: 11, color: '#888' }}>{a.email}</span></td>
                        <td>{a.check_in || '—'}</td>
                        <td>{a.check_out || '—'}</td>
                        <td><span style={{ fontWeight: 700, color: (a.minutes || 0) > 500 ? '#059669' : '#374151' }}>{a.minutes || 0} min</span></td>
                        <td>{(a.coins_earned || 0) > 0 ? <span style={{ fontWeight: 700, color: '#b8860b' }}>🪙 +{a.coins_earned}</span> : '—'}</td>
                        <td><span className={`dash-status ${a.status?.toLowerCase()}`}>{a.status}</span></td>
                      </tr>
                    )) : <tr><td colSpan={6} className="dash-empty">No attendance records for this date</td></tr>}
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
