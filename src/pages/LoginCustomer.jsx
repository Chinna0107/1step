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
  const [step, setStep]   = useState(1)   // 1 = PAN+phone, 2 = MPIN
  const [form, setForm]   = useState({ pan: '', phone: '', mpin: '' })
  const [custName, setCustName] = useState('')
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const { verify, login, loading, error, setError } = useCustomerLogin()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = e => { e.preventDefault(); setDeferredPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

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
    const data = await verify({ pan: form.pan, phone: form.phone })
    if (data?.verified) {
      setCustName(data.name)
      setStep(2)
      gsap.fromTo('.login-card', { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' })
    }
  }

  const handleStep2 = async e => {
    e.preventDefault()
    const data = await login({ pan: form.pan, phone: form.phone, mpin: form.mpin })
    if (data?.token) navigate('/customer/dashboard')
  }

  const goBack = () => {
    setStep(1)
    setError('')
    setForm(f => ({ ...f, mpin: '' }))
    gsap.fromTo('.login-card', { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' })
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
            {deferredPrompt && (
              <button onClick={handleInstall} className="btn-install-app">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download App
              </button>
            )}
          </div>
        </div>

        <div className="login-card">
          <div className="login-logo">
            <img src={logoImg} alt="1 Step Finance Care" className="login-logo-img" />
          </div>

          <h2>Customer Login</h2>

          {/* Step indicator */}
          <div className="login-steps">
            <div className={`step-dot ${step === 1 ? 'active' : 'done'}`}>{step > 1 ? '✓' : '1'}</div>
            <span className={`step-label ${step === 1 ? 'active' : 'done'}`}>Verify Identity</span>
            <span className="step-sep">›</span>
            <div className={`step-dot ${step === 2 ? 'active' : ''}`}>2</div>
            <span className={`step-label ${step === 2 ? 'active' : ''}`}>Enter MPIN</span>
          </div>

          {error && <div className="login-alert login-alert-error">{error}</div>}

          {/* ── Step 1: PAN + Phone ── */}
          {step === 1 && (
            <form onSubmit={handleStep1}>
              <p className="login-sub" style={{ marginBottom: 20 }}>Enter your PAN &amp; registered mobile number</p>
              <div className="form-group">
                <label>PAN Number</label>
                <input required placeholder="ABCDE1234F" maxLength={10}
                  value={form.pan} onChange={e => { setError(''); setForm(f => ({ ...f, pan: e.target.value.toUpperCase() })) }} />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input required type="tel" placeholder="10-digit mobile" maxLength={10}
                  value={form.phone} onChange={e => { setError(''); setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })) }} />
              </div>
              <button type="submit" className="btn-login-submit"
                disabled={loading || form.phone.length !== 10 || form.pan.length !== 10}>
                {loading ? 'Verifying...' : 'Continue →'}
              </button>
            </form>
          )}

          {/* ── Step 2: MPIN ── */}
          {step === 2 && (
            <form onSubmit={handleStep2}>
              <p className="login-sub" style={{ marginBottom: 20 }}>Welcome back, <strong>{custName}</strong>! Enter your MPIN to continue.</p>
              <div className="form-group">
                <label>MPIN</label>
                <input
                  className="mpin-input"
                  required
                  type="password"
                  inputMode="numeric"
                  placeholder="••••••"
                  maxLength={6}
                  autoFocus
                  value={form.mpin}
                  onChange={e => { setError(''); setForm(f => ({ ...f, mpin: e.target.value.replace(/\D/g, '').slice(0, 6) })) }}
                />
              </div>
              <button type="submit" className="btn-login-submit"
                disabled={loading || form.mpin.length < 4}>
                {loading ? 'Logging in...' : '🔓 Login'}
              </button>
              <button type="button" className="btn-back" onClick={goBack}>← Back</button>
            </form>
          )}

          <div className="login-contact-strip" style={{ marginTop: 16 }}>
            <a href="https://wa.me/919581611711?text=Hi%201 Step Finance Care%2C%20I%20need%20help%20with%20login." target="_blank" rel="noopener noreferrer" className="lcs-btn lcs-wa">💬 WhatsApp</a>
            <a href="tel:+919581611711" className="lcs-btn lcs-call">📞 Call Us</a>
          </div>
        </div>
      </div>
    </div>
  )
}
