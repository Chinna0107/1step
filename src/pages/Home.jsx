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
import bannerImg from '../assets/icons png/Money Spot Logo.png'
import './Home.css'

gsap.registerPlugin(ScrollTrigger)

const products = [
  {
    slug: 'spot-cash',
    title: 'Spot Cash on Credit Card',
    tagline: 'Convert your credit limit into instant cash',
    desc: 'Unlock the power of your credit card. Get instant cash transferred directly to your bank account within minutes using your existing credit limit.',
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
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/Layer_14_hfozvc.png',
    accent: 'var(--ms-purple)',
  },
  {
    slug: 'bill-payment',
    title: 'Credit Card Bill Payment',
    tagline: "Don't miss your due date!",
    desc: 'Pay any credit card bill instantly — any amount, any bank, zero hassle. Avoid late fees and protect your CIBIL score with on-time payments.',
    features: [
      { icon: FaBolt,          label: 'Instant Bill Clearance' },
      { icon: FaMoneyBillWave, label: 'Any Amount – No Limits' },
      { icon: FaShieldAlt,     label: 'Avoid Late Fees & Interest' },
      { icon: FaStar,          label: 'Cashback / Reward Points' },
    ],
    badge: '100% Secure | Trusted | Transparent',
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986810/Layer_18_kwkkgx.png',
    accent: 'var(--ms-crimson)',
  },
  {
    slug: 'personal-loans',
    title: 'Personal Loans',
    tagline: 'Quick disbursal with minimal docs',
    desc: 'Get personal loans with fast approval and minimal documentation. Competitive interest rates tailored to your profile.',
    features: [
      { icon: FaBolt,        label: 'Fast Approval' },
      { icon: FaCheckCircle, label: 'Minimal Documentation' },
      { icon: FaChartLine,   label: 'Competitive Rates' },
      { icon: FaClock,       label: 'Flexible Tenure' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/Layer_20_dpj7hw.png',
    accent: '#7c3aed',
  },
  {
    slug: 'business-loans',
    title: 'Business Loans',
    tagline: 'Fuel your business growth',
    desc: 'Tailored business loan solutions to help you scale, expand, and achieve your entrepreneurial goals with ease.',
    features: [
      { icon: FaMoneyBillWave, label: 'Loan up to ₹70 Lakhs' },
      { icon: FaBolt,          label: 'Fast Approval & Disbursal' },
      { icon: FaCheckCircle,   label: 'High Approval Chances' },
      { icon: FaUniversity,    label: '120+ Bank & NBFC Tie-ups' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986810/Layer_21_rfhylr.png',
    accent: '#d97706',
  },
  {
    slug: 'insurance',
    title: 'Insurance Services',
    tagline: 'Protect what matters most',
    desc: 'Life, health, and vehicle insurance from top providers at the best rates. Comprehensive coverage for you and your family.',
    features: [
      { icon: FaShieldAlt,   label: 'Life Insurance' },
      { icon: FaCheckCircle, label: 'Health Insurance' },
      { icon: FaClock,       label: 'Vehicle Insurance' },
      { icon: FaStar,        label: 'Best Rates' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_23_ebzlts.png',
    accent: '#10b981',
  },
  {
    slug: 'cibil-score',
    title: 'CIBIL Score Check & Repair',
    tagline: 'Know & improve your credit score',
    desc: 'Know your credit score and get expert guidance to improve it for better loan eligibility and financial health.',
    features: [
      { icon: FaBolt,        label: 'Instant Score Check' },
      { icon: FaChartLine,   label: 'Expert Guidance' },
      { icon: FaCheckCircle, label: 'Score Improvement' },
      { icon: FaClock,       label: 'Free Consultation' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986813/Layer_26_nxw11o.png',
    accent: '#f43f5e',
  },
]

const stats = [
  { value: 10000, suffix: '+', label: 'Happy Customers',   Icon: FaUsers },
  { value: 50,    prefix: '₹', suffix: 'Cr+', label: 'Transactions Done', Icon: FaMoneyBillWave },
  { value: 99,    suffix: '%', label: 'Success Rate',      Icon: FaCheckCircle },
  { value: 24,    suffix: '/7', label: 'Support Available', Icon: FaClock },
]

const whyUs = [
  { Icon: FaHandshake,    title: '120+ Bank & NBFC Partnerships', desc: 'Tied up with 120+ banks and NBFCs to bring you the best financial options.' },
  { Icon: FaBolt,         title: 'Instant Processing & Quick Disbursal', desc: 'Transactions completed in under 2 minutes. No waiting, no delays.' },
  { Icon: FaCheckCircle,  title: '100% Transparent Charges',     desc: 'Transparent pricing with zero hidden fees. What you see is what you pay.' },
  { Icon: FaShieldAlt,    title: 'No Hidden Fees Guarantee',     desc: 'We guarantee no surprise charges — ever. Full clarity before every transaction.' },
  { Icon: FaLock,         title: 'Secure & Verified Transactions',desc: 'Bank-grade encryption and secure payment gateways protect every transaction.' },
  { Icon: FaTrophy,       title: 'Expert Financial Assistance',  desc: 'Our trained experts guide you through every step of your financial journey.' },
]

const moreServices = [
  { img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_22_dxp4lv.png', label: 'Aadhaar Services',    desc: 'Aadhaar-based cash withdrawal',      slug: 'aadhaar-withdrawal' },
  { img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986807/Cash_Deposit_iqi1gr.png', label: 'Cash Deposit',   desc: 'Quick & secure cash deposits',       slug: 'cash-deposit' },
  { img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_25_z5scod.png', label: 'Bank Account Opening', desc: 'Zero-hassle account setup',         slug: 'bank-account' },
  { img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/copy_8_khzlf7.png',   label: 'New Credit Cards',    desc: 'Best cards for your profile',       slug: 'new-credit-card' },
]

const testimonials = [
  { name: 'Ravi Kumar',    role: 'Business Owner',        text: 'Got ₹50,000 cash from my credit card in just 10 minutes! MoneySpot is a lifesaver.', rating: 5, avatar: 'https://ui-avatars.com/api/?name=Ravi+Kumar&background=402070&color=fff&size=80&bold=true' },
  { name: 'Priya Sharma',  role: 'Salaried Professional', text: 'Paid my credit card bill instantly. No more late fees. Highly recommend!', rating: 5, avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=c02040&color=fff&size=80&bold=true' },
  { name: 'Mohammed Ali',  role: 'Freelancer',            text: 'DMT service is super fast. Sent money to my family at midnight — worked perfectly!', rating: 5, avatar: 'https://ui-avatars.com/api/?name=Mohammed+Ali&background=1a365d&color=fff&size=80&bold=true' },
  { name: 'Sunita Reddy',  role: 'Homemaker',             text: 'Aadhaar withdrawal saved me when I forgot my ATM card. Amazing service!', rating: 5, avatar: 'https://ui-avatars.com/api/?name=Sunita+Reddy&background=065f46&color=fff&size=80&bold=true' },
]

const googleReviews = [
  { name: 'Arjun Mehta',     rating: 5, time: '2 weeks ago',  text: 'Excellent service! Got instant cash on my credit card within minutes. The staff was very professional and the process was smooth. Highly recommended!', avatar: 'https://ui-avatars.com/api/?name=Arjun+Mehta&background=4285F4&color=fff&size=80&bold=true' },
  { name: 'Deepa Nair',      rating: 5, time: '1 month ago',  text: 'Best fintech service in the area. Paid my HDFC credit card bill instantly. Zero hidden charges. Will definitely use again!', avatar: 'https://ui-avatars.com/api/?name=Deepa+Nair&background=EA4335&color=fff&size=80&bold=true' },
  { name: 'Suresh Babu',     rating: 5, time: '3 weeks ago',  text: 'MoneySpot helped me with a personal loan quickly. Minimal documentation and fast disbursal. Great team!', avatar: 'https://ui-avatars.com/api/?name=Suresh+Babu&background=34A853&color=fff&size=80&bold=true' },
  { name: 'Kavitha Rao',     rating: 5, time: '2 months ago', text: 'Used Aadhaar withdrawal service when I was in an emergency. Super fast and secure. Thank you MoneySpot!', avatar: 'https://ui-avatars.com/api/?name=Kavitha+Rao&background=FBBC05&color=000&size=80&bold=true' },
  { name: 'Rahul Verma',     rating: 5, time: '1 week ago',   text: 'DMT transfer was done in seconds. 24/7 availability is a huge plus. Best money transfer service I have used.', avatar: 'https://ui-avatars.com/api/?name=Rahul+Verma&background=402070&color=fff&size=80&bold=true' },
  { name: 'Anitha Krishnan', rating: 4, time: '5 weeks ago',  text: 'Very reliable service for credit card bill payments. Quick confirmation and digital receipt. Would recommend to everyone.', avatar: 'https://ui-avatars.com/api/?name=Anitha+Krishnan&background=c02040&color=fff&size=80&bold=true' },
]

function Counter({ value, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const steps = 60
        const increment = value / steps
        let current = 0
        const timer = setInterval(() => {
          current += increment
          if (current >= value) { setCount(value); clearInterval(timer) }
          else setCount(Math.floor(current))
        }, 2000 / steps)
      }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

const S = {
  section: {
    background: 'linear-gradient(160deg, #0c0620 0%, #180c38 45%, #2a1050 75%, #180c38 100%)',
    position: 'relative',
    overflow: 'hidden',
    padding: '100px 0 60px',
  },
  header: {
    textAlign: 'center',
    padding: '0 24px 72px',
    position: 'relative',
    zIndex: 1,
  },
  pill: {
    display: 'inline-block',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    padding: '6px 16px',
    borderRadius: 999,
    background: 'rgba(212,175,55,0.12)',
    color: '#d4af37',
    border: '1px solid rgba(212,175,55,0.3)',
    marginBottom: 16,
  },
  h2: {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: 900,
    color: '#fff',
    letterSpacing: '-0.03em',
    margin: '0 0 12px',
  },
  headerSub: {
    fontSize: '1.05rem',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
  },
  card: {
    display: 'grid',
    gridTemplateColumns: '45% 55%',
    minHeight: 480,
    position: 'relative',
    zIndex: 1,
    margin: '0 48px',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    border: '1px solid rgba(255,255,255,0.07)',
  },
  imgPanel: {
    position: 'relative',
    overflow: 'hidden',
    minHeight: 380,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(30,12,70,0.9) 0%, rgba(20,8,50,0.95) 100%)',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    objectPosition: 'center',
    display: 'block',
    padding: '32px',
    boxSizing: 'border-box',
    transition: 'transform 0.7s ease',
    position: 'absolute',
    inset: 0,
  },
  imgOverlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    pointerEvents: 'none',
  },
  cardNum: {
    position: 'absolute',
    bottom: 24,
    fontSize: '5rem',
    fontWeight: 900,
    lineHeight: 1,
    color: 'rgba(255,255,255,0.07)',
    letterSpacing: '-0.04em',
    zIndex: 2,
    pointerEvents: 'none',
    userSelect: 'none',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '60px 56px',
    background: 'rgba(255,255,255,0.025)',
    backdropFilter: 'blur(16px)',
    transition: 'background 0.3s ease',
  },
  tagline: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1.8px',
    color: '#d4af37',
    margin: '0 0 10px',
  },
  title: {
    fontSize: 'clamp(1.6rem, 2.2vw, 2.2rem)',
    fontWeight: 900,
    color: '#fff',
    letterSpacing: '-0.025em',
    lineHeight: 1.15,
    margin: '0 0 14px',
  },
  desc: {
    fontSize: '0.97rem',
    color: 'rgba(255,255,255,0.62)',
    lineHeight: 1.8,
    margin: '0 0 22px',
    maxWidth: 420,
  },
  features: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 20px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.78)',
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 8,
  },
  check: {
    color: '#d4af37',
    fontSize: 10,
    flexShrink: 0,
  },
  cats: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  cat: {
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 999,
    background: 'rgba(212,175,55,0.08)',
    color: '#f0cc55',
    border: '1px solid rgba(212,175,55,0.18)',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: '#34d399',
    background: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.22)',
    padding: '7px 14px',
    borderRadius: 8,
    marginBottom: 20,
  },
  actions: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 8,
  },
  btnPrimary: {
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 14,
    fontWeight: 700,
    padding: '12px 26px',
    borderRadius: 10,
    background: 'linear-gradient(135deg, #d4af37 0%, #f0cc55 100%)',
    color: '#0c0620',
    boxShadow: '0 6px 24px rgba(212,175,55,0.28)',
    transition: 'all 0.25s ease',
    letterSpacing: '0.2px',
  },
  btnGhost: {
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 14,
    fontWeight: 600,
    padding: '12px 26px',
    borderRadius: 10,
    border: '1.5px solid rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.85)',
    background: 'transparent',
    transition: 'all 0.25s ease',
  },
}

export default function Home() {
  const heroRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-badge-anim', { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' })
      gsap.fromTo('.hero-title-anim', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.2, ease: 'power4.out' })
      gsap.fromTo('.hero-sub-anim', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.45, ease: 'power3.out' })
      gsap.fromTo('.hero-btns-anim', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.65, ease: 'power3.out' })
      gsap.fromTo('.hero-trust-anim', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.85, ease: 'power3.out' })
      gsap.fromTo('.hero-img-anim', { opacity: 0, scale: 1.06, x: 80 }, { opacity: 1, scale: 1, x: 0, duration: 1.1, delay: 0.3, ease: 'power3.out' })
      gsap.to('.hero-particle', {
        y: 'random(-30,30)', x: 'random(-20,20)',
        duration: 'random(2,4)', repeat: -1, yoyo: true,
        ease: 'sine.inOut', stagger: { each: 0.3, from: 'random' },
      })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.stat-card', { opacity: 1, y: 0, scale: 1 })

      gsap.utils.toArray('.product-card-anim').forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0, y: 45 }, { opacity: 1, y: 0, duration: 0.65, delay: i * 0.04, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 96%', once: true } })
      })

      gsap.fromTo('.why-card', { opacity: 0, y: 35, scale: 0.93 }, { opacity: 1, y: 0, scale: 1, stagger: 0.07, duration: 0.55, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.why-grid', start: 'top 93%', once: true } })
      gsap.fromTo('.svc-card', { opacity: 0, y: 25 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.45, ease: 'power2.out', scrollTrigger: { trigger: '.services-grid', start: 'top 93%', once: true } })
      gsap.fromTo('.testi-card', { opacity: 0, y: 28 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out', scrollTrigger: { trigger: '.testi-grid', start: 'top 93%', once: true } })
      gsap.utils.toArray('.section-title').forEach(el => {
        gsap.fromTo(el, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 96%', once: true } })
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="home">

      {/* ═══ HERO ═══ */}
      <section className="hero" ref={heroRef}>
        <div className="hero-grid-mesh" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-particles-wrap">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="hero-particle" style={{
              left: `${5 + Math.random() * 90}%`,
              top: `${5 + Math.random() * 90}%`,
              width: `${3 + Math.random() * 7}px`,
              height: `${3 + Math.random() * 7}px`,
              opacity: 0.12 + Math.random() * 0.22,
            }} />
          ))}
        </div>

        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-badge-anim hero-badge">
              <FaRocket size={12} /> Authorised Fintech Service Provider
            </div>
            <h1 className="hero-title-anim">
              One Spot For All Your<br />
              <span className="gradient-text">Financial Needs</span>
            </h1>
            <p className="hero-sub-anim">
              India's trusted <strong>Business Correspondent & Financial Service Partner</strong> —
              connecting you with <strong>120+ Banks & NBFCs</strong> for instant cash,
              bill payments, money transfers, loans, insurance & more. All under one roof, 24×7.
            </p>
            <div className="hero-btns-anim hero-btns">
              <Link to="/what-we-do" className="btn-hero-primary">
                Explore Services <FaArrowRight size={13} />
              </Link>
              <Link to="/contact" className="btn-hero-outline">Contact Us</Link>
            </div>
            <div className="hero-trust-anim hero-feature-strip">
              <div className="hero-feature-item">
                <div className="hero-feature-icon"><FaBolt size={16} /></div>
                <div className="hero-feature-text">
                  <strong>Instant Transfer</strong>
                  <span>Cash in under 2 mins</span>
                </div>
              </div>
              <div className="hero-feature-divider" />
              <div className="hero-feature-item">
                <div className="hero-feature-icon"><FaLock size={16} /></div>
                <div className="hero-feature-text">
                  <strong>100% Secure</strong>
                  <span>Bank-grade encryption</span>
                </div>
              </div>
              <div className="hero-feature-divider" />
              <div className="hero-feature-item">
                <div className="hero-feature-icon"><FaUsers size={16} /></div>
                <div className="hero-feature-text">
                  <strong>10,000+ Customers</strong>
                  <span>Trusted across India</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-img-anim hero-visual">
            <div className="hero-ring" />
            <div className="hero-ring hero-ring-2" />

            {/* ── Business Banner ── */}
            <div className="hero-banner-card">

              {/* Top brand strip */}
              <div className="hbc-brand">
                <div className="hbc-brand-dot" />
                <span className="hbc-brand-name">MoneySpot</span>
                <span className="hbc-brand-tag">Fintech Services</span>
              </div>

              {/* Central logo */}
              <div className="hbc-center">
                <div className="hbc-logo-ring hbc-ring-1" />
                <div className="hbc-logo-ring hbc-ring-2" />
                <div className="hbc-logo-wrap">
                  <img src={bannerImg} alt="MoneySpot" />
                </div>
              </div>

              {/* Service pills grid */}
              <div className="hbc-services">
                {[
                  { Icon: FaCreditCard,   label: 'Spot Cash',       color: '#2b77e6' },
                  { Icon: FaBolt,         label: 'Bill Payment',    color: '#10b981' },
                  { Icon: FaExchangeAlt,  label: 'Money Transfer',  color: '#8b5cf6' },
                  { Icon: FaMoneyBillWave,label: 'Personal Loans',  color: '#7c3aed' },
                  { Icon: FaBuilding,     label: 'Business Loans',  color: '#d97706' },
                  { Icon: FaShieldAlt,    label: 'Insurance',       color: '#10b981' },
                  { Icon: FaChartBar,     label: 'CIBIL Score',     color: '#f43f5e' },
                  { Icon: FaFingerprint,  label: 'Aadhaar Cash',    color: '#f59e0b' },
                  { Icon: FaUniversity,   label: 'Cash Deposit',    color: '#2b77e6' },
                ].map(({ Icon, label, color }) => (
                  <div className="hbc-svc" key={label} style={{ '--svc-color': color }}>
                    <div className="hbc-svc-icon"><Icon size={13} /></div>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* Bottom trust bar */}
              <div className="hbc-trust">
                <span><FaLock size={10} /> KYC Verified</span>
                <span><FaBolt size={10} /> Instant</span>
                <span><FaUsers size={10} /> 10K+ Customers</span>
                <span><FaTrophy size={10} /> 120+ Partners</span>
              </div>

            </div>

            {/* Advantage chips */}
            <div className="hero-adv hero-adv-tl"><span className="hero-adv-icon"><FaLock size={11} /></span><span>100% Secure</span></div>
            <div className="hero-adv hero-adv-tr"><span className="hero-adv-icon"><FaBolt size={11} /></span><span>Instant Cash</span></div>
            <div className="hero-adv hero-adv-ml"><span className="hero-adv-icon"><FaUsers size={11} /></span><span>10K+ Customers</span></div>
            <div className="hero-adv hero-adv-mr"><span className="hero-adv-icon"><FaTrophy size={11} /></span><span>120+ Partners</span></div>
            <div className="hero-adv hero-adv-bl"><span className="hero-adv-icon"><FaClock size={11} /></span><span>24/7 Support</span></div>
            <div className="hero-adv hero-adv-br"><span className="hero-adv-icon"><FaShieldAlt size={11} /></span><span>KYC Verified</span></div>
          </div>
        </div>

        <button className="hero-scroll-down" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} aria-label="Scroll down">
          <span className="scroll-label">Scroll</span>
          <span className="scroll-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div className="stat-item" key={s.label}>
              {i !== 0 && <div className="stat-divider" />}
              <div className="stat-icon"><s.Icon size={26} /></div>
              <div className="stat-value">
                <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ PRODUCTS ═══ */}
      <section style={S.section}>
        {/* header */}
        <div style={S.header}>
          <span style={S.pill}>Our Products</span>
          <h2 style={S.h2}>Powerful Financial Tools</h2>
          <p style={S.headerSub}>Designed for speed, security, and your convenience</p>
        </div>

        {/* cards */}
        {products.map((p, i) => {
          const rev = i % 2 !== 0
          return (
            <article key={p.slug} className="product-card-anim" style={S.card}>

              {/* image */}
              <div style={{
                ...S.imgPanel,
                order: rev ? 2 : 1,
                background: p.img.includes('unsplash')
                  ? 'transparent'
                  : 'linear-gradient(135deg, rgba(20,8,55,0.95) 0%, rgba(35,12,80,0.98) 100%)',
              }}>
                <img
                  src={p.img}
                  alt={p.title}
                  loading="lazy"
                  style={{
                    ...S.img,
                    objectFit: p.img.includes('unsplash') ? 'cover' : 'contain',
                    padding: p.img.includes('unsplash') ? 0 : '28px',
                  }}
                />
                <div style={{ ...S.imgOverlay, background: rev
                  ? 'linear-gradient(to left, rgba(12,6,32,0.1) 0%, transparent 40%, rgba(12,6,32,0.45) 100%)'
                  : 'linear-gradient(to right, rgba(12,6,32,0.1) 0%, transparent 40%, rgba(12,6,32,0.45) 100%)'
                }} />
                <span style={{ ...S.cardNum, [rev ? 'left' : 'right']: 28 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              {/* body */}
              <div style={{ ...S.body, order: rev ? 1 : 2,
                borderLeft:  rev ? 'none' : '1px solid rgba(255,255,255,0.07)',
                borderRight: rev ? '1px solid rgba(255,255,255,0.07)' : 'none',
              }}>
                <p style={S.tagline}>{p.tagline}</p>
                <h3 style={S.title}>{p.title}</h3>
                <p style={S.desc}>{p.desc}</p>

                <ul style={S.features}>
                  {p.features.map(f => (
                    <li key={f.label} style={S.featureItem}>
                      <f.icon size={13} style={S.check} />{f.label}
                    </li>
                  ))}
                </ul>

                {p.categories && (
                  <div style={S.cats}>
                    {p.categories.map(c => (
                      <span key={c.label} style={{ ...S.cat, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <c.icon size={11} />{c.label}
                      </span>
                    ))}
                  </div>
                )}

                {p.badge && (
                  <div style={S.badge}>
                    <FaShieldAlt size={12} style={{ marginRight: 6 }} />{p.badge}
                  </div>
                )}

                <div style={S.actions}>
                  <Link to={`/product/${p.slug}`} style={S.btnPrimary}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(212,175,55,0.45)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(212,175,55,0.28)' }}
                  >
                    Learn More <FaArrowRight size={12} style={{ marginLeft: 6 }} />
                  </Link>
                  <Link to="/contact" style={S.btnGhost}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'none' }}
                  >
                    Contact Now
                  </Link>
                </div>
              </div>

            </article>
          )
        })}
      </section>

      {/* ═══ WHY US ═══ */}
      <section className="why-section">
        <div className="why-orb" />
        <div className="section-title light">
          <div className="section-pill light">Why MoneySpot?</div>
          <h2>Why Choose Us?</h2>
          <p>Your Bill. Our Responsibility.</p>
        </div>
        <div className="why-grid">
          {whyUs.map(w => (
            <div className="why-card" key={w.title}>
              <div className="why-icon"><w.Icon size={26} /></div>
              <h4>{w.title}</h4>
              <p>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ MORE SERVICES ═══ */}
      <section className="services-section">
        <div className="section-title">
          <div className="section-pill">More Services</div>
          <h2>Complete Financial Ecosystem</h2>
          <p>Everything you need under one roof</p>
        </div>
        <div className="services-grid">
          {moreServices.map(s => (
            <Link to={`/product/${s.slug}`} className="svc-card" key={s.label}>
              <div className="svc-img-wrap">
                <img src={s.img} alt={s.label} />
              </div>
              <h4>{s.label}</h4>
              <p>{s.desc}</p>
            </Link>
          ))}
        </div>
        <div className="services-cta">
          <Link to="/what-we-do" className="btn-explore">
            Explore All Services <FaArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="testi-section">
        <div className="section-title">
          <div className="section-pill">Testimonials</div>
          <h2>What Our Customers Say</h2>
          <p>Real stories from real people</p>
        </div>
        <div className="testi-grid">
          {testimonials.map(t => (
            <div className="testi-card" key={t.name}>
              <div className="testi-stars">
                {[...Array(t.rating)].map((_, i) => <FaStar key={i} size={14} />)}
              </div>
              <p className="testi-text">"{t.text}"</p>
              <div className="testi-author">
                <div className="testi-avatar">
                  <img src={t.avatar} alt={t.name} />
                </div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ GOOGLE REVIEWS ═══ */}
      <section className="google-reviews-section">
        <div className="section-title">
          <div className="section-pill">Google Reviews</div>
          <h2>Rated on Google</h2>
          <p>See what people are saying about us</p>
        </div>
        <div className="google-rating-bar">
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="google-logo" />
          <div className="google-score">
            <span className="google-score-num">4.9</span>
            <div className="google-score-stars">
              {[...Array(5)].map((_, i) => <FaStar key={i} size={18} />)}
            </div>
            <span className="google-score-count">Based on 200+ reviews</span>
          </div>
        </div>
        <div className="google-reviews-grid">
          {googleReviews.map(r => (
            <div className="google-review-card" key={r.name}>
              <div className="gr-header">
                <img src={r.avatar} alt={r.name} className="gr-avatar" />
                <div className="gr-meta">
                  <strong>{r.name}</strong>
                  <span>{r.time}</span>
                </div>
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="gr-google-logo" />
              </div>
              <div className="gr-stars">
                {[...Array(r.rating)].map((_, i) => <FaStar key={i} size={13} />)}
              </div>
              <p className="gr-text">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="cta-section">
        <div className="cta-particles">
          {[...Array(12)].map((_, i) => <div key={i} className="cta-particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
          }} />)}
        </div>
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join 10,000+ satisfied customers. Fast, secure, and always available.</p>
          <div className="cta-btns">
            <Link to="/login/customer" className="btn-cta-primary">Get Started Now</Link>
            <Link to="/contact" className="btn-cta-outline">Talk to Us</Link>
          </div>
        </div>
      </section>

    </div>
  )
}
