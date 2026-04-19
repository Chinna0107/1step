import React, { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import '../dashboard.css'
import './Profile.css'

const authHeader = () => {
  const token = getTokenByRole('employee') || getTokenByRole('admin')
  return { Authorization: `Bearer ${token}` }
}

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
  const [user, setUser]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [showPwModal, setShowPwModal] = useState(false)

  useEffect(() => {
    api('/auth/me', { headers: authHeader() })
      .then(d => { setUser(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const role     = user?.is_superadmin ? 'Super Admin' : user?.is_admin ? 'Admin' : 'Employee'
  const roleClass = user?.is_superadmin ? 'profile-role-superadmin' : user?.is_admin ? 'profile-role-admin' : 'profile-role-employee'
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

  const infoRows = user ? [
    { icon: '✉️',  label: 'Email',        value: user.email },
    { icon: '📱',  label: 'Mobile',       value: user.mobile    || null },
    { icon: '🪪',  label: 'PAN',          value: user.pan       || null },
    { icon: '🔢',  label: 'Aadhar',       value: user.aadhar    || null },
    { icon: '🏢',  label: 'Branch',       value: user.branch    || null },
    { icon: '👔',  label: 'Role',         value: role, isRole: true },
    { icon: '📅',  label: 'Member Since', value: user.created_at
        ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : null },
  ] : []

  const content = (
    <div className="profile-page">
      {/* Floating Background Orbs */}
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
            {/* Hero Banner */}
            <div className="profile-hero">
              <div className="profile-hero-orbs">
                <div className="profile-hero-orb profile-hero-orb1" />
                <div className="profile-hero-orb profile-hero-orb2" />
              </div>
              <div className="profile-hero-content">
                <div className="profile-hero-label">My Profile</div>
                <h1 className="profile-hero-title">{user?.name || 'User'}</h1>
                <div className="profile-hero-subtitle">{role} • {user?.branch || 'No Branch Assigned'}</div>
              </div>
            </div>

            {/* Avatar & Name Section */}
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                {user?.photo_url ? (
                  <img src={user.photo_url} alt={user.name} />
                ) : (
                  <div className="profile-avatar-initials">{initials}</div>
                )}
              </div>
              
              <div className="profile-name-card">
                <div className="profile-name-info">
                  <h2>{user?.name || 'User'}</h2>
                  <p>{user?.email}</p>
                </div>
                <button className="profile-change-pw-btn" onClick={() => setShowPwModal(true)}>
                  🔒 Change Password
                </button>
              </div>
            </div>

            {/* Details Card */}
            <div className="profile-details-card">
              <div className="profile-details-header">
                <span className="profile-details-header-icon">📋</span>
                <h3>Account Details</h3>
              </div>
              
              <div className="profile-details-grid">
                {infoRows.map(({ icon, label, value, isRole }, i) => (
                  <div key={label} className="profile-detail-item" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="profile-detail-label">
                      <span>{icon}</span>
                      {label}
                    </div>
                    <div className={`profile-detail-value ${!value ? 'empty' : ''}`}>
                      {isRole ? (
                        <span className={`profile-role-badge ${roleClass}`}>
                          {role === 'Super Admin' ? '👑' : role === 'Admin' ? '⭐' : '👤'} {role}
                        </span>
                      ) : (
                        value || '—'
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
