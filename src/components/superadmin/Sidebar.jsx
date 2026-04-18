import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  MdDashboard, MdInsights, MdStorefront, MdEmojiEvents,
  MdAccountBalance, MdPeople, MdSettings, MdMiscellaneousServices,
  MdAssessment, MdSecurity, MdLogout, MdChevronRight,
  MdLock, MdFactCheck
} from 'react-icons/md'
import { useRoleBasedAuth } from '../../hooks/useRoleBasedAuth'
import { api } from '../../utils/api'
import { getTokenByRole, getUserByRole } from '../../utils/tokenUtils'
import logoImg from '../../assets/icons png/MS Logo.png'
import './Sidebar.css'

const NAV = [
  {
    group: 'Overview',
    items: [
      { to: '/superadmin/dashboard',    icon: <MdDashboard />,    label: 'Dashboard' },
      { to: '/superadmin/insights',     icon: <MdInsights />,     label: 'Performance Insights' },
    ],
  },
  {
    group: 'Operations',
    items: [
      { to: '/superadmin/branches',     icon: <MdStorefront />,   label: 'Branch Management' },
      { to: '/superadmin/tracking',     icon: <MdEmojiEvents />,  label: 'Performance Tracking' },
      { to: '/superadmin/finance',      icon: <MdAccountBalance />,label: 'Financial Control' },
      { to: '/superadmin/employees',    icon: <MdPeople />,       label: 'Employee Management' },
      { to: '/superadmin/attendance',    icon: <MdFactCheck />,    label: 'Attendance' },
    ],
  },
  {
    group: 'Configuration',
    items: [
      { to: '/superadmin/master',       icon: <MdSettings />,     label: 'Master Config' },
      { to: '/superadmin/services',     icon: <MdMiscellaneousServices />, label: 'Service Types' },
    ],
  },
  {
    group: 'Reports',
    items: [
      { to: '/superadmin/reports',      icon: <MdAssessment />,   label: 'Reports & Downloads' },
      { to: '/superadmin/security',     icon: <MdSecurity />,     label: 'Security & Control' },
    ],
  },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { logout } = useRoleBasedAuth()
  const [collapsed, setCollapsed] = useState(false)
  const user = getUserByRole('superadmin')

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
    <aside className={`sa-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand */}
      <div className="sa-sidebar-brand">
        <img src={logoImg} alt="logo" className="sa-brand-logo" />
        {!collapsed && (
          <div className="sa-brand-text">
            <span className="sa-brand-title">
              <span style={{ color: '#fff' }}>Money</span>
              <span style={{ color: '#d4af37' }}>Spot</span>
            </span>
            <span className="sa-brand-role">
              <MdLock size={10} style={{ marginRight: 4 }} />Super Admin
            </span>
          </div>
        )}
        <button className="sa-collapse-btn" onClick={() => setCollapsed(c => !c)} title="Toggle sidebar">
          <MdChevronRight style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
        </button>
      </div>

      {/* User pill */}
      {!collapsed && (
        <div className="sa-user-pill">
          <div className="sa-user-avatar">{(user?.name || 'S')[0].toUpperCase()}</div>
          <div className="sa-user-info">
            <span className="sa-user-name">{user?.name || 'Super Admin'}</span>
            <span className="sa-user-email">{user?.email || ''}</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="sa-sidebar-nav">
        {NAV.map(group => (
          <div key={group.group} className="sa-nav-group">
            {!collapsed && <span className="sa-nav-group-label">{group.group}</span>}
            {group.items.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`sa-nav-link ${pathname.startsWith(item.to) ? 'active' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <span className="sa-nav-icon">{item.icon}</span>
                {!collapsed && <span className="sa-nav-label">{item.label}</span>}
                {!collapsed && pathname.startsWith(item.to) && (
                  <span className="sa-nav-active-dot" />
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sa-sidebar-footer">
        <button className="sa-logout-btn" onClick={handleLogout} title="Logout">
          <MdLogout />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
