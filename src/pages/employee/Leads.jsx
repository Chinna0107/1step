import React, { useState } from 'react'
import EmployeeNavbar from '../../components/employee/EmployeeNavbar'
import { useLeads } from '../../hooks/useLeads'
import DocUpload from '../../components/common/DocUpload'
import '../../pages/dashboard.css'
import './Leads.css'
const fmt  = n => Number(parseFloat(n)||0).toLocaleString('en-IN')

const LEAD_TYPES = [
  { value: 'Credit Card',    label: '💳 New Credit Card Application' },
  { value: 'Personal Loan',  label: '💸 Personal Loan' },
  { value: 'Business Loan',  label: '🏦 Business Loan' },
  { value: 'CIBIL',          label: '📊 CIBIL Score Check / Repair' },
]

const STATUS_CONFIG = {
  new:        { label: '🟡 New',        bg: '#fef3c7', color: '#d97706' },
  in_process: { label: '🔵 In Process', bg: '#dbeafe', color: '#2563eb' },
  approved:   { label: '🟢 Approved',   bg: '#d1fae5', color: '#059669' },
  rejected:   { label: '🔴 Rejected',   bg: '#fee2e2', color: '#dc2626' },
}

const emptyForm = {
  cust_name: '', mobile: '', email: '', lead_type: '', required_amount: '',
  company_name: '', job_type: '', cibil_score: '', location: '', remarks: '',
  aadhar_url: '', pan_url: '', bank_stmt_url: '', payslip_url: '', followup_date: '',
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="lead-stat" style={{ borderTop: `3px solid ${color}` }}>
      <div className="lead-stat-icon" style={{ color }}>{icon}</div>
      <div className="lead-stat-val" style={{ color }}>{value}</div>
      <div className="lead-stat-label">{label}</div>
    </div>
  )
}

function DocField({ label, icon, field, value, onChange }) {
  return (
    <div className="dash-form-group">
      <DocUpload label={`${icon} ${label}`} url={value} onChange={url => onChange(field, url)} endpoint="/leads/upload-doc" role="employee" />
    </div>
  )
}

