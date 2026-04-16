import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  MdDashboard, MdAdminPanelSettings, MdGroup,
  MdFactCheck, MdMiscellaneousServices, MdLogout
} from 'react-icons/md'
import { useRoleBasedAuth } from '../../hooks/useRoleBasedAuth'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import logoImg from '../../assets/icons png/MS Logo.png'
import nameImg from '../../assets/icons png/Money Spot Logo.png'
import './Sidebar.css'

const navItems = [
  { to: '/superadmin/dashboard',  icon: <MdDashboard />,           label: 'Dashboard' },
  { to: '/superadmin/admins',     icon: <MdAdminPanelSettings />,  label: 'Manage Admins' },
  { to: '/superadmin/employees',  icon: <MdGroup />,               label: 'Employees' },
  { to: '/superadmin/attendance', icon: <MdFactCheck />,           label: 'Attendance' },
  { to: '/superadmin/services',   icon: <MdMiscellaneousServices />, label: 'Services' },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const navigate     = useNavigate()
  const { logout }   = useRoleBasedAuth()

  const handleLogout = async () => {
    try {
      await api('/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getTokenByRole('superadmin')}` },
      })
    } catch (_) {}
    logout('superadmin')
    navigate('/login/superadmin')
  }

  return (
    <aside className="sa-sidebar">
      <div className="sa-sidebar-brand">
        <img src={logoImg} alt="logo" className="sa-brand-logo" />
        <div>
          <img src={nameImg} alt="MoneySpot" className="sa-brand-name" />
          <span className="sa-brand-role">Super Admin</span>
        </div>
      </div>

      <nav className="sa-sidebar-nav">
        {navItems.map(item => (
          <Link key={item.to} to={item.to} className={`sa-nav-link ${pathname === item.to ? 'active' : ''}`}>
            <span className="sa-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sa-sidebar-footer">
        <button className="sa-logout-btn" onClick={handleLogout}>
          <MdLogout /> Logout
        </button>
      </div>
    </aside>
  )
}
