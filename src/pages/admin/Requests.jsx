import React, { useState, useEffect, useCallback } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useCustomerRequests } from '../../hooks/useCustomers'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import '../../pages/dashboard.css'
import './Requests.css'

const authAdmin = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })
const fmt = n => Number(parseFloat(n)||0).toLocaleString('en-IN')

const LEAD_TYPES = {
  'Credit Card':   '💳 Credit Card',
  'Personal Loan': '💸 Personal Loan',
  'Business Loan': '🏦 Business Loan',
  'CIBIL':         '📊 CIBIL',
}

export default function Requests() {
  const { pending, all, loading, error, msg, approve, reject } = useCustomerRequests()
  const [tab, setTab]           = useState('pending')
  const [section, setSection]   = useState('customers')
  const [lightbox, setLightbox] = useState(null)
  const [leads, setLeads]       = useState([])
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [leadsMsg, setLeadsMsg] = useState('')

  const loadLeads = useCallback(() => {
    setLeadsLoading(true)
    api('/leads?status=new', { headers: authAdmin() })
      .then(d => { setLeads(d); setLeadsLoading(false) })
      .catch(() => setLeadsLoading(false))
  }, [])

  useEffect(() => { if (section === 'leads') loadLeads() }, [section, loadLeads])

  const updateLeadStatus = async (id, status) => {
    try {
      await api(`/leads/${id}`, { method: 'PATCH', headers: authAdmin(), body: JSON.stringify({ status }) })
      setLeadsMsg(`✅ Lead marked as ${status}`)
      setLeads(l => l.filter(x => x.id !== id))
    } catch (err) { alert(err.message) }
  }

  const rows = tab === 'pending' ? pending : all

  const statusStyle = s => ({
    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-block',
    background: s === 'approved' ? '#d1fae5' : s === 'rejected' ? '#fee2e2' : '#fef3c7',
    color:      s === 'approved' ? '#059669' : s === 'rejected' ? '#dc2626' : '#d97706',
  })

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <h1>{section === 'leads' ? '🎯 Lead Requests' : 'Customer Requests'}</h1>
          <div className="dash-topbar-right">
            <span className="dash-badge">🔔 {pending.length} Pending Customers</span>
            <span className="dash-badge" style={{ background: '#ede9fe', color: '#402070', marginLeft: 8 }}>🎯 {leads.length} New Leads</span>
          </div>
        </div>
        <div className="dash-main">

          {/* Section Toggle */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button onClick={() => setSection('customers')}
              style={{ padding: '10px 24px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                background: section === 'customers' ? 'linear-gradient(135deg,#402070,#c02040)' : '#f0f2f8',
                color: section === 'customers' ? '#fff' : '#64748b' }}>
              👥 Customer Requests ({pending.length})
            </button>
            <button onClick={() => setSection('leads')}
              style={{ padding: '10px 24px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                background: section === 'leads' ? 'linear-gradient(135deg,#402070,#c02040)' : '#f0f2f8',
                color: section === 'leads' ? '#fff' : '#64748b' }}>
              🎯 Lead Requests ({leads.length})
            </button>
          </div>

          {/* ── CUSTOMERS ── */}
          {section === 'customers' && (
            <>
              {msg   && <div className="dash-alert dash-alert-success">✅ {msg}</div>}
              {error && <div className="dash-alert dash-alert-error">❌ {error}</div>}
              <div className="dash-tabs">
                <button className={`dash-tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>Pending ({pending.length})</button>
                <button className={`dash-tab ${tab === 'all'     ? 'active' : ''}`} onClick={() => setTab('all')}>All Requests ({all.length})</button>
              </div>
              <div className="dash-card">
                <div className="dash-card-header"><h2>{tab === 'pending' ? 'Pending Approvals' : 'All Customer Requests'}</h2></div>
                <div className="dash-table-wrap">
                  {loading ? <div className="dash-loading">Loading...</div> : rows.length === 0 ? (
                    <div className="dash-empty">No {tab === 'pending' ? 'pending' : ''} requests found</div>
                  ) : (
                    <table className="dash-table">
                      <thead>
                        <tr><th>Customer</th><th>Email</th><th>Phone</th><th>PAN</th><th>Aadhar</th><th>Acc No.</th><th>Branch</th><th>Documents</th><th>Submitted By</th><th>Status</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {rows.map(c => (
                          <tr key={c.id}>
                            <td><strong>{c.name}</strong></td>
                            <td>{c.email}</td>
                            <td>{c.phone}</td>
                            <td>{c.pan}</td>
                            <td>{c.aadhar}</td>
                            <td>{c.acc_number}</td>
                            <td>{c.branch || '—'}</td>
                            <td>
                              <div className="req-doc-thumbs">
                                {c.aadhar_img_url
                                  ? <button className="req-doc-btn" onClick={() => setLightbox({ url: c.aadhar_img_url, label: `${c.name} — Aadhar` })}>🪪 Aadhar</button>
                                  : <span className="req-no-doc">No Aadhar</span>}
                                {c.pan_img_url
                                  ? <button className="req-doc-btn" onClick={() => setLightbox({ url: c.pan_img_url, label: `${c.name} — PAN` })}>🪪 PAN</button>
                                  : <span className="req-no-doc">No PAN</span>}
                              </div>
                            </td>
                            <td>{c.added_by_name}</td>
                            <td><span style={statusStyle(c.status)}>{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span></td>
                            <td>
                              {c.status === 'pending' ? (
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button className="dash-btn dash-btn-success dash-btn-sm" onClick={() => approve(c.id)}>✅ Approve</button>
                                  <button className="dash-btn dash-btn-danger  dash-btn-sm" onClick={() => reject(c.id)}>❌ Reject</button>
                                </div>
                              ) : (
                                <span style={{ fontSize: 12, color: '#888' }}>by {c.reviewed_by_name || '—'}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── LEADS ── */}
          {section === 'leads' && (
            <>
              {leadsMsg && <div className="dash-alert dash-alert-success" style={{ marginBottom: 16 }}>{leadsMsg}</div>}
              <div className="dash-card">
                <div className="dash-card-header">
                  <h2>🎯 New Lead Requests ({leads.length})</h2>
                  <button className="dash-btn" onClick={loadLeads} style={{ background: '#f0f2f8', color: '#402070', border: 'none', fontSize: 12 }}>🔄 Refresh</button>
                </div>
                <div className="dash-table-wrap">
                  {leadsLoading ? <div className="dash-loading">Loading...</div> : leads.length === 0 ? (
                    <div className="dash-empty">No new lead requests</div>
                  ) : (
                    <table className="dash-table">
                      <thead>
                        <tr><th>#</th><th>Customer</th><th>Mobile</th><th>Lead Type</th><th>Amount</th><th>Job Type</th><th>CIBIL</th><th>Location</th><th>Employee</th><th>Documents</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {leads.map(l => (
                          <tr key={l.id}>
                            <td style={{ fontFamily: 'monospace', color: '#402070', fontWeight: 700, fontSize: 11 }}>#{l.id}</td>
                            <td>
                              <strong>{l.cust_name}</strong>
                              {l.email && <div style={{ fontSize: 11, color: '#9ca3af' }}>{l.email}</div>}
                              {l.remarks && <div style={{ fontSize: 11, color: '#d97706', marginTop: 2 }}>📝 {l.remarks}</div>}
                            </td>
                            <td>
                              <a href={`tel:${l.mobile}`} style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>📞 {l.mobile}</a>
                            </td>
                            <td style={{ fontSize: 12 }}>{LEAD_TYPES[l.lead_type] || l.lead_type}</td>
                            <td style={{ color: '#059669', fontWeight: 700 }}>{l.required_amount > 0 ? `₹${fmt(l.required_amount)}` : '—'}</td>
                            <td style={{ fontSize: 12 }}>{l.job_type || '—'}</td>
                            <td style={{ fontSize: 13, fontWeight: 700, color: l.cibil_score >= 750 ? '#059669' : l.cibil_score >= 650 ? '#d97706' : l.cibil_score ? '#dc2626' : '#9ca3af' }}>
                              {l.cibil_score || '—'}
                            </td>
                            <td style={{ fontSize: 12 }}>{l.location || '—'}</td>
                            <td style={{ fontSize: 12 }}>
                              {l.employee_name || '—'}
                              <div style={{ fontSize: 11, color: '#9ca3af' }}>{l.branch || ''}</div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {l.aadhar_url    && <a href={l.aadhar_url}    target="_blank" rel="noopener noreferrer" className="req-doc-btn">🪪 Aadhar</a>}
                                {l.pan_url       && <a href={l.pan_url}       target="_blank" rel="noopener noreferrer" className="req-doc-btn">🆔 PAN</a>}
                                {l.bank_stmt_url && <a href={l.bank_stmt_url} target="_blank" rel="noopener noreferrer" className="req-doc-btn">📊 Bank</a>}
                                {l.payslip_url   && <a href={l.payslip_url}   target="_blank" rel="noopener noreferrer" className="req-doc-btn">📄 Payslip</a>}
                                {!l.aadhar_url && !l.pan_url && !l.bank_stmt_url && !l.payslip_url && <span className="req-no-doc">None</span>}
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className="dash-btn dash-btn-success dash-btn-sm" onClick={() => updateLeadStatus(l.id, 'in_process')}>🔵 Process</button>
                                <button className="dash-btn dash-btn-danger  dash-btn-sm" onClick={() => updateLeadStatus(l.id, 'rejected')}>❌ Reject</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {lightbox && (
        <div className="req-lightbox" onClick={() => setLightbox(null)}>
          <div className="req-lightbox-box" onClick={e => e.stopPropagation()}>
            <div className="req-lightbox-header">
              <span>{lightbox.label}</span>
              <button onClick={() => setLightbox(null)}>✕</button>
            </div>
            <img src={lightbox.url} alt={lightbox.label} className="req-lightbox-img" />
          </div>
        </div>
      )}
    </div>
  )
}
