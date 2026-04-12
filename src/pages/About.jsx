import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './About.css'

gsap.registerPlugin(ScrollTrigger)

const values = [
  { icon: '⚡', title: 'Speed', desc: 'Transactions completed in minutes, not days. No waiting, no delays.' },
  { icon: '🔒', title: 'Security', desc: '100% secure and encrypted financial operations with bank-grade protection.' },
  { icon: '🤝', title: 'Trust', desc: 'Transparent processes with zero hidden charges. What you see is what you pay.' },
  { icon: '🌐', title: 'Accessibility', desc: 'Services available 24×7 across all platforms, anytime anywhere.' },
]

const highlights = [
  { value: '10,000+', label: 'Customers Served' },
  { value: '₹50Cr+', label: 'Transactions Processed' },
  { value: '5+', label: 'Years of Experience' },
  { value: '24/7', label: 'Customer Support' },
]

export default function About() {
  const heroRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.about-hero-badge',
        { opacity: 0, y: -30, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.7)' })
      gsap.fromTo('.about-hero h1',
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.2, ease: 'power4.out' })
      gsap.fromTo('.about-hero p',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, delay: 0.45, ease: 'power3.out' })
      gsap.to('.about-particle', {
        y: 'random(-25,25)', x: 'random(-15,15)',
        duration: 'random(2,4)', repeat: -1, yoyo: true,
        ease: 'sine.inOut', stagger: { each: 0.4, from: 'random' },
      })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.about-text',
        { opacity: 0, x: -60 },
        { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.about-text', start: 'top 82%' } })
      gsap.fromTo('.highlight',
        { opacity: 0, y: 50, scale: 0.85 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(1.4)',
          scrollTrigger: { trigger: '.about-highlights', start: 'top 82%' } })
      gsap.fromTo('.value-card',
        { opacity: 0, y: 60, rotateX: 15 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '.values-grid', start: 'top 82%' } })
      gsap.fromTo('.mission-inner',
        { opacity: 0, scale: 0.9, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: 'back.out(1.3)',
          scrollTrigger: { trigger: '.mission-inner', start: 'top 82%' } })
      gsap.fromTo('.about-cta-strip h3, .about-cta-strip p, .about-cta-btns',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: '.about-cta-strip', start: 'top 85%' } })
    })
    return () => ctx.revert()
  }, [])

  const particles = [
    { left: '10%', top: '20%', w: 6, h: 6, delay: 0 },
    { left: '85%', top: '15%', w: 4, h: 4, delay: 0.5 },
    { left: '70%', top: '70%', w: 8, h: 8, delay: 1 },
    { left: '20%', top: '75%', w: 5, h: 5, delay: 1.5 },
    { left: '50%', top: '40%', w: 3, h: 3, delay: 0.8 },
  ]

  return (
    <div className="about">

      {/* ── Hero ── */}
      <section className="about-hero" ref={heroRef}>
        <div className="about-hero-particles">
          {particles.map((p, i) => (
            <div key={i} className="about-particle" style={{
              left: p.left, top: p.top,
              width: p.w, height: p.h,
              animationDelay: `${p.delay}s`,
            }} />
          ))}
        </div>
        <div className="about-hero-content">
          <div className="about-hero-badge">🏆 Trusted Financial Partner</div>
          <h1>About <span className="brand-gradient">MoneySpot</span></h1>
          <p>Empowering individuals and businesses with fast, reliable, and transparent financial services since day one.</p>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="about-section">
        <div className="about-story">
          <div className="about-text">
            <h2>Our Story</h2>
            <p>MoneySpot was founded with a single mission — to make financial services accessible, fast, and transparent for everyone. We understand that money matters are time-sensitive, and delays can be costly.</p>
            <p>From converting credit card limits to instant cash, to helping customers pay bills on time and transfer money in seconds, we've built a platform that puts your financial needs first.</p>
            <p>With a growing network of trusted partners and a dedicated team, MoneySpot has served thousands of customers across Hyderabad and beyond.</p>
          </div>
          <div className="about-highlights">
            {highlights.map(h => (
              <div className="highlight" key={h.label}>
                <strong>{h.value}</strong>
                <span>{h.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="about-values-section">
        <h2>Our Core Values</h2>
        <div className="values-grid">
          {values.map(v => (
            <div className="value-card" key={v.title}>
              <span className="value-card-icon">{v.icon}</span>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="about-mission">
        <div className="mission-inner">
          <h2>Our Mission</h2>
          <p>To be the most trusted financial services partner — delivering speed, security, and simplicity in every transaction, for every customer, every single time.</p>
        </div>
      </section>

      {/* ── CTA Strip ── */}
      <section className="about-cta-strip">
        <h3>Ready to Experience the Difference?</h3>
        <p>Join 10,000+ satisfied customers who trust MoneySpot for their financial needs.</p>
        <div className="about-cta-btns">
          <Link to="/contact" className="btn-about-primary">Get in Touch</Link>
          <Link to="/what-we-do" className="btn-about-outline">Explore Services →</Link>
        </div>
      </section>

    </div>
  )
}
