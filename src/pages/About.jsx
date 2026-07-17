import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  FaCreditCard, FaExchangeAlt, FaShieldAlt, FaHome,
  FaRocket, FaGlobe, FaLock, FaBolt, FaUserCheck, FaChartBar, FaArrowRight
} from 'react-icons/fa'
import './About.css'

gsap.registerPlugin(ScrollTrigger)

const stats = [
  { value: '5,000+', label: 'Happy Customers' },
  { value: '100+',    label: 'Bank Partners' },
  { value: '₹30Cr+',  label: 'Transactions' },
  { value: '24/7',    label: 'Support' },
]

const values = [
  { Icon: FaLock,      title: 'Trust & Transparency',    desc: 'No hidden surprises. Honest services always.' },
  { Icon: FaBolt,      title: 'Speed & Efficiency',      desc: 'Fast processing with minimal delays.' },
  { Icon: FaUserCheck, title: 'Customer First',          desc: 'Your satisfaction is our absolute priority.' },
  { Icon: FaChartBar,  title: 'Professional Excellence', desc: 'Expert team delivering reliable solutions.' },
]

export default function About() {
  useEffect(() => {
    // Hero Animations
    gsap.fromTo('.a-hero-content > *', 
      { opacity: 0, x: -50 }, 
      { opacity: 1, x: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
    )
    gsap.fromTo('.a-hero-stat', 
      { opacity: 0, scale: 0.8, y: 30 }, 
      { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.4, ease: 'back.out(1.5)' }
    )

    // ZigZag Scroll Animations
    const ctx = gsap.context(() => {
      // Left-to-right sections
      gsap.utils.toArray('.a-zigzag-left').forEach(el => {
        gsap.fromTo(el, 
          { opacity: 0, x: -80 },
          { opacity: 1, x: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 80%' } }
        )
      })
      // Right-to-left sections
      gsap.utils.toArray('.a-zigzag-right').forEach(el => {
        gsap.fromTo(el, 
          { opacity: 0, x: 80 },
          { opacity: 1, x: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 80%' } }
        )
      })

      // Values Stagger
      gsap.fromTo('.a-value-card',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'back.out(1.2)', scrollTrigger: { trigger: '.a-values-grid', start: 'top 75%' } }
      )
    })
    
    // Floating Graphic Animation
    gsap.to('.a-graphic-icon', {
      y: 'random(-15, 15)',
      x: 'random(-15, 15)',
      rotation: 'random(-5, 5)',
      duration: 'random(3, 5)',
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="about-zz">
      
      {/* Background Elements */}
      <div className="a-bg-grid" />
      <div className="a-bg-glow glow-top" />
      <div className="a-bg-glow glow-mid" />

      {/* Split Hero Section */}
      <section className="a-hero-split">
        <div className="a-hero-content">
          <div className="a-hero-badge">About One Step</div>
          <h1 className="a-hero-title">
            Your Trusted<br/>
            <span className="a-text-gold">Financial Partner</span>
          </h1>
          <p className="a-hero-sub">
            We are committed to simplifying financial services for individuals and businesses across India. Connecting you with 120+ Banks & NBFCs for fast, transparent solutions.
          </p>
          <div className="a-hero-tags">
            <span className="a-tag"><FaCreditCard/> Credit Cards</span>
            <span className="a-tag"><FaExchangeAlt/> Transfers</span>
            <span className="a-tag"><FaShieldAlt/> Insurance</span>
          </div>
        </div>
        
        <div className="a-hero-visual">
          <div className="a-stats-grid">
            {stats.map(s => (
              <div className="a-hero-stat" key={s.label}>
                <div className="a-stat-value">{s.value}</div>
                <div className="a-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zig-Zag 1: Mission */}
      <section className="a-zigzag-section">
        <div className="a-zigzag-container">
          <div className="a-zigzag-text a-zigzag-left">
            <div className="a-section-label">Our Mission</div>
            <h2>Simplify, Access,<br/>and <span className="a-text-gold">Transact.</span></h2>
            <p>Our mission is to make financial services simple, accessible, and transparent for every customer. We break down the complex barriers of banking to provide you with seamless solutions.</p>
            <ul className="a-zigzag-list">
              <li><div className="a-list-dot"/> Provide quick and hassle-free solutions</li>
              <li><div className="a-list-dot"/> Ensure safe & secure transactions</li>
              <li><div className="a-list-dot"/> Educate customers for better decisions</li>
            </ul>
          </div>
          <div className="a-zigzag-visual a-zigzag-right">
            <div className="a-graphic-circle">
              <div className="a-graphic-ring ring-1" />
              <div className="a-graphic-ring ring-2" />
              <FaRocket className="a-graphic-icon" />
            </div>
          </div>
        </div>
      </section>

      {/* Zig-Zag 2: Vision */}
      <section className="a-zigzag-section reverse">
        <div className="a-zigzag-container">
          <div className="a-zigzag-text a-zigzag-right">
            <div className="a-section-label">Our Vision</div>
            <h2>India's Most<br/><span className="a-text-gold">Trusted Network.</span></h2>
            <p>To become India's most trusted and customer-friendly financial service network. We aim to set the gold standard for how financial services are delivered to the everyday consumer.</p>
            <ul className="a-zigzag-list">
              <li><div className="a-list-dot"/> Expand across multiple locations</li>
              <li><div className="a-list-dot"/> Empower customers with financial growth</li>
              <li><div className="a-list-dot"/> Become the first choice for every need</li>
            </ul>
          </div>
          <div className="a-zigzag-visual a-zigzag-left">
            <div className="a-graphic-circle">
              <div className="a-graphic-ring ring-1" />
              <div className="a-graphic-ring ring-2" />
              <FaGlobe className="a-graphic-icon" />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="a-values-section">
        <div className="a-values-header">
          <h2>Core <span className="a-text-gold">Values</span></h2>
          <p>The principles that guide every single service we deliver.</p>
        </div>
        <div className="a-values-grid">
          {values.map(v => (
            <div className="a-value-card" key={v.title}>
              <div className="a-value-icon"><v.Icon /></div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="a-cta-section">
        <div className="a-cta-box">
          <h2>Experience the Difference</h2>
          <p>Join the thousands who trust 1 Step Finance Care.</p>
          <Link to="/contact" className="a-btn-cta">
            Contact Us Today <FaArrowRight />
          </Link>
        </div>
      </section>

    </div>
  )
}
