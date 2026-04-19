import React, { useState } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { useEmployees, useBranches } from '../../hooks/useSuperAdmin'
import './superadmin.css'

const empty = { name: '', email: '', mobile: '', pan: '', aadhar: '', branch: '', password: '', confirm_password: '', mpin: '', is_admin: false, pan_img_url: '', aadhar_img_url: '', docx_url: '', resume_url: '', photo_url: '' }

export default function EmployeesData() {
  const { employees, loading, error, msg, addEmployee, toggleStatus, deleteUser } = useEmployees()
  const { branches } = useBranches()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(empty)
  const [saving, setSaving]     = useState(false)
  const [showPass, setShowPass] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    const ok = await addEmployee(form)
    if (ok) { setForm(empty); setShowForm(false) }
    setSaving(false)
  }

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="sa-topbar">
          <h1>Manage Employees</h1>
          <div className="sa-topbar-right">
            <button className="sa-btn sa-btn-primary" onClick={() => setShowForm(v => !v)}>
              {showForm ? '✕ Cancel' : '+ Add Employee'}
            </button>
          </div>
        </div>

        <div className="sa-main">
          {msg   && <div className="sa-alert sa-alert-success">✅ {msg}</div>}
          {error && <div className="sa-alert sa-alert-error">❌ {error}</div>}

          {showForm && (
            <div className="sa-card" style={{ marginBottom: 24 }}>
              <div className="sa-card-header"><h2>New Employee Details</h2></div>
              <div className="sa-card-body">
                <form onSubmit={handleSubmit}>
                  <div className="sa-form-grid">
                    <div className="sa-form-group">
                      <label>Full Name *</label>
                      <input required placeholder="Full Name" value={form.name} onChange={e => set('name', e.target.value)} />
                    </div>
                    <div className="sa-form-group">
                      <label>Email *</label>
                      <input required type="email" placeholder="employee@moneyspot.com" value={form.email} onChange={e => set('email', e.target.value)} />
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
                      <label>Branch / Location *</label>
                      <select required value={form.branch} onChange={e => set('branch', e.target.value)}>
                        <option value="">Select branch</option>
                        {branches.map(b => <option key={b.id} value={b.city}>{b.city}</option>)}
                      </select>
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
                    <div className="sa-form-group" style={{ justifyContent: 'flex-end' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', textTransform: 'none', fontSize: 14, fontWeight: 600 }}>
                        <input type="checkbox" checked={form.is_admin} onChange={e => set('is_admin', e.target.checked)} />
                        Grant Admin Access
                      </label>
                    </div>
                    <div className="sa-form-group">
                      <label>PAN Card Image URL</label>
                      <input type="url" placeholder="Paste PAN card image URL" value={form.pan_img_url}
                        onChange={e => set('pan_img_url', e.target.value)} />
                    </div>
                    <div className="sa-form-group">
                      <label>Aadhar Card Image URL</label>
                      <input type="url" placeholder="Paste Aadhar card image URL" value={form.aadhar_img_url}
                        onChange={e => set('aadhar_img_url', e.target.value)} />
                    </div>
                    <div className="sa-form-group">
                      <label>Document / ID Proof URL</label>
                      <input type="url" placeholder="Paste document image URL" value={form.docx_url}
                        onChange={e => set('docx_url', e.target.value)} />
                    </div>
                    <div className="sa-form-group">
                      <label>Resume URL</label>
                      <input type="url" placeholder="Paste resume URL" value={form.resume_url}
                        onChange={e => set('resume_url', e.target.value)} />
                    </div>
                    <div className="sa-form-group">
                      <label>Employee Photo URL</label>
                      <input type="url" placeholder="Paste photo URL" value={form.photo_url}
                        onChange={e => set('photo_url', e.target.value)} />
                    </div>
                  </div>
                  <button type="submit" className="sa-btn sa-btn-primary"
                    disabled={saving || form.password !== form.confirm_password || !form.branch || (form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan))}>
                    {saving ? 'Creating...' : '✅ Create Employee'}
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="sa-card">
            <div className="sa-card-header"><h2>All Employees ({employees.length})</h2></div>
            <div className="sa-table-wrap">
              {loading ? <div className="sa-loading">Loading...</div> : (
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Email</th><th>Mobile</th><th>PAN</th>
                      <th>Branch</th><th>Role</th><th>Coins</th><th>Status</th><th>Joined</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length ? employees.map(emp => (
                      <tr key={emp.id}>
                        <td><strong>{emp.name}</strong></td>
                        <td>{emp.email}</td>
                        <td>{emp.mobile || '—'}</td>
                        <td>{emp.pan || '—'}</td>
                        <td>
                          {emp.branch
                            ? <span className="sa-status admin">{emp.branch}</span>
                            : <span style={{ color: '#9ca3af' }}>—</span>}
                        </td>
                        <td><span className="sa-status admin">{emp.is_admin ? 'Admin' : 'Employee'}</span></td>
                        <td>🪙 {emp.coins ?? 0}</td>
                        <td><span className={`sa-status ${emp.is_active ? 'active' : 'inactive'}`}>{emp.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td>{new Date(emp.created_at).toLocaleDateString()}</td>
                        <td style={{ display: 'flex', gap: 6 }}>
                          <button className="sa-btn sa-btn-warning sa-btn-sm" onClick={() => toggleStatus(emp.id)}>
                            {emp.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button className="sa-btn sa-btn-danger sa-btn-sm" onClick={() => deleteUser(emp.id)}>Delete</button>
                        </td>
                      </tr>
                    )) : <tr><td colSpan={10} className="sa-empty">No employees found</td></tr>}
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
