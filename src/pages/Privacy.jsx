import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  FaUserShield, FaLock, FaDatabase, FaShareAlt, FaCookieBite,
  FaUserEdit, FaEnvelope, FaShieldAlt, FaEye, FaTrashAlt,
  FaArrowRight, FaCalendarAlt
} from 'react-icons/fa'
import './Privacy.css'

gsap.registerPlugin(ScrollTrigger)

const sections = [
  {
    id: 'information-we-collect',
    Icon: FaDatabase,
    title: 'Information We Collect',
    color: '#2b77e6',
    content: [
      {
        subtitle: 'Personal Information',
        text: 'We collect information you provide directly to us, including your full name, mobile number, email address, Aadhaar number (for KYC), PAN card details, bank account information, and any other details required to process your financial service requests.',
      },
      {
        subtitle: 'Transaction Data',
        text: 'We collect details of transactions you carry out through our services, including the amount, date, time, and nature of the transaction (credit card cash, bill payment, money transfer, etc.).',
      },
      {
        subtitle: 'Device & Usage Information',
        text: 'We automatically collect information about your device, browser type, IP address, pages visited, and how you interact with our website to improve our services.',
      },
    ],
  },
  {
    id: 'how-we-use',
    Icon: FaEye,
    title: 'How We Use Your Information',
    color: '#10b981',
    content: [
      {
        subtitle: 'Service Delivery',
        text: 'To process your financial transactions, verify your identity through KYC, transfer funds, pay bills, and deliver all services you request from MoneySpot.',
      },
      {
        subtitle: 'Communication',
        text: 'To send you transaction confirmations, OTPs, service updates, promotional offers, and important notices related to your account and transactions.',
      },
      {
        subtitle: 'Compliance & Security',
        text: 'To comply with legal obligations, prevent fraud, detect suspicious activity, and ensure the security of your financial data and transactions.',
      },
      {
        subtitle: 'Service Improvement',
        text: 'To analyze usage patterns, improve our website and services, and personalize your experience with MoneySpot.',
      },
    ],
  },
  {
    id: 'data-sharing',
    Icon: FaShareAlt,
    title: 'Data Sharing & Disclosure',
    color: '#8b5cf6',
    content: [
      {
        subtitle: 'Banking Partners',
        text: 'We share necessary information with our 120+ Bank & NBFC partners solely to process your financial transactions. All partners are bound by strict confidentiality agreements.',
      },
      {
        subtitle: 'Regulatory Authorities',
        text: 'We may disclose your information to RBI, UIDAI, or other regulatory bodies as required by law, court orders, or government regulations.',
      },
      {
        subtitle: 'No Third-Party Sale',
        text: 'We do not sell, rent, or trade your personal information to any third party for marketing purposes. Your data is used exclusively for service delivery.',
      },
    ],
  },
  {
    id: 'data-security',
    Icon: FaLock,
    title: 'Data Security',
    color: '#d4af37',
    content: [
      {
        subtitle: 'Encryption',
        text: 'All sensitive data including Aadhaar, PAN, and bank account details are encrypted using industry-standard SSL/TLS encryption both in transit and at rest.',
      },
      {
        subtitle: 'Access Controls',
        text: 'Access to your personal data is restricted to authorized MoneySpot personnel only, on a need-to-know basis, and is protected by multi-factor authentication.',
      },
      {
        subtitle: 'KYC Compliance',
        text: 'All transactions are KYC-verified. We follow strict RBI guidelines for customer due diligence and anti-money laundering (AML) compliance.',
      },
    ],
  },
  {
    id: 'cookies',
    Icon: FaCookieBite,
    title: 'Cookies & Tracking',
    color: '#f59e0b',
    content: [
      {
        subtitle: 'What We Use',
        text: 'We use essential cookies to keep you logged in and remember your preferences, and analytics cookies to understand how visitors use our website.',
      },
      {
        subtitle: 'Your Control',
        text: 'You can control cookie settings through your browser. Disabling cookies may affect some functionality of our website but will not impact your ability to use our core financial services.',
      },
    ],
  },
  {
    id: 'your-rights',
    Icon: FaUserEdit,
    title: 'Your Rights',
    color: '#f43f5e',
    content: [
      {
        subtitle: 'Access & Correction',
        text: 'You have the right to access the personal information we hold about you and request corrections if any data is inaccurate or incomplete.',
      },
      {
        subtitle: 'Data Deletion',
        text: 'You may request deletion of your personal data, subject to our legal obligations to retain certain records for regulatory compliance purposes.',
      },
      {
        subtitle: 'Opt-Out',
        text: 'You can opt out of promotional communications at any time by contacting us. Note that transactional and compliance-related communications cannot be opted out of.',
      },
    ],
  },
  {
    id: 'data-retention',
    Icon: FaDatabase,
    title: 'Data Retention',
    color: '#06b6d4',
    content: [
      {
        subtitle: 'Retention Period',
        text: 'We retain your personal data for as long as necessary to provide our services and comply with legal obligations. Transaction records are retained for a minimum of 5 years as required by RBI guidelines.',
      },
      {
        subtitle: 'After Account Closure',
        text: 'Upon account closure or service termination, we retain your data for the legally required period before securely deleting it from our systems.',
      },
    ],
  },
  {
    id: 'contact-us',
    Icon: FaEnvelope,
    title: 'Contact Us',
    color: '#10b981',
    content: [
      {
        subtitle: 'Privacy Concerns',
        text: 'If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your personal data, please contact our Data Protection Officer.',
      },
      {
        subtitle: 'Reach Us',
        text: 'Email: support@moneyspot.in | Phone: +91 98664 40477 | Branches: Kadapa, Anantapur & Bangalore',
      },
    ],
  },
]

