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
      { Icon: FaBolt,         label: 'Instant Bill Clearance' },
      { Icon: FaMoneyBillWave, label: 'Any Amount – No Limits' },
      { Icon: FaShieldAlt,    label: 'Avoid Late Fees & Interest' },
      { Icon: FaStar,         label: 'Cashback / Reward Points' },
    ],
    badge: '100% Secure | Trusted | Transparent',
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986810/Layer_18_kwkkgx.png',
    accent: '#10b981',
  },
  {
    slug: 'dmt',
    Icon: FaExchangeAlt,
    title: 'Instant Money Transfer (DMT)',
    tagline: 'Send money anywhere in seconds',
    desc: 'Send money to any bank account across India in seconds using IMPS. Available 24×7 with the lowest charges.',
    points: [
      { Icon: FaClock,        label: '24×7 Service' },
      { Icon: FaBolt,         label: 'Instant IMPS Transfer' },
      { Icon: FaUniversity,   label: 'All Banks Supported' },
      { Icon: FaMoneyBillWave, label: 'Low Charges' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986807/Cash_Deposit_iqi1gr.png',
    accent: '#8b5cf6',
  },
  {
    slug: 'aadhaar-withdrawal',
    Icon: FaFingerprint,
    title: 'Aadhaar Cash Withdrawal',
    tagline: 'No ATM card? No problem',
    desc: 'Withdraw cash from your bank account using just your Aadhaar card and biometric fingerprint — no ATM card needed.',
    points: [
      { Icon: FaFingerprint,  label: 'No ATM Card Needed' },
      { Icon: FaLock,         label: 'Biometric Authentication' },
      { Icon: FaBolt,         label: 'Instant Disbursement' },
      { Icon: FaMapMarkerAlt, label: 'Available Nearby' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_22_dxp4lv.png',
    accent: '#f59e0b',
  },
]

const moreServices = [
  { slug: 'personal-loans',  Icon: FaMoneyBillWave, title: 'Personal Loans',        desc: 'Quick loans with minimal documentation and fast disbursal.',       img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/Layer_20_dpj7hw.png' },
  { slug: 'business-loans',  Icon: FaBuilding,      title: 'Business Loans',        desc: 'Fuel your business growth with tailored loan solutions.',           img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986810/Layer_21_rfhylr.png' },
  { slug: 'bank-account',    Icon: FaUniversity,    title: 'Bank Account Opening',  desc: 'Open a savings or current account with leading banks hassle-free.', img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_25_z5scod.png' },
  { slug: 'cibil-score',     Icon: FaChartBar,      title: 'CIBIL Score Check',     desc: 'Know your credit score and get expert help to improve it.',         img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986813/Layer_26_nxw11o.png' },
  { slug: 'new-credit-card', Icon: FaCreditCard,    title: 'New Credit Card Apply', desc: 'Apply for the best credit cards matching your spending profile.',   img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/copy_8_khzlf7.png' },
  { slug: 'insurance',       Icon: FaShieldAlt,     title: 'Insurance Services',    desc: 'Life, health, and vehicle insurance from top providers.',           img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_23_ebzlts.png' },
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
