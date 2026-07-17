import { useState, useEffect } from 'react'
import { FaChevronDown, FaBolt, FaCreditCard, FaExchangeAlt, FaFingerprint, FaMoneyBillWave, FaShieldAlt } from 'react-icons/fa'
import './FAQ.css'

const faqs = [
  {
    id: 'spot-cash',
    category: 'Spot Cash on Credit Card',
    Icon: FaBolt,
    items: [
      { q: 'What is Spot Cash on Credit Card?', a: 'Spot Cash allows you to convert your unused credit card limit into instant cash, transferred directly to your bank account within minutes using our POS machine facility.' },
      { q: 'Which credit cards are accepted?', a: 'We accept all major credit cards including Visa, Mastercard, RuPay, and American Express from all leading banks.' },
      { q: 'How long does the transfer take?', a: 'The cash is transferred to your bank account within 2–5 minutes after the transaction is processed.' },
      { q: 'Are there any hidden charges?', a: 'No hidden charges. Our fee structure is completely transparent and communicated upfront before every transaction.' },
    ],
  },
  {
    id: 'bill-payment',
    category: 'Credit Card Bill Payment',
    Icon: FaCreditCard,
    items: [
      { q: 'Can I pay bills for any bank\'s credit card?', a: 'Yes, we support credit card bill payments for all major banks and card issuers across India.' },
      { q: 'Is there a minimum or maximum payment amount?', a: 'There is no minimum or maximum limit. You can pay any amount from the minimum due to the full outstanding balance.' },
      { q: 'Will my payment reflect immediately?', a: 'Yes, payments are processed instantly and reflect in your credit card account within a few hours.' },
      { q: 'Can I earn reward points on bill payments?', a: 'Yes, depending on your card issuer\'s policy, you may earn cashback or reward points on bill payments made through us.' },
    ],
  },
  {
    id: 'money-transfer',
    category: 'Money Transfer (DMT)',
    Icon: FaExchangeAlt,
    items: [
      { q: 'What is DMT (Domestic Money Transfer)?', a: 'DMT is a service that allows you to send money instantly to any bank account across India using IMPS, available 24×7 including holidays.' },
      { q: 'What are the charges for money transfer?', a: 'We offer the lowest transaction charges in the market. Exact charges are displayed before you confirm the transfer.' },
      { q: 'Is there a transfer limit per day?', a: 'Transfer limits depend on your KYC status. Basic KYC allows up to ₹25,000/month and full KYC allows higher limits.' },
      { q: 'What if the transfer fails?', a: 'In case of a failed transfer, the amount is automatically refunded to the sender within 24–48 hours.' },
    ],
  },
  {
    id: 'aadhaar',
    category: 'Aadhaar Cash Withdrawal',
    Icon: FaFingerprint,
    items: [
      { q: 'How does Aadhaar-based withdrawal work?', a: 'You provide your Aadhaar number and authenticate using your biometric fingerprint. The amount is debited from your linked bank account and disbursed as cash instantly.' },
      { q: 'Which banks support Aadhaar withdrawal?', a: 'All banks that have enabled Aadhaar-linked accounts with NPCI support this service.' },
      { q: 'What is the maximum withdrawal limit?', a: 'The withdrawal limit is set by your bank, typically up to ₹10,000 per transaction.' },
      { q: 'Is my Aadhaar data safe?', a: 'Yes. We use UIDAI-certified biometric devices and do not store any Aadhaar data. All transactions are encrypted end-to-end.' },
    ],
  },
  {
    id: 'loans',
    category: 'Loans',
    Icon: FaMoneyBillWave,
    items: [
      { q: 'What types of loans do you offer?', a: 'We offer Personal Loans and Business Loans through our partner banks and NBFCs with competitive interest rates.' },
      { q: 'How quickly can I get a loan approved?', a: 'Personal loans can be approved within 24 hours with minimal documentation. Business loans may take 2–5 working days.' },
      { q: 'What is the minimum CIBIL score required?', a: 'A CIBIL score of 700 or above is generally required. We also assist customers in improving their score.' },
      { q: 'Is collateral required for loans?', a: 'Personal loans are unsecured — no collateral required. Business loans may require collateral depending on the loan amount.' },
    ],
  },
  {
    id: 'general',
    category: 'General & Security',
    Icon: FaShieldAlt,
    items: [
      { q: 'Is 1 Step Finance Care a registered company?', a: 'Yes, 1 Step Finance Care is a registered fintech company operating under all applicable RBI and government regulations.' },
      { q: 'How is my data protected?', a: 'We use bank-grade SSL encryption and follow strict data privacy policies. Your personal and financial data is never shared with third parties.' },
      { q: 'What are your working hours?', a: 'Our digital services are available 24×7. Physical centers operate from 9 AM to 8 PM on all working days.' },
      { q: 'How do I contact support?', a: 'You can reach us via phone, email, or the contact form on our website. Our support team responds within 2 hours during business hours.' },
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
          <div className="doc-pill">Support Center</div>
          <h1>Frequently Asked <span className="doc-gold">Questions</span></h1>
          <p>Everything you need to know about 1 Step Finance Care.</p>
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
