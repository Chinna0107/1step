import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { getCustomerUser, useCustomerLogin } from '../../hooks/useCustomerAuth'
import logoImg from '../../assets/icons png/MS Logo.png'
import './CustomerSidebar.css'

const nav = [
  { to: '/customer/dashboard',     icon: '🏠', label: 'Dashboard' },
  { to: '/customer/services',      icon: '💳', label: 'Services' },
  { to: '/customer/transactions',  icon: '📊', label: 'Transactions' },
  { to: '/customer/kyc',           icon: '🪪', label: 'KYC & Profile' },
  { to: '/customer/offers',        icon: '💰', label: 'Offers' },
  { to: '/customer/notifications', icon: '🔔', label: 'Alerts' },
  { to: '/customer/support',       icon: '📞', label: 'Support' },
  { to: '/customer/security',      icon: '🔐', label: 'Security' },
]

// Bottom tab bar shows only first 5 items
const bottomTabs = nav.slice(0, 5)

export default function CustomerSidebar() {
  const user = getCustomerUser()
  const { logout } = useCustomerLogin()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login/customer')
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="csb">
        <div className="csb-brand">
          <img src={logoImg} alt="MoneySpot" className="csb-logo" />
          <div>
            <div className="csb-brand-name">MoneySpot</div>
            <div className="csb-brand-sub">Customer Portal</div>
          </div>
        </div>

        <div className="csb-user">
          <div className="csb-avatar">{user?.name?.[0]?.toUpperCase() || 'C'}</div>
          <div>
            <div className="csb-user-name">{user?.name || 'Customer'}</div>
            <div className="csb-user-pan">{user?.pan || ''}</div>
          </div>
        </div>

        <nav className="csb-nav">
          {nav.map(n => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `csb-link${isActive ? ' active' : ''}`}>
              <span className="csb-icon">{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="csb-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      {/* ── Mobile top navbar ── */}
      <header className="csb-mobile-header">
        <div className="csb-mobile-brand">
          <img src={logoImg} alt="MoneySpot" className="csb-mobile-logo" />
          <span className="csb-mobile-title">MoneySpot</span>
        </div>
        <div className="csb-mobile-user">
          <div className="csb-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
            {user?.name?.[0]?.toUpperCase() || 'C'}
          </div>
          <button className="csb-mobile-menu-btn" onClick={() => setDrawerOpen(true)}>☰</button>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div className="csb-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="csb-drawer" onClick={e => e.stopPropagation()}>
            <div className="csb-drawer-header">
              <div className="csb-user" style={{ margin: 0, borderRadius: 0, background: 'transparent', padding: '16px 18px' }}>
                <div className="csb-avatar">{user?.name?.[0]?.toUpperCase() || 'C'}</div>
                <div>
                  <div className="csb-user-name">{user?.name || 'Customer'}</div>
                  <div className="csb-user-pan">{user?.pan || ''}</div>
                </div>
              </div>
              <button className="csb-drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
            </div>
            <nav className="csb-nav" style={{ padding: '8px 12px' }}>
              {nav.map(n => (
                <NavLink key={n.to} to={n.to} onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) => `csb-link${isActive ? ' active' : ''}`}>
                  <span className="csb-icon">{n.icon}</span>
                  <span>{n.label}</span>
                </NavLink>
              ))}
            </nav>
            <button className="csb-logout" onClick={handleLogout}>🚪 Logout</button>
          </div>
        </div>
      )}

      {/* ── Mobile bottom tab bar ── */}
      <nav className="csb-bottom-tabs">
        {bottomTabs.map(n => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => `csb-tab${isActive ? ' active' : ''}`}>
            <span className="csb-tab-icon">{n.icon}</span>
            <span className="csb-tab-label">{n.label}</span>
          </NavLink>
        ))}
        <button className="csb-tab" onClick={() => setDrawerOpen(true)}>
          <span className="csb-tab-icon">☰</span>
          <span className="csb-tab-label">More</span>
        </button>
      </nav>
    </>
  )
}
