import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  FaBolt, FaLock, FaCheckCircle, FaClock, FaRocket, FaShieldAlt,
  FaMoneyBillWave, FaHandshake, FaMobileAlt, FaTrophy, FaStar,
  FaArrowRight, FaUsers, FaChartLine, FaUniversity, FaCreditCard,
  FaExchangeAlt, FaPlane, FaShoppingCart, FaCouch, FaCar,
  FaFingerprint, FaMapMarkerAlt, FaChartBar, FaBuilding
} from 'react-icons/fa'
import bannerImg from '../assets/logo.png'
import './Home.css'

gsap.registerPlugin(ScrollTrigger)

const products = [
  {
    slug: 'spot-cash',
    title: 'Spot Cash on Credit Card',
    tagline: 'Turn your available credit limit into liquid cash immediately',
    desc: 'Maximize your credit card potential. We facilitate immediate cash transfers to your bank account in just a few minutes by utilizing your unused credit limit.',
    features: [
      { icon: FaExchangeAlt, label: 'Instant Bank Transfer' },
      { icon: FaBolt,        label: 'Cash in Minutes' },
      { icon: FaCreditCard,  label: 'All Cards Accepted' },
      { icon: FaMobileAlt,   label: 'POS Machine Available' },
    ],
    categories: [
      { icon: FaPlane,        label: 'Travel' },
      { icon: FaShoppingCart, label: 'Grocery' },
      { icon: FaCouch,        label: 'Furniture' },
      { icon: FaShieldAlt,    label: 'Insurance' },
    ],
    img: '/images/v2_spot_cash_1784285576712.png',
  },
  {
    slug: 'bill-payment',
    title: 'Credit Card Bill Payment',
    tagline: 'Stay ahead of your payment deadlines!',
    desc: 'Settle your credit card statements in real-time, regardless of the bank or amount. Prevent penalty charges and maintain a healthy credit profile through punctual repayments.',
    features: [
      { icon: FaBolt,          label: 'Instant Bill Clearance' },
      { icon: FaMoneyBillWave, label: 'Any Amount – No Limits' },
      { icon: FaShieldAlt,     label: 'Avoid Late Fees & Interest' },
      { icon: FaStar,          label: 'Cashback / Reward Points' },
    ],
    badge: '100% Secure | Trusted | Transparent',
    img: '/images/v2_bill_payment_1784285586007.png',
  },
  {
    slug: 'personal-loans',
    title: 'Personal Loans',
    tagline: 'Rapid funding with minimal paperwork',
    desc: 'Secure a personal loan with swift processing and basic documentation. Enjoy attractive interest rates customized to suit your financial background.',
    features: [
      { icon: FaBolt,        label: 'Fast Approval' },
      { icon: FaCheckCircle, label: 'Minimal Documentation' },
      { icon: FaChartLine,   label: 'Competitive Rates' },
      { icon: FaClock,       label: 'Flexible Tenure' },
    ],
    img: '/images/v2_personal_loan_1784285595978.png',
  },
  {
    slug: 'business-loans',
    title: 'Business Loans',
    tagline: 'Accelerate your enterprise expansion',
    desc: 'Custom-built commercial financing designed to assist you in scaling operations and reaching your business milestones effortlessly.',
    features: [
      { icon: FaMoneyBillWave, label: 'Loan up to ₹70 Lakhs' },
      { icon: FaBolt,          label: 'Fast Approval & Disbursal' },
      { icon: FaCheckCircle,   label: 'High Approval Chances' },
      { icon: FaUniversity,    label: '120+ Bank & NBFC Tie-ups' },
    ],
    img: '/images/v2_business_loan_1784285621125.png',
  },
  {
    slug: 'insurance',
    title: 'Insurance Services',
    tagline: 'Safeguard your most valuable assets',
    desc: 'Premium life, medical, and auto insurance policies from leading insurers at competitive premiums. Complete safety nets for you and your loved ones.',
    features: [
      { icon: FaShieldAlt,   label: 'Life Insurance' },
      { icon: FaCheckCircle, label: 'Health Insurance' },
      { icon: FaClock,       label: 'Vehicle Insurance' },
      { icon: FaStar,        label: 'Best Rates' },
    ],
    img: '/images/v2_insurance_1784285631772.png',
  },
  {
    slug: 'cibil-score',
    title: 'CIBIL Score Check',
    tagline: 'Understand and enhance your credit rating',
    desc: 'Discover your current credit standing and receive professional advice on elevating it to secure better borrowing terms and overall financial stability.',
    features: [
      { icon: FaBolt,        label: 'Instant Score Check' },
      { icon: FaChartLine,   label: 'Expert Guidance' },
      { icon: FaCheckCircle, label: 'Score Improvement' },
      { icon: FaClock,       label: 'Free Consultation' },
    ],
    img: '/images/v2_cibil_score_1784285639978.png',
  },
  {
    slug: 'credit-repair',
    title: 'CIBIL Repair',
    tagline: 'Resolve negative credit and restore confidence',
    desc: 'Expert credit rehabilitation assistance aimed at eliminating derogatory marks, contesting inaccuracies, and re-establishing your financial reputation.',
    features: [
      { icon: FaShieldAlt,   label: 'Dispute Resolution' },
      { icon: FaChartLine,   label: 'Rapid Score Boost' },
      { icon: FaCheckCircle, label: 'Expert Consultants' },
      { icon: FaLock,        label: '100% Confidential' },
    ],
    badge: 'Guaranteed Results | Trusted Experts',
    img: '/images/v2_credit_repair_1784285649653.png',
  },
]

