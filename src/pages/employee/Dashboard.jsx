import React, { useEffect, useState } from 'react'
import EmployeeNavbar from '../../components/employee/EmployeeNavbar'
import { getUserByRole, getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import {
  MdPerson, MdMonetizationOn, MdCalendarToday,
  MdBadge, MdLogin, MdLogout, MdFactCheck, MdStar
} from 'react-icons/md'
import '../../pages/dashboard.css'

export default function EmployeeDashboard() {
  const user = getUserByRole('employee') || getUserByRole('admin')
  const [profile, setProfile] = useState(null)
  const [attendance, setAttendance] = useState(null)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = getTokenByRole('employee') || getTokenByRole('admin')
    api('/dashboard/employee', { headers: { Authorization: `Bearer ${token}` } })
      .then(d => setProfile(d.profile))
      .catch(() => {})
  }, [])

  const markAttendance = async (type) => {
    setLoading(true); setMsg('')
    const token = getTokenByRole('employee') || getTokenByRole('admin')
    try {
      const r = await api('/dashboard/attendance/mark', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type }),
      })
      setMsg(r.message)
      if (r.coinsEarned > 0) setMsg(`${r.message} 🪙 +${r.coinsEarned} coins earned!`)
    } catch (e) { setMsg(e.message) }
    setLoading(false)
  }

  const now = new Date()

  return (
    <div className="emp-page">
      <EmployeeNavbar />
      <div className="emp-page-content">
        <div className="emp-page-header">
          <div>
            <h1>Welcome back, {profile?.name || user?.name || 'Employee'} 👋</h1>
            <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
              {now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <span className="dash-badge">Employee Portal</span>
        </div>

        {msg && <div className="dash-alert dash-alert-success">{msg}</div>}

        <div className="dash-stats">
          <div className="dash-stat">
            <div className="dash-stat-icon"><MdPerson size={22}/></div>
            <div className="dash-stat-label">Name</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ms-purple)' }}>{profile?.name || '—'}</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-icon"><MdMonetizationOn size={22} style={{color:'#b8860b'}}/></div>
            <div className="dash-stat-label">MoneySpot Coins</div>
            <div className="dash-stat-value" style={{ color: '#b8860b' }}>{profile?.coins ?? 0}</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-icon"><MdCalendarToday size={22}/></div>
            <div className="dash-stat-label">Member Since</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ms-purple)' }}>
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN') : '—'}
            </div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-icon"><MdBadge size={22} style={{color:'var(--ms-crimson)'}}/></div>
            <div className="dash-stat-label">Role</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ms-crimson)' }}>
              {profile?.is_admin ? 'Admin' : 'Employee'}
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header"><h2 style={{display:'flex',alignItems:'center',gap:6}}><MdFactCheck/>Today's Attendance</h2></div>
          <div className="dash-card-body">
            <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>
              Mark your attendance for today. Earn <strong style={{ color: '#b8860b' }}>5 coins/min</strong> for every minute beyond 500 minutes worked.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="dash-btn dash-btn-success" onClick={() => markAttendance('check_in')} disabled={loading}>
                <MdLogin /> Check In
              </button>
              <button className="dash-btn dash-btn-danger" onClick={() => markAttendance('check_out')} disabled={loading}>
                <MdLogout /> Check Out
              </button>
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header"><h2 style={{display:'flex',alignItems:'center',gap:6}}><MdMonetizationOn style={{color:'#b8860b'}}/>MoneySpot Coins</h2></div>
          <div className="dash-card-body">
            <div className="coins-card">
              <div className="coins-label">Available Balance</div>
              <div className="coins-amount" style={{display:'flex',alignItems:'center',gap:8}}><MdMonetizationOn size={32}/> {profile?.coins ?? 0}</div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 8 }}>
                Earn coins by working more than 500 minutes/day. 5 coins per extra minute!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
