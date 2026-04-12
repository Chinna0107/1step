import { useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock,
  FaWhatsapp, FaFacebookF, FaInstagram,
  FaBuilding, FaRocket, FaCheckCircle, FaHeadset,
  FaDirections, FaExternalLinkAlt
} from 'react-icons/fa'
import './Contact.css'

gsap.registerPlugin(ScrollTrigger)

const PHONE = '+919866440477'
const PHONE_DISPLAY = '+91 98664 40477'

const branches = [
  {
    city: 'Kadapa',
    state: 'Andhra Pradesh',
    address: 'MoneySpot Fintech Services, Kadapa, Andhra Pradesh',
    phone: '+91 98664 40477',
    hours: 'Mon–Sat: 9AM–7PM',
    color: '#2b77e6',
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243647.3!2d78.8241!3d14.4673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb14b1b3b3b3b3b%3A0x3b3b3b3b3b3b3b3b!2sKadapa%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000',
    mapsLink: 'https://maps.google.com/?q=Kadapa,Andhra+Pradesh',
  },
  {
    city: 'Anantapur',
    state: 'Andhra Pradesh',
    address: 'MoneySpot Fintech Services, Anantapur, Andhra Pradesh',
    phone: '+91 98664 40477',
    hours: 'Mon–Sat: 9AM–7PM',
    color: '#d97706',
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243647.3!2d77.6006!3d14.6819!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb5a9b1b1b1b1b1%3A0x1b1b1b1b1b1b1b1b!2sAnantapur%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000001',
    mapsLink: 'https://maps.google.com/?q=Anantapur,Andhra+Pradesh',
  },
  {
    city: 'Bangalore',
    state: 'Karnataka',
    address: 'MoneySpot Fintech Services, Bangalore, Karnataka',
    phone: '+91 98664 40477',
    hours: 'Mon–Sat: 9AM–7PM',
    color: '#10b981',
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d497698.9!2d77.3522!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000002',
    mapsLink: 'https://maps.google.com/?q=Bangalore,Karnataka',
  },
]

