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
    category: 'Data We Gather',
    items: [
      { subtitle: 'Identity Details', text: 'We assemble data supplied directly by you, which encompasses your complete name, contact number, electronic mail, Aadhaar (for verification), PAN specifics, banking details, and other necessary inputs to facilitate your requested monetary operations.' },
      { subtitle: 'Operational Records', text: 'We record specifics of activities performed via our platform, capturing the sum, timestamp, and the category of the exchange (e.g., cash withdrawals, bill clearances, fund routing).' },
      { subtitle: 'System & Interaction Metrics', text: 'Our systems autonomously capture data regarding your hardware, browser variant, IP footprint, navigation paths, and site engagement to refine our offerings.' },
    ],
  },
  {
    id: 'how-we-use',
    Icon: FaEye,
    category: 'Utilization of Your Data',
    items: [
      { subtitle: 'Fulfilling Requests', text: 'To execute your monetary exchanges, validate your identity via KYC procedures, route funds, settle invoices, and furnish all provisions you seek from 1 Step Finance Care.' },
      { subtitle: 'Client Correspondence', text: 'To dispatch transfer receipts, one-time passwords, platform enhancements, marketing materials, and critical alerts concerning your profile and activities.' },
      { subtitle: 'Regulatory Adherence & Protection', text: 'To honor statutory requirements, thwart deceptive practices, identify anomalous behaviors, and guarantee the safety of your economic information.' },
      { subtitle: 'Platform Enhancement', text: 'To examine interaction trends, upgrade our digital infrastructure, and tailor your journey with 1 Step Finance Care.' },
    ],
  },
  {
    id: 'data-sharing',
    Icon: FaShareAlt,
    category: 'Information Distribution',
    items: [
      { subtitle: 'Financial Affiliates', text: 'We distribute requisite details to our network of 120+ banks and NBFCs exclusively for executing your operations. All associates operate under rigorous non-disclosure pacts.' },
      { subtitle: 'Governing Bodies', text: 'We might reveal your records to entities like RBI, UIDAI, or other oversight agencies when compelled by legislation, judicial decrees, or state rules.' },
      { subtitle: 'Zero Commercialization', text: 'We absolutely never vend, lease, or barter your private information to external parties for promotional intents. Your details are leveraged purely for service provision.' },
    ],
  },
  {
    id: 'data-security',
    Icon: FaLock,
    category: 'Information Safeguarding',
    items: [
      { subtitle: 'Cryptographic Security', text: 'All critical inputs, such as Aadhaar, PAN, and banking data, undergo robust SSL/TLS cryptographic scrambling both during transmission and in storage.' },
      { subtitle: 'Restricted Accessibility', text: 'Only sanctioned staff members at 1 Step Finance Care can view your private records on a strictly required basis, shielded by multi-layered verification.' },
      { subtitle: 'Verification Protocols', text: 'Every transfer undergoes KYC validation. We adhere strictly to RBI directives regarding consumer vetting and anti-money laundering measures.' },
    ],
  },
  {
    id: 'cookies',
    Icon: FaCookieBite,
    category: 'Digital Tracking Mechanisms',
    items: [
      { subtitle: 'Our Deployed Tools', text: 'We employ fundamental trackers to sustain your session and recall settings, alongside analytical trackers to comprehend user navigation.' },
      { subtitle: 'User Autonomy', text: 'You possess the ability to govern tracker preferences via your browser. Deactivating them might alter certain site features, though it won’t hinder your access to principal monetary services.' },
    ],
  },
  {
    id: 'your-rights',
    Icon: FaUserEdit,
    category: 'User Privileges',
    items: [
      { subtitle: 'Retrieval & Amendment', text: 'You are entitled to view the private records we maintain regarding you and may ask for rectifications should any details be erroneous or partial.' },
      { subtitle: 'Information Erasure', text: 'You can demand the wiping of your personal details, contingent upon our statutory duties to preserve specific logs for oversight conformity.' },
      { subtitle: 'Communication Withdrawal', text: 'You may unsubscribe from marketing dispatches at any moment by reaching out. Please be aware that you cannot decline operational or regulatory notices.' },
    ],
  },
  {
    id: 'data-retention',
    Icon: FaDatabase,
    category: 'Information Preservation',
    items: [
      { subtitle: 'Storage Duration', text: 'We hold onto your private records for the duration required to deliver services and meet statutory mandates. Operational logs are kept for at least 5 years as dictated by RBI standards.' },
      { subtitle: 'Post-Termination Protocol', text: 'Following profile deactivation or service conclusion, we maintain your records for the legally stipulated timeframe prior to permanently expunging them.' },
    ],
  },
  {
    id: 'contact-us',
    Icon: FaEnvelope,
    category: 'Reach Out',
    items: [
      { subtitle: 'Data Queries', text: 'Should you harbor any questions, worries, or appeals concerning these privacy guidelines or our data management, please get in touch with our Compliance Officer.' },
      { subtitle: 'Contact Channels', text: 'Email: 1stepcreditcard@gmail.com | Phone: +91 95816 11711 | Branch: Kadapa.' },
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
          <div className="doc-pill">Compliance</div>
          <h1>Data Privacy <span className="doc-gold">Guidelines</span></h1>
          <p>Safeguarding your personal data is our duty. Most recent revision: January 2025.</p>
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
