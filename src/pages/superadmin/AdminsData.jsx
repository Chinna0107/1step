import React, { useState } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { useAdmins } from '../../hooks/useSuperAdmin'
import './superadmin.css'

const empty = { name: '', email: '', mobile: '', pan: '', aadhar: '', password: '', confirm_password: '', mpin: '' }

export default function AdminsData() {
  const { admins, loading, error, msg, addAdmin, toggleStatus, deleteUser } = useAdmins()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(empty)
  const [saving, setSaving]     = useState(false)
  const [showPass, setShowPass] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    const ok = await addAdmin(form)
    if (ok) { setForm(empty); setShowForm(false) }
    setSaving(false)
  }

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="sa-topbar">
          <h1>Manage Admins</h1>
          <div className="sa-topbar-right">
            <button className="sa-btn sa-btn-primary" onClick={() => setShowForm(v => !v)}>
              {showForm ? '✕ Cancel' : '+ Add Admin'}
            </button>
          </div>
        </div>

        <div className="sa-main">
          {msg   && <div className="sa-alert sa-alert-success">✅ {msg}</div>}
          {error && <div className="sa-alert sa-alert-error">❌ {error}</div>}

          {showForm && (
            <div className="sa-card" style={{ marginBottom: 24 }}>
              <div className="sa-card-header"><h2>New Admin Details</h2></div>
              <div className="sa-card-body">
                <form onSubmit={handleSubmit}>
                  <div className="sa-form-grid">
                    <div className="sa-form-group">
                      <label>Full Name *</label>
                      <input required placeholder="Full Name" value={form.name}
                        onChange={e => set('name', e.target.value)} />
                    </div>
                    <div className="sa-form-group">
                      <label>Email *</label>
                      <input required type="email" placeholder="admin@moneyspot.com" value={form.email}
                        onChange={e => set('email', e.target.value)} />
                    </div>
                    <div className="sa-form-group">
                      <label>Mobile Number *</label>
                      <input required placeholder="10-digit mobile" maxLength={10} value={form.mobile}
                        onChange={e => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} />
                    </div>
                    <div className="sa-form-group">
                      <label>PAN Number *</label>
                      <input required placeholder="ABCDE1234F" maxLength={10} value={form.pan}
                        onChange={e => set('pan', e.target.value.toUpperCase())} />
                      {form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan) && (
                        <span style={{ color: '#dc2626', fontSize: 12 }}>Format: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F)</span>
                      )}
                    </div>
                    <div className="sa-form-group">
                      <label>Aadhar Number *</label>
                      <input required placeholder="12-digit Aadhar" maxLength={12} value={form.aadhar}
                        onChange={e => set('aadhar', e.target.value.replace(/\D/g, '').slice(0, 12))} />
                    </div>
                    <div className="sa-form-group">
                      <label>Password *</label>
                      <div style={{ position: 'relative' }}>
                        <input required type={showPass ? 'text' : 'password'} placeholder="Create password"
                          value={form.password} onChange={e => set('password', e.target.value)}
                          style={{ width: '100%', paddingRight: 40 }} />
                        <span onClick={() => setShowPass(v => !v)}
                          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: 16 }}>
                          {showPass ? '🙈' : '👁️'}
                        </span>
                      </div>
                    </div>
                    <div className="sa-form-group">
                      <label>Confirm Password *</label>
                      <input required type={showPass ? 'text' : 'password'} placeholder="Confirm password"
                        value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)} />
                      {form.confirm_password && form.password !== form.confirm_password && (
                        <span style={{ color: '#dc2626', fontSize: 12 }}>Passwords do not match</span>
                      )}
                    </div>
                    <div className="sa-form-group">
                      <label>6-Digit MPIN *</label>
                      <input required type="password" inputMode="numeric" maxLength={6}
                        placeholder="••••••" value={form.mpin}
                        onChange={e => set('mpin', e.target.value.replace(/\D/g, '').slice(0, 6))} />
                    </div>
                  </div>
                  <button type="submit" className="sa-btn sa-btn-primary" disabled={saving || form.password !== form.confirm_password || (form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan))}>
                    {saving ? 'Creating...' : '✅ Create Admin'}
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="sa-card">
            <div className="sa-card-header"><h2>All Admins ({admins.length})</h2></div>
            <div className="sa-table-wrap">
              {loading ? <div className="sa-loading">Loading...</div> : (
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Email</th><th>Mobile</th><th>PAN</th>
                      <th>Role</th><th>Coins</th><th>Status</th><th>Joined</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.length ? admins.map(a => (
                      <tr key={a.id}>
                        <td><strong>{a.name}</strong></td>
                        <td>{a.email}</td>
                        <td>{a.mobile || '—'}</td>
                        <td>{a.pan || '—'}</td>
                        <td><span className="sa-status admin">{a.is_superadmin ? 'SuperAdmin' : 'Admin'}</span></td>
                        <td>🪙 {a.coins ?? 0}</td>
                        <td><span className={`sa-status ${a.is_active ? 'active' : 'inactive'}`}>{a.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td>{new Date(a.created_at).toLocaleDateString()}</td>
                        <td style={{ display: 'flex', gap: 6 }}>
                          <button className="sa-btn sa-btn-warning sa-btn-sm" onClick={() => toggleStatus(a.id)}>
                            {a.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          {!a.is_superadmin && (
                            <button className="sa-btn sa-btn-danger sa-btn-sm" onClick={() => deleteUser(a.id)}>Delete</button>
                          )}
                        </td>
                      </tr>
                    )) : <tr><td colSpan={9} className="sa-empty">No admins found</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
