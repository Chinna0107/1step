import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import EmployeeNavbar from '../../components/employee/EmployeeNavbar'
import { useAddCustomer, useMyCustomers } from '../../hooks/useCustomers'
import { getUserByRole, getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import config from '../../config'
import '../../pages/dashboard.css'

const empty = {
  name: '', email: '', phone: '', pan: '', aadhar: '', acc_number: '',
  branch: '', aadhar_img_url: '', pan_img_url: '', card_front_img_url: '',
  referral_name: '', referral_phone: '', customer_type: 'general',
  bank_name: '', mpin: '', cards: []
}

function ImgUploadField({ label, icon, fieldKey, value, onChange }) {
  const inputRef = useRef()
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const token = getTokenByRole('employee') || getTokenByRole('admin')

  const handleFile = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadErr('')
    try {
      const fd = new FormData()
      fd.append(fieldKey, file)
      const res = await fetch(`${config.API_URL}/customers/upload-kyc`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      const urlKey = fieldKey + '_url'
      onChange(urlKey, data[urlKey])
    } catch (err) {
      setUploadErr(err.message)
    }
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div className="dash-form-group">
      <label>{icon} {label}</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
        <button
          type="button"
          onClick={() => inputRef.current.click()}
          disabled={uploading}
          style={{
            padding: '8px 16px', background: uploading ? '#94a3b8' : '#3448c5',
            color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700,
            fontSize: 13, cursor: uploading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap'
          }}>
          {uploading ? '⏳ Uploading...' : '☁️ Upload File'}
        </button>
        {value && (
          <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>✅ Uploaded</span>
        )}
        {!value && !uploading && (
          <span style={{ fontSize: 12, color: '#9ca3af' }}>No file chosen</span>
        )}
      </div>
      {uploadErr && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block' }}>❌ {uploadErr}</span>}
      {value && (
        <div style={{ marginTop: 8, position: 'relative', display: 'inline-block' }}>
          <img
            src={value} alt={label}
            onError={e => e.target.style.display = 'none'}
            style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0', display: 'block' }}
          />
          <button
            type="button"
            onClick={() => onChange(fieldKey + '_url', '')}
            style={{
              position: 'absolute', top: 4, right: 4, background: '#dc2626', color: '#fff',
              border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer',
              fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>✕</button>
        </div>
      )}
    </div>
  )
}

export default function AddCustomer() {
  const navigate = useNavigate()
  const { submitCustomer, loading, error, success } = useAddCustomer()
  const { customers, loading: listLoading, refetch } = useMyCustomers()
  const currentUser = getUserByRole('employee') || getUserByRole('admin')
  const branch = currentUser?.branch || ''
  const [form, setForm]             = useState({ ...empty, branch })
  const [showForm, setShowForm]     = useState(false)
  const [fraudAlert, setFraudAlert] = useState(null)
  const [checkingFraud, setCheckingFraud] = useState(false)

  useEffect(() => {
    const pendingName = localStorage.getItem('pendingCustomerName')
    if (pendingName) {
      localStorage.removeItem('pendingCustomerName')
      setForm(f => ({ ...f, name: pendingName }))
      setShowForm(true)
    }
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const checkFraud = useCallback(async (phone) => {
    if (!/^\d{10}$/.test(phone)) { setFraudAlert(null); return }
    setCheckingFraud(true)
    try {
      const r = await api(`/fraud/check/${phone}`, {
        headers: { Authorization: `Bearer ${getTokenByRole('employee') || getTokenByRole('admin')}` }
      })
      setFraudAlert(r.fraud ? r.entry : null)
    } catch { setFraudAlert(null) }
    setCheckingFraud(false)
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    if (fraudAlert) return
    const ok = await submitCustomer(form)
    if (ok) {
      setForm({ ...empty, branch })
      setShowForm(false)
      refetch()
    }
  }

  const statusStyle = s => ({
    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-block',
    background: s === 'approved' ? '#d1fae5' : s === 'rejected' ? '#fee2e2' : '#fef3c7',
    color:      s === 'approved' ? '#059669' : s === 'rejected' ? '#dc2626' : '#d97706',
  })

  return (
    <div className="emp-page">
      <EmployeeNavbar />
      <div className="emp-page-content">
        <div className="emp-page-header">
          <h1>Add New Customer</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="dash-btn" onClick={() => navigate(-1)} style={{ background: '#f0f2f8', color: '#0d1f3d', border: 'none' }}>
              ← Back
            </button>
            <button className="dash-btn dash-btn-primary" onClick={() => setShowForm(v => !v)}>
              {showForm ? '✕ Cancel' : '+ New Customer'}
            </button>
          </div>
        </div>

        {success && <div className="dash-alert dash-alert-success" style={{ marginBottom: 16 }}>✅ {success}</div>}
        {error   && <div className="dash-alert dash-alert-error"   style={{ marginBottom: 16 }}>❌ {error}</div>}

        {showForm && (
          <div className="dash-card" style={{ marginBottom: 20 }}>
            <div className="dash-card-header">
              <h2>👤 Customer Details</h2>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>All * fields required</span>
            </div>
            <div className="dash-card-body">
              <form onSubmit={handleSubmit}>

                {/* ── Customer Type ── */}
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0d1f3d', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Customer Type</div>
                <div className="dash-form-grid" style={{ marginBottom: 20 }}>
                  <div className="dash-form-group">
                    <label>Customer Type *</label>
                    <select required value={form.customer_type} onChange={e => set('customer_type', e.target.value)}>
                      <option value="general">Credit Card</option>
                      <option value="credit_repair">CIBIL Repair</option>
                    </select>
                  </div>
                </div>

                {/* ── Personal Info ── */}
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0d1f3d', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Personal Information</div>
                <div className="dash-form-grid" style={{ marginBottom: 20 }}>
                  <div className="dash-form-group">
                    <label>Full Name *</label>
                    <input required placeholder="Customer full name" value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                  <div className="dash-form-group">
                    <label>Email *</label>
                    <input required type="email" placeholder="customer@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div className="dash-form-group">
                    <label>Phone *</label>
                    <input required placeholder="10-digit phone" maxLength={10} value={form.phone}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 10)
                        set('phone', v)
                        checkFraud(v)
                      }} />
                    {checkingFraud && <span style={{ fontSize: 11, color: '#9ca3af' }}>Checking fraud list...</span>}
                    {fraudAlert && (
                      <div style={{ marginTop: 8, background: '#fee2e2', border: '2px solid #fca5a5', borderRadius: 10, padding: '10px 14px' }}>
                        <div style={{ fontWeight: 900, color: '#dc2626', fontSize: 14 }}>🚨 FRAUD ALERT — Onboarding Blocked</div>
                        <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>This mobile number is in the fraud list.</div>
                        <div style={{ fontSize: 12, color: '#7f1d1d', marginTop: 4 }}>
                          <strong>Name:</strong> {fraudAlert.name} &nbsp;|&nbsp;
                          <strong>Reason:</strong> {fraudAlert.reason || 'Not specified'}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="dash-form-group">
                    <label>PAN Number *</label>
                    <input required placeholder="ABCDE1234F" maxLength={10} value={form.pan}
                      onChange={e => set('pan', e.target.value.toUpperCase())} />
                    {form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan) && (
                      <span className="dash-field-hint" style={{ color: '#dc2626', fontSize: 11 }}>Format: ABCDE1234F</span>
                    )}
                  </div>
                  <div className="dash-form-group">
                    <label>Aadhar Number *</label>
                    <input required placeholder="12-digit Aadhar" maxLength={12} value={form.aadhar}
                      onChange={e => set('aadhar', e.target.value.replace(/\D/g, '').slice(0, 12))} />
                  </div>
                  <div className="dash-form-group">
                    <label>Account Number *</label>
                    <input required placeholder="Bank account number" value={form.acc_number}
                      onChange={e => set('acc_number', e.target.value.replace(/\D/g, ''))} />
                  </div>
                  <div className="dash-form-group">
                    <label>Branch</label>
                    <input readOnly value={form.branch} style={{ background: '#f8fafc', color: '#0d1f3d', fontWeight: 700, cursor: 'not-allowed' }} />
                  </div>
                </div>

                {/* ── Bank & Security ── */}
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0d1f3d', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, marginTop: 20 }}>Bank & Security</div>
                <div className="dash-form-grid" style={{ marginBottom: 20 }}>
                  <div className="dash-form-group">
                    <label>Bank Name</label>
                    <input placeholder="e.g. HDFC Bank" value={form.bank_name} onChange={e => set('bank_name', e.target.value)} />
                  </div>
                  <div className="dash-form-group">
                    <label>MPIN</label>
                    <input placeholder="4–6 digit MPIN" maxLength={6} value={form.mpin}
                      onChange={e => set('mpin', e.target.value.replace(/\D/g, '').slice(0, 6))} />
                  </div>
                </div>

                {/* ── Credit Cards ── */}
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0d1f3d', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Credit Cards</div>
                <div style={{ marginBottom: 20 }}>
                  {form.cards.map((card, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, marginBottom: 10, alignItems: 'end' }}>
                      <div className="dash-form-group" style={{ marginBottom: 0 }}>
                        <label>Card {i + 1} — Bank Name</label>
                        <input placeholder="e.g. ICICI Bank" value={card.bank}
                          onChange={e => {
                            const updated = [...form.cards]
                            updated[i] = { ...updated[i], bank: e.target.value }
                            set('cards', updated)
                          }} />
                      </div>
                      <div className="dash-form-group" style={{ marginBottom: 0 }}>
                        <label>Card Number (last 4 digits)</label>
                        <input placeholder="e.g. 4521" maxLength={4} value={card.last4}
                          onChange={e => {
                            const updated = [...form.cards]
                            updated[i] = { ...updated[i], last4: e.target.value.replace(/\D/g, '').slice(0, 4) }
                            set('cards', updated)
                          }} />
                      </div>
                      <button type="button"
                        onClick={() => set('cards', form.cards.filter((_, j) => j !== i))}
                        style={{ padding: '10px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13, marginBottom: 0 }}>
                        ✕
                      </button>
                    </div>
                  ))}
                  <button type="button"
                    onClick={() => set('cards', [...form.cards, { bank: '', last4: '' }])}
                    style={{ padding: '9px 18px', background: '#ede9fe', color: '#4c1d95', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                    + Add Card
                  </button>
                </div>

                {/* ── Referral Details ── */}
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0d1f3d', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, marginTop: 20 }}>Referral Details (Optional)</div>
                <div className="dash-form-grid" style={{ marginBottom: 20 }}>
                  <div className="dash-form-group">
                    <label>Referral Name</label>
                    <input placeholder="Referred by (name)" value={form.referral_name} onChange={e => set('referral_name', e.target.value)} />
                  </div>
                  <div className="dash-form-group">
                    <label>Referral Phone</label>
                    <input placeholder="10-digit phone" maxLength={10} value={form.referral_phone}
                      onChange={e => set('referral_phone', e.target.value.replace(/\D/g, '').slice(0, 10))} />
                    {form.referral_phone && !/^\d{10}$/.test(form.referral_phone) && (
                      <span className="dash-field-hint" style={{ color: '#dc2626', fontSize: 11 }}>Must be 10 digits</span>
                    )}
                  </div>
                </div>

                {/* ── Document Images ── */}
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0d1f3d', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Document Images</div>
                <div className="dash-form-grid">
                  <ImgUploadField label="Aadhar Card Image"  icon="🪪" fieldKey="aadhar_img"      value={form.aadhar_img_url}      onChange={set} />
                  <ImgUploadField label="PAN Card Image"     icon="💳" fieldKey="pan_img"         value={form.pan_img_url}         onChange={set} />
                  <ImgUploadField label="Card Front Image"   icon="🏧" fieldKey="card_front_img"  value={form.card_front_img_url}  onChange={set} />
                </div>

                <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ padding: '12px 24px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                    Cancel
                  </button>
                  <button type="submit" className="dash-btn dash-btn-primary"
                    disabled={loading || !!fraudAlert || (form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan)) || (form.referral_phone && !/^\d{10}$/.test(form.referral_phone))}>
                    {loading ? 'Submitting...' : '📤 Submit for Approval'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="dash-card">
          <div className="dash-card-header">
            <h2>My Submitted Customers ({customers.length})</h2>
          </div>
          <div className="dash-table-wrap">
            {listLoading ? <div className="dash-loading">Loading...</div> : customers.length === 0 ? (
              <div className="dash-empty" style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                No customers submitted yet. Click "+ New Customer" to add one.
              </div>
            ) : (
              <table className="dash-table">
                <thead>
                  <tr><th>Name</th><th>Phone</th><th>PAN</th><th>Bank</th><th>Cards</th><th>Type</th><th>Branch</th><th>Status</th><th>Submitted</th></tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.name}</strong></td>
                      <td style={{ fontSize: 12 }}>{c.phone}</td>
                      <td style={{ fontSize: 12 }}>{c.pan}</td>
                      <td style={{ fontSize: 12 }}>{c.bank_name || '—'}</td>
                      <td style={{ fontSize: 12 }}>
                        {Array.isArray(c.cards) && c.cards.length > 0
                          ? <span style={{ background: '#ede9fe', color: '#4c1d95', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{c.cards.length} card{c.cards.length > 1 ? 's' : ''}</span>
                          : '—'}
                      </td>
                      <td>
                        <span style={{
                          padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: c.customer_type === 'credit_repair' ? '#ede9fe' : '#e0f2fe',
                          color: c.customer_type === 'credit_repair' ? '#7c3aed' : '#0369a1',
                        }}>
                          {c.customer_type === 'credit_repair' ? 'CIBIL Repair' : 'General'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>{c.branch || '—'}</td>
                      <td><span style={statusStyle(c.status)}>{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span></td>
                      <td style={{ fontSize: 12 }}>{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
