import { useState, useEffect } from 'react'
import { FaChevronDown, FaBolt, FaCreditCard, FaExchangeAlt, FaFingerprint, FaMoneyBillWave, FaShieldAlt } from 'react-icons/fa'
import './FAQ.css'

const faqs = [
  {
    id: 'spot-cash',
    category: 'Spot Cash on Credit Card',
    Icon: FaBolt,
    items: [
      { q: 'How does Instant Credit Card Cash function?', a: 'This service lets you draw liquid funds against your available credit card balance, which is then swiftly routed to your bank account via our point-of-sale terminals.' },
      { q: 'What types of credit cards do you process?', a: 'We take all prominent cards such as Visa, Mastercard, RuPay, and Amex issued by major financial institutions.' },
      { q: 'What is the expected processing time for transfers?', a: 'Funds are deposited into your designated bank account typically within 2 to 5 minutes post-transaction.' },
      { q: 'Do you have any concealed fees?', a: 'Absolutely not. We maintain a clear pricing model and all costs are disclosed to you prior to initiating any transfer.' },
    ],
  },
  {
    id: 'bill-payment',
    category: 'Credit Card Bill Payment',
    Icon: FaCreditCard,
    items: [
      { q: 'Is bill settlement supported for all bank cards?', a: 'Certainly, our platform enables dues clearance for cards issued by any major bank nationwide.' },
      { q: 'Are there limits on how much I can pay?', a: 'We do not impose floor or ceiling limits. You are free to remit anything from the minimum requirement up to your total outstanding.' },
      { q: 'Does the payment update in real-time?', a: 'Indeed, we process settlements instantaneously, and the updated balance usually shows on your card statement within a few hours.' },
      { q: 'Do I get loyalty points for clearing my dues?', a: 'Yes, subject to your respective bank\'s terms, you might accumulate rewards or cashback when settling bills via our service.' },
    ],
  },
  {
    id: 'money-transfer',
    category: 'Money Transfer (DMT)',
    Icon: FaExchangeAlt,
    items: [
      { q: 'What exactly is Domestic Money Transfer (DMT)?', a: 'DMT provides a mechanism to remit funds immediately to any Indian bank account utilizing IMPS technology, accessible around the clock, even on public holidays.' },
      { q: 'How much does it cost to send money?', a: 'We boast highly competitive rates. The precise fee will be shown to you for approval before the transaction concludes.' },
      { q: 'Are there daily caps on fund transfers?', a: 'Caps are determined by your KYC tier. A basic profile permits up to ₹25,000 monthly, while fully verified accounts enjoy elevated thresholds.' },
      { q: 'What happens in case of a transaction failure?', a: 'If a remittance does not go through, the funds will be autonomously credited back to your source account within one to two business days.' },
    ],
  },
  {
    id: 'aadhaar',
    category: 'Aadhaar Cash Withdrawal',
    Icon: FaFingerprint,
    items: [
      { q: 'Can you explain the Aadhaar withdrawal process?', a: 'By submitting your Aadhaar details and verifying via fingerprint scan, the requested sum is deducted from your associated bank account and handed over in cash straight away.' },
      { q: 'Which banking institutions permit Aadhaar cash outs?', a: 'Any bank integrated with the NPCI framework for Aadhaar-seeded accounts is compatible with our withdrawal feature.' },
      { q: 'What is the upper limit for withdrawing cash?', a: 'Maximum caps are dictated by your specific bank, generally hovering around ₹10,000 per single operation.' },
      { q: 'Are my Aadhaar details secure with you?', a: 'Absolutely. We deploy UIDAI-approved scanners and never retain your personal data. Every operation features end-to-end encryption.' },
    ],
  },
  {
    id: 'loans',
    category: 'Loans',
    Icon: FaMoneyBillWave,
    items: [
      { q: 'What loan varieties are available?', a: 'We facilitate access to both Individual and Commercial Financing via our network of associated banks and NBFCs, featuring attractive borrowing rates.' },
      { q: 'What is the typical turnaround time for loan approvals?', a: 'Individual funding may receive clearance in just 24 hours with sparse paperwork. Enterprise financing normally requires between 2 to 5 business days.' },
      { q: 'Is there a baseline credit score necessary?', a: 'Typically, a credit rating of 700+ is mandated. Additionally, we provide guidance for clients looking to boost their current scores.' },
      { q: 'Do I need to pledge assets to secure a loan?', a: 'Individual loans are fundamentally unsecured without collateral needs. Enterprise loans might necessitate asset backing based on the requested sum.' },
    ],
  },
  {
    id: 'general',
    category: 'General & Security',
    Icon: FaShieldAlt,
    items: [
      { q: 'Is your organization officially recognized?', a: 'Indeed, 1 Step Finance Care is a formally incorporated financial technology firm adhering strictly to all relevant RBI and state mandates.' },
      { q: 'What measures are in place to safeguard my information?', a: 'We implement banking-standard SSL protocols and adhere to rigorous privacy guidelines. Your sensitive data is never distributed to external entities.' },
      { q: 'When are your services operational?', a: 'Our online platforms function perpetually 24/7. Our brick-and-mortar branches are open between 9 AM and 8 PM during standard working days.' },
      { q: 'What is the best way to reach customer service?', a: 'You may connect with us through a phone call, electronic mail, or our online form. Our helpdesk typically replies within a two-hour window during regular hours.' },
    ],
  },
]

export default function FAQ() {
  const [openMap, setOpenMap] = useState({})
  const [activeSection, setActiveSection] = useState(faqs[0].id)

  const toggle = (key) => setOpenMap(prev => ({ ...prev, [key]: !prev[key] }))

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      window.scrollTo({ top: el.offsetTop - 120, behavior: 'smooth' })
    }
  }

  // Spy on scroll to update active sidebar link
  useEffect(() => {
    const handleScroll = () => {
      let current = faqs[0].id
      for (const section of faqs) {
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
          <div className="doc-pill">Help Center</div>
          <h1>Commonly Addressed <span className="doc-gold">Inquiries</span></h1>
          <p>All the essential information regarding 1 Step Finance Care.</p>
        </div>
      </div>

      <div className="doc-container">
        
        {/* Sticky Sidebar */}
        <aside className="doc-sidebar">
          <div className="doc-sidebar-inner">
            <h4>Categories</h4>
            <ul>
              {faqs.map(s => (
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

        {/* Content (Accordion Sections) */}
        <div className="doc-content">
          {faqs.map((section) => (
            <div className="doc-section-card" id={section.id} key={section.id}>
              <div className="doc-section-header">
                <div className="doc-section-icon"><section.Icon /></div>
                <h2>{section.category}</h2>
              </div>
              <div className="faq-list">
                {section.items.map((item, i) => {
                  const key = `${section.id}-${i}`
                  const open = !!openMap[key]
                  return (
                    <div className={`faq-item ${open ? 'open' : ''}`} key={key}>
                      <button className="faq-question" onClick={() => toggle(key)}>
                        <span>{item.q}</span>
                        <FaChevronDown className="faq-chevron" />
                      </button>
                      <div className="faq-answer-wrap" style={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}>
                        <div className="faq-answer">{item.a}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
