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
  { value: '5,000+', label: 'Delighted Clients' },
  { value: '100+',    label: 'Banking Affiliates' },
  { value: '₹30Cr+',  label: 'Funds Processed' },
  { value: '24/7',    label: 'Helpdesk' },
]

const values = [
  { Icon: FaLock,      title: 'Reliability & Openness',    desc: 'Zero concealed elements. Consistently genuine operations.' },
  { Icon: FaBolt,      title: 'Pace & Effectiveness',      desc: 'Rapid execution minimizing any wait times.' },
  { Icon: FaUserCheck, title: 'Client-Centric',          desc: 'Your contentment remains our principal focus.' },
  { Icon: FaChartBar,  title: 'Industry Competence', desc: 'Skilled professionals providing dependable outcomes.' },
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
          <div className="a-hero-badge">Discover One Step</div>
          <h1 className="a-hero-title">
            Your Reliable<br/>
            <span className="a-text-gold">Financial Ally</span>
          </h1>
          <p className="a-hero-sub">
            We are dedicated to streamlining monetary solutions for individuals and enterprises nationwide. Bridging the gap with over 120 banking partners to offer swift and clear pathways.
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
            <div className="a-section-label">Our Core Objective</div>
            <h2>Streamline, Connect,<br/>and <span className="a-text-gold">Execute.</span></h2>
            <p>Our primary goal is to render monetary operations straightforward, reachable, and clear for all clients. We dismantle traditional banking obstacles to deliver frictionless experiences.</p>
            <ul className="a-zigzag-list">
              <li><div className="a-list-dot"/> Deliver rapid and effortless outcomes</li>
              <li><div className="a-list-dot"/> Guarantee protected and verified exchanges</li>
              <li><div className="a-list-dot"/> Inform clients to foster smarter choices</li>
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
            <div className="a-section-label">Our Future Perspective</div>
            <h2>The Nation’s Most<br/><span className="a-text-gold">Reliable Platform.</span></h2>
            <p>To evolve into the country’s most dependable and user-centric financial network. We strive to establish the benchmark for delivering monetary support to everyday users.</p>
            <ul className="a-zigzag-list">
              <li><div className="a-list-dot"/> Broaden our presence across diverse regions</li>
              <li><div className="a-list-dot"/> Enable clients to achieve economic advancement</li>
              <li><div className="a-list-dot"/> Emerge as the primary preference for all requirements</li>
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
          <h2>Fundamental <span className="a-text-gold">Principles</span></h2>
          <p>The foundational beliefs directing all the services we provide.</p>
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
          <h2>Feel the Distinction</h2>
          <p>Become part of the multitudes relying on 1 Step Finance Care.</p>
          <Link to="/contact" className="a-btn-cta">
            Reach Out Now <FaArrowRight />
          </Link>
        </div>
      </section>

    </div>
  )
}
