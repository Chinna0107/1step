import { useState, useEffect } from 'react'
import { FaFileContract, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'
import './FAQ.css'

const sections = [
  {
    id: 'acceptance',
    title: '1. Agreement to Provisions',
    content: `By navigating or employing the 1 Step Finance Care portal and provisions, you consent to be obligated by these Terms of Service. If these stipulations are unacceptable, kindly refrain from using our system. We retain the authority to modify these rules whenever necessary without advance warning.`,
  },
  {
    id: 'services',
    title: '2. Available Provisions',
    content: `1 Step Finance Care provides the following financial services:
• Instant Credit Card Cash — Immediate funds drawn from your card balance
• Card Dues Settlement — Clear your credit card invoices in real-time
• Fund Remittance (DMT) — Transfer capital to any bank via IMPS protocols
• Aadhaar Banking — Cash outs facilitated by biometric authentication
• Individual & Commercial Financing — Sourced via our allied banks and NBFCs
• Protective Coverage — Policies for life, medical, and automotive needs
• Credit Profiling & Restoration — Evaluation and enhancement of credit ratings
• Account Creation — Assistance with establishing savings and current accounts
• Credit Card Procurement — Guidance and filing for new cards`,
  },
  {
    id: 'eligibility',
    title: '3. Qualifying Criteria',
    content: `To interact with our provisions, you are required to:
• Have attained the age of 18
• Hold Indian residency
• Maintain legitimate state-issued ID (such as Aadhaar or PAN)
• Operate a functioning and recognized bank account
• Supply precise and honest details during enrollment and operational activities`,
  },
  {
    id: 'responsibilities',
    title: '4. Client Obligations',
    content: `You commit to:
• Furnish precise, up-to-date, and exhaustive data
• Safeguard the secrecy of your login particulars
• Refrain from leveraging our platform for illicit, deceptive, or unsanctioned motives
• Abstain from attempting to decompile, breach, or interfere with our infrastructure
• Adhere to all pertinent legislation and mandates
• Promptly alert us regarding any unsanctioned access to your profile`,
  },
  {
    id: 'fees',
    title: '5. Pricing & Tariffs',
    content: `We levy operational tariffs on specific activities. All relevant charges are:
• Explicitly stated prior to your authorization of any operation
• Ineligible for refund after an activity has been conclusively executed
• Prone to revision, accompanied by preliminary announcements on our portal
• Incorporating mandatory levies as dictated by state directives

We maintain a strict no-hidden-cost policy. The displayed figure is your final obligation.`,
  },
  {
    id: 'processing',
    title: '6. Operational Execution',
    content: `Every activity is contingent upon:
• Rigorous validation and identity checks
• Sufficient balance existing in the originating account
• Strict alignment with RBI protocols and relevant legislative codes
• Systemic stability and the operational status of external partners

We bear no liability for postponements resulting from banking lags, connectivity failures, or acts of God.`,
  },
  {
    id: 'privacy',
    title: '7. Confidentiality & Information Safeguarding',
    content: `We are staunchly dedicated to shielding your private details. We:
• Gather merely the information essential to deliver our provisions
• Never vend or distribute your private records to unsanctioned external entities
• Employ banking-standard SSL scrambling for all information transit
• Abide by all relevant information security statutes
• Preserve records exclusively for durations necessitated by legislation or operational needs

Kindly consult our Data Privacy Guidelines for comprehensive specifics on information management.`,
  },
  {
    id: 'liability',
    title: '8. Liability Constraints',
    content: `We shall not be held accountable for:
• Any secondary, circumstantial, or resultant harm
• Deprivation of earnings, information, or commercial prospects
• Unapproved entry to your profile stemming from your oversight
• Breakdowns triggered by external partners (such as banking institutions or payment processors)
• Lags or collapses arising from situations outside our sensible purview

Our maximum accountability under any circumstance will not surpass the value of the contested operation.`,
  },
  {
    id: 'intellectual-property',
    title: '9. Proprietary Rights',
    content: `Every element present on this portal, encompassing emblems, copy, visuals, and code, remains the sole asset of 1 Step Finance Care and is shielded by relevant proprietary statutes. You are forbidden from copying, disseminating, or forging derivative materials lacking our explicit written consent.`,
  },
  {
    id: 'termination',
    title: '10. Account Suspension',
    content: `We possess the prerogative to halt or permanently revoke your entry to our provisions instantaneously, without warning, should:
• You breach these established Terms of Service
• We harbor suspicions of deceptive or unlawful conduct
• Mandated by legislation or oversight bodies
• You furnish inaccurate or deceptive details

Following revocation, any unresolved operations will either reach conclusion or trigger a reimbursement, as appropriate.`,
  },
  {
    id: 'governing-law',
    title: '11. Jurisdiction & Legislation',
    content: `These stipulations are regulated by Indian jurisprudence. Any conflicts emerging from the utilization of our provisions will fall under the exclusive purview of Indian judicial courts. We urge clients to initially engage our helpdesk to settle disagreements peacefully prior to initiating formal litigation.`,
  },
  {
    id: 'contact',
    title: '12. Reach Out',
    content: `For inquiries, worries, or grievances related to these Provisions, kindly connect with us:

Email: 1stepcreditcard@gmail.com
Phone: +91 95816 11711
Address: As listed on our official website

We strive to address all communications within a two-hour window during standard business days.`,
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
          <h1>Terms of <span className="doc-gold">Service</span></h1>
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
               Greetings from 1 Step Finance Care. Kindly review these Terms of Service thoroughly prior to utilizing our platform. These provisions form a lawful contract between you and 1 Step Finance Care.
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