const infoItems = [
  { icon: <FaPhoneAlt />,     label: 'Phone',         value: PHONE_DISPLAY,                href: `tel:${PHONE}` },
  { icon: <FaWhatsapp />,     label: 'WhatsApp',      value: PHONE_DISPLAY,                href: `https://wa.me/${PHONE.replace('+','')}` },
  { icon: <FaEnvelope />,     label: 'Email',         value: 'support@moneyspot.in',       href: 'mailto:support@moneyspot.in' },
  { icon: <FaClock />,        label: 'Working Hours', value: 'Mon–Sat: 9AM–7PM | Sun: 10AM–4PM' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', mobile: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = e => {
    e.preventDefault()
    setSent(true)
  }

  useEffect(() => {
    gsap.fromTo('.contact-hero-badge', { opacity: 0, y: -30, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.7)' })
    gsap.fromTo('.contact-hero h1',    { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.2, ease: 'power4.out' })
    gsap.fromTo('.contact-hero p',     { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.45, ease: 'power3.out' })

    const ctx = gsap.context(() => {
      gsap.fromTo('.contact-info',      { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.contact-body', start: 'top 82%' } })
      gsap.fromTo('.contact-form-wrap', { opacity: 0, x: 60  }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.contact-body', start: 'top 82%' } })
      gsap.fromTo('.info-item',         { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.contact-info', start: 'top 80%' } })
      gsap.fromTo('.branch-card',       { opacity: 0, y: 40  }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'back.out(1.3)', scrollTrigger: { trigger: '.branches-grid', start: 'top 85%' } })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="contact">

      {/* ── Hero ── */}
      <section className="contact-hero">
        <div className="contact-hero-orb contact-hero-orb-1" />
        <div className="contact-hero-orb contact-hero-orb-2" />
        <div className="contact-hero-content">
          <div className="contact-hero-badge"><FaHeadset /> We're Here to Help</div>
          <h1>Get in <span className="brand-gradient">Touch</span></h1>
          <p>Have a question or need assistance? Our team is available to help you with all your financial needs across 3 branches.</p>
          <div className="contact-hero-actions">
            <a href={`tel:${PHONE}`} className="contact-hero-btn contact-hero-btn-primary">
              <FaPhoneAlt size={14} /> Call Now
            </a>
            <a href={`https://wa.me/${PHONE.replace('+','')}`} target="_blank" rel="noopener noreferrer" className="contact-hero-btn contact-hero-btn-wa">
              <FaWhatsapp size={16} /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── Contact Body ── */}
      <div className="contact-body">

        {/* Info */}
        <div className="contact-info">
          <h2>Contact Info</h2>
          {infoItems.map(item => (
            <div className="info-item" key={item.label}>
              <span className="info-item-icon">{item.icon}</span>
              <div>
                <strong>{item.label}</strong>
                {item.href
                  ? <a href={item.href} className="info-item-link">{item.value}</a>
                  : <p>{item.value}</p>
                }
              </div>
            </div>
          ))}
          <div className="contact-socials">
            <a href={`https://wa.me/${PHONE.replace('+','')}`} target="_blank" rel="noopener noreferrer" className="social-btn social-wa"><FaWhatsapp /> WhatsApp</a>
            <a href="https://www.instagram.com/moneyspot_official" target="_blank" rel="noopener noreferrer" className="social-btn social-ig"><FaInstagram /> Instagram</a>
            {/* <a href="#" className="social-btn social-fb"><FaFacebookF /> Facebook</a> */}
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
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input required placeholder="Your full name" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input required placeholder="+91 98664 40477" value={form.mobile}
                    onChange={e => setForm({ ...form, mobile: e.target.value })} />
                </div>
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

      {/* ── Branches with Maps ── */}
      <section className="contact-branches">
        <div className="contact-branches-inner">
          <div className="contact-branches-header">
            <div className="contact-pill"><FaMapMarkerAlt size={11} /> Our Branches</div>
            <h2>Visit Us at Any Branch</h2>
            <p>3 locations across Andhra Pradesh & Karnataka — walk in for instant service</p>
          </div>

          <div className="branches-grid">
            {branches.map(b => (
              <div className="branch-card" key={b.city} style={{ '--branch-color': b.color }}>

                {/* Map embed */}
                <div className="branch-map">
                  <iframe
                    src={b.mapSrc}
                    title={`${b.city} branch map`}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="branch-map-overlay" />
                </div>

                {/* Card body */}
                <div className="branch-body">
                  <div className="branch-header">
                    <div className="branch-icon-wrap" style={{ background: `${b.color}22`, borderColor: `${b.color}44`, color: b.color }}>
                      <FaBuilding size={18} />
                    </div>
                    <div>
                      <h3>{b.city}</h3>
                      <span className="branch-state">{b.state}</span>
                    </div>
                    <span className="branch-badge">Open</span>
                  </div>

                  <div className="branch-details">
                    <div className="branch-detail-item">
                      <FaMapMarkerAlt size={12} />
                      <span>{b.address}</span>
                    </div>
                    <div className="branch-detail-item">
                      <FaPhoneAlt size={12} />
                      <a href={`tel:${b.phone.replace(/\s/g,'')}`}>{b.phone}</a>
                    </div>
                    <div className="branch-detail-item">
                      <FaClock size={12} />
                      <span>{b.hours}</span>
                    </div>
                  </div>

                  <div className="branch-actions">
                    <a href={`tel:${b.phone.replace(/\s/g,'')}`} className="branch-btn branch-btn-call">
                      <FaPhoneAlt size={12} /> Call
                    </a>
                    <a href={`https://wa.me/${PHONE.replace('+','')}`} target="_blank" rel="noopener noreferrer" className="branch-btn branch-btn-wa">
                      <FaWhatsapp size={13} /> WhatsApp
                    </a>
                    <a href={b.mapsLink} target="_blank" rel="noopener noreferrer" className="branch-btn branch-btn-map">
                      <FaDirections size={13} /> Directions
                    </a>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
