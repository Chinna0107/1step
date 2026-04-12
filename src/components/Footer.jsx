import { Link } from 'react-router-dom'
import { FaQuestionCircle, FaFileContract, FaUserShield } from 'react-icons/fa'
import {
  FaWhatsapp, FaInstagram, FaFacebookF, FaTwitter,
  FaHome, FaBolt, FaInfoCircle, FaPhone, FaEnvelope,
  FaMapMarkerAlt, FaClock, FaCreditCard, FaExchangeAlt, FaFingerprint,
  FaHeadset, FaShieldAlt
} from 'react-icons/fa'
import './Footer.css'

const PHONE = '+919866440477'
const PHONE_DISPLAY = '+91 98664 40477'

export default function Footer() {
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
            <a href="" title="Facebook"  aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" title="Twitter"   aria-label="Twitter"><FaTwitter /></a>
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
          <a href="mailto:support@moneyspot.in"><FaEnvelope size={13} /> support@moneyspot.in</a>
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
        <p>© {new Date().getFullYear()} MoneySpot. All rights reserved. | Fast · Secure · Trusted</p>
        <p className="footer-zewo">Developed with <span className="footer-heart"></span><b>passion   </b> by <span className="footer-zewo-brand"><a href="https://zewo.in" target="_blank" rel="noopener noreferrer">Zewo</a></span></p>
      </div>
    </footer>
  )
}
