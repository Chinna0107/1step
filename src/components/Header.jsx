import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaCheckCircle, FaUser, FaBuilding, FaKey, FaHome, FaBriefcase, FaUsers, FaImages, FaRocket, FaPhoneAlt, FaTimes, FaChevronRight } from 'react-icons/fa'
import logoImg from '../assets/logo.png'
import './Header.css'

const trustItems = [
  '120+ Bank & NBFC Partners',
  '5,000+ Happy Customers',
  'Authorised Fintech Service Provider',
  'Instant Cash Transfers 24/7',
  '100% Secure & Trusted',
  'Zero Hidden Charges',
]

const navLinks = [
  { to: '/',           label: 'Home',      icon: FaHome },
  { to: '/what-we-do', label: 'What We Do', icon: FaBriefcase },
  { to: '/about',      label: 'About Us',   icon: FaUsers },
  { to: '/gallery',    label: 'Gallery',    icon: FaImages },
  { to: '/careers',    label: 'Careers',    icon: FaRocket },
  { to: '/contact',    label: 'Contact Us', icon: FaPhoneAlt },
]

export default function Header({ menuOpen, setMenuOpen }) {
  const [loginOpen, setLoginOpen] = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()
  const loginRef  = useRef(null)

  const close = () => setMenuOpen(false)

  useEffect(() => {
    const handler = (e) => {
      if (loginRef.current && !loginRef.current.contains(e.target)) {
        setLoginOpen(false)
      }
    }
    if (loginOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [loginOpen])

  return (
    <>
      {/* ── Trust Bar ── */}
      <div className="trust-bar">
        <div className="trust-track">
          {[...trustItems, ...trustItems].map((item, i) => (
            <span key={i} className="trust-item">
              <FaCheckCircle className="trust-check" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo">
            <img src={logoImg} alt="1 Step Finance Care" className="logo-full-img" width="285" height="130" loading="eager" decoding="async" />
            <span className="logo-name-text">1 Step Finance Care</span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="nav desktop-nav">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}>{l.label}</Link>
            ))}
          </nav>

          <div className="header-actions">
            {/* ── Desktop login ── */}
            <div className="login-dropdown" ref={loginRef}>
              <button className="btn-login" onClick={() => setLoginOpen(o => !o)}>Login ▾</button>
              {loginOpen && (
                <div className="login-menu">
                  <button onClick={() => { navigate('/login/customer');   setLoginOpen(false) }}><FaUser size={13} /> Customer Login</button>
                  <button onClick={() => { navigate('/login/employee');   setLoginOpen(false) }}><FaBuilding size={13} /> Employee / Admin</button>
                  <button onClick={() => { navigate('/login/superadmin'); setLoginOpen(false) }}><FaKey size={13} /> Super Admin</button>
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
            <img src={logoImg} alt="1 Step Finance Care" className="nav-mobile-full-logo" width="160" height="73" loading="lazy" decoding="async" />
            <span className="logo-name-text">1 Step Finance Care</span>
          </div>
          <button className="nav-mobile-close" onClick={close}><FaTimes size={16} /></button>
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
              <span className="nav-link-icon"><l.icon size={16} /></span>
              <span className="nav-link-label">{l.label}</span>
              <FaChevronRight className="nav-link-arrow" size={12} />
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
              <FaUser size={14} /> Customer Login
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
