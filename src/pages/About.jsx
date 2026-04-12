import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  FaTrophy, FaCreditCard, FaExchangeAlt, FaShieldAlt, FaHome,
  FaRocket, FaLock, FaLightbulb, FaHandshake,
  FaGlobe, FaChartLine, FaMedal, FaHeart,
  FaBolt, FaUserCheck, FaChartBar, FaSyncAlt,
  FaArrowRight, FaCheckCircle, FaMapMarkerAlt
} from 'react-icons/fa'
import './About.css'

gsap.registerPlugin(ScrollTrigger)

const highlights = [
  { value: '10,000+', label: 'Happy Customers' },
  { value: '120+',    label: 'Bank & NBFC Partners' },
  { value: '₹50Cr+',  label: 'Transactions Processed' },
  { value: '24/7',    label: 'Customer Support' },
]

const missionPoints = [
  { Icon: FaRocket,    text: 'Provide quick and hassle-free financial solutions' },
  { Icon: FaLock,      text: 'Ensure safe & secure transactions with full trust' },
  { Icon: FaLightbulb, text: 'Educate customers for better financial decisions' },
  { Icon: FaHandshake, text: 'Build long-term relationships through honesty & support' },
]

const visionPoints = [
  { Icon: FaGlobe,     text: 'Expand across multiple locations' },
  { Icon: FaChartLine, text: 'Empower customers with financial growth' },
  { Icon: FaMedal,     text: 'Set new standards in service quality & trust' },
  { Icon: FaHeart,     text: 'Become the first choice for every financial need' },
]

const values = [
  { Icon: FaLock,      title: 'Trust & Transparency',          desc: 'We believe in clear communication and honest services — no hidden surprises.' },
  { Icon: FaBolt,      title: 'Speed & Efficiency',            desc: 'Fast processing with minimal delays to save your valuable time.' },
  { Icon: FaUserCheck, title: 'Customer First Approach',       desc: 'Every service is designed keeping customer satisfaction as our top priority.' },
  { Icon: FaShieldAlt, title: 'Security & Compliance',         desc: 'Strict KYC & safety protocols to protect every transaction.' },
  { Icon: FaChartBar,  title: 'Professional Excellence',       desc: 'Experienced team delivering high-quality and reliable financial solutions.' },
  { Icon: FaSyncAlt,   title: 'Continuous Growth & Innovation',desc: 'We constantly upgrade our services to meet modern financial needs.' },
]

export default function About() {
  const heroRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.about-hero-badge', { opacity: 0, y: -30, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.7)' })
      gsap.fromTo('.about-hero-title', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.2, ease: 'power4.out' })
      gsap.fromTo('.about-hero-sub',   { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.4, ease: 'power3.out' })
      gsap.fromTo('.about-hero-tags .about-tag', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.6, ease: 'back.out(1.4)' })
      gsap.to('.about-orb', { y: 'random(-30,30)', x: 'random(-20,20)', duration: 'random(4,8)', repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: { each: 0.5, from: 'random' } })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.highlight', { opacity: 0, y: 40, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.about-highlights', start: 'top 85%' } })
      gsap.fromTo('.about-story-text', { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.about-story-text', start: 'top 82%' } })
      gsap.fromTo('.mission-point', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.mission-points', start: 'top 85%' } })
      gsap.fromTo('.vision-point', { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.vision-points', start: 'top 85%' } })
      gsap.fromTo('.value-card', { opacity: 0, y: 50, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.3)', scrollTrigger: { trigger: '.values-grid', start: 'top 82%' } })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="about">

      {/* ── Hero ── */}
      <section className="about-hero" ref={heroRef}>
        <div className="about-hero-bg">
          <div className="about-orb about-orb-1" />
          <div className="about-orb about-orb-2" />
          <div className="about-orb about-orb-3" />
          <div className="about-grid-lines" />
        </div>
        <div className="about-hero-inner">
          <div className="about-hero-badge"><FaTrophy size={13} /> Trusted Financial Partner</div>
          <h1 className="about-hero-title">
            Money Spot<br />
            <span className="about-gold-text">Fintech Services</span>
          </h1>
          <p className="about-hero-sub">
            At Money Spot, we are committed to simplifying financial services for individuals and businesses across India.
            We operate as a trusted <strong>Business Correspondent & Financial Service Partner</strong>, connecting customers
            with <strong>120+ Banks & NBFCs</strong> to deliver fast, transparent, and reliable solutions.
          </p>
          <div className="about-hero-tags">
            {[
              { Icon: FaCreditCard,   label: 'Credit Card Services to Loans' },
              { Icon: FaExchangeAlt,  label: 'Instant Money Transfers' },
              { Icon: FaShieldAlt,    label: 'Insurance & Financial Support' },
              { Icon: FaHome,         label: 'One Roof for All Needs' },
            ].map(({ Icon, label }) => (
              <div className="about-tag" key={label}>
                <Icon size={13} /> {label}
              </div>
            ))}
          </div>
          <div className="about-hero-quote">
            <span>"One Spot for All Your Financial Needs"</span>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="about-stats-bar">
        <div className="about-highlights">
          {highlights.map(h => (
            <div className="highlight" key={h.label}>
              <strong>{h.value}</strong>
              <span>{h.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mission & Vision ── */}
      <section className="about-mv-section">
        <div className="about-mv-inner">

          {/* Mission */}
          <div className="about-mv-card mission-card">
            <div className="about-mv-icon-wrap mission-icon">
              <FaRocket size={28} />
            </div>
            <h2>Our Mission</h2>
            <p className="about-mv-lead">
              Our mission is to make financial services <strong>simple, accessible, and transparent</strong> for every customer.
            </p>
            <ul className="mission-points">
              {missionPoints.map(({ Icon, text }) => (
                <li key={text} className="mission-point">
                  <span className="mv-point-icon"><Icon size={15} /></span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Vision */}
          <div className="about-mv-card vision-card">
            <div className="about-mv-icon-wrap vision-icon">
              <FaGlobe size={28} />
            </div>
            <h2>Our Vision</h2>
            <p className="about-mv-lead">
              To become <strong>India's most trusted and customer-friendly</strong> financial service network, delivering innovative, reliable, and transparent fintech solutions.
            </p>
            <ul className="vision-points">
              {visionPoints.map(({ Icon, text }) => (
                <li key={text} className="vision-point">
                  <span className="mv-point-icon"><Icon size={15} /></span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="about-values-section">
        <div className="about-values-inner">
          <div className="about-section-header">
            <div className="about-pill">Core Values</div>
            <h2>What We Stand For</h2>
            <p>The principles that guide every service we deliver</p>
          </div>
          <div className="values-grid">
            {values.map(v => (
              <div className="value-card" key={v.title}>
                <div className="value-icon-wrap">
                  <v.Icon size={22} />
                </div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta">
        <div className="about-cta-glow" />
        <div className="about-cta-inner">
          <h2>Ready to Experience the Difference?</h2>
          <p>Join 10,000+ satisfied customers who trust MoneySpot for their financial needs.</p>
          <div className="about-cta-btns">
            <Link to="/contact" className="btn-about-primary">Get in Touch <FaArrowRight size={13} /></Link>
            <Link to="/what-we-do" className="btn-about-outline">Explore Services <FaArrowRight size={13} /></Link>
          </div>
        </div>
      </section>

    </div>
  )
}
