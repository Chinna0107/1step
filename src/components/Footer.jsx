import { Link } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { FaQuestionCircle, FaFileContract, FaUserShield } from 'react-icons/fa'
import {
  FaWhatsapp, FaInstagram, FaFacebookF, FaTwitter,
  FaHome, FaBolt, FaInfoCircle, FaPhone, FaEnvelope,
  FaMapMarkerAlt, FaClock, FaCreditCard, FaExchangeAlt, FaFingerprint,
  FaHeadset, FaShieldAlt, FaEye, FaCalendarDay, FaCalendarAlt, FaGlobe
} from 'react-icons/fa'
import { api } from '../utils/api'
import './Footer.css'

const PHONE = '+919866440477'
const PHONE_DISPLAY = '+91 98664 40477'

function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    if (!target) return
    const start = performance.now()
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) raf.current = requestAnimationFrame(step)
      else setCount(target)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])
  return count
}

function CounterCard({ icon: Icon, label, target, color, delay = 0 }) {
  const [active, setActive] = useState(false)
  const count = useCountUp(active ? target : 0, 1800)
  const ref = useRef(null)

  useEffect(() => {
    if (!target) return
    const timer = setTimeout(() => setActive(true), delay)
    return () => clearTimeout(timer)
  }, [target, delay])

  const fmt = n => Number(n || 0).toLocaleString('en-IN')

  return (
    <div className="fv-card" style={{ '--fv-color': color }} ref={ref}>
      <div className="fv-card-glow" />
      <div className="fv-icon-wrap">
        <Icon size={18} />
      </div>
      <div className="fv-count">{target ? fmt(count) : '—'}</div>
      <div className="fv-label">{label}</div>
      <div className="fv-bar"><div className="fv-bar-fill" /></div>
    </div>
  )
}

export default function Footer() {
  const [visitors, setVisitors] = useState(null)

  useEffect(() => {
    // Get or create a persistent visitor ID (survives refreshes, not new browsers)
    let vid = localStorage.getItem('ms_visitor_id')
    if (!vid) {
      vid = crypto.randomUUID()
      localStorage.setItem('ms_visitor_id', vid)
    }
    // Only counts once per unique visitor per day — backend ignores duplicates
    api('/visitors/track', { method: 'POST', body: JSON.stringify({ visitor_id: vid }) }).catch(() => {})
    api('/visitors/counts').then(setVisitors).catch(() => {})
  }, [])
  return (
    <footer className="footer">

      {/* ── Mobile Call Strip ── */}
      <a href={`tel:${PHONE}`} className="footer-call-strip">
        <span className="footer-call-icon"><FaHeadset size={18} /></span>
        <span className="footer-call-text">
          <strong>Need Help? Call Us Now</strong>
          <span>{PHONE_DISPLAY}</span>
        </span>
        <span className="footer-call-badge">24×7</span>
      </a>

      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-money">Money</span><span className="logo-spot">Spot</span>
          </div>
          <p>Your trusted partner for fast, secure financial transactions. Serving 10,000+ customers across Kadapa, Ananthapur & Bangalore.</p>
          <div className="footer-social">
            <a href={`https://wa.me/${PHONE}`} title="WhatsApp" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
            <a href="https://www.instagram.com/moneyspot_official" title="Instagram" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://www.facebook.com/moneyspotfintech" title="Facebook"  aria-label="Facebook"><FaFacebookF /></a>
            <a href="https://twitter.com/moneyspotfintech" title="Twitter"   aria-label="Twitter"><FaTwitter /></a>
          </div>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <Link to="/"><FaHome size={13} /> Home</Link>
          <Link to="/what-we-do"><FaBolt size={13} /> What We Do</Link>
          <Link to="/about"><FaInfoCircle size={13} /> About Us</Link>
          <Link to="/contact"><FaPhone size={13} /> Contact</Link>
        </div>

        <div className="footer-links">
          <h4>Services</h4>
          <span><FaBolt size={13} /> Spot Cash on Card</span>
          <span><FaCreditCard size={13} /> Bill Payment</span>
          <span><FaExchangeAlt size={13} /> Money Transfer</span>
          <span><FaFingerprint size={13} /> Aadhaar Withdrawal</span>
          <span><FaHeadset size={13} /> Others</span>
        </div>

        <div className="footer-links">
          <h4>Policies</h4>
          <Link to="/faq"><FaQuestionCircle size={13} /> FAQ</Link>
          <Link to="/terms"><FaFileContract size={13} /> Terms & Conditions</Link>
          <Link to="/privacy"><FaUserShield size={13} /> Privacy Policy</Link>
        </div>

        <div className="footer-links">
          <h4>Contact</h4>
          <a href={`tel:${PHONE}`}><FaPhone size={13} /> {PHONE_DISPLAY}</a>
          <a href="mailto:support@moneyspotfintech.com"><FaEnvelope size={13} /> support@moneyspotfintech.com</a>
          <a href="mailto:info@moneyspotfintech.com"><FaEnvelope size={13} /> info@moneyspotfintech.com</a>
          <span><FaMapMarkerAlt size={13} /> Kadapa, Andhra Pradesh</span>
          <span><FaMapMarkerAlt size={13} /> Ananthapur, Andhra Pradesh</span>
          <span><FaMapMarkerAlt size={13} /> Bangalore, Karnataka</span>
          <span><FaClock size={13} /> 24×7 Available</span>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-disclaimer">
          <FaShieldAlt size={13} className="footer-disclaimer-icon" />
          <p>All services are subject to KYC and compliance guidelines. Money Spot acts as a service provider / banking correspondent.</p>
        </div>

        {/* ── Visitor Counter ── */}
        <div className="fv-section">
          <div className="fv-heading">
            <FaEye size={14} />
            <span>Live Visitor Stats</span>
            <div className="fv-heading-line" />
          </div>
          <div className="fv-grid">
            <CounterCard icon={FaCalendarDay}  label="Today"       target={visitors ? parseInt(visitors.today) : 0}  color="#d4af37" delay={0}   />
            <CounterCard icon={FaCalendarAlt}  label="This Month"  target={visitors ? parseInt(visitors.month) : 0}  color="#c02040" delay={200} />
            <CounterCard icon={FaGlobe}        label="All Time"    target={visitors ? parseInt(visitors.total) : 0}  color="#402070" delay={400} />
          </div>
        </div>

        <p>© {new Date().getFullYear()} MoneySpot. All rights reserved. | Fast · Secure · Trusted</p>
        <p className="footer-zewo">Developed with <span className="footer-heart"></span><b>passion   </b> by <span className="footer-zewo-brand"><a href="https://zewo.in" target="_blank" rel="noopener noreferrer">Zewo</a></span></p>
      </div>
    </footer>
  )
}
