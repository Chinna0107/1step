import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  MdDashboard, MdInsights, MdStorefront, MdAccountBalance,
  MdPeople, MdPersonAdd, MdInbox, MdBarChart, MdFactCheck,
  MdReceipt, MdAssessment, MdSecurity, MdSettings, MdLogout, MdPerson
} from 'react-icons/md'
import { useRoleBasedAuth } from '../../hooks/useRoleBasedAuth'
import { getUserByRole, getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import logoImg from '../../assets/icons png/MS Logo.png'
import nameImg from '../../assets/icons png/Money Spot Logo.png'
import '../../pages/dashboard.css'

const NAV = [
  { group: 'Overview',
    items: [
      { to: '/admin/dashboard',    icon: <MdDashboard />,    label: 'Dashboard' },
      { to: '/admin/insights',     icon: <MdInsights />,     label: 'Performance Insights' },
    ]},
  { group: 'Operations',
    items: [
      { to: '/admin/transactions', icon: <MdReceipt />,      label: 'Transactions' },
      { to: '/admin/finance',      icon: <MdAccountBalance />,label: 'Financial Control' },
    ]},
  { group: 'Employees',
    items: [
      { to: '/admin/performance',  icon: <MdBarChart />,     label: 'Performance' },
      { to: '/admin/attendance',   icon: <MdFactCheck />,    label: 'Attendance' },
      { to: '/admin/create-employee', icon: <MdPersonAdd />, label: 'Create Employee' },
    ]},
  { group: 'Customers',
    items: [
      { to: '/admin/requests',     icon: <MdInbox />,        label: 'Customer Requests' },
      { to: '/admin/customers',    icon: <MdPeople />,       label: 'All Customers' },
    ]},
  { group: 'Reports',
    items: [
      { to: '/admin/reports',      icon: <MdAssessment />,   label: 'Reports' },
      { to: '/admin/security',     icon: <MdSecurity />,     label: 'Security' },
      { to: '/admin/config',       icon: <MdSettings />,     label: 'Configuration' },
      { to: '/admin/profile',      icon: <MdPerson />,       label: 'My Profile' },
    ]},
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
    <aside className="adm-sidebar" style={{ width: 220, overflowY: 'auto' }}>
      <div className="adm-sidebar-brand">
        <img src={logoImg} alt="MoneySpot" className="adm-brand-logo" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <img src={nameImg} alt="MoneySpot" className="adm-brand-name" />
          <span className="adm-brand-role">Admin Panel</span>
        </div>
      </div>

      <nav className="adm-sidebar-nav" style={{ gap: 0 }}>
        {NAV.map(group => (
          <div key={group.group}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1.2, padding: '14px 14px 4px' }}>
              {group.group}
            </div>
            {group.items.map(item => (
              <Link key={item.to} to={item.to}
                className={`adm-nav-link ${pathname.startsWith(item.to) ? 'active' : ''}`}>
                <span className="adm-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="adm-sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8, paddingLeft: 4 }}>
          <MdPerson /> {user?.name || 'Admin'} {user?.branch ? `· ${user.branch}` : ''}
        </div>
        <button className="adm-logout-btn" onClick={handleLogout}>
          <MdLogout /> Logout
        </button>
      </div>
    </aside>
  )
}
