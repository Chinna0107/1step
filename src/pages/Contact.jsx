import { useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock,
  FaWhatsapp, FaFacebookF, FaInstagram,
  FaBuilding, FaRocket, FaCheckCircle, FaHeadset
} from 'react-icons/fa'
import './Contact.css'

gsap.registerPlugin(ScrollTrigger)

const branches = [
  { city: 'Kadapa',      state: 'Andhra Pradesh' },
  { city: 'Ananthapur', state: 'Andhra Pradesh' },
  { city: 'Bangalore',  state: 'Karnataka' },
]

const infoItems = [
  { icon: <FaPhoneAlt />,      label: 'Phone',         value: '+91 XXXXX XXXXX' },
  { icon: <FaEnvelope />,      label: 'Email',         value: 'support@moneyspot.in' },
  { icon: <FaMapMarkerAlt />,  label: 'Branches',      value: 'Kadapa · Ananthapur · Bangalore' },
  { icon: <FaClock />,         label: 'Working Hours', value: '24×7 Available' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', mobile: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = e => {
    e.preventDefault()
    setSent(true)
  }

  useEffect(() => {
    gsap.fromTo('.contact-hero-badge',
      { opacity: 0, y: -30, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.7)' })
    gsap.fromTo('.contact-hero h1',
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 0.9, delay: 0.2, ease: 'power4.out' })
    gsap.fromTo('.contact-hero p',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, delay: 0.45, ease: 'power3.out' })

    const ctx = gsap.context(() => {
      gsap.fromTo('.contact-info',
        { opacity: 0, x: -60 },
        { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.contact-body', start: 'top 82%' } })
      gsap.fromTo('.contact-form-wrap',
        { opacity: 0, x: 60 },
        { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.contact-body', start: 'top 82%' } })
      gsap.fromTo('.info-item',
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '.contact-info', start: 'top 80%' } })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="contact">

      {/* ── Hero ── */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <div className="contact-hero-badge"><FaHeadset /> We're Here to Help</div>
          <h1>Get in <span className="brand-gradient">Touch</span></h1>
          <p>Have a question or need assistance? Our team is available 24×7 to help you with all your financial needs.</p>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="contact-body">

        {/* Info */}
        <div className="contact-info">
          <h2>Contact Info</h2>
          {infoItems.map(item => (
            <div className="info-item" key={item.label}>
              <span className="info-item-icon">{item.icon}</span>
              <div>
                <strong>{item.label}</strong>
                <p>{item.value}</p>
              </div>
            </div>
          ))}
          <div className="contact-socials">
            <a href="#" className="social-btn"><FaWhatsapp /> WhatsApp</a>
            <a href="#" className="social-btn"><FaFacebookF /> Facebook</a>
            <a href="#" className="social-btn"><FaInstagram /> Instagram</a>
          </div>
        </div>

        {/* Form */}
        <div className="contact-form-wrap">
          {sent ? (
            <div className="success-msg">
              <span className="success-icon"><FaCheckCircle /></span>
              <h3>Message Sent!</h3>
              <p>We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <h2>Send a Message</h2>
              <div className="form-group">
                <label>Full Name</label>
                <input required placeholder="Your full name" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input required placeholder="+91 XXXXX XXXXX" value={form.mobile}
                  onChange={e => setForm({ ...form, mobile: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email (optional)</label>
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea required rows={4} placeholder="How can we help you?"
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })} />
              </div>
              <button type="submit" className="btn-submit"><FaRocket /> Send Message</button>
            </form>
          )}
        </div>
      </div>

      {/* ── Location Strip ── */}
      <div className="contact-map-strip">
        <h3><FaMapMarkerAlt /> Our Branches</h3>
        <p>Visit us at any of our 3 locations — we're available 24×7</p>
        <div className="branches-grid">
          {branches.map(b => (
            <div className="branch-card" key={b.city}>
              <span className="branch-icon"><FaBuilding /></span>
              <strong>{b.city}</strong>
              <span>{b.state}</span>
              <span className="branch-badge">24×7 Open</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
