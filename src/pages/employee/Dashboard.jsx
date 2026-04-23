import React, { useEffect, useState, useCallback, useRef } from 'react'
import EmployeeNavbar from '../../components/employee/EmployeeNavbar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import { MdLogin, MdLogout, MdRefresh, MdTrendingUp, MdTrendingDown, MdAccountBalanceWallet, MdMonetizationOn, MdStar, MdPeople, MdPersonAdd, MdPerson } from 'react-icons/md'
import './EmployeeDashboard.css'

const auth   = () => ({ Authorization: `Bearer ${getTokenByRole('employee') || getTokenByRole('admin')}` })
const fmt    = n => Number(n).toLocaleString('en-IN')
const fmtVal = n => { const v = parseFloat(n); if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }
const TARGET = 25

function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const target = parseFloat(value) || 0
    const duration = 1000
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(target * ease))
      if (progress < 1) ref.current = requestAnimationFrame(tick)
    }
    ref.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current)
  }, [value])
  return <>{prefix}{display.toLocaleString('en-IN')}{suffix}</>
}

function GrowthBadge({ pct }) {
  if (pct === null || pct === undefined) return null
  const up = pct >= 0
  return (
    <span className={`ed-growth ${up ? 'ed-growth-up' : 'ed-growth-down'}`}>
      {up ? <MdTrendingUp size={12} /> : <MdTrendingDown size={12} />}
      {Math.abs(pct)}%
    </span>
  )
}

function StatCard({ icon, label, value, sub, color, delay = 0, growth }) {
  return (
    <div className="ed-stat" style={{ '--color': color, animationDelay: `${delay}ms` }}>
      <div className="ed-stat-glow" />
      <div className="ed-stat-icon">{icon}</div>
      <div className="ed-stat-label">{label}</div>
      <div className="ed-stat-value-row">
        <div className="ed-stat-value">{value}</div>
        {growth !== undefined && <GrowthBadge pct={growth} />}
      </div>
      {sub && <div className="ed-stat-sub">{sub}</div>}
    </div>
  )
}

