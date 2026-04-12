import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logoImg from '../assets/icons png/MS Logo.png'
import './Header.css'

const navLinks = [
  { to: '/',           label: 'Home',      icon: '🏠' },
  { to: '/what-we-do', label: 'What We Do', icon: '💼' },
  { to: '/about',      label: 'About Us',   icon: '👥' },
  { to: '/contact',    label: 'Contact',    icon: '📞' },
]

export default function Header() {
  const [menuOpen, setMenuOpen]   = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()

  const close = () => setMenuOpen(false)

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo">
            <img src={logoImg} alt="MoneySpot Logo" className="logo-img" />
            <span className="logo-money">Money</span><span className="logo-spot">Spot</span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="nav desktop-nav">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}>{l.label}</Link>
            ))}
          </nav>

          <div className="header-actions">
            {/* ── Desktop login ── */}
            <div className="login-dropdown">
              <button className="btn-login" onClick={() => setLoginOpen(o => !o)}>Login ▾</button>
              {loginOpen && (
                <div className="login-menu">
                  <button onClick={() => { navigate('/login/customer');   setLoginOpen(false) }}>👤 Customer Login</button>
                  <button onClick={() => { navigate('/login/employee');   setLoginOpen(false) }}>🏢 Employee / Admin</button>
                  <button onClick={() => { navigate('/login/superadmin'); setLoginOpen(false) }}>🔑 Super Admin</button>
                </div>
              )}
            </div>

            {/* ── Hamburger ── */}
            <button className={`hamburger${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(o => !o)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile backdrop ── */}
      {menuOpen && <div className="nav-backdrop" onClick={close} />}

      {/* ── Mobile drawer ── */}
      <nav className={`nav mobile-nav${menuOpen ? ' open' : ''}`}>
        {/* Drawer header */}
        <div className="nav-mobile-header">
          <div className="nav-mobile-brand">
            <img src={logoImg} alt="logo" className="nav-mobile-logo" />
            <div>
              <span className="nav-mobile-name">
                <span className="logo-money">Money</span><span className="logo-spot">Spot</span>
              </span>
              <span className="nav-mobile-tagline">Smart Finance</span>
            </div>
          </div>
          <button className="nav-mobile-close" onClick={close}>✕</button>
        </div>

        {/* Nav links */}
        <div className="nav-links">
          {navLinks.map((l, i) => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav-link${location.pathname === l.to ? ' active' : ''}`}
              style={{ animationDelay: `${i * 0.06}s` }}
              onClick={close}
            >
              <span className="nav-link-icon">{l.icon}</span>
              <span className="nav-link-label">{l.label}</span>
              <span className="nav-link-arrow">›</span>
            </Link>
          ))}
        </div>

        {/* Login footer */}
        <div className="nav-mobile-footer">
          <p className="nav-mobile-footer-label">Login As</p>
          <div className="nav-login-options">
            <button
              className="nav-login-opt--customer"
              onClick={() => { navigate('/login/customer'); close() }}
            >
              <span className="opt-icon">👤</span> Customer Login
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="nav-login-opt--secondary" onClick={() => { navigate('/login/employee'); close() }}>
              🏢 Employee
            </button>
            <button className="nav-login-opt--secondary" onClick={() => { navigate('/login/superadmin'); close() }}>
              🔑 Super Admin
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
