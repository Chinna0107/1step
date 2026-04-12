import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import logoImg from '../assets/icons png/MS Logo.png'
import fullLogoImg from '../assets/icons png/Full Logo.png'
import bannerImg from '../assets/icons png/MS Logo.png'
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
  const [form, setForm] = useState({ pan: '', mobile: '' })

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

  const handleSubmit = e => {
    e.preventDefault()
    alert('OTP sent to your mobile number!')
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
          <div className="login-logo-text">
            <span className="logo-money">Money</span><span className="logo-spot">Spot</span>
          </div>
        </div>

        <h2>Customer Login</h2>
        <p className="login-sub">Enter your PAN & mobile number to continue</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>PAN Number</label>
            <input
              required
              placeholder="ABCDE1234F"
              maxLength={10}
              value={form.pan}
              onChange={e => setForm({ ...form, pan: e.target.value.toUpperCase() })}
            />
          </div>
          <div className="form-group">
            <label>Mobile Number</label>
            <input
              required
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              maxLength={10}
              value={form.mobile}
              onChange={e => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })}
            />
          </div>
          <button type="submit" className="btn-login-submit">🚀 Send OTP</button>
        </form>

        <div className="login-switch">
          <Link to="/login/employee">Employee / Admin Login</Link>
          <span>·</span>
          <Link to="/login/superadmin">Super Admin</Link>
        </div>
      </div>
      </div>
    </div>
  )
}
