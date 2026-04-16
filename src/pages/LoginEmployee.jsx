import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useEmployeeLogin } from '../hooks/useEmployeeLogin'
import { useRoleBasedAuth } from '../hooks/useRoleBasedAuth'
import logoImg from '../assets/icons png/MS Logo.png'
import fullLogoImg from '../assets/icons png/Full Logo.png'
import nameImg from '../assets/icons png/Money Spot Logo.png'
import bannerImg from '../assets/icons png/MS Logo.png'
import './Login.css'

const particles = [
  { left: '12%', top: '18%', w: 5, h: 5, delay: 0 },
  { left: '82%', top: '22%', w: 4, h: 4, delay: 0.6 },
  { left: '70%', top: '70%', w: 7, h: 7, delay: 1.1 },
  { left: '20%', top: '75%', w: 5, h: 5, delay: 1.6 },
  { left: '55%', top: '12%', w: 3, h: 3, delay: 0.9 },
  { left: '88%', top: '50%', w: 4, h: 4, delay: 1.3 },
]

export default function LoginEmployee() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ email: '', password: '' })
  const [mpin, setMpin] = useState('')
  const { verifyCredentials, verifyMpin, loading, error, success } = useEmployeeLogin()
  const { saveAuthData } = useRoleBasedAuth()
  const navigate = useNavigate()

  useEffect(() => {
    gsap.fromTo('.login-card',
      { opacity: 0, y: 50, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.4)' })
    gsap.to('.login-particle', {
      y: 'random(-25,25)', x: 'random(-15,15)',
      duration: 'random(2,4)', repeat: -1, yoyo: true,
      ease: 'sine.inOut', stagger: { each: 0.4, from: 'random' },
    })
  }, [])

  useEffect(() => {
    gsap.fromTo('.form-group',
      { opacity: 0, x: step === 1 ? -20 : 20 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' })
  }, [step])

  const handleCredentials = async e => {
    e.preventDefault()
    const data = await verifyCredentials(form)
    if (data) setStep(2)
  }
  const handleMpin = async e => {
    e.preventDefault()
    const data = await verifyMpin({ email: form.email, mpin })
    if (data) {
      const userRole = data.user.is_admin ? 'admin' : 'employee'
      saveAuthData(data.token, data.user, userRole)
      navigate(userRole === 'admin' ? '/admin/dashboard' : '/employee/dashboard')
    }
  }

  return (
    <div className="login-page">
      <div className="login-particles">
        {particles.map((p, i) => (
          <div key={i} className="login-particle" style={{
            left: p.left, top: p.top,
            width: p.w, height: p.h,
            animationDelay: `${p.delay}s`,
          }} />
        ))}
      </div>

      <div className="login-layout">
        <div className="login-image-panel">
          <img src={bannerImg} alt="MoneySpot" className="login-banner-img" />
          <div className="login-image-overlay">
            <img src={fullLogoImg} alt="MoneySpot" className="login-image-logo" />
            <p className="login-image-tagline">Your trusted financial partner</p>
          </div>
        </div>

      <div className="login-card">
        <div className="login-logo">
          <img src={logoImg} alt="MoneySpot" className="login-logo-img" />
          <img src={nameImg} alt="MoneySpot" className="login-name-img" />
        </div>

        <h2>Employee / Admin Login</h2>

        {error && <div className="login-alert login-alert-error">{error}</div>}
        {success && <div className="login-alert login-alert-success">{success}</div>}

        {step === 1 ? (
          <>
            <p className="login-sub">Enter your credentials to proceed</p>
            <form onSubmit={handleCredentials}>
              <div className="form-group">
                <label>Email Address</label>
                <input required type="email" placeholder="employee@moneyspotfintech.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input required type="password" placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <button type="submit" className="btn-login-submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Continue →'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="login-sub">Enter your 6-digit MPIN to complete login</p>
            <form onSubmit={handleMpin}>
              <div className="form-group">
                <label>6-Digit MPIN</label>
                <input
                  required type="password" inputMode="numeric"
                  maxLength={6} placeholder="••••••"
                  className="mpin-input" value={mpin}
                  onChange={e => setMpin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>
              <button type="submit" className="btn-login-submit" disabled={loading || mpin.length !== 6}>
                {loading ? 'Logging in...' : '🔓 Login'}
              </button>
              <button type="button" className="btn-back" onClick={() => setStep(1)}>← Back</button>
            </form>
          </>
        )}

        <div className="login-steps">
          <div className={`step-dot ${step === 1 ? 'active' : 'done'}`}>{step > 1 ? '✓' : '1'}</div>
          <span className={`step-label ${step === 1 ? 'active' : 'done'}`}>Credentials</span>
          <span className="step-sep">→</span>
          <div className={`step-dot ${step === 2 ? 'active' : ''}`}>2</div>
          <span className={`step-label ${step === 2 ? 'active' : ''}`}>MPIN</span>
        </div>

        <div className="login-switch">
          <Link to="/login/customer">Customer Login</Link>
          <span>·</span>
          <Link to="/login/superadmin">Super Admin</Link>
        </div>
        <div className="login-contact-strip">
          <a href="https://wa.me/919866440477?text=Hi%20MoneySpot%2C%20I%20need%20help%20with%20login." target="_blank" rel="noopener noreferrer" className="lcs-btn lcs-wa">💬 WhatsApp</a>
          <a href="tel:+919866440477" className="lcs-btn lcs-call">📞 Call Us</a>
        </div>
      </div>
      </div>
    </div>
  )
}
