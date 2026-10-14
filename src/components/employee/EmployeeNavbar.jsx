import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  MdDashboard, MdPeople, MdPersonAdd,
  MdMiscellaneousServices, MdPerson, MdLogout, MdBarChart, MdLeaderboard,
  MdCalendarToday
} from 'react-icons/md'
import { useRoleBasedAuth } from '../../hooks/useRoleBasedAuth'
import { getUserByRole, getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import NotificationBell from '../NotificationBell'
import nameImg from '../../assets/logo.png'
import logoImg from '../../assets/logo.png'
import '../../pages/dashboard.css'

const links = [
  { to: '/employee/dashboard',      icon: <MdDashboard />,             label: 'Dashboard' },
  { to: '/employee/services',       icon: <MdMiscellaneousServices />, label: 'New Transaction' },
  { to: '/employee/bill-due-dates', icon: <MdCalendarToday />,         label: '📅 Bill Due Dates' },
  { to: '/employee/cibil-repair',  icon: <MdLeaderboard />,           label: '🔧 CIBIL Repair' },
  { to: '/employee/leads',          icon: <MdLeaderboard />,           label: '🎯 Leads' },
  { to: '/employee/customer-info',  icon: <MdPeople />,                label: 'Customers' },
  { to: '/employee/add-customer',   icon: <MdPersonAdd />,             label: 'Add Customer' },
  { to: '/employee/reports',        icon: <MdBarChart />,              label: 'Reports' },
  { to: '/employee/profile',        icon: <MdPerson />,                label: 'Profile' },
]

export default function EmployeeNavbar() {
  const { pathname } = useLocation()
  const navigate     = useNavigate()
  const { logout }   = useRoleBasedAuth()
  const user         = getUserByRole('employee') || getUserByRole('admin')

  const handleLogout = async () => {
    try {
      const token = getTokenByRole('employee')
      await api('/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    } catch (_) {}
    logout('employee')
    navigate('/login/employee')
  }

  return (
    <nav className="emp-navbar">
      <div className="emp-navbar-brand">
        <img src={logoImg} alt="1 Step Finance Care" style={{ height: 32, width: 32, objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(26,54,93,0.5))' }} />
        <span style={{ fontWeight: 700, fontSize: 15, color: '#ffffff', letterSpacing: 0.3 }}>1 Step Finance Care</span>
        <span>Employee Portal</span>
      </div>
      <div className="emp-navbar-links">
        {links.map(l => (
          <Link key={l.to} to={l.to} className={`emp-nav-link ${pathname === l.to ? 'active' : ''}`}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{l.icon} {l.label}</span>
          </Link>
        ))}
      </div>
      <div className="emp-navbar-user">
        <span className="emp-user-name" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <MdPerson size={16} /> {user?.name || 'Employee'}
        </span>
        <NotificationBell role="employee" />
        <button className="emp-logout-btn" onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <MdLogout size={14} /> Logout
        </button>
      </div>
    </nav>
  )
}
