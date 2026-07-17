import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useEmployeeLogin } from '../hooks/useEmployeeLogin'
import { useRoleBasedAuth } from '../hooks/useRoleBasedAuth'
import logoImg from '../assets/logo.png'
import fullLogoImg from '../assets/logo.png'
import nameImg from '../assets/logo.png'
import bannerImg from '../assets/logo.png'
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
  const [step, setStep]   = useState(1)
  const [form, setForm]   = useState({ email: '', password: '', mpin: '' })
  const { verifyCredentials, verifyMpin, loading, error, success, setError, setSuccess } = useEmployeeLogin()
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

  const handleStep1 = async e => {
    e.preventDefault()
    const data = await verifyCredentials({ email: form.email, password: form.password })
    if (data) setStep(2)
  }

  const handleStep2 = async e => {
    e.preventDefault()
    const data = await verifyMpin({ email: form.email, mpin: form.mpin })
    if (data?.token) {
      const u = data.user
      if (u.is_superadmin) {
        saveAuthData(data.token, u, 'superadmin')
        navigate('/superadmin/dashboard')
      } else if (u.is_admin) {
        saveAuthData(data.token, u, 'admin')
        navigate('/admin/dashboard')
      } else {
        saveAuthData(data.token, u, 'employee')
        navigate('/employee/dashboard')
      }
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
          <img src={bannerImg} alt="1 Step Finance Care" className="login-banner-img" />
          <div className="login-image-overlay">
            <img src={fullLogoImg} alt="1 Step Finance Care" className="login-image-logo" />
            <p className="login-image-tagline">Your trusted financial partner</p>
          </div>
        </div>

      <div className="login-card">
        <div className="login-logo">
          <img src={logoImg} alt="1 Step Finance Care" className="login-logo-img" />
          <img src={nameImg} alt="1 Step Finance Care" className="login-name-img" />
        </div>

        <h2>Employee / Admin Login</h2>

        <div className="login-steps">
          <span className={`step-dot ${step === 1 ? 'active' : 'done'}`}>1</span>
          <span className="step-sep">›</span>
          <span className={`step-dot ${step === 2 ? 'active' : ''}`}>2</span>
        </div>

        {error && (
          <div className={`login-alert ${
            error.includes('Attendance completed') ? 'login-alert-attendance' : 'login-alert-error'
          }`}>
            {error.includes('Attendance completed') ? '🔒 ' : '❌ '}{error}
          </div>
        )}
        {success && step === 1 && <div className="login-alert login-alert-success">{success}</div>}

        {step === 1 ? (
          <>
            <p className="login-sub">Enter your email and password</p>
            <form onSubmit={handleStep1}>
              <div className="form-group">
                <label>Email Address</label>
                <input required type="email" placeholder="employee@1stepfinancecare.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input required type="password" placeholder="Enter your password"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <button type="submit" className="btn-login-submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Continue →'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="login-sub">Enter your 6-digit MPIN to complete login</p>
            <form onSubmit={handleStep2}>
              <div className="form-group">
                <label>6-Digit MPIN</label>
                <input required type="password" inputMode="numeric" maxLength={6}
                  placeholder="••••••" className="mpin-input" autoFocus
                  value={form.mpin} onChange={e => setForm({ ...form, mpin: e.target.value.replace(/\D/g, '').slice(0, 6) })} />
              </div>
              <button type="submit" className="btn-login-submit" disabled={loading || form.mpin.length !== 6}>
                {loading ? 'Logging in...' : '🔓 Login'}
              </button>
              <button type="button" className="btn-back" onClick={() => { setStep(1); setError(''); setSuccess('') }}>← Back</button>
            </form>
          </>
        )}

        
      </div>
      </div>
    </div>
  )
}
