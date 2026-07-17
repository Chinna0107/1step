import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useSuperAdminAuth } from '../hooks/useSuperAdminAuth'
import { useRoleBasedAuth } from '../hooks/useRoleBasedAuth'
import logoImg from '../assets/logo.png'
import fullLogoImg from '../assets/logo.png'
import nameImg from '../assets/logo.png'
import bannerImg from '../assets/logo.png'
import './Login.css'

const particles = [
  { left: '8%',  top: '20%', w: 6, h: 6, delay: 0 },
  { left: '88%', top: '18%', w: 4, h: 4, delay: 0.5 },
  { left: '78%', top: '72%', w: 7, h: 7, delay: 1 },
  { left: '18%', top: '78%', w: 5, h: 5, delay: 1.5 },
  { left: '48%', top: '8%',  w: 3, h: 3, delay: 0.8 },
  { left: '92%', top: '48%', w: 4, h: 4, delay: 1.2 },
]

export default function LoginSuperAdmin() {
  const [step, setStep]   = useState(1)
  const [form, setForm]   = useState({ email: '', password: '', mpin: '' })
  const [reg, setReg]     = useState({ name: '', email: '', password: '', mpin: '', secretKey: '' })
  const { verifyCredentials, verifyMpin, register, loading, error, success, setError, setSuccess } = useSuperAdminAuth()
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

  const [mode, setMode] = useState('login')

  const handleStep1 = async e => {
    e.preventDefault()
    const data = await verifyCredentials({ email: form.email, password: form.password })
    if (data) setStep(2)
  }

  const handleStep2 = async e => {
    e.preventDefault()
    const data = await verifyMpin({ email: form.email, mpin: form.mpin })
    if (data?.token) {
      saveAuthData(data.token, data.user, 'superadmin')
      navigate('/superadmin/dashboard')
    }
  }

  const handleRegister = async e => {
    e.preventDefault()
    const data = await register(reg)
    if (data) { setMode('login'); setReg({ name: '', email: '', password: '', mpin: '', secretKey: '' }) }
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

      <div className="login-card superadmin-card">
        <div className="login-logo">
          <img src={logoImg} alt="1 Step Finance Care" className="login-logo-img" />
          <img src={nameImg} alt="1 Step Finance Care" className="login-name-img" />
        </div>

        <div className="superadmin-badge">
          <span className="superadmin-badge-inner">🔐 Super Admin Portal</span>
        </div>

        <h2>{mode === 'register' ? 'Register Admin' : 'Super Admin Login'}</h2>

        {mode === 'register' && error && <div className="login-alert login-alert-error">{error}</div>}
        {mode === 'register' && success && <div className="login-alert login-alert-success">{success}</div>}

        {mode === 'register' ? (
          <>
            <p className="login-sub">Create a new Super Admin account</p>
            <form onSubmit={handleRegister}>
              <div className="form-group"><label>Full Name</label><input required placeholder="Admin Name" value={reg.name} onChange={e => setReg({ ...reg, name: e.target.value })} /></div>
              <div className="form-group"><label>Email</label><input required type="email" placeholder="1stepcreditcard@gmail.com" value={reg.email} onChange={e => setReg({ ...reg, email: e.target.value })} /></div>
              <div className="form-group"><label>Password</label><input required type="password" placeholder="Create password" value={reg.password} onChange={e => setReg({ ...reg, password: e.target.value })} /></div>
              <div className="form-group"><label>6-Digit MPIN</label><input required type="password" inputMode="numeric" maxLength={6} placeholder="••••••" className="mpin-input" value={reg.mpin} onChange={e => setReg({ ...reg, mpin: e.target.value.replace(/\D/g, '').slice(0, 6) })} /></div>
              <div className="form-group"><label>Secret Key</label><input required type="password" placeholder="Enter secret registration key" value={reg.secretKey} onChange={e => setReg({ ...reg, secretKey: e.target.value })} /></div>
              <button type="submit" className="btn-login-submit superadmin-btn" disabled={loading}>{loading ? 'Registering...' : '✅ Register Admin'}</button>
              <button type="button" className="btn-back" onClick={() => { setMode('login'); setError(''); setSuccess('') }}>← Back to Login</button>
            </form>
          </>
        ) : (
          <>
            <div className="login-steps">
              <span className={`step-dot ${step === 1 ? 'active' : 'done'}`}>1</span>
              <span className="step-sep">›</span>
              <span className={`step-dot ${step === 2 ? 'active' : ''}`}>2</span>
            </div>

            {error && <div className="login-alert login-alert-error">{error}</div>}
            {success && step === 1 && <div className="login-alert login-alert-success">{success}</div>}

            {step === 1 ? (
              <>
                <p className="login-sub">Restricted access — authorized personnel only</p>
                <form onSubmit={handleStep1}>
                  <div className="form-group"><label>Admin Email</label><input required type="email" placeholder="1stepcreditcard@gmail.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                  <div className="form-group"><label>Password</label><input required type="password" placeholder="Enter your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
                  <button type="submit" className="btn-login-submit superadmin-btn" disabled={loading}>{loading ? 'Verifying...' : 'Continue →'}</button>
                </form>
              </>
            ) : (
              <>
                <p className="login-sub">Enter your 6-digit MPIN to complete login</p>
                <form onSubmit={handleStep2}>
                  <div className="form-group"><label>6-Digit MPIN</label><input required type="password" inputMode="numeric" maxLength={6} placeholder="••••••" className="mpin-input" autoFocus value={form.mpin} onChange={e => setForm({ ...form, mpin: e.target.value.replace(/\D/g, '').slice(0, 6) })} /></div>
                  <button type="submit" className="btn-login-submit superadmin-btn" disabled={loading || form.mpin.length !== 6}>{loading ? 'Logging in...' : '🔓 Login'}</button>
                  <button type="button" className="btn-back" onClick={() => { setStep(1); setError(''); setSuccess('') }}>← Back</button>
                </form>
              </>
            )}
          </>
        )}
{/* 
        <div className="login-contact-strip">
          <a href="https://wa.me/919581611711?text=Hi%201 Step Finance Care%2C%20I%20need%20help%20with%20login." target="_blank" rel="noopener noreferrer" className="lcs-btn lcs-wa">💬 WhatsApp</a>
          <a href="tel:+919581611711" className="lcs-btn lcs-call">📞 Call Us</a>
        </div> */}
      </div>
      </div>
    </div>
  )
}
