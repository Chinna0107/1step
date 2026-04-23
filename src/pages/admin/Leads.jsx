import React, { useState, useMemo } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useLeads } from '../../hooks/useLeads'
import '../../pages/dashboard.css'

const fmt = n => Number(parseFloat(n) || 0).toLocaleString('en-IN')

const STATUS_CONFIG = {
  new:        { label: '🟡 New',        bg: '#fef3c7', color: '#d97706' },
  in_process: { label: '🔵 In Process', bg: '#dbeafe', color: '#2563eb' },
  approved:   { label: '🟢 Approved',   bg: '#d1fae5', color: '#059669' },
  rejected:   { label: '🔴 Rejected',   bg: '#fee2e2', color: '#dc2626' },
}

const LEAD_TYPES = [
  { value: 'Credit Card',   label: '💳 Credit Card' },
  { value: 'Personal Loan', label: '💸 Personal Loan' },
  { value: 'Business Loan', label: '🏦 Business Loan' },
  { value: 'CIBIL',         label: '📊 CIBIL' },
]

export default function AdminLeads() {
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType,   setFilterType]   = useState('')
  const [search,       setSearch]       = useState('')
  const [viewLead,     setViewLead]     = useState(null)
  const [editStatusId, setEditStatusId] = useState(null)

  const { leads, stats, loading, load, updateStatus: hookUpdate } = useLeads(filterStatus, filterType)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return leads.filter(l =>
      (!q || l.cust_name?.toLowerCase().includes(q) || l.mobile?.includes(q) || l.email?.toLowerCase().includes(q) || l.branch?.toLowerCase().includes(q))
    )
  }, [leads, search])

  const updateStatus = async (id, status) => {
    try {
      await hookUpdate(id, status)
      setEditStatusId(null)
      if (viewLead?.id === id) setViewLead(v => ({ ...v, status }))
    } catch (err) { alert(err.message) }
  }

  const exportExcel = () => {
    const header = 'ID,Name,Mobile,Email,Type,Amount,Status,Branch,Employee,Follow-up,Date'
    const rows = filtered.map(l => [
      l.id, l.cust_name, l.mobile, l.email || '', l.lead_type,
      l.required_amount || 0, l.status, l.branch || '', l.employee_name || '',
      l.followup_date ? new Date(l.followup_date).toLocaleDateString('en-IN') : '',
      new Date(l.created_at).toLocaleDateString('en-IN')
    ].join(','))
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`; a.click()
  }

  const exportPDF = () => {
    const rows = filtered.map(l => {
      const sc = STATUS_CONFIG[l.status] || STATUS_CONFIG.new
      return `<tr>
        <td>#${l.id}</td><td>${l.cust_name}</td><td>${l.mobile}</td>
        <td>${l.lead_type}</td><td>${l.required_amount > 0 ? '₹' + fmt(l.required_amount) : '—'}</td>
        <td style="color:${sc.color};font-weight:700">${sc.label}</td>
        <td>${l.branch || '—'}</td><td>${l.employee_name || '—'}</td>
        <td>${new Date(l.created_at).toLocaleDateString('en-IN')}</td>
      </tr>`
    }).join('')
    const html = `<html><head><title>Leads Report</title>
    <style>body{font-family:Arial;padding:24px;color:#1a0a2e}h2{color:#402070}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th{background:#402070;color:#fff;padding:8px 12px;text-align:left}
    td{padding:7px 12px;border-bottom:1px solid #e2e8f0}
    tr:nth-child(even)td{background:#f8fafc}</style></head>
    <body><h2>MoneySpot — Leads Report</h2>
    <p>${filtered.length} leads · Exported ${new Date().toLocaleString('en-IN')}</p>
    <table><thead><tr><th>#</th><th>Name</th><th>Mobile</th><th>Type</th><th>Amount</th><th>Status</th><th>Branch</th><th>Employee</th><th>Date</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`
    const w = window.open('', '_blank'); w.document.write(html); w.document.close()
    w.focus(); setTimeout(() => { w.print(); w.close() }, 400)
  }

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <h1>🎯 Lead Management</h1>
          <div className="dash-topbar-right">
            <button className="dash-btn" style={{ background: '#d1fae5', color: '#059669', border: 'none' }} onClick={exportExcel}>📊 Excel</button>
            <button className="dash-btn" style={{ background: '#fee2e2', color: '#dc2626', border: 'none' }} onClick={exportPDF}>📄 PDF</button>
            <button className="dash-btn" style={{ background: '#f0f2f8', color: '#402070', border: 'none' }} onClick={load}>🔄 Refresh</button>
          </div>
        </div>
        <div className="dash-main">

          {/* Stats */}
          <div className="dash-stats">
            {[
              { label: 'Total',      value: stats.total      ?? 0, color: '#402070' },
              { label: 'New',        value: stats.today      ?? 0, color: '#d97706' },
              { label: 'In Process', value: stats.in_process ?? 0, color: '#2563eb' },
              { label: 'Approved',   value: stats.approved   ?? 0, color: '#059669' },
              { label: 'Rejected',   value: stats.rejected   ?? 0, color: '#dc2626' },
              { label: 'Value',      value: `₹${fmt(stats.value ?? 0)}`, color: '#d4af37' },
            ].map(s => (
              <div key={s.label} className="dash-stat">
                <div className="dash-stat-label">{s.label}</div>
                <div className="dash-stat-value" style={{ color: s.color, fontSize: '1.4rem' }}>{loading ? '—' : s.value}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
              <input placeholder="Search name, mobile, email, branch..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#402070'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>✕</button>}
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit' }}>
              <option value="">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit' }}>
              <option value="">All Types</option>
              {LEAD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {(search || filterStatus || filterType) && (
              <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterType('') }}
                style={{ padding: '9px 14px', borderRadius: 8, border: '1.5px solid #fee2e2', background: '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                ✕ Clear
              </button>
            )}
            <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>{filtered.length} leads</span>
          </div>

          {/* Table */}
          <div className="dash-card">
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : filtered.length === 0 ? (
                <div className="dash-empty">No leads found</div>
              ) : (
                <table className="dash-table">
                  <thead>
                    <tr><th>#</th><th>Customer</th><th>Mobile</th><th>Type</th><th>Amount</th><th>Status</th><th>Employee</th><th>Follow-up</th><th>Date</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(l => {
                      const sc = STATUS_CONFIG[l.status] || STATUS_CONFIG.new
                      return (
                        <tr key={l.id}>
                          <td style={{ fontFamily: 'monospace', color: '#402070', fontWeight: 700, fontSize: 11 }}>#{l.id}</td>
                          <td><strong>{l.cust_name}</strong><div style={{ fontSize: 11, color: '#9ca3af' }}>{l.email || '—'}</div></td>
                          <td><a href={`tel:${l.mobile}`} style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>📞 {l.mobile}</a></td>
                          <td style={{ fontSize: 12 }}>{LEAD_TYPES.find(t => t.value === l.lead_type)?.label || l.lead_type}</td>
                          <td style={{ color: '#059669', fontWeight: 700 }}>{l.required_amount > 0 ? `₹${fmt(l.required_amount)}` : '—'}</td>
                          <td style={{ position: 'relative' }}>
                            <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', userSelect: 'none' }}
                              onClick={() => setEditStatusId(editStatusId === l.id ? null : l.id)}>
                              {sc.label} ▾
                            </span>
                            {editStatusId === l.id && (
                              <>
                                <div onClick={() => setEditStatusId(null)} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
                                <div style={{ position: 'absolute', top: '110%', left: 0, background: '#fff', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', zIndex: 99, minWidth: 160, overflow: 'hidden', border: '1px solid #f0f2f8' }}>
                                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                    <div key={k} onClick={() => updateStatus(l.id, k)}
                                      style={{ padding: '9px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: v.color, background: k === l.status ? v.bg : '#fff', borderBottom: '1px solid #f8fafc' }}
                                      onMouseEnter={e => e.currentTarget.style.background = v.bg}
                                      onMouseLeave={e => e.currentTarget.style.background = k === l.status ? v.bg : '#fff'}>
                                      {v.label}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </td>
                          <td style={{ fontSize: 12 }}>{l.employee_name || '—'}</td>
                          <td style={{ fontSize: 12, color: l.followup_date ? '#d97706' : '#9ca3af' }}>
                            {l.followup_date ? `📅 ${new Date(l.followup_date).toLocaleDateString('en-IN')}` : '—'}
                          </td>
                          <td style={{ fontSize: 12 }}>{new Date(l.created_at).toLocaleDateString('en-IN')}</td>
                          <td>
                            <button onClick={() => setViewLead(l)}
                              style={{ background: '#ede9fe', color: '#402070', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
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
        </div>
      </div>

      {/* View Modal */}
      {viewLead && (
        <div onClick={() => setViewLead(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 580, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ background: 'linear-gradient(135deg,#1a0a2e,#402070,#c02040)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Lead #{viewLead.id}</div>
                <div style={{ color: '#fff', fontWeight: 900, fontSize: 18, marginTop: 2 }}>{viewLead.cust_name}</div>
              </div>
              <button onClick={() => setViewLead(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ overflowY: 'auto', padding: 24 }}>
              {/* Status Update */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Update Status</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <button key={k} onClick={() => updateStatus(viewLead.id, k)}
                      style={{ padding: '6px 14px', borderRadius: 20, border: `2px solid ${viewLead.status === k ? v.color : '#e2e8f0'}`, background: viewLead.status === k ? v.bg : '#fff', color: v.color, fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Mobile',     value: viewLead.mobile,       link: `tel:${viewLead.mobile}` },
                  { label: 'Email',      value: viewLead.email || '—', link: viewLead.email ? `mailto:${viewLead.email}` : null },
                  { label: 'Lead Type',  value: LEAD_TYPES.find(t => t.value === viewLead.lead_type)?.label || viewLead.lead_type },
                  { label: 'Amount',     value: viewLead.required_amount > 0 ? `₹${fmt(viewLead.required_amount)}` : '—', color: '#059669' },
                  { label: 'Job Type',   value: viewLead.job_type     || '—' },
                  { label: 'Company',    value: viewLead.company_name || '—' },
                  { label: 'CIBIL',      value: viewLead.cibil_score  || '—', color: viewLead.cibil_score >= 750 ? '#059669' : '#d97706' },
                  { label: 'Location',   value: viewLead.location     || '—' },
                  { label: 'Branch',     value: viewLead.branch       || '—' },
                  { label: 'Employee',   value: viewLead.employee_name || '—' },
                  { label: 'Follow-up',  value: viewLead.followup_date ? new Date(viewLead.followup_date).toLocaleDateString('en-IN') : '—', color: '#d97706' },
                  { label: 'Created',    value: new Date(viewLead.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) },
                ].map(f => (
                  <div key={f.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{f.label}</div>
                    {f.link
                      ? <a href={f.link} style={{ fontSize: 13, fontWeight: 700, color: '#059669', textDecoration: 'none' }}>{f.value}</a>
                      : <div style={{ fontSize: 13, fontWeight: 700, color: f.color || '#1a0a2e' }}>{f.value}</div>}
                  </div>
                ))}
              </div>
              {viewLead.remarks && (
                <div style={{ marginTop: 12, background: '#fef3c7', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Remarks</div>
                  <div style={{ fontSize: 13, color: '#92400e' }}>{viewLead.remarks}</div>
                </div>
              )}
              {(viewLead.aadhar_url || viewLead.pan_url || viewLead.bank_stmt_url || viewLead.payslip_url) && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Documents</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[['🪪 Aadhaar', viewLead.aadhar_url], ['🆔 PAN', viewLead.pan_url], ['📊 Bank Stmt', viewLead.bank_stmt_url], ['📄 Payslip', viewLead.payslip_url]].map(([label, url]) =>
                      url ? <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                        style={{ padding: '6px 12px', background: '#ede9fe', color: '#402070', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>{label}</a> : null
                    )}
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={`tel:${viewLead.mobile}`} style={{ padding: '10px 18px', borderRadius: 10, background: '#d1fae5', color: '#059669', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>📞 Call</a>
                <a href={`https://wa.me/${viewLead.mobile}?text=${encodeURIComponent(`Hi ${viewLead.cust_name}, regarding your ${viewLead.lead_type} application. - MoneySpot`)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ padding: '10px 18px', borderRadius: 10, background: '#25D366', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>💬 WhatsApp</a>
              </div>
              <button onClick={() => setViewLead(null)} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#402070,#c02040)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