export default function Leads() {
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType]     = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(emptyForm)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')
  const [error, setError]       = useState('')
  const [viewLead, setViewLead] = useState(null)

  const { leads, stats, loading, load, createLead } = useLeads(filterStatus, filterType)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true); setMsg(''); setError('')
    try {
      await createLead(form)
      setMsg('✅ Lead submitted successfully!')
      setForm(emptyForm); setShowForm(false)
    } catch (err) { setError(err.message) }
    setSaving(false)
  }

  const filtered = leads.filter(l =>
    (!filterStatus || l.status === filterStatus) &&
    (!filterType   || l.lead_type === filterType)
  )

  return (
    <div className="emp-page">
      <EmployeeNavbar />
      <div className="emp-page-content">

        {/* ── Header ── */}
        <div className="emp-page-header">
          <h1>🎯 Lead Management</h1>
          <button className="lead-new-btn" onClick={() => { setShowForm(true); setMsg(''); setError('') }}>
            ➕ New Lead
          </button>
        </div>

        {msg   && <div className="dash-alert dash-alert-success" style={{ marginBottom: 16 }}>{msg}</div>}
        {error && <div className="dash-alert dash-alert-error"   style={{ marginBottom: 16 }}>❌ {error}</div>}

        {/* ── Stats ── */}
        <div className="lead-stats">
          <StatCard icon="📈" label="Total Leads Today"    value={stats.today      ?? 0} color="#0d1f3d" />
          <StatCard icon="🔵" label="In Process"           value={stats.in_process ?? 0} color="#2563eb" />
          <StatCard icon="🟢" label="Approved"             value={stats.approved   ?? 0} color="#059669" />
          <StatCard icon="🔴" label="Rejected"             value={stats.rejected   ?? 0} color="#dc2626" />
          <StatCard icon="💰" label="Converted Value"      value={`₹${fmt(stats.value ?? 0)}`} color="#d4af37" />
          <StatCard icon="📋" label="Total All Time"       value={stats.total      ?? 0} color="#64748b" />
        </div>

        {/* ── Filters ── */}
        <div className="lead-filters">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="lead-filter-sel">
            <option value="">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="lead-filter-sel">
            <option value="">All Types</option>
            {LEAD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <button className="dash-btn" onClick={load} style={{ background: '#f0f2f8', color: '#0d1f3d', border: 'none' }}>🔄 Refresh</button>
        </div>

        {/* ── Leads Table ── */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2>📋 Leads ({filtered.length})</h2>
          </div>
          <div className="dash-table-wrap">
            {loading ? <div className="dash-loading">Loading...</div> : filtered.length === 0 ? (
              <div className="dash-empty" style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                No leads found. Click ➕ New Lead to add one.
              </div>
            ) : (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>#</th><th>Customer</th><th>Mobile</th><th>Lead Type</th>
                    <th>Amount</th><th>Status</th><th>Follow-up</th><th>Date</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(l => {
                    const sc = STATUS_CONFIG[l.status] || STATUS_CONFIG.new
                    return (
                      <tr key={l.id}>
                        <td style={{ fontFamily: 'monospace', color: '#0d1f3d', fontWeight: 700, fontSize: 11 }}>#{l.id}</td>
                        <td><strong>{l.cust_name}</strong><div style={{ fontSize: 11, color: '#9ca3af' }}>{l.email || '—'}</div></td>
                        <td>
                          <a href={`tel:${l.mobile}`} style={{ color: '#059669', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                            📞 {l.mobile}
                          </a>
                        </td>
                        <td style={{ fontSize: 12 }}>{LEAD_TYPES.find(t => t.value === l.lead_type)?.label || l.lead_type}</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>{l.required_amount > 0 ? `₹${fmt(l.required_amount)}` : '—'}</td>
                        <td>
                          <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {sc.label}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: l.followup_date ? '#d97706' : '#9ca3af' }}>
                          {l.followup_date ? `📅 ${new Date(l.followup_date).toLocaleDateString('en-IN')}` : '—'}
                        </td>
                        <td style={{ fontSize: 12 }}>{new Date(l.created_at).toLocaleDateString('en-IN')}</td>
                        <td>
                          <button onClick={() => setViewLead(l)}
                            style={{ background: '#ede9fe', color: '#0d1f3d', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                            👁️ View
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── New Lead Form Modal ── */}
        {showForm && (
          <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
              <div style={{ background: 'linear-gradient(135deg,#081427,#0d1f3d,#1a365d)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>New Lead Entry</div>
                  <div style={{ color: '#fff', fontWeight: 900, fontSize: 18, marginTop: 2 }}>🎯 Lead Details</div>
                </div>
                <button onClick={() => setShowForm(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>✕</button>
              </div>
              <div style={{ overflowY: 'auto', padding: 24 }}>
                <form onSubmit={handleSubmit}>

                  {/* Basic Details */}
                  <div className="lead-section-title">👤 Basic Details</div>
                  <div className="dash-form-grid">
                    <div className="dash-form-group">
                      <label>Customer Name *</label>
                      <input required placeholder="Full name" value={form.cust_name} onChange={e => set('cust_name', e.target.value)} />
                    </div>
                    <div className="dash-form-group">
                      <label>📱 Mobile *</label>
                      <input required placeholder="10-digit mobile" maxLength={10} value={form.mobile}
                        onChange={e => set('mobile', e.target.value.replace(/\D/g,'').slice(0,10))} />
                    </div>
                    <div className="dash-form-group">
                      <label>📧 Email</label>
                      <input type="email" placeholder="email@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                    </div>
                  </div>

                  {/* Lead Details */}
                  <div className="lead-section-title">📌 Lead Details</div>
                  <div className="dash-form-grid">
                    <div className="dash-form-group">
                      <label>🏷️ Lead Type *</label>
                      <select required value={form.lead_type} onChange={e => set('lead_type', e.target.value)}>
                        <option value="">Select type</option>
                        {LEAD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div className="dash-form-group">
                      <label>💰 Required Amount (₹)</label>
                      <input type="number" placeholder="Loan / Limit amount" value={form.required_amount} onChange={e => set('required_amount', e.target.value)} />
                    </div>
                    <div className="dash-form-group">
                      <label>🏢 Company / Business Name</label>
                      <input placeholder="Company name" value={form.company_name} onChange={e => set('company_name', e.target.value)} />
                    </div>
                    <div className="dash-form-group">
                      <label>💼 Job Type</label>
                      <select value={form.job_type} onChange={e => set('job_type', e.target.value)}>
                        <option value="">Select</option>
                        <option value="Salaried">Salaried</option>
                        <option value="Self-Employed">Self-Employed</option>
                        <option value="Business">Business</option>
                        <option value="Student">Student</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="dash-form-group">
                      <label>📊 CIBIL Score</label>
                      <input type="number" placeholder="e.g. 750" min={300} max={900} value={form.cibil_score} onChange={e => set('cibil_score', e.target.value)} />
                    </div>
                    <div className="dash-form-group">
                      <label>📅 Follow-up Date</label>
                      <input type="date" value={form.followup_date} onChange={e => set('followup_date', e.target.value)} />
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="lead-section-title">📍 Additional Info</div>
                  <div className="dash-form-grid">
                    <div className="dash-form-group">
                      <label>📍 Location</label>
                      <input placeholder="City / Area" value={form.location} onChange={e => set('location', e.target.value)} />
                    </div>
                    <div className="dash-form-group" style={{ gridColumn: '1/-1' }}>
                      <label>📝 Remarks</label>
                      <textarea rows={2} placeholder="Any additional notes..." value={form.remarks} onChange={e => set('remarks', e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(13,31,61,0.2)', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="lead-section-title">📎 Documents (Optional)</div>
                  <div className="dash-form-grid">
                    <DocField label="Aadhaar"        icon="🪪" field="aadhar_url"    value={form.aadhar_url}    onChange={set} />
                    <DocField label="PAN"            icon="🆔" field="pan_url"       value={form.pan_url}       onChange={set} />
                    <DocField label="Bank Statement" icon="📊" field="bank_stmt_url" value={form.bank_stmt_url} onChange={set} />
                    <DocField label="Payslips"       icon="📄" field="payslip_url"   value={form.payslip_url}   onChange={set} />
                  </div>

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                    <button type="button" onClick={() => setShowForm(false)}
                      style={{ padding: '12px 24px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={saving}
                      style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0d1f3d,#1a365d)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                      {saving ? 'Submitting...' : '🎯 Submit Lead'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── View Lead Modal ── */}
        {viewLead && (
          <div onClick={() => setViewLead(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
              <div style={{ background: 'linear-gradient(135deg,#081427,#0d1f3d,#1a365d)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Lead #{viewLead.id}</div>
                  <div style={{ color: '#fff', fontWeight: 900, fontSize: 18, marginTop: 2 }}>{viewLead.cust_name}</div>
                </div>
                <button onClick={() => setViewLead(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>✕</button>
              </div>
              <div style={{ overflowY: 'auto', padding: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Mobile',      value: viewLead.mobile,        link: `tel:${viewLead.mobile}` },
                    { label: 'Email',        value: viewLead.email || '—',  link: viewLead.email ? `mailto:${viewLead.email}` : null },
                    { label: 'Lead Type',    value: LEAD_TYPES.find(t => t.value === viewLead.lead_type)?.label || viewLead.lead_type },
                    { label: 'Amount',       value: viewLead.required_amount > 0 ? `₹${fmt(viewLead.required_amount)}` : '—', color: '#059669' },
                    { label: 'Job Type',     value: viewLead.job_type     || '—' },
                    { label: 'Company',      value: viewLead.company_name || '—' },
                    { label: 'CIBIL Score',  value: viewLead.cibil_score  || '—', color: viewLead.cibil_score >= 750 ? '#059669' : viewLead.cibil_score >= 650 ? '#d97706' : '#dc2626' },
                    { label: 'Location',     value: viewLead.location     || '—' },
                    { label: 'Follow-up',    value: viewLead.followup_date ? new Date(viewLead.followup_date).toLocaleDateString('en-IN') : '—', color: '#d97706' },
                    { label: 'Added By',     value: viewLead.employee_name || '—' },
                    { label: 'Branch',       value: viewLead.branch        || '—' },
                    { label: 'Created',      value: new Date(viewLead.created_at).toLocaleString('en-IN') },
                  ].map(f => (
                    <div key={f.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{f.label}</div>
                      {f.link
                        ? <a href={f.link} style={{ fontSize: 14, fontWeight: 700, color: '#059669', textDecoration: 'none' }}>{f.value}</a>
                        : <div style={{ fontSize: 14, fontWeight: 700, color: f.color || '#081427' }}>{f.value}</div>
                      }
                    </div>
                  ))}
                </div>

                {viewLead.remarks && (
                  <div style={{ marginTop: 12, background: '#fef3c7', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Remarks</div>
                    <div style={{ fontSize: 13, color: '#92400e' }}>{viewLead.remarks}</div>
                  </div>
                )}

                {/* Documents */}
                {(viewLead.aadhar_url || viewLead.pan_url || viewLead.bank_stmt_url || viewLead.payslip_url) && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Documents</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {[['🪪 Aadhaar', viewLead.aadhar_url], ['🆔 PAN', viewLead.pan_url], ['📊 Bank Stmt', viewLead.bank_stmt_url], ['📄 Payslip', viewLead.payslip_url]].map(([label, url]) =>
                        url ? <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                          style={{ padding: '6px 12px', background: '#ede9fe', color: '#0d1f3d', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>{label}</a> : null
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, justifyContent: 'space-between', flexShrink: 0 }}>
                <a href={`tel:${viewLead.mobile}`}
                  style={{ padding: '10px 20px', borderRadius: 10, background: '#d1fae5', color: '#059669', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                  📞 Call Now
                </a>
                <a href={`https://wa.me/${viewLead.mobile}?text=${encodeURIComponent(`Hi ${viewLead.cust_name}, regarding your ${viewLead.lead_type} application. - 1 Step Finance Care`)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ padding: '10px 20px', borderRadius: 10, background: '#25D366', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                  💬 WhatsApp
                </a>
                <button onClick={() => setViewLead(null)}
                  style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0d1f3d,#1a365d)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
