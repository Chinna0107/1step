import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { getCustomerUser, useCustomerLogin } from '../../hooks/useCustomerAuth'
import logoImg from '../../assets/logo.png'
import { MdDashboard, MdCreditCard, MdReceipt, MdPerson, MdLocalOffer, MdNotifications, MdSupportAgent, MdSecurity, MdLogout, MdMenu, MdClose } from 'react-icons/md'
import './CustomerSidebar.css'

const nav = [
  { to: '/customer/dashboard',     icon: <MdDashboard size={20} />, label: 'Dashboard' },
  { to: '/customer/services',      icon: <MdCreditCard size={20} />, label: 'Services' },
  { to: '/customer/cibil-repairs', icon: <MdDashboard size={20} />, label: 'CIBIL Repairs' },
  { to: '/customer/transactions',  icon: <MdReceipt size={20} />, label: 'Transactions' },
  { to: '/customer/coins',         icon: <img src={logoImg} alt="1step coin" style={{width: 20, height: 20, objectFit: 'contain'}} />, label: '1step Coins' },
  { to: '/customer/kyc',           icon: <MdPerson size={20} />, label: 'KYC & Profile' },
  { to: '/customer/offers',        icon: <MdLocalOffer size={20} />, label: 'Offers' },
  { to: '/customer/notifications', icon: <MdNotifications size={20} />, label: 'Alerts' },
  { to: '/customer/support',       icon: <MdSupportAgent size={20} />, label: 'Support' },
  { to: '/customer/security',      icon: <MdSecurity size={20} />, label: 'Security' },
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
          <img src={logoImg} alt="1 Step Finance Care" className="csb-logo" />
          <div>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#ffffff', display: 'block', lineHeight: 1.3 }}>1 Step Finance Care</span>
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

        <button className="csb-logout" onClick={handleLogout}><MdLogout size={18} /> Logout</button>
      </aside>

      {/* ── Mobile top navbar ── */}
      <header className="csb-mobile-header">
        <div className="csb-mobile-brand">
          <img src={logoImg} alt="1 Step Finance Care" className="csb-mobile-logo" />
          <span style={{ fontWeight: 700, fontSize: 14, color: '#ffffff' }}>1 Step Finance Care</span>
        </div>
        <div className="csb-mobile-user">
          <div className="csb-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
            {user?.name?.[0]?.toUpperCase() || 'C'}
          </div>
          <button className="csb-mobile-menu-btn" onClick={() => setDrawerOpen(true)}><MdMenu size={24} /></button>
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
              <button className="csb-drawer-close" onClick={() => setDrawerOpen(false)}><MdClose size={24} /></button>
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
            <button className="csb-logout" onClick={handleLogout}><MdLogout size={18} /> Logout</button>
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
          <span className="csb-tab-icon"><MdMenu size={22} /></span>
          <span className="csb-tab-label">More</span>
        </button>
      </nav>
    </>
  )
}
