import { useState, useEffect } from 'react'
import { FaFileContract, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'
import './FAQ.css'

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing or using 1 Step Finance Care's website and services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services. 1 Step Finance Care reserves the right to update these terms at any time without prior notice.`,
  },
  {
    id: 'services',
    title: '2. Services Offered',
    content: `1 Step Finance Care provides the following financial services:
• Spot Cash on Credit Card — Instant cash against your credit card limit
• Credit Card Bill Payment — Pay any credit card bill instantly
• Domestic Money Transfer (DMT) — Send money to any bank account via IMPS
• Aadhaar Cash Withdrawal — Biometric-based cash withdrawal
• Personal & Business Loans — Through partner banks and NBFCs
• Insurance Services — Life, health, and vehicle insurance
• CIBIL Score Check & Repair — Credit score analysis and improvement
• Bank Account Opening — Savings and current account facilitation
• New Credit Card Applications — Card recommendations and applications`,
  },
  {
    id: 'eligibility',
    title: '3. Eligibility',
    content: `To use 1 Step Finance Care services, you must:
• Be at least 18 years of age
• Be a resident of India
• Possess valid government-issued identification (Aadhaar, PAN, etc.)
• Have a valid and active bank account
• Provide accurate and truthful information during registration and transactions`,
  },
  {
    id: 'responsibilities',
    title: '4. User Responsibilities',
    content: `You agree to:
• Provide accurate, current, and complete information
• Maintain the confidentiality of your account credentials
• Not use our services for any illegal, fraudulent, or unauthorized purpose
• Not attempt to reverse-engineer, hack, or disrupt our systems
• Comply with all applicable laws and regulations
• Immediately notify us of any unauthorized use of your account`,
  },
  {
    id: 'fees',
    title: '5. Fees & Charges',
    content: `1 Step Finance Care charges service fees for certain transactions. All applicable fees are:
• Clearly communicated before you confirm any transaction
• Non-refundable once a transaction is successfully processed
• Subject to change with prior notice on our website
• Inclusive of applicable taxes as per government regulations

We do not charge any hidden fees. What you see is what you pay.`,
  },
  {
    id: 'processing',
    title: '6. Transaction Processing',
    content: `All transactions are subject to:
• Verification and authentication procedures
• Availability of funds in the source account
• Compliance with RBI guidelines and applicable regulations
• Network availability and third-party service provider uptime

1 Step Finance Care is not liable for delays caused by bank processing times, network outages, or force majeure events.`,
  },
  {
    id: 'privacy',
    title: '7. Privacy & Data Protection',
    content: `1 Step Finance Care is committed to protecting your personal information. We:
• Collect only the data necessary to provide our services
• Do not sell or share your personal data with unauthorized third parties
• Use bank-grade SSL encryption for all data transmission
• Comply with applicable data protection laws
• Retain data only as long as required by law or business necessity

Please refer to our Privacy Policy for detailed information on data handling.`,
  },
  {
    id: 'liability',
    title: '8. Limitation of Liability',
    content: `1 Step Finance Care shall not be liable for:
• Any indirect, incidental, or consequential damages
• Loss of profits, data, or business opportunities
• Unauthorized access to your account due to your negligence
• Failures caused by third-party service providers (banks, payment gateways)
• Delays or failures due to circumstances beyond our reasonable control

Our total liability in any case shall not exceed the amount of the transaction in dispute.`,
  },
  {
    id: 'intellectual-property',
    title: '9. Intellectual Property',
    content: `All content on the 1 Step Finance Care website including logos, text, graphics, and software is the exclusive property of 1 Step Finance Care and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.`,
  },
  {
    id: 'termination',
    title: '10. Termination',
    content: `1 Step Finance Care reserves the right to suspend or terminate your access to our services at any time, without notice, if:
• You violate these Terms and Conditions
• We suspect fraudulent or illegal activity
• Required by law or regulatory authorities
• You provide false or misleading information

Upon termination, all pending transactions will be processed or refunded as applicable.`,
  },
  {
    id: 'governing-law',
    title: '11. Governing Law',
    content: `These Terms and Conditions are governed by the laws of India. Any disputes arising from the use of 1 Step Finance Care services shall be subject to the exclusive jurisdiction of the courts in India. We encourage users to first contact our support team to resolve disputes amicably before pursuing legal action.`,
  },
  {
    id: 'contact',
    title: '12. Contact Us',
    content: `For any questions, concerns, or complaints regarding these Terms and Conditions, please contact us:

Email: 1stepcreditcard@gmail.com
Phone: +91 95816 11711
Address: As listed on our official website

We aim to respond to all queries within 2 business hours during working days.`,
  },
]

export default function TermsConditions() {
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
          <h1>Terms & <span className="doc-gold">Conditions</span></h1>
          <p>Last updated: August 2026 &nbsp;·&nbsp; Effective immediately</p>
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
                    <FaFileContract className="sidebar-icon" /> {s.title.split('.')[0]}. {s.title.split('.')[1]}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Content */}
        <div className="doc-content">
          
          <div className="doc-section-card" style={{ paddingBottom: '20px' }}>
             <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: 'rgba(255,255,255,0.8)' }}>
               Welcome to 1 Step Finance Care. Please read these Terms and Conditions carefully before using our services. These terms constitute a legally binding agreement between you and 1 Step Finance Care Fintech.
             </p>
          </div>

          {sections.map((section) => (
            <div className="doc-section-card" id={section.id} key={section.id}>
              <div className="doc-section-header">
                <div className="doc-section-icon"><FaFileContract /></div>
                <h2>{section.title}</h2>
              </div>
              <div className="doc-text">
                {section.content.split('\n').map((line, i) => {
                  if (line.trim().startsWith('•')) {
                    return <li key={i}>{line.replace('• ', '')}</li>
                  }
                  return line.trim() ? <p key={i}>{line}</p> : <br key={i} />
                })}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