export default function EmployeeDashboard() {
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [attMsg, setAttMsg]       = useState('')
  const [attErr, setAttErr]       = useState('')
  const [attLoading, setAttLoading] = useState(false)
  const [greeting, setGreeting]   = useState('')

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening')
  }, [])

  const refetch = useCallback(() => {
    setLoading(true)
    api('/dashboard/employee/stats', { headers: auth() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const markAttendance = async type => {
    setAttLoading(true); setAttMsg(''); setAttErr('')
    try {
      const r = await api('/dashboard/attendance/mark', { method: 'POST', headers: auth(), body: JSON.stringify({ type }) })
      setAttMsg(r.coinsEarned > 0 ? `${r.message} 🪙 +${r.coinsEarned} coins!` : r.message)
      refetch()
    } catch (e) { setAttErr(e.message) }
    setAttLoading(false)
  }

  const profile = data?.profile     ?? {}
  const s       = data?.stats       ?? {}
  const txns    = data?.transactions ?? []
  const att     = data?.attendance  ?? null
  const pct     = Math.min(100, Math.round((s.txnToday ?? 0) / TARGET * 100))
  const now     = new Date()

  return (
    <div className="ed-page">
      <EmployeeNavbar />
      <div className="ed-content">

        {/* ── Hero Header ── */}
        <div className="ed-hero">
          <div className="ed-hero-bg" />
          <div className="ed-hero-orb ed-orb1" />
          <div className="ed-hero-orb ed-orb2" />
          <div className="ed-hero-inner">
            <div>
              <div className="ed-greeting">{greeting} 👋</div>
              <h1 className="ed-hero-name">{loading ? '...' : profile.name || 'Employee'}</h1>
              <div className="ed-hero-meta">
                {now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {profile.branch && <span className="ed-branch-pill">🏦 {profile.branch}</span>}
              </div>
            </div>
            <div className="ed-hero-actions">
              <button className="ed-refresh-btn" onClick={refetch}><MdRefresh size={18} /></button>
              <div className="ed-coins-pill">🪙 {loading ? '...' : fmt(profile.coins ?? 0)} coins</div>
            </div>
          </div>
        </div>

        {/* ── Stats Row 1 ── */}
        <div className="ed-stats">
          {loading ? [1,2,3,4].map(i => <div key={i} className="ed-stat-skel" />) : (
            <>
              <StatCard icon={<MdTrendingUp />}           color="#402070" delay={0}
                label="Transactions Today" value={<AnimatedNumber value={s.txnToday ?? 0} />}
                sub={`Month: ${fmt(s.txnMonth ?? 0)}`}
                growth={s.txnGrowth} />
              <StatCard icon={<MdAccountBalanceWallet />} color="#c02040" delay={100}
                label="Value Handled Today" value={fmtVal(s.valueToday ?? 0)}
                sub={`Month: ${fmtVal(s.valueMonth ?? 0)}`}
                growth={s.valueGrowth} />
              <StatCard icon={<MdMonetizationOn />}       color="#d4af37" delay={200}
                label="Transactions This Month" value={<AnimatedNumber value={s.txnMonth ?? 0} />}
                sub={`Today: ${fmt(s.txnToday ?? 0)}`} />
              <StatCard icon={<MdStar />}                 color="#059669" delay={300}
                label="MoneySpot Coins" value={<AnimatedNumber value={profile.coins ?? 0} prefix="🪙 " />}
                sub="Earn more by working longer" />
            </>
          )}
        </div>

        {/* ── Stats Row 2 ── */}
        <div className="ed-stats" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 24 }}>
          {loading ? [1,2,3,4].map(i => <div key={i} className="ed-stat-skel" />) : (
            <>
              <StatCard icon={<MdPeople />}    color="#0ea5e9" delay={0}
                label="Customers Attended Today" value={<AnimatedNumber value={s.custAttendedToday ?? 0} />}
                sub="Unique customers served" />
              <StatCard icon={<MdPersonAdd />} color="#8b5cf6" delay={100}
                label="New Customers Today" value={<AnimatedNumber value={s.custNewToday ?? 0} />}
                sub="Added by you today" />
              <StatCard icon={<MdPerson />}    color="#f59e0b" delay={200}
                label="Total My Customers" value={<AnimatedNumber value={s.custTotal ?? 0} />}
                sub="All time" />
              <div className="ed-stat ed-earnings-stat" style={{ '--color': '#059669', animationDelay: '300ms' }}>
                <div className="ed-stat-glow" />
                <div className="ed-stat-icon">💸</div>
                <div className="ed-stat-label">Today's Earnings</div>
                <div className="ed-stat-value-row">
                  <div className="ed-stat-value ed-earnings-val">{fmtVal(s.profitToday ?? 0)}</div>
                </div>
                <div className="ed-earnings-coins">
                  🪙 {fmt(Math.round((s.profitToday ?? 0) / 10))} coins equivalent
                </div>
                <div className="ed-stat-sub">Month: {fmtVal(s.profitMonth ?? 0)}</div>
              </div>
            </>
          )}
        </div>

        <div className="ed-grid">

          {/* ── Target ── */}
          <div className="ed-card ed-card-target">
            <div className="ed-card-header">
              <span className="ed-card-icon">🎯</span>
              <h2>Daily Target</h2>
              <span className="ed-card-badge" style={{ background: pct >= 100 ? '#d1fae5' : pct >= 60 ? '#fef3c7' : '#fee2e2', color: pct >= 100 ? '#059669' : pct >= 60 ? '#d97706' : '#dc2626' }}>
                {pct}%
              </span>
            </div>
            <div className="ed-card-body">
              <div className="ed-target-info">
                <span className="ed-target-current">{s.txnToday ?? 0}</span>
                <span className="ed-target-sep">/</span>
                <span className="ed-target-max">{TARGET} txns</span>
              </div>
              <div className="ed-progress-track">
                <div className="ed-progress-fill" style={{
                  width: `${pct}%`,
                  background: pct >= 100 ? 'linear-gradient(90deg,#10b981,#059669)' : pct >= 60 ? 'linear-gradient(90deg,#f59e0b,#d97706)' : 'linear-gradient(90deg,#ef4444,#dc2626)'
                }} />
                <div className="ed-progress-glow" style={{ left: `${pct}%`, background: pct >= 100 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444' }} />
              </div>
              <div className="ed-target-msg">
                {pct >= 100 ? '🎉 Target achieved! Outstanding work!' : `${TARGET - (s.txnToday ?? 0)} more to reach today's target`}
              </div>
              <div className="ed-target-divider" />
              <div className="ed-target-extra">
                <div className="ed-target-extra-item">
                  <span>💰 Value This Month</span>
                  <strong style={{ color: '#059669' }}>{fmtVal(s.valueMonth ?? 0)}</strong>
                </div>
                <div className="ed-target-extra-item">
                  <span>📊 Txns This Month</span>
                  <strong style={{ color: '#402070' }}>{fmt(s.txnMonth ?? 0)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ── Attendance ── */}
          <div className="ed-card">
            <div className="ed-card-header">
              <span className="ed-card-icon">🕒</span>
              <h2>Today's Attendance</h2>
              {att?.status && <span className="ed-card-badge" style={{ background: '#d1fae5', color: '#059669' }}>{att.status}</span>}
            </div>
            <div className="ed-card-body">
              {(attMsg || attErr) && (
                <div className={`ed-alert ${attErr ? 'ed-alert-error' : 'ed-alert-success'}`}>
                  {attErr || attMsg}
                </div>
              )}
              <div className="ed-att-grid">
                <div className="ed-att-box">
                  <div className="ed-att-label">Check In</div>
                  <div className="ed-att-time">{att?.check_in || '—'}</div>
                  {att?.late && <div className="ed-att-late">⏰ Late</div>}
                </div>
                <div className="ed-att-divider" />
                <div className="ed-att-box">
                  <div className="ed-att-label">Check Out</div>
                  <div className="ed-att-time">{att?.check_out || '—'}</div>
                  {att?.minutes > 0 && <div className="ed-att-mins">⏱ {att.minutes} min</div>}
                </div>
              </div>
              <div className="ed-att-btns">
                <button className="ed-att-btn ed-att-in" onClick={() => markAttendance('check_in')}
                  disabled={attLoading || !!att?.check_in}>
                  <MdLogin /> {att?.check_in ? `In at ${att.check_in}` : 'Check In'}
                </button>
                <button className="ed-att-btn ed-att-out" onClick={() => markAttendance('check_out')}
                  disabled={attLoading || !att?.check_in || !!att?.check_out}>
                  <MdLogout /> {att?.check_out ? `Out at ${att.check_out}` : 'Check Out'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Transactions ── */}
        <div className="ed-card">
          <div className="ed-card-header">
            <span className="ed-card-icon">💳</span>
            <h2>Recent Transactions</h2>
            <span className="ed-card-badge">{txns.length} records</span>
          </div>
          <div className="ed-table-wrap">
            {loading ? (
              <div className="ed-table-skel">
                {[1,2,3,4].map(i => <div key={i} className="ed-row-skel" style={{ animationDelay: `${i*80}ms` }} />)}
              </div>
            ) : txns.length === 0 ? (
              <div className="ed-empty">
                <div className="ed-empty-icon">💳</div>
                <div>No transactions yet — go to Services to add one</div>
              </div>
            ) : (
              <table className="ed-table">
                <thead><tr><th>Date</th><th>Service</th><th>Platform</th><th>Amount</th><th>Charges</th><th>Settled</th></tr></thead>
                <tbody>
                  {txns.map((t, i) => (
                    <tr key={t.id} style={{ animationDelay: `${i * 40}ms` }} className="ed-tr">
                      <td>{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                      <td><strong>{t.service_type}</strong></td>
                      <td><span className="ed-platform-tag">{t.platform || '—'}</span></td>
                      <td><span className="ed-amount">₹{fmt(t.amount)}</span></td>
                      <td><span className="ed-charges">₹{fmt(t.charges_amount || 0)}</span></td>
                      <td><span className="ed-profit">₹{fmt(t.settled_amount || t.profit || 0)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Coins Card ── */}
        <div className="ed-coins-card">
          <div className="ed-coins-bg" />
          <div className="ed-coins-orb" />
          <div className="ed-coins-inner">
            <div className="ed-coins-icon">🪙</div>
            <div>
              <div className="ed-coins-label">MoneySpot Coins Balance</div>
              <div className="ed-coins-value">{loading ? '...' : fmt(profile.coins ?? 0)}</div>
              <div className="ed-coins-hint">Earn 5 coins per minute worked beyond 500 min/day</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
