import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  FaBriefcase, FaGraduationCap, FaHeartbeat, FaMoneyBillWave, 
  FaRocket, FaUsers, FaLaptop, FaArrowRight, FaClock, FaCheckCircle
} from 'react-icons/fa'
import './Careers.css'
import bannerImg from '../assets/logo.png' // Fallback image

gsap.registerPlugin(ScrollTrigger)

import { api } from '../utils/api'

const whyWorkHere = [
  { Icon: FaMoneyBillWave, title: 'Competitive Compensation', desc: 'We offer industry-leading salaries and attractive performance bonuses.' },
  { Icon: FaHeartbeat,     title: 'Health & Wellness',        desc: 'Comprehensive health insurance plans for you and your family.' },
  { Icon: FaGraduationCap, title: 'Continuous Learning',      desc: 'Regular training sessions and allowances for professional development.' },
  { Icon: FaRocket,        title: 'Career Growth',            desc: 'Clear pathways for promotion and internal mobility within the company.' },
  { Icon: FaUsers,         title: 'Collaborative Culture',    desc: 'Work with a team of passionate, supportive, and driven professionals.' },
  { Icon: FaBriefcase,     title: 'Work-Life Balance',        desc: 'Flexible working arrangements and generous paid time off.' },
]

export default function Careers() {
  const heroRef = useRef(null)
  const [roles, setRoles] = useState([])
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    age: '',
    education: '',
    skills: '',
    experience: '',
    expectedSalary: ''
  })

  const handleApply = (roleTitle) => {
    setSelectedRole(roleTitle || 'General Application')
    setIsFormOpen(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    const text = `*New Job Application*\n\n*Role:* ${selectedRole}\n*Name:* ${formData.name}\n*Gender:* ${formData.gender}\n*Age:* ${formData.age}\n*Education:* ${formData.education}\n*Skills:* ${formData.skills}\n*Experience:* ${formData.experience}\n*Expected Salary:* ${formData.expectedSalary}`
    const encodedText = encodeURIComponent(text)
    window.open(`https://wa.me/919581611711?text=${encodedText}`, '_blank')
    setIsFormOpen(false)
    setFormData({ name: '', gender: 'Male', age: '', education: '', skills: '', experience: '', expectedSalary: '' })
  }

  useEffect(() => {
    api('/careers')
      .then(data => setRoles(data || []))
      .catch(console.error)
      .finally(() => setLoadingRoles(false))
  }, [])

  useEffect(() => {
    if (loadingRoles || roles.length === 0) return; // Wait until roles are loaded and rendered
    const ctx = gsap.context(() => {
      // Hero Animations
      gsap.fromTo('.careers-hero-text > *', 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
      )
      gsap.fromTo('.careers-visual', { opacity: 0, scale: 1.06, x: 80 }, { opacity: 1, scale: 1, x: 0, duration: 1.1, delay: 0.3, ease: 'power3.out' })
      
      // Scroll Reveal for Roles
      gsap.utils.toArray('.careers-role-section').forEach((sec) => {
        const text = sec.querySelector('.cr-text')
        const img = sec.querySelector('.cr-img-wrapper')

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
  }, [loadingRoles, roles]) // Re-run animation bindings when roles data changes

  return (
    <div className="careers-wrapper" ref={heroRef}>
      
      {/* ── MASSIVE HERO ── */}
      <section className="careers-hero">
        <div className="careers-hero-bg">
          <div className="careers-orb orb-gold" />
          <div className="careers-orb orb-navy" />
          <div className="careers-grid-pattern" />
        </div>
        
        <div className="careers-hero-inner">
          <div className="careers-hero-text">
            <div className="careers-hero-badge"><FaBriefcase size={14} /> Join Our Growing Team</div>
            <h1>
              Build Your Career at <br/>
              <span className="careers-gold-gradient">1 Step Finance Care</span>
            </h1>
            <p>
              We are on a mission to revolutionize financial services in India. Join a team of passionate innovators, problem solvers, and industry experts. Discover opportunities to grow, lead, and make a real impact.
            </p>
            <div className="careers-hero-actions">
              <a href="#open-roles" className="careers-btn-primary">View Open Roles <FaArrowRight /></a>
            </div>
            
            <div className="careers-hero-stats">
              <div className="c-stat">
                <div className="c-stat-icon"><FaUsers size={16} /></div>
                <div className="c-stat-text">
                  <h3>100+ Team</h3>
                  <span>Strong & Growing</span>
                </div>
              </div>
              <div className="c-stat-div" />
              <div className="c-stat">
                <div className="c-stat-icon"><FaRocket size={16} /></div>
                <div className="c-stat-text">
                  <h3>Fast Growth</h3>
                  <span>Industry Leading</span>
                </div>
              </div>
              <div className="c-stat-div" />
              <div className="c-stat">
                <div className="c-stat-icon"><FaHeartbeat size={16} /></div>
                <div className="c-stat-text">
                  <h3>Great Culture</h3>
                  <span>People First</span>
                </div>
              </div>
            </div>
          </div>

          <div className="careers-visual">
            <div className="careers-banner-card">
              <div className="cbc-brand">
                <span className="cbc-brand-name">Innovate With Us</span>
              </div>
              <div className="cbc-center">
                <div className="cbc-logo-wrap">
                  <img src={bannerImg} alt="1 Step Finance Care Team" />
                </div>
              </div>
              <div className="cbc-trust">
                <span><FaCheckCircle size={10} /> Certified Great Place to Work</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OPEN ROLES FLOW ── */}
      <div className="careers-roles" id="open-roles">
        <div className="careers-section-header">
          <h2>Current <span className="careers-gold-gradient">Openings</span></h2>
        </div>
        {loadingRoles ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#fff' }}>Loading open roles...</div>
        ) : roles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ccc' }}>No open roles at the moment. Please check back later.</div>
        ) : (
          roles.map((r, i) => (
            <section className={`careers-role-section ${i % 2 !== 0 ? 'reversed' : ''}`} key={r.id}>
              <div className="cr-bg-glow" />
              <div className="cr-inner">
                
                <div className="cr-text">
                  <div className="cr-tagline">{r.tagline}</div>
                  <h2>{r.title}</h2>
                  <p className="cr-desc">{r.description || r.desc}</p>
                  
                  <div className="cr-features">
                    {(r.features || []).map((f, idx) => (
                      <div className="cr-feat" key={idx}>
                        <FaCheckCircle className="cr-feat-icon" />
                        <span>{f.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="cr-actions">
                    <button onClick={() => handleApply(r.title)} className="careers-btn-primary">Apply Now</button>
                  </div>
                </div>

                <div className="cr-visual">
                  <div className="cr-img-wrapper">
                    <img src={r.img || bannerImg} alt={r.title} className="cr-img" />
                    <div className="cr-img-overlay" />
                  </div>
                </div>

              </div>
            </section>
          ))
        )}
      </div>
      
      {/* ── WHY WORK WITH US GRID ── */}
      <section className="careers-why">
        <div className="careers-section-header">
          <div className="careers-badge">Benefits & Perks</div>
          <h2>Why You'll Love <span className="careers-gold-gradient">Working Here</span></h2>
        </div>
        <div className="cw-grid">
          {whyWorkHere.map((w, i) => (
            <div className="cw-card" key={i}>
              <div className="cw-icon"><w.Icon /></div>
              <h3>{w.title}</h3>
              <p>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* ── FINAL CTA ── */}
      <section className="careers-cta">
        <div className="careers-cta-inner">
          <div className="careers-cta-glow" />
          <h2>Don't see a <span className="careers-gold-gradient">perfect fit?</span></h2>
          <p>We are always looking for talented individuals. Send us your resume and we will keep you in mind for future opportunities.</p>
          <div className="careers-cta-actions">
            <button onClick={() => handleApply()} className="careers-btn-primary">Submit Resume</button>
          </div>
        </div>
      </section>

      {/* ── APPLICATION MODAL ── */}
      {isFormOpen && (
        <div className="careers-modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="careers-modal" onClick={e => e.stopPropagation()}>
            <div className="careers-modal-header">
              <h3>Apply for {selectedRole}</h3>
              <button className="careers-modal-close" onClick={() => setIsFormOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleFormSubmit} className="careers-form">
              <div className="careers-form-group">
                <label>Full Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleFormChange} placeholder="Enter your full name" />
              </div>
              <div className="careers-form-row">
                <div className="careers-form-group">
                  <label>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleFormChange}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="careers-form-group">
                  <label>Age</label>
                  <input type="number" name="age" required value={formData.age} onChange={handleFormChange} placeholder="e.g. 24" />
                </div>
              </div>
              <div className="careers-form-group">
                <label>Highest Education</label>
                <input type="text" name="education" required value={formData.education} onChange={handleFormChange} placeholder="e.g. B.Tech, MBA" />
              </div>
              <div className="careers-form-group">
                <label>Skills</label>
                <input type="text" name="skills" required placeholder="e.g. Sales, React, Communication" value={formData.skills} onChange={handleFormChange} />
              </div>
              <div className="careers-form-row">
                <div className="careers-form-group">
                  <label>Experience</label>
                  <input type="text" name="experience" required placeholder="e.g. 2 Years, Fresher" value={formData.experience} onChange={handleFormChange} />
                </div>
                <div className="careers-form-group">
                  <label>Expected Salary</label>
                  <input type="text" name="expectedSalary" required placeholder="e.g. 3 LPA" value={formData.expectedSalary} onChange={handleFormChange} />
                </div>
              </div>
              <button type="submit" className="careers-btn-primary full-width">Submit via WhatsApp</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
