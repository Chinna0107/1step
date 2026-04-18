import React, { useEffect, useState, useCallback } from 'react'
import EmployeeNavbar from '../../components/employee/EmployeeNavbar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import { MdLogin, MdLogout, MdRefresh } from 'react-icons/md'
import '../../pages/dashboard.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('employee') || getTokenByRole('admin')}` })
const fmt    = n => Number(n).toLocaleString('en-IN')
const fmtVal = n => { const v = parseFloat(n); if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }

const TARGET_TXN = 25

export default function EmployeeDashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [attMsg, setAttMsg]   = useState('')
  const [attLoading, setAttLoading] = useState(false)

  const refetch = useCallback(() => {
    setLoading(true)
    api('/dashboard/employee/stats', { headers: auth() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const markAttendance = async type => {
    setAttLoading(true); setAttMsg('')
    try {
      const r = await api('/dashboard/attendance/mark', { method: 'POST', headers: auth(), body: JSON.stringify({ type }) })
      setAttMsg(r.coinsEarned > 0 ? `${r.message} 🪙 +${r.coinsEarned} coins!` : r.message)
      refetch()
    } catch (e) { setAttMsg(e.message) }
    setAttLoading(false)
  }

  const profile = data?.profile    ?? {}
  const s       = data?.stats      ?? {}
  const txns    = data?.transactions ?? []
  const att     = data?.attendance  ?? null
  const now     = new Date()
  const pct     = Math.min(100, Math.round((s.txnToday ?? 0) / TARGET_TXN * 100))

  return (
    <div className="emp-page">
      <EmployeeNavbar />
      <div className="emp-page-content">

        <div className="emp-page-header">
          <div>
            <h1>Welcome back, {profile.name || '...'} 👋</h1>
            <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
              {now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {profile.branch && ` · ${profile.branch}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="dash-btn" style={{ background: '#f0f2f8', color: '#402070', border: 'none', padding: '7px 14px' }} onClick={refetch}><MdRefresh /></button>
            <span className="dash-badge">Employee Portal</span>
          </div>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          <div className="dash-stat">
            <div className="dash-stat-label">Transactions Today</div>
            <div className="dash-stat-value">{loading ? '—' : fmt(s.txnToday ?? 0)}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Month: {fmt(s.txnMonth ?? 0)}</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-label">Value Handled</div>
            <div className="dash-stat-value">{loading ? '—' : fmtVal(s.valueToday ?? 0)}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Month: {fmtVal(s.valueMonth ?? 0)}</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-label">Profit Generated</div>
            <div className="dash-stat-value">{loading ? '—' : fmtVal(s.profitToday ?? 0)}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Month: {fmtVal(s.profitMonth ?? 0)}</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-label">MoneySpot Coins</div>
            <div className="dash-stat-value" style={{ color: '#b8860b' }}>🪙 {loading ? '—' : fmt(profile.coins ?? 0)}</div>
          </div>
        </div>

        {/* Target vs Achievement */}
        <div className="dash-card">
          <div className="dash-card-header"><h2>🎯 Target vs Achievement — Today</h2></div>
          <div className="dash-card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span style={{ fontWeight: 700, color: '#402070' }}>{s.txnToday ?? 0} / {TARGET_TXN} transactions</span>
              <span style={{ fontWeight: 800, color: pct >= 100 ? '#059669' : pct >= 60 ? '#d97706' : '#dc2626' }}>{pct}%</span>
            </div>
            <div style={{ height: 12, background: '#f0f2f8', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? '#10b981' : pct >= 60 ? '#d97706' : '#ef4444', borderRadius: 999, transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
              {pct >= 100 ? '🎉 Target achieved!' : `${TARGET_TXN - (s.txnToday ?? 0)} more transactions to reach daily target`}
            </div>
          </div>
        </div>

        {/* Attendance */}
        <div className="dash-card">
          <div className="dash-card-header"><h2>🕒 Today's Attendance</h2></div>
          <div className="dash-card-body">
            {attMsg && <div className="dash-alert dash-alert-success" style={{ marginBottom: 12 }}>{attMsg}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ background: '#f0f2f8', borderRadius: 10, padding: '14px 18px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>Check In</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#402070' }}>{att?.check_in || '—'}</div>
                {att?.late && <div style={{ fontSize: 11, background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginTop: 4, fontWeight: 700 }}>⏰ Late</div>}
              </div>
              <div style={{ background: '#f0f2f8', borderRadius: 10, padding: '14px 18px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>Check Out</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#402070' }}>{att?.check_out || '—'}</div>
                {att?.minutes > 0 && <div style={{ fontSize: 11, color: '#059669', fontWeight: 700, marginTop: 4 }}>{att.minutes} min worked</div>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="dash-btn dash-btn-success" onClick={() => markAttendance('check_in')} disabled={attLoading || !!att?.check_in}>
                <MdLogin /> {att?.check_in ? `Checked in at ${att.check_in}` : 'Check In'}
              </button>
              <button className="dash-btn dash-btn-danger" onClick={() => markAttendance('check_out')} disabled={attLoading || !att?.check_in || !!att?.check_out}>
                <MdLogout /> {att?.check_out ? `Checked out at ${att.check_out}` : 'Check Out'}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="dash-card">
          <div className="dash-card-header"><h2>💳 My Recent Transactions</h2></div>
          <div className="dash-table-wrap">
            {loading ? <div className="dash-loading">Loading...</div> : (
              <table className="dash-table">
                <thead><tr><th>Date</th><th>Service</th><th>Platform</th><th>Bank</th><th>Amount</th><th>Profit</th></tr></thead>
                <tbody>
                  {txns.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontSize: 12 }}>{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                      <td><strong>{t.service_type}</strong></td>
                      <td>{t.platform || '—'}</td>
                      <td>{t.bank || '—'}</td>
                      <td style={{ color: '#059669', fontWeight: 700 }}>₹{fmt(t.amount)}</td>
                      <td style={{ color: '#d4af37', fontWeight: 800 }}>₹{fmt(t.profit)}</td>
                    </tr>
                  ))}
                  {!txns.length && <tr><td colSpan={6} className="dash-empty">No transactions yet — go to Services to add one</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Coins */}
        <div className="dash-card">
          <div className="dash-card-header"><h2>🪙 MoneySpot Coins</h2></div>
          <div className="dash-card-body">
            <div className="coins-card">
              <div className="coins-label">Available Balance</div>
              <div className="coins-amount">🪙 {loading ? '...' : fmt(profile.coins ?? 0)}</div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 8 }}>
                Earn 5 coins/min for every minute worked beyond 500 minutes/day
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