const whyUs = [
  { Icon: FaHandshake,    title: 'Over 120 Banking & NBFC Alliances', desc: 'Partnered with an extensive network of financial institutions to offer you premium choices.' },
  { Icon: FaBolt,         title: 'Immediate Processing & Swift Funding', desc: 'Operations finalized within couple of minutes. Zero wait times and absolutely no delays.' },
  { Icon: FaCheckCircle,  title: 'Fully Transparent Pricing',     desc: 'Clear fee structures without any concealed costs. The quoted price is exactly what you incur.' },
  { Icon: FaShieldAlt,    title: 'Zero Concealed Costs Assurance',     desc: 'Our pledge: absolutely no unexpected fees at any point. Complete transparency prior to all dealings.' },
  { Icon: FaLock,         title: 'Safe & Authenticated Transfers',desc: 'Enterprise-level security protocols and fortified payment channels safeguard all your transfers.' },
  { Icon: FaTrophy,       title: 'Specialized Financial Guidance',  desc: 'Our qualified professionals support you across every phase of your financial endeavors.' },
]

const moreServices = [
  { img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_22_dxp4lv.png', label: 'Aadhaar Withdrawal',    desc: 'Cash out using Aadhaar',      slug: 'aadhaar-withdrawal' },
  { img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986807/Cash_Deposit_iqi1gr.png', label: 'Cash Deposit',   desc: 'Fast & safe money deposits',       slug: 'cash-deposit' },
  { img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_25_z5scod.png', label: 'Bank Account Opening', desc: 'Effortless account creation',         slug: 'bank-account' },
  { img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/copy_8_khzlf7.png',   label: 'New Credit Card',    desc: 'Ideal cards matching your needs',       slug: 'new-credit-card' },
]

const testimonials = [
  { name: 'Ravi Kumar',    role: 'Business Owner',        text: 'Received ₹50,000 liquidity from my card in a mere 10 minutes! 1 Step Finance Care truly rescued me.', rating: 5 },
  { name: 'Priya Sharma',  role: 'Salaried Professional', text: 'Cleared my card dues in real-time. Say goodbye to late penalties. I strongly suggest their services!', rating: 5 },
  { name: 'Mohammed Ali',  role: 'Freelancer',            text: 'The money transfer is incredibly swift. Remitted funds to my relatives late at night without a hitch!', rating: 5 },
  { name: 'Sunita Reddy',  role: 'Homemaker',             text: 'Taking out cash via Aadhaar was a lifesaver when I left my debit card behind. Phenomenal platform!', rating: 5 },
]

export default function Home() {
  const heroRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // Hero Animations
      gsap.fromTo('.home-hero-text > *', 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
      )
      gsap.fromTo('.hero-img-anim', { opacity: 0, scale: 1.06, x: 80 }, { opacity: 1, scale: 1, x: 0, duration: 1.1, delay: 0.3, ease: 'power3.out' })
      
      // Apple Keynote Scroll Reveal for Products
      gsap.utils.toArray('.home-product-section').forEach((sec) => {
        const text = sec.querySelector('.hp-text')
        const img = sec.querySelector('.hp-img-wrapper')

        gsap.fromTo(text, 
          { opacity: 0, x: -50 }, 
          { opacity: 1, x: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: sec, start: 'top 60%' } }
        )
        gsap.fromTo(img, 
          { opacity: 0, scale: 0.9, y: 50 }, 
          { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: sec, start: 'top 60%' } }
        )
      })

    }, heroRef)
    return () => ctx.revert()
  }, [])

  return (
    <div className="home-wrapper" ref={heroRef}>
      
      {/* ── MASSIVE HERO ── */}
      <section className="home-hero">
        <div className="home-hero-bg">
          <div className="home-orb orb-gold" />
          <div className="home-orb orb-navy" />
          <div className="home-grid-pattern" />
        </div>
        
        <div className="home-hero-inner">
          <div className="home-hero-text">
            <div className="home-hero-badge"><FaRocket size={14} /> Authorised Fintech Service Provider</div>
            <h1>
              The Ultimate Hub For Your <br/>
              <span className="home-gold-gradient">Financial Solutions</span>
            </h1>
            <p>
              India’s premier Business Correspondent and Financial Ally. Bridging the gap to over 120 Banks & NBFCs for immediate liquidity, utility settlements, and credit facilities. Everything in one place, around the clock.
            </p>
            <div className="home-hero-actions">
              <Link to="/what-we-do" className="home-btn-primary">Explore Services <FaArrowRight /></Link>
              <Link to="/contact" className="home-btn-outline">Contact Us</Link>
            </div>
            
            <div className="home-hero-stats">
              <div className="h-stat">
                <div className="h-stat-icon"><FaBolt size={16} /></div>
                <div className="h-stat-text">
                  <h3>Instant Transfer</h3>
                  <span>Cash in under 2 mins</span>
                </div>
              </div>
              <div className="h-stat-div" />
              <div className="h-stat">
                <div className="h-stat-icon"><FaLock size={16} /></div>
                <div className="h-stat-text">
                  <h3>100% Secure</h3>
                  <span>Bank-grade encryption</span>
                </div>
              </div>
              <div className="h-stat-div" />
              <div className="h-stat">
                <div className="h-stat-icon"><FaUsers size={16} /></div>
                <div className="h-stat-text">
                  <h3>5,000+ Customers</h3>
                  <span>Trusted across India</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-img-anim hero-visual">
            <div className="hero-ring" />
            <div className="hero-ring hero-ring-2" />

            <div className="hero-banner-card">
              <div className="hbc-brand">
                <div className="hbc-brand-dot" />
                <span className="hbc-brand-name">1 Step Finance Care</span>
                <span className="hbc-brand-tag">Fintech Services</span>
              </div>

              <div className="hbc-center">
                <div className="hbc-logo-ring hbc-ring-1" />
                <div className="hbc-logo-ring hbc-ring-2" />
                <div className="hbc-logo-wrap">
                  <img src={bannerImg} alt="1 Step Finance Care" />
                </div>

                <div className="hbc-services">
                  {[
                    { id: 'spot-cash',      Icon: FaCreditCard,    label: 'Spot Cash',      color: '#2b77e6' },
                    { id: 'bill-payment',   Icon: FaBolt,          label: 'Bill Payment',   color: '#10b981' },
                    { id: 'money-transfer', Icon: FaExchangeAlt,   label: 'Money Transfer', color: '#8b5cf6' },
                    { id: 'personal-loans', Icon: FaMoneyBillWave, label: 'Personal Loans', color: '#7c3aed' },
                    { id: 'business-loans', Icon: FaBuilding,      label: 'Biz Loans',      color: '#d97706' },
                    { id: 'insurance',      Icon: FaShieldAlt,     label: 'Insurance',      color: '#10b981' },
                    { id: 'cibil-score',    Icon: FaChartBar,      label: 'CIBIL Score',    color: '#f43f5e' },
                    { id: 'aadhaar-cash',   Icon: FaFingerprint,   label: 'Aadhaar Cash',   color: '#f59e0b' },
                    { id: 'cash-deposit',   Icon: FaUniversity,    label: 'Cash Deposit',   color: '#2b77e6' },
                    { id: 'credit-repair',  Icon: FaChartLine,     label: 'CIBIL Repair',  color: '#8b5cf6' },
                  ].map(({ id, Icon, label, color }, i) => (
                    <Link to={`/product/${id}`} className="hbc-svc" key={label} style={{ '--i': i, '--svc-color': color }}>
                      <div className="hbc-svc-counter">
                        <div className="hbc-svc-content">
                          <div className="hbc-svc-icon"><Icon size={15} /></div>
                          <span>{label}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="hbc-trust">
                <span><FaLock size={10} /> KYC Verified</span>
                <span><FaBolt size={10} /> Instant</span>
                <span><FaUsers size={10} /> 5K+ Customers</span>
                <span><FaTrophy size={10} /> 120+ Partners</span>
              </div>
            </div>

            <div className="hero-adv hero-adv-tl"><span className="hero-adv-icon"><FaLock size={11} /></span><span>100% Secure</span></div>
            <div className="hero-adv hero-adv-ml"><span className="hero-adv-icon"><FaUsers size={11} /></span><span>5K+ Customers</span></div>
            <div className="hero-adv hero-adv-bl"><span className="hero-adv-icon"><FaClock size={11} /></span><span>24/7 Support</span></div>
            <div className="hero-adv hero-adv-tr"><span className="hero-adv-icon"><FaBolt size={11} /></span><span>Instant Cash</span></div>
            <div className="hero-adv hero-adv-mr"><span className="hero-adv-icon"><FaTrophy size={11} /></span><span>120+ Partners</span></div>
            <div className="hero-adv hero-adv-br"><span className="hero-adv-icon"><FaShieldAlt size={11} /></span><span>KYC Verified</span></div>
          </div>
        </div>

        <button className="home-scroll-indicator" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
          <span className="scroll-text">Scroll to explore</span>
          <span className="scroll-arrow">↓</span>
        </button>
      </section>

      {/* ── APPLE KEYNOTE PRODUCT FLOW ── */}
      <div className="home-products">
        {products.map((p, i) => (
          <section className={`home-product-section ${i % 2 !== 0 ? 'reversed' : ''}`} key={p.slug}>
            <div className="hp-bg-glow" />
            <div className="hp-inner">
              
              <div className="hp-text">
                <div className="hp-tagline">{p.tagline}</div>
                <h2>{p.title}</h2>
                <p className="hp-desc">{p.desc}</p>
                
                {p.badge && <div className="hp-badge"><FaShieldAlt /> {p.badge}</div>}

                <div className="hp-features">
                  {p.features.map(f => (
                    <div className="hp-feat" key={f.label}>
                      <f.icon className="hp-feat-icon" />
                      <span>{f.label}</span>
                    </div>
                  ))}
                </div>

                <div className="hp-actions">
                  <Link to={`/product/${p.slug}`} className="home-btn-primary">Learn More</Link>
                  <Link to="/contact" className="home-btn-outline">Contact Now</Link>
                </div>
              </div>

              <div className="hp-visual">
                <div className="hp-img-wrapper">
                  <img src={p.img} alt={p.title} className="hp-img" />
                  <div className="hp-img-overlay" />
                </div>
              </div>

            </div>
          </section>
        ))}
      </div>


      {/* ── WHY US GRID ── */}
      <section className="home-why">
        <div className="home-section-header">
          <div className="home-badge">Why Partner With Us?</div>
          <h2>Your Dues. <span className="home-gold-gradient">Our Commitment.</span></h2>
        </div>
        <div className="hw-grid">
          {whyUs.map((w, i) => (
            <div className="hw-card" key={i}>
              <div className="hw-icon"><w.Icon /></div>
              <h3>{w.title}</h3>
              <p>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* ── MORE SERVICES BENTO ── */}
      <section className="home-more">
        <div className="home-section-header">
          <div className="home-badge">Complete Ecosystem</div>
          <h2>All your essentials in <span className="home-gold-gradient">a single platform</span></h2>
        </div>
        <div className="hm-grid">
          {moreServices.map(s => (
            <Link to={`/product/${s.slug}`} className="hm-card" key={s.slug}>
              <div className="hm-img-wrap">
                <img src={s.img} alt={s.label} />
              </div>
              <div className="hm-card-content">
                <h3>{s.label}</h3>
                <p>{s.desc}</p>
                <div className="hm-arrow"><FaArrowRight /></div>
              </div>
            </Link>
          ))}
        </div>
        <div className="home-center-action">
          <Link to="/what-we-do" className="home-btn-outline">Explore All Services</Link>
        </div>
      </section>


      {/* ── TESTIMONIALS ── */}
      <section className="home-testimonials">
        <div className="home-section-header">
          <div className="home-badge">Client Experiences</div>
          <h2>Hear From Our <span className="home-gold-gradient">Patrons</span></h2>
        </div>
        <div className="ht-grid">
          {testimonials.map((t, i) => (
            <div className="ht-card" key={i}>
              <div className="ht-stars">
                {[...Array(5)].map((_, j) => <FaStar key={j} />)}
              </div>
              <p>"{t.text}"</p>
              <div className="ht-author">
                <div className="ht-avatar">{t.name.charAt(0)}</div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      
      {/* ── FINAL CTA ── */}
      <section className="home-cta">
        <div className="home-cta-inner">
          <div className="home-cta-glow" />
          <h2>Prepared to <span className="home-gold-gradient">Begin?</span></h2>
          <p>Become one of our 5,000+ delighted clients. Rapid, protected, and accessible at all times.</p>
          <div className="home-cta-actions">
            <Link to="/what-we-do" className="home-btn-primary">Get Started Now</Link>
            <Link to="/contact" className="home-btn-outline">Talk to Us</Link>
          </div>
        </div>
      </section>

    </div>
  )
}
