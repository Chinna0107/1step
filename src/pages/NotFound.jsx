import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${5 + Math.random() * 90}%`,
  top: `${5 + Math.random() * 90}%`,
  size: 3 + Math.random() * 6,
  delay: Math.random() * 3,
}))

const LINKS = [
  { to: '/',           label: 'Home',       icon: '🏠' },
  { to: '/what-we-do', label: 'Services',   icon: '💼' },
  { to: '/contact',    label: 'Contact Us', icon: '📞' },
]

export default function NotFound() {
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.nf-code',
        { opacity: 0, scale: 0.6, y: -40 },
        { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'back.out(1.6)' })
      gsap.fromTo('.nf-title',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, delay: 0.3, ease: 'power3.out' })
      gsap.fromTo('.nf-desc',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.5, ease: 'power3.out' })
      gsap.fromTo('.nf-actions',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.7, ease: 'power3.out' })
      gsap.fromTo('.nf-links',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.9, ease: 'power3.out' })
      gsap.to('.nf-particle', {
        y: 'random(-30,30)', x: 'random(-20,20)',
        duration: 'random(2,4)', repeat: -1, yoyo: true,
        ease: 'sine.inOut', stagger: { each: 0.3, from: 'random' },
      })
      gsap.to('.nf-orb-1', {
        x: 20, y: 15, scale: 1.08,
        duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })
      gsap.to('.nf-orb-2', {
        x: -18, y: -12, scale: 1.06,
        duration: 10, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} style={S.page}>
      {/* orbs */}
      <div className="nf-orb-1" style={S.orb1} />
      <div className="nf-orb-2" style={S.orb2} />

      {/* grid overlay */}
      <div style={S.grid} />

      {/* particles */}
      {PARTICLES.map(p => (
        <div key={p.id} className="nf-particle" style={{
          ...S.particle,
          left: p.left, top: p.top,
          width: p.size, height: p.size,
          animationDelay: `${p.delay}s`,
        }} />
      ))}

      <div style={S.content}>

        {/* 404 number */}
        <div className="nf-code" style={S.codeWrap}>
          <span style={S.code}>4</span>
          <span style={S.codeO}>
            <span style={S.codeOInner}>0</span>
          </span>
          <span style={S.code}>4</span>
        </div>

        {/* divider line */}
        <div style={S.divider} />

        <h1 className="nf-title" style={S.title}>Page Not Found</h1>
        <p className="nf-desc" style={S.desc}>
          Looks like this page took a detour. The URL you're looking for
          doesn't exist or may have been moved.
        </p>

        {/* primary actions */}
        <div className="nf-actions" style={S.actions}>
          <button
            onClick={() => navigate(-1)}
            style={S.btnGhost}
            onMouseEnter={e => Object.assign(e.currentTarget.style, S.btnGhostHover)}
            onMouseLeave={e => Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', transform: 'none' })}
          >
            ← Go Back
          </button>
          <Link
            to="/"
            style={S.btnPrimary}
            onMouseEnter={e => Object.assign(e.currentTarget.style, { transform: 'translateY(-2px)', boxShadow: '0 14px 36px rgba(212,175,55,0.45)' })}
            onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: 'none', boxShadow: '0 6px 24px rgba(212,175,55,0.28)' })}
          >
            🏠 Back to Home
          </Link>
        </div>

        {/* quick nav */}
        <div className="nf-links" style={S.quickNav}>
          <p style={S.quickLabel}>Or explore</p>
          <div style={S.quickLinks}>
            {LINKS.map(l => (
              <Link
                key={l.to}
                to={l.to}
                style={S.quickLink}
                onMouseEnter={e => Object.assign(e.currentTarget.style, S.quickLinkHover)}
                onMouseLeave={e => Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', transform: 'none' })}
              >
                <span style={S.quickIcon}>{l.icon}</span>
                <span style={S.quickLinkLabel}>{l.label}</span>
                <span style={S.quickArrow}>›</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #050912 0%, #0a1324 45%, #081427 75%, #0a1324 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    padding: '250px 24px 60px',
    fontFamily: 'system-ui, sans-serif',
  },
  orb1: {
    position: 'absolute',
    top: '-150px', right: '-150px',
    width: 600, height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(26,54,93,0.18), transparent 65%)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute',
    bottom: '-150px', left: '-150px',
    width: 550, height: 550,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(13,31,61,0.22), transparent 65%)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
    backgroundSize: '60px 60px',
    maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(212,175,55,0.7), rgba(26,54,93,0.3))',
    pointerEvents: 'none',
  },
  content: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    maxWidth: 560,
    width: '100%',
  },
  codeWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
    lineHeight: 1,
  },
  code: {
    fontSize: 'clamp(6rem, 18vw, 10rem)',
    fontWeight: 900,
    letterSpacing: '-0.04em',
    background: 'linear-gradient(135deg, #fff 20%, #d4af37 60%, #f0cc55 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    display: 'inline-block',
    filter: 'drop-shadow(0 0 40px rgba(212,175,55,0.3))',
  },
  codeO: {
    fontSize: 'clamp(6rem, 18vw, 10rem)',
    fontWeight: 900,
    letterSpacing: '-0.04em',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'clamp(80px, 18vw, 130px)',
    height: 'clamp(80px, 18vw, 130px)',
    borderRadius: '50%',
    border: '3px solid rgba(212,175,55,0.4)',
    background: 'rgba(212,175,55,0.06)',
    boxShadow: '0 0 40px rgba(212,175,55,0.15), inset 0 0 30px rgba(212,175,55,0.05)',
    position: 'relative',
  },
  codeOInner: {
    background: 'linear-gradient(135deg, #fff 20%, #d4af37 60%, #f0cc55 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  divider: {
    width: 60,
    height: 3,
    margin: '0 auto 28px',
    borderRadius: 999,
    background: 'linear-gradient(90deg, #0d1f3d, #1a365d, #d4af37)',
  },
  title: {
    fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
    fontWeight: 900,
    color: '#fff',
    letterSpacing: '-0.02em',
    margin: '0 0 14px',
  },
  desc: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.75,
    margin: '0 0 36px',
    maxWidth: 420,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  actions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 40,
  },
  btnPrimary: {
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 15,
    fontWeight: 700,
    padding: '13px 28px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #d4af37 0%, #f0cc55 100%)',
    color: '#050912',
    boxShadow: '0 6px 24px rgba(212,175,55,0.28)',
    transition: 'all 0.25s ease',
    letterSpacing: '0.2px',
  },
  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 15,
    fontWeight: 600,
    padding: '13px 28px',
    borderRadius: 12,
    border: '1.5px solid rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.85)',
    background: 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  btnGhostHover: {
    background: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.4)',
    transform: 'translateY(-2px)',
  },
  quickNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    color: 'rgba(255,255,255,0.3)',
    margin: 0,
  },
  quickLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  quickLink: {
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 18px',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    transition: 'all 0.22s ease',
  },
  quickLinkHover: {
    background: 'rgba(212,175,55,0.08)',
    borderColor: 'rgba(212,175,55,0.25)',
    transform: 'translateX(4px)',
  },
  quickIcon: {
    fontSize: 20,
    width: 38,
    height: 38,
    borderRadius: 10,
    background: 'rgba(255,255,255,0.06)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  quickLinkLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'left',
  },
  quickArrow: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.25)',
    fontWeight: 300,
  },
}
