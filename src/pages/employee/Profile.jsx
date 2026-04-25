import React, { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import '../dashboard.css'
import './Profile.css'

const authHeader = () => {
  const token = getTokenByRole('employee') || getTokenByRole('admin')
  return { Authorization: `Bearer ${token}` }
}

const fmt = n => Number(parseInt(n) || 0).toLocaleString('en-IN')
const COINS_PER_RUPEE = 100

function ChangePasswordModal({ onClose }) {
  const [form, setForm]     = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')
  const [error, setError]   = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.new_password !== form.confirm_password) { setError('Passwords do not match'); return }
    setSaving(true); setMsg(''); setError('')
    try {
      const r = await api('/auth/change-password', {
        method: 'PATCH', headers: authHeader(),
        body: JSON.stringify({ current_password: form.current_password, new_password: form.new_password }),
      })
      setMsg(r.message)
      setForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) { setError(err.message) }
    setSaving(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #402070, #c02040)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>🔒 Change Password</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>Keep your account secure</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ padding: 24 }}>
          {msg   && <div style={{ background: '#d1fae5', color: '#059669', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>✅ {msg}</div>}
          {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>❌ {error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'current_password', label: 'Current Password',     icon: '🔑' },
              { key: 'new_password',      label: 'New Password',         icon: '🔒' },
              { key: 'confirm_password',  label: 'Confirm New Password', icon: '✅' },
            ].map(({ key, label, icon }) => (
              <div key={key}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                  {icon} {label}
                </label>
                <input required type="password" placeholder="••••••••"
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }} />
              </div>
            ))}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="button" onClick={onClose}
                style={{ flex: 1, padding: '11px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#f9fafb', color: '#6b7280', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                Cancel
              </button>
              <button type="submit" disabled={saving}
                style={{ flex: 2, padding: '11px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #402070, #c02040)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                {saving ? 'Saving...' : '🔒 Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function Profile({ Sidebar, isAdmin = false }) {
  const [user, setUser]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [showPwModal, setShowPwModal] = useState(false)
  const [coins, setCoins]             = useState(0)
  const [coinHistory, setCoinHistory] = useState([])
  const [redeemAmt, setRedeemAmt]     = useState('')
  const [redeemMsg, setRedeemMsg]     = useState('')
  const [redeemErr, setRedeemErr]     = useState('')
  const [redeeming, setRedeeming]     = useState(false)
  const [showCoins, setShowCoins]     = useState(false)

  const fetchProfile = () => {
    api('/auth/me', { headers: authHeader() })
      .then(d => { setUser(d); setCoins(d.coins ?? 0); setLoading(false) })
      .catch(() => setLoading(false))
  }

  const fetchCoins = () => {
    api('/master/coins/history', { headers: authHeader() })
      .then(d => { setCoins(d.balance); setCoinHistory(d.history) })
      .catch(() => {})
  }

  useEffect(() => { fetchProfile() }, [])
  useEffect(() => { if (showCoins) fetchCoins() }, [showCoins])

  const handleRedeem = async e => {
    e.preventDefault()
    setRedeeming(true); setRedeemMsg(''); setRedeemErr('')
    try {
      const r = await api('/master/coins/redeem', {
        method: 'POST', headers: authHeader(),
        body: JSON.stringify({ coins: parseInt(redeemAmt) }),
      })
      setRedeemMsg(r.message)
      setRedeemAmt('')
      fetchCoins()
      fetchProfile()
    } catch (err) { setRedeemErr(err.message) }
    setRedeeming(false)
  }

  const roleLabel = user?.is_superadmin ? 'Super Admin' : user?.is_admin ? 'Admin' : 'Employee'
  const roleClass = user?.is_superadmin ? 'profile-role-superadmin' : user?.is_admin ? 'profile-role-admin' : 'profile-role-employee'
  const initials  = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
  const empId     = user?.id ? `MS-${String(user.id).padStart(5, '0')}` : '—'
  const joinDate  = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

  const content = (
    <div className="profile-page">
      <div className="profile-orb profile-orb1" />
      <div className="profile-orb profile-orb2" />
      <div className="profile-orb profile-orb3" />

      <div className="profile-content">
        {loading ? (
          <div className="profile-loading">
            <div className="profile-loading-spinner" />
            <div>Loading your profile...</div>
          </div>
        ) : (
          <>
            {/* Page title */}
            <div style={{ padding: '32px 40px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>My Profile</div>
                <h1 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 900, color: '#1a0a2e' }}>Employee ID Card</h1>
              </div>
              <button className="profile-change-pw-btn" onClick={() => setShowPwModal(true)}>🔒 Change Password</button>
            </div>

            {/* ── ID CARD ── */}
            <div className="id-card-wrap">
              <div className="id-card">
                {/* Card Header */}
                <div className="id-card-header">
                  <div className="id-card-header-orb" />
                  <div className="id-card-header-orb2" />
                  <div className="id-card-logo">💰 MoneySpot</div>
                  <div className="id-card-type">Employee Identity Card</div>
                </div>

                {/* Card Body */}
                <div className="id-card-body">
                  {/* Photo */}
                  <div className="id-card-photo">
                    {user?.photo_url
                      ? <img src={user.photo_url} alt={user.name} />
                      : <div className="id-card-initials">{initials}</div>}
                    <div className={`id-card-role-dot ${roleClass}`} />
                  </div>

                  {/* Info */}
                  <div className="id-card-info">
                    <div className="id-card-name">{user?.name || '—'}</div>
                    <div className={`id-card-role-badge ${roleClass}`}>
                      {roleLabel === 'Super Admin' ? '👑' : roleLabel === 'Admin' ? '⭐' : '👤'} {user?.role || roleLabel}
                    </div>
                    <div className="id-card-branch">🏢 {user?.branch || 'No Branch Assigned'}</div>

                    <div className="id-card-fields">
                      <div className="id-card-field">
                        <span className="id-card-field-label">Employee ID</span>
                        <span className="id-card-field-val id-card-empid">{empId}</span>
                      </div>
                      <div className="id-card-field">
                        <span className="id-card-field-label">Email</span>
                        <span className="id-card-field-val">{user?.email || '—'}</span>
                      </div>
                      <div className="id-card-field">
                        <span className="id-card-field-label">Mobile</span>
                        <span className="id-card-field-val">{user?.mobile || '—'}</span>
                      </div>
                      <div className="id-card-field">
                        <span className="id-card-field-label">PAN</span>
                        <span className="id-card-field-val">{user?.pan || '—'}</span>
                      </div>
                      <div className="id-card-field">
                        <span className="id-card-field-label">Aadhar</span>
                        <span className="id-card-field-val">{user?.aadhar ? `XXXX XXXX ${user.aadhar.slice(-4)}` : '—'}</span>
                      </div>
                      <div className="id-card-field">
                        <span className="id-card-field-label">Joined</span>
                        <span className="id-card-field-val">{joinDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="id-card-footer">
                  <div className="id-card-coins">🪙 {user?.coins ?? 0} Coins</div>
                  <div className="id-card-footer-id">{empId}</div>
                  <div className={`id-card-status ${user?.is_active !== false ? 'active' : 'inactive'}`}>
                    {user?.is_active !== false ? '● Active' : '● Inactive'}
                  </div>
                </div>

                {/* Decorative strip */}
                <div className="id-card-strip" />
              </div>
            </div>
            {/* ── COINS SECTION ── */}
            <div style={{ padding: '0 40px 40px' }}>
              <button
                onClick={() => setShowCoins(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#402070,#c02040)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 800, fontSize: 15, cursor: 'pointer', marginBottom: showCoins ? 16 : 0, width: '100%', justifyContent: 'space-between' }}>
                <span>🪙 Coins — {fmt(coins)} balance</span>
                <span style={{ fontSize: 12, opacity: 0.8 }}>{showCoins ? '▲ Hide' : '▼ Show & Redeem'}</span>
              </button>

              {showCoins && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                  {/* Redeem Panel */}
                  <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 16px rgba(64,32,112,0.08)', border: '1px solid #f0f2f8' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#402070', marginBottom: 4 }}>🎁 Redeem Coins</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>{COINS_PER_RUPEE} coins = ₹1 &nbsp;·&nbsp; Min: {COINS_PER_RUPEE} coins</div>

                    {/* Balance display */}
                    <div style={{ background: 'linear-gradient(135deg,#fef9e7,#fef3c7)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#d97706', fontWeight: 700 }}>Available Balance</span>
                      <span style={{ fontSize: 22, fontWeight: 900, color: '#d97706' }}>🪙 {fmt(coins)}</span>
                    </div>

                    {redeemMsg && <div style={{ background: '#d1fae5', color: '#059669', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13, fontWeight: 600 }}>✅ {redeemMsg}</div>}
                    {redeemErr && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13, fontWeight: 600 }}>❌ {redeemErr}</div>}

                    <form onSubmit={handleRedeem}>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Coins to Redeem</label>
                        <input
                          type="number" required min={COINS_PER_RUPEE} step={COINS_PER_RUPEE}
                          placeholder={`Min ${COINS_PER_RUPEE} coins`}
                          value={redeemAmt} onChange={e => setRedeemAmt(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit' }}
                        />
                        {redeemAmt && parseInt(redeemAmt) >= COINS_PER_RUPEE && (
                          <div style={{ fontSize: 12, color: '#059669', fontWeight: 700, marginTop: 6 }}>
                            = ₹{parseInt(redeemAmt) / COINS_PER_RUPEE} cash value
                          </div>
                        )}
                      </div>

                      {/* Quick select buttons */}
                      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                        {[100, 500, 1000, 2000].filter(v => v <= coins).map(v => (
                          <button key={v} type="button"
                            onClick={() => setRedeemAmt(String(v))}
                            style={{ padding: '4px 10px', borderRadius: 20, border: '1.5px solid #e5e7eb', background: redeemAmt === String(v) ? '#402070' : '#f8fafc', color: redeemAmt === String(v) ? '#fff' : '#374151', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            {fmt(v)}
                          </button>
                        ))}
                      </div>

                      <button type="submit" disabled={redeeming || !redeemAmt || parseInt(redeemAmt) < COINS_PER_RUPEE || parseInt(redeemAmt) > coins}
                        style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#402070,#c02040)', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', opacity: (redeeming || !redeemAmt || parseInt(redeemAmt) < COINS_PER_RUPEE || parseInt(redeemAmt) > coins) ? 0.5 : 1 }}>
                        {redeeming ? 'Processing...' : `🎁 Redeem ${redeemAmt ? fmt(redeemAmt) : ''} Coins`}
                      </button>
                    </form>
                  </div>

                  {/* History Panel */}
                  <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 16px rgba(64,32,112,0.08)', border: '1px solid #f0f2f8', maxHeight: 380, overflowY: 'auto' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#402070', marginBottom: 16 }}>📜 Coins History</div>
                    {coinHistory.length === 0
                      ? <div style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: 20 }}>No coin activity yet</div>
                      : coinHistory.map(h => (
                        <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{h.remarks || (h.type === 'earn' ? 'Earned' : 'Redeemed')}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{new Date(h.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                          </div>
                          <span style={{
                            fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap',
                            color: h.type === 'earn' ? '#059669' : '#dc2626'
                          }}>
                            {h.type === 'earn' ? '+' : '−'}{fmt(h.coins)} 🪙
                          </span>
                        </div>
                      ))
                    }
                  </div>

                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )

  if (isAdmin) {
    return (
      <div className="dash-page">
        <Sidebar />
        <div className="dash-content" style={{ padding: 0 }}>
          {content}
        </div>
        {showPwModal && <ChangePasswordModal onClose={() => setShowPwModal(false)} />}
      </div>
    )
  }

  return (
    <div className="emp-page">
      <Sidebar />
      <div style={{ flex: 1, padding: 0 }}>
        {content}
      </div>
      {showPwModal && <ChangePasswordModal onClose={() => setShowPwModal(false)} />}
    </div>
  )
}
