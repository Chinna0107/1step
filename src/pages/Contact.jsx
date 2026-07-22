import { useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock,
  FaWhatsapp, FaInstagram, FaCheckCircle
} from 'react-icons/fa'
import './Contact.css'

gsap.registerPlugin(ScrollTrigger)

const PHONE = '+919581611711'
const PHONE_DISPLAY = '+91 95816 11711'
const EMAIL = '1stepcreditcard@gmail.com'

const KADAPA_BRANCH = {
  city: 'Kadapa',
  state: 'Andhra Pradesh',
  address: '1-98-1 haritha palace near sonovison, rajivmarg, kadapa',
  phone: PHONE,
  phoneDisplay: PHONE_DISPLAY,
  whatsapp: '919581611711',
  hours: 'Mon–Sat: 9AM–7PM | Sun: 10AM–4PM',
  mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3862.6845341619623!2d78.82420311483863!3d14.47167588988457!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb3726759c55555%3A0xc3c544521408801!2sHaritha%20Palace%2C%20Kadapa!5e0!3m2!1sen!2sin!4v1700000000000',
  mapsLink: 'https://maps.google.com/?q=Haritha+Palace,Kadapa',
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', mobile: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [focusedInput, setFocusedInput] = useState(null)

  const handleSubmit = e => {
    e.preventDefault()
    
    const text = `*New Contact Inquiry*\n\n*Name:* ${form.name}\n*Mobile:* ${form.mobile}\n*Email:* ${form.email || 'N/A'}\n\n*Message:*\n${form.message}`
    const encodedText = encodeURIComponent(text)
    
    window.open(`https://wa.me/${KADAPA_BRANCH.whatsapp}?text=${encodedText}`, '_blank')
    setSent(true)
  }

  useEffect(() => {
    // Light Theme Animations
    gsap.fromTo('.cv3-hero-badge', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
    gsap.fromTo('.cv3-hero-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: 'power4.out' })
    gsap.fromTo('.cv3-hero-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' })
    
    gsap.fromTo('.cv3-info-card', 
      { opacity: 0, y: 40 }, 
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(1.2)', delay: 0.3 }
    )

    const ctx = gsap.context(() => {
      gsap.fromTo('.cv3-form-wrapper',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.cv3-main-content', start: 'top 80%' } }
      )
      gsap.fromTo('.cv3-map-card',
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.cv3-map-section', start: 'top 70%' } }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="contact-v3-dark">
      
      {/* Abstract Background Shapes */}
      <div className="cv3-bg-shape shape-1" />
      <div className="cv3-bg-shape shape-2" />

      {/* Hero Section */}
      <section className="cv3-hero">
        <div className="cv3-hero-badge">Connect With Us</div>
        <h1 className="cv3-hero-title">We’re Ready to <span className="cv3-text-gold">Assist You.</span></h1>
        <p className="cv3-hero-subtitle">Got inquiries regarding our monetary solutions? Contact our specialists without hesitation.</p>
      </section>

      <main className="cv3-main-content">
        
        {/* Top Info Cards (3 Columns) */}
        <div className="cv3-info-grid">
          <a href={`tel:${PHONE}`} className="cv3-info-card">
            <div className="cv3-card-icon"><FaPhoneAlt /></div>
            <h3>Phone Us</h3>
            <p>{PHONE_DISPLAY}</p>
            <span className="cv3-card-link">Tap to Call &rarr;</span>
          </a>

          <a href={`https://wa.me/${KADAPA_BRANCH.whatsapp}`} target="_blank" rel="noopener noreferrer" className="cv3-info-card cv3-wa-card">
            <div className="cv3-card-icon"><FaWhatsapp /></div>
            <h3>WhatsApp Support</h3>
            <p>Round-the-Clock Assistance</p>
            <span className="cv3-card-link">Chat Now &rarr;</span>
          </a>

          <a href={`mailto:${EMAIL}`} className="cv3-info-card">
            <div className="cv3-card-icon"><FaEnvelope /></div>
            <h3>Electronic Mail</h3>
            <p>{EMAIL}</p>
            <span className="cv3-card-link">Send Email &rarr;</span>
          </a>
        </div>

        {/* Contact Form Section */}
        <div className="cv3-form-wrapper">
          <div className="cv3-form-info">
            <h2>Drop Us a Line</h2>
            <p>Complete the fields below, and we will seamlessly route you to our WhatsApp desk with your information pre-loaded.</p>
            
            <div className="cv3-socials">
              <p>Follow us on Social Media:</p>
              <a href="https://www.instagram.com/1step_all_credit_card_payments" target="_blank" rel="noopener noreferrer" className="cv3-social-btn"><FaInstagram /> Instagram</a>
            </div>
          </div>

          <div className="cv3-form-container">
            {sent ? (
              <div className="cv3-success">
                <FaCheckCircle className="cv3-success-icon" />
                <h3>Redirecting to WhatsApp</h3>
                <p>Please complete your message in the WhatsApp window.</p>
                <button className="cv3-btn-reset" onClick={() => setSent(false)}>Send Another</button>
              </div>
            ) : (
              <form className="cv3-form" onSubmit={handleSubmit}>
                <div className="cv3-input-row">
                  <div className={`cv3-input-group ${focusedInput === 'name' || form.name ? 'active' : ''}`}>
                    <label>Full Name *</label>
                    <input 
                      type="text" required 
                      value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      onFocus={() => setFocusedInput('name')} onBlur={() => setFocusedInput(null)}
                    />
                  </div>
                  <div className={`cv3-input-group ${focusedInput === 'mobile' || form.mobile ? 'active' : ''}`}>
                    <label>Mobile Number *</label>
                    <input 
                      type="tel" required 
                      value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})}
                      onFocus={() => setFocusedInput('mobile')} onBlur={() => setFocusedInput(null)}
                    />
                  </div>
                </div>

                <div className={`cv3-input-group ${focusedInput === 'email' || form.email ? 'active' : ''}`}>
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)}
                  />
                </div>

                <div className={`cv3-input-group cv3-textarea-group ${focusedInput === 'message' || form.message ? 'active' : ''}`}>
                  <label>Your Message *</label>
                  <textarea 
                    required rows={4}
                    value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                    onFocus={() => setFocusedInput('message')} onBlur={() => setFocusedInput(null)}
                  />
                </div>

                <button type="submit" className="cv3-btn-submit">
                  <FaWhatsapp size={18} /> Send to WhatsApp
                </button>
              </form>
            )}
          </div>
        </div>

      </main>

      {/* Map Section */}
      <section className="cv3-map-section">
        <div className="cv3-map-header">
          <h2>Drop By Our Office</h2>
          <p>Come in person for immediate liquidity, card solutions, and professional guidance.</p>
        </div>
        
        <div className="cv3-map-container">
          <iframe
            src={KADAPA_BRANCH.mapSrc}
            title="Kadapa Branch Map"
            className="cv3-map-iframe"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          
          <div className="cv3-map-card">
            <div className="cv3-map-card-icon"><FaMapMarkerAlt /></div>
            <div className="cv3-map-card-content">
              <h3>Kadapa Branch</h3>
              <p>{KADAPA_BRANCH.address}</p>
              
              <div className="cv3-map-meta">
                <p><FaClock /> {KADAPA_BRANCH.hours}</p>
                <p><FaPhoneAlt /> {KADAPA_BRANCH.phone}</p>
              </div>

              <a href={KADAPA_BRANCH.mapsLink} target="_blank" rel="noopener noreferrer" className="cv3-btn-directions">
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
