import React, { useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useCustomerRequests } from '../../hooks/useCustomers'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import '../../pages/dashboard.css'
import '../employee/CustomerInfo.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })
const fmt  = n => Number(parseFloat(n) || 0).toLocaleString('en-IN')

function CustomerDetailModal({ customer: c, onClose }) {
  const [txns, setTxns]       = useState(null)
  const [txnLoad, setTxnLoad] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const [tab, setTab]         = useState('details')

  const loadTxns = async () => {
    if (txns) return
    setTxnLoad(true)
    try {
      const data = await api(`/master/transactions?customer_id=${c.id}`, { headers: auth() })
      setTxns(Array.isArray(data) ? data : [])
    } catch { setTxns([]) }
    setTxnLoad(false)
  }

  const handleTab = t => { setTab(t); if (t === 'transactions') loadTxns() }

  const statusColor = s => s === 'approved' ? '#059669' : s === 'rejected' ? '#dc2626' : '#d97706'
  const statusBg    = s => s === 'approved' ? '#d1fae5' : s === 'rejected' ? '#fee2e2' : '#fef3c7'

  const fields = [
    { label: 'Customer ID',   value: `#${c.id}` },
    { label: 'Full Name',     value: c.name || '—' },
    { label: 'Email',         value: c.email || '—' },
    { label: 'Phone',         value: c.phone || '—' },
    { label: 'PAN Number',    value: c.pan || '—',    mono: true },
    { label: 'Aadhar Number', value: c.aadhar ? c.aadhar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '—', mono: true },
    { label: 'Account No.',   value: c.acc_number || '—', mono: true },
    { label: 'Branch',        value: c.branch || '—' },
    { label: 'Added By',      value: c.added_by_name || '—' },
    { label: 'Reviewed By',   value: c.reviewed_by_name || '—' },
    { label: 'Reviewed At',   value: c.reviewed_at ? new Date(c.reviewed_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—' },
    { label: 'Member Since',  value: new Date(c.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) },
    ...(c.referral_name || c.referral_phone ? [
      { label: 'Referred By (Name)',   value: c.referral_name  || '—' },
      { label: 'Referred By (Phone)',  value: c.referral_phone || '—' },
    ] : []),
  ]

  const docs = [
    { label: '🪪 Aadhaar Card', url: c.aadhar_img_url },
    { label: '🆔 PAN Card',     url: c.pan_img_url },
    { label: '🏧 Card Front',   url: c.card_front_img_url },
  ].filter(d => d.url)

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#1a0a2e,#402070,#c02040)', padding: '20px 24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#d4af37' }}>
                {c.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>{c.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 }}>{c.email} · {c.phone}</div>
                <span style={{ background: statusBg(c.status), color: statusColor(c.status), padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, marginTop: 6, display: 'inline-block' }}>
                  {c.status === 'approved' ? '✅ Verified' : c.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                </span>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
            {[['details','👤 Details'], ['documents','🖼️ Documents'], ['transactions','📋 Transactions']].map(([key, label]) => (
              <button key={key} onClick={() => handleTab(key)}
                style={{ padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  background: tab === key ? '#fff' : 'rgba(255,255,255,0.15)',
                  color: tab === key ? '#402070' : 'rgba(255,255,255,0.8)' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 20 }}>

          {/* ── Details Tab ── */}
          {tab === 'details' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {fields.map(f => (
                <div key={f.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a0a2e', fontFamily: f.mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{f.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── Documents Tab ── */}
          {tab === 'documents' && (
            <div>
              {docs.length === 0 ? (
                <div className="dash-empty">No documents uploaded</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16 }}>
                  {docs.map(d => (
                    <div key={d.label} style={{ background: '#f8fafc', borderRadius: 12, overflow: 'hidden', border: '1.5px solid #e2e8f0' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#402070', padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>{d.label}</div>
                      <img src={d.url} alt={d.label} onClick={() => setLightbox({ url: d.url, label: `${c.name} — ${d.label}` })}
                        style={{ width: '100%', height: 140, objectFit: 'cover', cursor: 'pointer', display: 'block' }} />
                      <div style={{ padding: '8px 12px' }}>
                        <a href={d.url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 11, color: '#402070', fontWeight: 700, textDecoration: 'none' }}>🔗 Open Full Size</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {docs.length === 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 8 }}>
                  {[['🪪 Aadhaar Card', c.aadhar_img_url], ['🆔 PAN Card', c.pan_img_url], ['🏧 Card Front', c.card_front_img_url]].map(([label]) => (
                    <div key={label} style={{ background: '#f8fafc', borderRadius: 12, padding: 20, textAlign: 'center', border: '1.5px dashed #e2e8f0' }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{label.split(' ')[0]}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{label} not uploaded</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Transactions Tab ── */}
          {tab === 'transactions' && (
            <div>
              {txnLoad ? <div className="dash-loading">Loading...</div> : txns === null ? (
                <div className="dash-empty">Loading transactions...</div>
              ) : txns.length === 0 ? (
                <div className="dash-empty">No transactions found for this customer</div>
              ) : (
                <>
                  {/* Summary */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                    {[
                      { label: 'Total Txns',   value: txns.length,                                                    color: '#402070' },
                      { label: 'Total Amount', value: `₹${fmt(txns.reduce((s,t) => s + parseFloat(t.amount||0), 0))}`, color: '#059669' },
                      { label: 'Total Charges',value: `₹${fmt(txns.reduce((s,t) => s + parseFloat(t.charges_amount||0), 0))}`, color: '#d97706' },
                    ].map(s => (
                      <div key={s.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="dash-table">
                      <thead>
                        <tr><th>#</th><th>Date</th><th>Service</th><th>Platform</th><th>Amount</th><th>Charges</th><th>Settled</th></tr>
                      </thead>
                      <tbody>
                        {txns.map(t => (
                          <tr key={t.id}>
                            <td style={{ fontFamily: 'monospace', color: '#402070', fontWeight: 700, fontSize: 11 }}>#{t.id}</td>
                            <td style={{ fontSize: 11 }}>
                              <div>{new Date(t.created_at).toLocaleDateString('en-IN')}</div>
                              <div style={{ color: '#9ca3af' }}>{new Date(t.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                            <td style={{ fontSize: 12 }}>{t.service_type || '—'}</td>
                            <td><span style={{ background: '#ede9fe', color: '#402070', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{t.platform || t.bill_platform || '—'}</span></td>
                            <td style={{ color: '#059669', fontWeight: 700 }}>₹{fmt(t.amount)}</td>
                            <td style={{ color: '#d97706', fontSize: 12 }}>₹{fmt(t.charges_amount || 0)}</td>
                            <td style={{ color: '#402070', fontWeight: 700 }}>₹{fmt(t.settled_amount || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href={`tel:${c.phone}`} style={{ padding: '8px 16px', borderRadius: 10, background: '#d1fae5', color: '#059669', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>📞 Call</a>
            <a href={`https://wa.me/${c.phone?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${c.name}, this is MoneySpot. How can we help you?`)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ padding: '8px 16px', borderRadius: 10, background: '#25D366', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>💬 WhatsApp</a>
          </div>
          <button onClick={onClose} style={{ padding: '8px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#402070,#c02040)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Close</button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', maxWidth: 700, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#1a0a2e' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{lightbox.label}</span>
              <button onClick={() => setLightbox(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>
            <img src={lightbox.url} alt={lightbox.label} style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', display: 'block' }} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminCustomers() {
  const { all, loading, error, msg, approve, reject } = useCustomerRequests()
  const [search,     setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected,   setSelected]   = useState(null)
  const [lightbox,   setLightbox]   = useState(null)

  const filtered = all.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.pan?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
    const matchStatus = !statusFilter || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts = {
    total:    all.length,
    approved: all.filter(c => c.status === 'approved').length,
    pending:  all.filter(c => c.status === 'pending').length,
    rejected: all.filter(c => c.status === 'rejected').length,
  }

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <h1>👥 Customer Details</h1>
          <div className="dash-topbar-right">
            <input placeholder="Search name / phone / PAN / email..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ padding: '7px 14px', borderRadius: 8, border: '1.5px solid rgba(64,32,112,0.2)', fontFamily: 'inherit', fontSize: 13, width: 260 }} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid rgba(64,32,112,0.2)', fontFamily: 'inherit', fontSize: 13 }}>
              <option value="">All Status</option>
              <option value="approved">✅ Approved</option>
              <option value="pending">⏳ Pending</option>
              <option value="rejected">❌ Rejected</option>
            </select>
          </div>
        </div>

        <div className="dash-main">
          {msg   && <div className="dash-alert dash-alert-success">✅ {msg}</div>}
          {error && <div className="dash-alert dash-alert-error">❌ {error}</div>}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Total',    value: counts.total,    color: '#402070', bg: '#ede9fe', icon: '👥' },
              { label: 'Approved', value: counts.approved, color: '#059669', bg: '#d1fae5', icon: '✅' },
              { label: 'Pending',  value: counts.pending,  color: '#d97706', bg: '#fef3c7', icon: '⏳' },
              { label: 'Rejected', value: counts.rejected, color: '#dc2626', bg: '#fee2e2', icon: '❌' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 2px 12px rgba(64,32,112,0.08)', borderLeft: `4px solid ${s.color}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h2>All Customers ({filtered.length})</h2>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>Click any row to view full details</span>
            </div>
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : (
                <table className="dash-table">
                  <thead>
                    <tr><th>#</th><th>Name</th><th>Phone</th><th>PAN</th><th>Aadhar</th><th>Branch</th><th>Documents</th><th>Status</th><th>Added By</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => (
                      <tr key={c.id} onClick={() => setSelected(c)} style={{ cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f0f2f8'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td style={{ fontFamily: 'monospace', color: '#402070', fontWeight: 700, fontSize: 11 }}>#{c.id}</td>
                        <td>
                          <strong>{c.name}</strong>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>{c.email}</div>
                        </td>
                        <td style={{ fontSize: 12 }}>{c.phone}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.pan}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.aadhar ? c.aadhar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '—'}</td>
                        <td style={{ fontSize: 12 }}>{c.branch || '—'}</td>
                        <td onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {c.aadhar_img_url
                              ? <img src={c.aadhar_img_url} alt="Aadhar" onClick={() => setLightbox({ url: c.aadhar_img_url, label: `${c.name} — Aadhaar` })}
                                  style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: '1.5px solid #e2e8f0' }} />
                              : <span style={{ fontSize: 10, color: '#9ca3af', background: '#f8fafc', padding: '2px 6px', borderRadius: 4 }}>No Aadhar</span>}
                            {c.pan_img_url
                              ? <img src={c.pan_img_url} alt="PAN" onClick={() => setLightbox({ url: c.pan_img_url, label: `${c.name} — PAN` })}
                                  style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: '1.5px solid #e2e8f0' }} />
                              : <span style={{ fontSize: 10, color: '#9ca3af', background: '#f8fafc', padding: '2px 6px', borderRadius: 4 }}>No PAN</span>}
                            {c.card_front_img_url
                              ? <img src={c.card_front_img_url} alt="Card" onClick={() => setLightbox({ url: c.card_front_img_url, label: `${c.name} — Card` })}
                                  style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: '1.5px solid #e2e8f0' }} />
                              : <span style={{ fontSize: 10, color: '#9ca3af', background: '#f8fafc', padding: '2px 6px', borderRadius: 4 }}>No Card</span>}
                          </div>
                        </td>
                        <td>
                          <span style={{ background: c.status === 'approved' ? '#d1fae5' : c.status === 'rejected' ? '#fee2e2' : '#fef3c7', color: c.status === 'approved' ? '#059669' : c.status === 'rejected' ? '#dc2626' : '#d97706', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {c.status === 'approved' ? '✅ Approved' : c.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                          </span>
                        </td>
                        <td style={{ fontSize: 12 }}>{c.added_by_name || '—'}</td>
                        <td onClick={e => e.stopPropagation()}>
                          {c.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button className="dash-btn dash-btn-success dash-btn-sm" onClick={() => approve(c.id)}>✅</button>
                              <button className="dash-btn dash-btn-danger  dash-btn-sm" onClick={() => reject(c.id)}>❌</button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, color: '#9ca3af' }}>{c.reviewed_by_name || '—'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!filtered.length && <tr><td colSpan={10} className="dash-empty">No customers found</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {selected && <CustomerDetailModal customer={selected} onClose={() => setSelected(null)} />}

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', maxWidth: 700, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#1a0a2e' }}>
              <span style={{ color: '#fff', fontWeight: 700 }}>{lightbox.label}</span>
              <button onClick={() => setLightbox(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>
            <img src={lightbox.url} alt={lightbox.label} style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', display: 'block' }} />
          </div>
        </div>
      )}
    </div>
  )
}
