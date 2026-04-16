import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  FaBolt, FaCreditCard, FaExchangeAlt, FaFingerprint,
  FaMoneyBillWave, FaBuilding, FaUniversity, FaChartBar,
  FaIdCard, FaShieldAlt, FaCheckCircle, FaArrowRight,
  FaMapMarkerAlt, FaClock, FaLock, FaStar
} from 'react-icons/fa'
import './WhatWeDo.css'

gsap.registerPlugin(ScrollTrigger)

const products = [
  {
    slug: 'spot-cash',
    Icon: FaBolt,
    title: 'Spot Cash on Credit Card',
    tagline: 'Instant cash from your credit limit',
    desc: 'Convert your unused credit card limit into instant cash. We support all major banks and cards with POS machine facility.',
    points: [
      { Icon: FaExchangeAlt, label: 'Instant Bank Transfer' },
      { Icon: FaBolt,        label: 'Cash in Minutes' },
      { Icon: FaCreditCard,  label: 'All Cards Accepted' },
      { Icon: FaShieldAlt,   label: 'POS Machine Available' },
    ],
    categories: ['Travel', 'Grocery', 'Furniture', 'Insurance'],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/Layer_14_hfozvc.png',
    accent: '#2b77e6',
  },
  {
    slug: 'bill-payment',
    Icon: FaCreditCard,
    title: 'Credit Card Bill Payment',
    tagline: 'Never miss your due date again',
    desc: 'Pay any amount on any credit card instantly with zero hassle. Avoid late fees and protect your CIBIL score.',
    points: [
      { Icon: FaBolt,          label: 'Instant Bill Clearance' },
      { Icon: FaMoneyBillWave, label: 'Any Amount – No Limits' },
      { Icon: FaShieldAlt,     label: 'Avoid Late Fees & Interest' },
      { Icon: FaStar,          label: 'Cashback / Reward Points' },
    ],
    badge: '100% Secure | Trusted | Transparent',
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986810/Layer_18_kwkkgx.png',
    accent: '#10b981',
  },
  {
    slug: 'personal-loans',
    Icon: FaMoneyBillWave,
    title: 'Personal Loans',
    tagline: 'Quick disbursal with minimal docs',
    desc: 'Get personal loans with fast approval and minimal documentation. Competitive interest rates tailored to your profile.',
    points: [
      { Icon: FaBolt,        label: 'Fast Approval' },
      { Icon: FaCheckCircle, label: 'Minimal Documentation' },
      { Icon: FaClock,       label: 'Competitive Rates' },
      { Icon: FaShieldAlt,   label: 'Flexible Tenure' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/Layer_20_dpj7hw.png',
    accent: '#7c3aed',
  },
  {
    slug: 'business-loans',
    Icon: FaBuilding,
    title: 'Business Loans',
    tagline: 'Fuel your business growth',
    desc: 'Tailored business loan solutions to help you scale, expand, and achieve your entrepreneurial goals with ease.',
    points: [
      { Icon: FaMoneyBillWave, label: 'Loan up to ₹70 Lakhs' },
      { Icon: FaBolt,          label: 'Fast Approval & Disbursal' },
      { Icon: FaCheckCircle,   label: 'High Approval Chances' },
      { Icon: FaUniversity,    label: '120+ Bank & NBFC Tie-ups' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986810/Layer_21_rfhylr.png',
    accent: '#d97706',
  },
  {
    slug: 'insurance',
    Icon: FaShieldAlt,
    title: 'Insurance Services',
    tagline: 'Protect what matters most',
    desc: 'Life, health, and vehicle insurance from top providers at the best rates. Comprehensive coverage for you and your family.',
    points: [
      { Icon: FaShieldAlt,   label: 'Life Insurance' },
      { Icon: FaCheckCircle, label: 'Health Insurance' },
      { Icon: FaClock,       label: 'Vehicle Insurance' },
      { Icon: FaStar,        label: 'Best Rates' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_23_ebzlts.png',
    accent: '#10b981',
  },
  {
    slug: 'cibil-score',
    Icon: FaChartBar,
    title: 'CIBIL Score Check & Repair',
    tagline: 'Know & improve your credit score',
    desc: 'Know your credit score and get expert guidance to improve it for better loan eligibility and financial health.',
    points: [
      { Icon: FaBolt,        label: 'Instant Score Check' },
      { Icon: FaCheckCircle, label: 'Expert Guidance' },
      { Icon: FaLock,        label: 'Score Improvement' },
      { Icon: FaClock,       label: 'Free Consultation' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986813/Layer_26_nxw11o.png',
    accent: '#f43f5e',
  },
]

const moreServices = [
  { slug: 'dmt',              Icon: FaExchangeAlt,   title: 'Instant Money Transfer', desc: 'Send money anywhere in seconds via IMPS.',          img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986807/Cash_Deposit_iqi1gr.png' },
  { slug: 'aadhaar-withdrawal', Icon: FaFingerprint, title: 'Aadhaar Cash Withdrawal', desc: 'Withdraw cash using just your Aadhaar.',            img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_22_dxp4lv.png' },
  { slug: 'cash-deposit',     Icon: FaUniversity,    title: 'Cash Deposit',           desc: 'Quick & secure cash deposits to any bank.',         img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986807/Cash_Deposit_iqi1gr.png' },
  { slug: 'bank-account',     Icon: FaUniversity,    title: 'Bank Account Opening',   desc: 'Open a savings or current account hassle-free.',    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_25_z5scod.png' },
  { slug: 'new-credit-card',  Icon: FaCreditCard,    title: 'New Credit Card Apply',  desc: 'Apply for the best credit cards for your profile.', img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/copy_8_khzlf7.png' },
]

export default function WhatWeDo() {
  const pageRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.wwd-hero-badge',  { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' })
      gsap.fromTo('.wwd-hero-title',  { opacity: 0, y: 50  }, { opacity: 1, y: 0, duration: 0.9, delay: 0.15, ease: 'power4.out' })
      gsap.fromTo('.wwd-hero-sub',    { opacity: 0, y: 25  }, { opacity: 1, y: 0, duration: 0.7, delay: 0.35, ease: 'power3.out' })
      gsap.fromTo('.wwd-hero-stats .wwd-stat', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.55, ease: 'power2.out' })
      gsap.to('.wwd-orb', { y: 'random(-30,30)', x: 'random(-20,20)', duration: 'random(4,8)', repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: { each: 0.5, from: 'random' } })

      gsap.utils.toArray('.wwd-product-card').forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.7, delay: i * 0.04, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 95%', once: true } })
      })

      gsap.utils.toArray('.wwd-more-card').forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0, y: 35, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, delay: i * 0.04, ease: 'back.out(1.3)', scrollTrigger: { trigger: el, start: 'top 95%', once: true } })
      })

      gsap.utils.toArray('.wwd-section-header').forEach(el => {
        gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 95%', once: true } })
      })
    }, pageRef)
    return () => ctx.revert()
  }, [])

  return (
    <div className="wwd" ref={pageRef}>

      {/* ── Hero ── */}
      <section className="wwd-hero">
        <div className="wwd-hero-bg">
          <div className="wwd-orb wwd-orb-1" />
          <div className="wwd-orb wwd-orb-2" />
          <div className="wwd-orb wwd-orb-3" />
          <div className="wwd-grid-lines" />
        </div>
        <div className="wwd-hero-inner">
          <div className="wwd-hero-badge"><FaBolt size={11} /> Our Services</div>
          <h1 className="wwd-hero-title">
            Everything You Need,<br />
            <span className="wwd-gold-text">All In One Place</span>
          </h1>
          <p className="wwd-hero-sub">
            Comprehensive financial services designed for speed, security, and simplicity.
            From instant cash to loans — we've got you covered.
          </p>
          <div className="wwd-hero-stats">
            {[['10K+','Customers'],['₹50Cr+','Processed'],['99%','Success Rate'],['24/7','Support']].map(([v,l]) => (
              <div className="wwd-stat" key={l}>
                <span className="wwd-stat-val">{v}</span>
                <span className="wwd-stat-lbl">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core Products ── */}
      <section className="wwd-section">
        <div className="wwd-section-header">
          <div className="wwd-pill">Core Products</div>
          <h2>Our Flagship Services</h2>
          <p>Powerful tools built for your everyday financial needs</p>
        </div>
        <div className="wwd-products-grid">
          {products.map((p, i) => (
            <div className={`wwd-product-card ${i % 2 === 1 ? 'reverse' : ''}`} key={p.slug}>
              <div className="wwd-card-img-side">
                <div className="wwd-card-img-wrap">
                  <img src={p.img} alt={p.title} loading="lazy" />
                  <div className="wwd-card-img-overlay" />
                </div>
              </div>
              <div className="wwd-card-content">
                <div className="wwd-card-icon-chip" style={{ background: `${p.accent}22`, borderColor: `${p.accent}44`, color: p.accent }}>
                  <p.Icon size={14} /> {p.title}
                </div>
                <h3>{p.title}</h3>
                <p className="wwd-card-desc">{p.desc}</p>
                <ul className="wwd-card-points">
                  {p.points.map(pt => (
                    <li key={pt.label}>
                      <span className="wwd-check" style={{ background: `${p.accent}22`, borderColor: `${p.accent}55`, color: p.accent }}>
                        <pt.Icon size={12} />
                      </span>
                      {pt.label}
                    </li>
                  ))}
                </ul>
                {p.categories && (
                  <div className="wwd-cats">
                    {p.categories.map(c => <span key={c}>{c}</span>)}
                  </div>
                )}
                {p.badge && (
                  <div className="wwd-badge">
                    <FaShieldAlt size={13} /> {p.badge}
                  </div>
                )}
                <Link to={`/product/${p.slug}`} className="wwd-btn-learn" style={{ '--accent': p.accent }}>
                  Learn More <FaArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── More Services ── */}
      <section className="wwd-more-section">
        <div className="wwd-more-bg-orb" />
        <div className="wwd-more-inner">
          <div className="wwd-section-header">
            <div className="wwd-pill light">More Services</div>
            <h2>Complete Financial Ecosystem</h2>
            <p>Everything you need under one roof</p>
          </div>
          <div className="wwd-more-grid">
            {moreServices.map(s => (
              <Link to={`/product/${s.slug}`} className="wwd-more-card" key={s.slug}>
                <div className="wwd-more-img-wrap">
                  <img src={s.img} alt={s.title} loading="lazy" />
                </div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="wwd-cta">
        <div className="wwd-cta-glow" />
        <h2>Ready to Get Started?</h2>
        <p>Join 10,000+ satisfied customers. Fast, secure, and always available.</p>
        <div className="wwd-cta-btns">
          <Link to="/contact" className="btn-wwd-primary">Contact Us Now</Link>
          <Link to="/" className="btn-wwd-outline">Back to Home</Link>
        </div>
      </section>

    </div>
  )
}
