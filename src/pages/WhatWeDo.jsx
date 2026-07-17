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
    tagline: 'Instant cash from your credit limit',
    desc: 'Convert your unused credit card limit into instant cash. Supported by all major banks with POS machine facility. Get funds instantly when you need them most.',
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/Layer_14_hfozvc.png',
  },
  {
    slug: 'bill-payment',
    Icon: FaCreditCard,
    title: 'Credit Card Bill Payment',
    tagline: 'Never miss your due date',
    desc: 'Pay any amount on any credit card instantly. Avoid massive late fees, save on interest, and protect your CIBIL score with zero hassle.',
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986810/Layer_18_kwkkgx.png',
  },
  {
    slug: 'personal-loans',
    Icon: FaMoneyBillWave,
    title: 'Personal Loans',
    tagline: 'Quick disbursal when you need it',
    desc: 'Get personal loans with incredibly fast approval and minimal documentation. We offer highly competitive interest rates tailored to your profile.',
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/Layer_20_dpj7hw.png',
  },
  {
    slug: 'business-loans',
    Icon: FaBuilding,
    title: 'Business Loans',
    tagline: 'Fuel your ultimate growth',
    desc: 'Tailored business loan solutions up to ₹70 Lakhs to help you scale, expand, and achieve your entrepreneurial goals with complete ease.',
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986810/Layer_21_rfhylr.png',
  },
  {
    slug: 'insurance',
    Icon: FaShieldAlt,
    title: 'Insurance Services',
    tagline: 'Protect what matters most',
    desc: 'Life, health, and vehicle insurance from top providers. We secure the absolute best rates so you and your family are fully covered.',
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_23_ebzlts.png',
  },
  {
    slug: 'cibil-score',
    Icon: FaChartBar,
    title: 'CIBIL Score Repair',
    tagline: 'Improve your credit health',
    desc: 'Know your exact credit score and get expert, personalized guidance to repair it. Better scores mean better loan eligibility and financial freedom.',
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986813/Layer_26_nxw11o.png',
  },
]

const moreServices = [
  { slug: 'dmt',              Icon: FaExchangeAlt,   title: 'Instant Money Transfer', desc: 'Send money anywhere in seconds.' },
  { slug: 'aadhaar-withdrawal', Icon: FaFingerprint, title: 'Aadhaar Withdrawal',     desc: 'Withdraw cash using your Aadhaar.' },
  { slug: 'cash-deposit',     Icon: FaUniversity,    title: 'Cash Deposit',           desc: 'Quick cash deposits to any bank.' },
  { slug: 'bank-account',     Icon: FaUniversity,    title: 'Bank Account Opening',   desc: 'Open a savings or current account.' },
  { slug: 'new-credit-card',  Icon: FaCreditCard,    title: 'New Credit Card',        desc: 'Apply for the best credit cards.' },
  { slug: 'more',             Icon: FaCheckCircle,   title: 'And Much More...',       desc: 'We are your one-stop financial hub.' },
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
          <div className="wwd-hero-badge"><FaBolt /> Our Services</div>
          <h1 className="wwd-hero-title">
            The Financial Hub<br />
            <span className="wwd-text-gold">Built for You.</span>
          </h1>
          <p className="wwd-hero-sub">
            Comprehensive financial services designed for speed, security, and simplicity. Explore our complete ecosystem below.
          </p>
        </div>
      </section>

      {/* Core Products (Massive Alternating Strips) */}
      <section className="wwd-strips-section">
        <div className="wwd-section-header">
          <div className="wwd-pill">Flagship Services</div>
          <h2>Everything You Need.</h2>
          <p>Discover our suite of premium financial solutions.</p>
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
          <div className="wwd-pill">More Services</div>
          <h2>A Complete Ecosystem</h2>
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
          <h2>Ready to get started?</h2>
          <p>Our team is available 24/7 to help you with your financial needs.</p>
          <Link to="/contact" className="wwd-btn-cta">
            Contact Support <FaArrowRight />
          </Link>
        </div>
      </section>

    </div>
  )
}
