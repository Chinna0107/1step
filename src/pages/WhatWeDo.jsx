import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  FaBolt, FaCreditCard, FaExchangeAlt, FaFingerprint,
  FaMoneyBillWave, FaBuilding, FaUniversity, FaChartBar,
  FaShieldAlt, FaArrowRight, FaLock, FaCheckCircle
} from 'react-icons/fa'
import './WhatWeDo.css'

gsap.registerPlugin(ScrollTrigger)

const products = [
  {
    slug: 'spot-cash',
    Icon: FaBolt,
    title: 'Spot Cash on Credit Card',
    tagline: 'Immediate liquidity from your card balance',
    desc: 'Transform your available credit into liquid capital. Compatible with all premier banking institutions via point-of-sale systems. Secure capital promptly during crucial moments.',
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/Layer_14_hfozvc.png',
  },
  {
    slug: 'bill-payment',
    Icon: FaCreditCard,
    title: 'Credit Card Bill Payment',
    tagline: 'Always pay on time',
    desc: 'Settle any card balance in real-time. Dodge hefty penalty charges, conserve on interest rates, and safeguard your credit rating effortlessly.',
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986810/Layer_18_kwkkgx.png',
  },
  {
    slug: 'personal-loans',
    Icon: FaMoneyBillWave,
    title: 'Personal Loans',
    tagline: 'Rapid funding upon request',
    desc: 'Acquire individual financing with exceptionally swift clearance and basic paperwork. We provide extremely attractive interest rates customized to your situation.',
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/Layer_20_dpj7hw.png',
  },
  {
    slug: 'business-loans',
    Icon: FaBuilding,
    title: 'Business Loans',
    tagline: 'Power your enterprise expansion',
    desc: 'Custom-built enterprise financing reaching up to ₹70 Lakhs, designed to facilitate scaling, broadening operations, and realizing your commercial ambitions smoothly.',
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986810/Layer_21_rfhylr.png',
  },
  {
    slug: 'insurance',
    Icon: FaShieldAlt,
    title: 'Insurance Services',
    tagline: 'Safeguard your critical assets',
    desc: 'Policies for life, medical, and automotive needs sourced from premier insurers. We lock in optimal premiums ensuring complete coverage for you and your dependents.',
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_23_ebzlts.png',
  },
  {
    slug: 'cibil-score',
    Icon: FaChartBar,
    title: 'CIBIL Score Repair',
    tagline: 'Enhance your borrowing capacity',
    desc: 'Discover your precise credit rating and receive specialized, tailored advice for its restoration. Superior ratings lead to enhanced loan qualification and fiscal independence.',
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986813/Layer_26_nxw11o.png',
  },
]

const moreServices = [
  { slug: 'dmt',              Icon: FaExchangeAlt,   title: 'Instant Money Transfer', desc: 'Dispatch capital anywhere swiftly.' },
  { slug: 'aadhaar-withdrawal', Icon: FaFingerprint, title: 'Aadhaar Withdrawal',     desc: 'Extract funds via biometric ID.' },
  { slug: 'cash-deposit',     Icon: FaUniversity,    title: 'Cash Deposit',           desc: 'Speedy deposits into any account.' },
  { slug: 'bank-account',     Icon: FaUniversity,    title: 'Bank Account Opening',   desc: 'Establish savings or checking accounts.' },
  { slug: 'new-credit-card',  Icon: FaCreditCard,    title: 'New Credit Card',        desc: 'File for top-tier credit cards.' },
  { slug: 'more',             Icon: FaCheckCircle,   title: 'And Much More...',       desc: 'Your comprehensive monetary center.' },
]

export default function WhatWeDo() {
  const pageRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animations
      gsap.fromTo('.wwd-hero-badge', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
      gsap.fromTo('.wwd-hero-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: 'power4.out' })
      gsap.fromTo('.wwd-hero-sub',   { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' })
      
      // Strips Animation
      gsap.utils.toArray('.wwd-strip').forEach((strip, i) => {
        const textSide = strip.querySelector('.strip-text')
        const visualSide = strip.querySelector('.strip-visual')
        
        // Alternate directions based on index
        const textX = i % 2 === 0 ? -100 : 100
        const visualX = i % 2 === 0 ? 100 : -100

        gsap.fromTo(textSide, 
          { opacity: 0, x: textX },
          { opacity: 1, x: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: strip, start: 'top 75%' } }
        )
        gsap.fromTo(visualSide, 
          { opacity: 0, x: visualX, scale: 0.9 },
          { opacity: 1, x: 0, scale: 1, duration: 1, delay: 0.2, ease: 'back.out(1.2)', scrollTrigger: { trigger: strip, start: 'top 75%' } }
        )
      })

      // More Services Grid
      gsap.fromTo('.wwd-more-card',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.wwd-more-grid', start: 'top 85%' } }
      )
    }, pageRef)
    return () => ctx.revert()
  }, [])

  return (
    <div className="wwd-premium" ref={pageRef}>
      
      {/* Background Elements */}
      <div className="wwd-bg-grid" />
      <div className="wwd-bg-glow glow-top" />
      <div className="wwd-bg-glow glow-bottom" />

      {/* Hero Section */}
      <section className="wwd-hero">
        <div className="wwd-hero-inner">
          <div className="wwd-hero-badge"><FaBolt /> Our Provisions</div>
          <h1 className="wwd-hero-title">
            The Monetary Center<br />
            <span className="wwd-text-gold">Designed for You.</span>
          </h1>
          <p className="wwd-hero-sub">
            All-inclusive monetary solutions engineered for velocity, safety, and ease of use. Discover our full operational suite below.
          </p>
        </div>
      </section>

      {/* Core Products (Massive Alternating Strips) */}
      <section className="wwd-strips-section">
        <div className="wwd-section-header">
          <div className="wwd-pill">Primary Offerings</div>
          <h2>All Essential Solutions.</h2>
          <p>Explore our portfolio of high-grade monetary services.</p>
        </div>
        
        <div className="wwd-strips-container">
          {products.map((p, index) => (
            <div className={`wwd-strip ${index % 2 === 1 ? 'strip-reverse' : ''}`} key={p.slug}>
              <div className="strip-text">
                <div className="strip-icon"><p.Icon /></div>
                <h3>{p.title}</h3>
                <h4 className="wwd-text-gold">{p.tagline}</h4>
                <p>{p.desc}</p>
                <Link to={`/product/${p.slug}`} className="strip-link">
                  Explore <FaArrowRight />
                </Link>
              </div>
              <div className="strip-visual">
                <div className="strip-glass-box">
                  <img src={p.img} alt={p.title} loading="lazy" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* More Services Grid */}
      <section className="wwd-more-section">
        <div className="wwd-section-header">
          <div className="wwd-pill">Additional Offerings</div>
          <h2>An All-Encompassing Network</h2>
        </div>
        
        <div className="wwd-more-grid">
          {moreServices.map(s => (
            <div className="wwd-more-card" key={s.slug}>
              <div className="more-icon"><s.Icon /></div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="wwd-cta-section">
        <div className="wwd-cta-box">
          <h2>Prepared to initiate?</h2>
          <p>Our staff remains accessible around the clock to assist with your monetary requirements.</p>
          <Link to="/contact" className="wwd-btn-cta">
            Contact Support <FaArrowRight />
          </Link>
        </div>
      </section>

    </div>
  )
}
