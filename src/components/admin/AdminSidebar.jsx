import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  MdDashboard, MdPersonAdd, MdInbox,
  MdBarChart, MdFactCheck, MdLogout, MdPerson
} from 'react-icons/md'
import { useRoleBasedAuth } from '../../hooks/useRoleBasedAuth'
import { getUserByRole, getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import logoImg from '../../assets/icons png/MS Logo.png'
import nameImg from '../../assets/icons png/Money Spot Logo.png'
import '../../pages/dashboard.css'

const navItems = [
  { to: '/admin/dashboard',       icon: <MdDashboard />,  label: 'Dashboard' },
  { to: '/admin/create-employee', icon: <MdPersonAdd />,  label: 'Create Employee' },
  { to: '/admin/requests',        icon: <MdInbox />,      label: 'Customer Requests' },
  { to: '/admin/performance',     icon: <MdBarChart />,   label: 'Performance' },
  { to: '/admin/attendance',      icon: <MdFactCheck />,  label: 'Attendance' },
]

export default function AdminSidebar() {
  const { pathname } = useLocation()
  const navigate     = useNavigate()
  const { logout }   = useRoleBasedAuth()
  const user         = getUserByRole('admin')

  const handleLogout = async () => {
    try { await api('/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${getTokenByRole('admin')}` } }) } catch (_) {}
    logout('admin')
    navigate('/login/employee')
  }

  return (
    <aside className="adm-sidebar">
      <div className="adm-sidebar-brand">
        <img src={logoImg} alt="logo" className="adm-brand-logo" />
        <div>
          <img src={nameImg} alt="MoneySpot" className="adm-brand-name" />
          <span className="adm-brand-role">Admin</span>
        </div>
      </div>
      <nav className="adm-sidebar-nav">
        {navItems.map(item => (
          <Link key={item.to} to={item.to} className={`adm-nav-link ${pathname === item.to ? 'active' : ''}`}>
            <span className="adm-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="adm-sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8, paddingLeft: 4 }}>
          <MdPerson /> {user?.name || 'Admin'}
        </div>
        <button className="adm-logout-btn" onClick={handleLogout}>
          <MdLogout /> Logout
        </button>
      </div>
    </aside>
  )
}
