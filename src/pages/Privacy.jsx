import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  FaUserShield, FaLock, FaDatabase, FaShareAlt, FaCookieBite,
  FaUserEdit, FaEnvelope, FaShieldAlt, FaEye
} from 'react-icons/fa'
import './FAQ.css' // Reusing the unified Document Layout CSS

const sections = [
  {
    id: 'information-we-collect',
    Icon: FaDatabase,
    category: 'Information We Collect',
    items: [
      { subtitle: 'Personal Information', text: 'We collect information you provide directly to us, including your full name, mobile number, email address, Aadhaar number (for KYC), PAN card details, bank account information, and any other details required to process your financial service requests.' },
      { subtitle: 'Transaction Data', text: 'We collect details of transactions you carry out through our services, including the amount, date, time, and nature of the transaction (credit card cash, bill payment, money transfer, etc.).' },
      { subtitle: 'Device & Usage Information', text: 'We automatically collect information about your device, browser type, IP address, pages visited, and how you interact with our website to improve our services.' },
    ],
  },
  {
    id: 'how-we-use',
    Icon: FaEye,
    category: 'How We Use Your Information',
    items: [
      { subtitle: 'Service Delivery', text: 'To process your financial transactions, verify your identity through KYC, transfer funds, pay bills, and deliver all services you request from 1 Step Finance Care.' },
      { subtitle: 'Communication', text: 'To send you transaction confirmations, OTPs, service updates, promotional offers, and important notices related to your account and transactions.' },
      { subtitle: 'Compliance & Security', text: 'To comply with legal obligations, prevent fraud, detect suspicious activity, and ensure the security of your financial data and transactions.' },
      { subtitle: 'Service Improvement', text: 'To analyze usage patterns, improve our website and services, and personalize your experience with 1 Step Finance Care.' },
    ],
  },
  {
    id: 'data-sharing',
    Icon: FaShareAlt,
    category: 'Data Sharing & Disclosure',
    items: [
      { subtitle: 'Banking Partners', text: 'We share necessary information with our 120+ Bank & NBFC partners solely to process your financial transactions. All partners are bound by strict confidentiality agreements.' },
      { subtitle: 'Regulatory Authorities', text: 'We may disclose your information to RBI, UIDAI, or other regulatory bodies as required by law, court orders, or government regulations.' },
      { subtitle: 'No Third-Party Sale', text: 'We do not sell, rent, or trade your personal information to any third party for marketing purposes. Your data is used exclusively for service delivery.' },
    ],
  },
  {
    id: 'data-security',
    Icon: FaLock,
    category: 'Data Security',
    items: [
      { subtitle: 'Encryption', text: 'All sensitive data including Aadhaar, PAN, and bank account details are encrypted using industry-standard SSL/TLS encryption both in transit and at rest.' },
      { subtitle: 'Access Controls', text: 'Access to your personal data is restricted to authorized 1 Step Finance Care personnel only, on a need-to-know basis, and is protected by multi-factor authentication.' },
      { subtitle: 'KYC Compliance', text: 'All transactions are KYC-verified. We follow strict RBI guidelines for customer due diligence and anti-money laundering (AML) compliance.' },
    ],
  },
  {
    id: 'cookies',
    Icon: FaCookieBite,
    category: 'Cookies & Tracking',
    items: [
      { subtitle: 'What We Use', text: 'We use essential cookies to keep you logged in and remember your preferences, and analytics cookies to understand how visitors use our website.' },
      { subtitle: 'Your Control', text: 'You can control cookie settings through your browser. Disabling cookies may affect some functionality of our website but will not impact your ability to use our core financial services.' },
    ],
  },
  {
    id: 'your-rights',
    Icon: FaUserEdit,
    category: 'Your Rights',
    items: [
      { subtitle: 'Access & Correction', text: 'You have the right to access the personal information we hold about you and request corrections if any data is inaccurate or incomplete.' },
      { subtitle: 'Data Deletion', text: 'You may request deletion of your personal data, subject to our legal obligations to retain certain records for regulatory compliance purposes.' },
      { subtitle: 'Opt-Out', text: 'You can opt out of promotional communications at any time by contacting us. Note that transactional and compliance-related communications cannot be opted out of.' },
    ],
  },
  {
    id: 'data-retention',
    Icon: FaDatabase,
    category: 'Data Retention',
    items: [
      { subtitle: 'Retention Period', text: 'We retain your personal data for as long as necessary to provide our services and comply with legal obligations. Transaction records are retained for a minimum of 5 years as required by RBI guidelines.' },
      { subtitle: 'After Account Closure', text: 'Upon account closure or service termination, we retain your data for the legally required period before securely deleting it from our systems.' },
    ],
  },
  {
    id: 'contact-us',
    Icon: FaEnvelope,
    category: 'Contact Us',
    items: [
      { subtitle: 'Privacy Concerns', text: 'If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your personal data, please contact our Data Protection Officer.' },
      { subtitle: 'Reach Us', text: 'Email: 1stepcreditcard@gmail.com | Phone: +91 95816 11711 | Branch: Kadapa.' },
    ],
  },
]

export default function Privacy() {
  const [activeSection, setActiveSection] = useState(sections[0].id)

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      window.scrollTo({ top: el.offsetTop - 120, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      let current = sections[0].id
      for (const section of sections) {
        const el = document.getElementById(section.id)
        if (el && window.scrollY >= el.offsetTop - 150) {
          current = section.id
        }
      }
      setActiveSection(current)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="doc-page">
      
      {/* Background Elements */}
      <div className="doc-bg-grid" />
      <div className="doc-bg-glow glow-top" />

      {/* Hero Section */}
      <div className="doc-hero">
        <div className="doc-hero-inner">
          <div className="doc-pill">Legal</div>
          <h1>Privacy <span className="doc-gold">Policy</span></h1>
          <p>Your privacy, our responsibility. Last updated: January 2025.</p>
        </div>
      </div>

      <div className="doc-container">
        
        {/* Sticky Sidebar */}
        <aside className="doc-sidebar">
          <div className="doc-sidebar-inner">
            <h4>Sections</h4>
            <ul>
              {sections.map(s => (
                <li key={s.id}>
                  <button 
                    className={activeSection === s.id ? 'active' : ''}
                    onClick={() => scrollTo(s.id)}
                  >
                    <s.Icon className="sidebar-icon" /> {s.category}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Content (Text Sections) */}
        <div className="doc-content">
          {sections.map((section) => (
            <div className="doc-section-card" id={section.id} key={section.id}>
              <div className="doc-section-header">
                <div className="doc-section-icon"><section.Icon /></div>
                <h2>{section.category}</h2>
              </div>
              <div className="doc-text">
                {section.items.map((item, i) => (
                  <div key={i} style={{ marginBottom: '24px' }}>
                    <h4 style={{ color: '#d4af37', marginBottom: '8px', fontSize: '1.1rem' }}>{item.subtitle}</h4>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
