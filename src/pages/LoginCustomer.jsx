import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useCustomerLogin } from '../hooks/useCustomerAuth'
import logoImg from '../assets/logo.png'
import fullLogoImg from '../assets/logo.png'
import nameImg from '../assets/logo.png'
import bannerImg from '../assets/logo.png'
import './Login.css'

const particles = [
  { left: '10%', top: '15%', w: 6, h: 6, delay: 0 },
  { left: '85%', top: '20%', w: 4, h: 4, delay: 0.5 },
  { left: '75%', top: '75%', w: 7, h: 7, delay: 1 },
  { left: '15%', top: '80%', w: 5, h: 5, delay: 1.5 },
  { left: '50%', top: '10%', w: 3, h: 3, delay: 0.8 },
  { left: '90%', top: '55%', w: 4, h: 4, delay: 1.2 },
]

export default function LoginCustomer() {
  const [form, setForm] = useState({ pan: '', phone: '' })
  const { login, loading, error, setError } = useCustomerLogin()
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

  const handleLogin = async e => {
    e.preventDefault()
    const data = await login({ pan: form.pan, phone: form.phone })
    if (data?.token) navigate('/customer/dashboard')
  }

  return (
    <div className="login-page">
      <div className="login-particles">
        {particles.map((p, i) => (
          <div key={i} className="login-particle" style={{ left: p.left, top: p.top, width: p.w, height: p.h, animationDelay: `${p.delay}s` }} />
        ))}
      </div>

      <div className="login-layout">
        <div className="login-image-panel">
          <img src={bannerImg} alt="1 Step Finance Care" className="login-banner-img" />
          <div className="login-image-overlay">
            <img src={fullLogoImg} alt="1 Step Finance Care" className="login-image-logo" />
            <p className="login-image-tagline">Your trusted financial partner</p>
          </div>
        </div>

        <div className="login-card">
          <div className="login-logo">
            <img src={logoImg} alt="1 Step Finance Care" className="login-logo-img" />
          </div>

          <h2>Customer Login</h2>
          <p className="login-sub">Enter your PAN & registered mobile number</p>

          {error && <div className="login-alert login-alert-error">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>PAN Number</label>
              <input required placeholder="ABCDE1234F" maxLength={10}
                value={form.pan} onChange={e => { setError(''); setForm({ ...form, pan: e.target.value.toUpperCase() }) }} />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input required type="tel" placeholder="10-digit mobile" maxLength={10}
                value={form.phone} onChange={e => { setError(''); setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }) }} />
            </div>
            <button type="submit" className="btn-login-submit" disabled={loading || form.phone.length !== 10}>
              {loading ? 'Logging in...' : '🔓 Login'}
            </button>
          </form>

          <div className="login-contact-strip" style={{ marginTop: 16 }}>
            <a href="https://wa.me/919581611711?text=Hi%201 Step Finance Care%2C%20I%20need%20help%20with%20login." target="_blank" rel="noopener noreferrer" className="lcs-btn lcs-wa">💬 WhatsApp</a>
            <a href="tel:+919581611711" className="lcs-btn lcs-call">📞 Call Us</a>
          </div>
        </div>
      </div>
    </div>
  )
}