export default function Privacy() {
  const pageRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.privacy-hero-badge', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' })
      gsap.fromTo('.privacy-hero-title', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.15, ease: 'power4.out' })
      gsap.fromTo('.privacy-hero-sub',   { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.3, ease: 'power3.out' })
      gsap.fromTo('.privacy-meta',       { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.5, ease: 'power2.out' })

      gsap.fromTo('.privacy-section-card', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.privacy-content', start: 'top 85%' }
      })

      gsap.to('.privacy-orb', {
        y: 'random(-30,30)', x: 'random(-20,20)',
        duration: 'random(4,8)', repeat: -1, yoyo: true,
        ease: 'sine.inOut', stagger: { each: 0.5, from: 'random' },
      })
    }, pageRef)
    return () => ctx.revert()
  }, [])

  return (
    <div className="privacy" ref={pageRef}>

      {/* ── Hero ── */}
      <section className="privacy-hero">
        <div className="privacy-hero-bg">
          <div className="privacy-orb privacy-orb-1" />
          <div className="privacy-orb privacy-orb-2" />
          <div className="privacy-orb privacy-orb-3" />
          <div className="privacy-grid" />
        </div>
        <div className="privacy-hero-inner">
          <div className="privacy-hero-badge"><FaUserShield size={13} /> Privacy Policy</div>
          <h1 className="privacy-hero-title">
            Your Privacy,<br />
            <span className="privacy-gold">Our Responsibility</span>
          </h1>
          <p className="privacy-hero-sub">
            At MoneySpot, we are committed to protecting your personal information and being transparent about how we collect, use, and safeguard your data.
          </p>
          <div className="privacy-meta">
            <span><FaCalendarAlt size={12} /> Last Updated: January 2025</span>
            <span><FaShieldAlt size={12} /> RBI Compliant</span>
            <span><FaLock size={12} /> SSL Secured</span>
          </div>
        </div>
      </section>

      {/* ── Quick Nav ── */}
      <div className="privacy-nav">
        <div className="privacy-nav-inner">
          {sections.map(s => (
            <a key={s.id} href={`#${s.id}`} className="privacy-nav-item" style={{ '--nav-color': s.color }}>
              <s.Icon size={12} />
              <span>{s.title}</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="privacy-content">
        <div className="privacy-content-inner">

          {/* Intro card */}
          <div className="privacy-intro-card">
            <div className="privacy-intro-icon"><FaShieldAlt size={28} /></div>
            <div>
              <h3>Our Commitment to You</h3>
              <p>MoneySpot Fintech Services operates as an Authorised Business Correspondent & Financial Service Partner. We handle sensitive financial data and take our responsibility to protect your privacy extremely seriously. This policy explains exactly what data we collect, why we collect it, and how we protect it.</p>
            </div>
          </div>

          {/* Sections */}
          <div className="privacy-sections">
            {sections.map((s, i) => (
              <div key={s.id} id={s.id} className="privacy-section-card" style={{ '--sec-color': s.color }}>
                <div className="privacy-section-header">
                  <div className="privacy-section-icon" style={{ background: `${s.color}18`, borderColor: `${s.color}35`, color: s.color }}>
                    <s.Icon size={20} />
                  </div>
                  <div>
                    <span className="privacy-section-num">0{i + 1}</span>
                    <h2>{s.title}</h2>
                  </div>
                </div>
                <div className="privacy-section-body">
                  {s.content.map((c, j) => (
                    <div key={j} className="privacy-subsection">
                      <h4><FaArrowRight size={10} /> {c.subtitle}</h4>
                      <p>{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="privacy-cta">
            <div className="privacy-cta-glow" />
            <FaUserShield size={36} className="privacy-cta-icon" />
            <h2>Questions About Your Privacy?</h2>
            <p>Our team is available to address any concerns about how we handle your personal data.</p>
            <div className="privacy-cta-btns">
              <Link to="/contact" className="privacy-btn-primary">Contact Us <FaArrowRight size={13} /></Link>
              <Link to="/faq" className="privacy-btn-outline">View FAQ</Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
