import React, { useState, useMemo } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { useLeads } from '../../hooks/useLeads'
import { useBranches } from '../../hooks/useSuperAdmin'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import './superadmin.css'
import '../../pages/dashboard.css'

const fmt = n => Number(parseFloat(n) || 0).toLocaleString('en-IN')
const fmtVal = n => { const v = parseFloat(n) || 0; if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }

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

export default function SuperAdminLeads() {
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType,   setFilterType]   = useState('')
  const [filterBranch, setFilterBranch] = useState('')
  const [search,       setSearch]       = useState('')
  const [viewLead,     setViewLead]     = useState(null)
  const [editStatusId, setEditStatusId] = useState(null)

  const { leads, stats, loading, load, updateStatus: hookUpdate } = useLeads(filterStatus, filterType)
  const { branches } = useBranches()

  const authSA = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin')}` })

  const updateStatus = async (id, status) => {
    try {
      await api(`/leads/${id}`, { method: 'PATCH', headers: authSA(), body: JSON.stringify({ status }) })
      hookUpdate(id, status).catch(() => {})
      setEditStatusId(null)
      if (viewLead?.id === id) setViewLead(v => ({ ...v, status }))
      load()
    } catch (err) { alert(err.message) }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return leads.filter(l =>
      (!filterBranch || l.branch === filterBranch) &&
      (!q || l.cust_name?.toLowerCase().includes(q) || l.mobile?.includes(q) || l.email?.toLowerCase().includes(q) || l.branch?.toLowerCase().includes(q) || l.employee_name?.toLowerCase().includes(q))
    )
  }, [leads, search, filterBranch])

  // Branch-wise stats from filtered leads
  const branchStats = useMemo(() => {
    const map = {}
    leads.forEach(l => {
      const b = l.branch || 'Unknown'
      if (!map[b]) map[b] = { branch: b, total: 0, approved: 0, in_process: 0 }
      map[b].total++
      if (l.status === 'approved')   map[b].approved++
      if (l.status === 'in_process') map[b].in_process++
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [leads])

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
    a.download = `leads_all_branches_${new Date(Date.now() + 5.5 * 3600000).toISOString().split('T')[0]}.csv`; a.click()
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
    const branchRows = branchStats.map(b =>
      `<tr><td>${b.branch}</td><td>${b.total}</td><td style="color:#059669">${b.approved}</td><td style="color:#2563eb">${b.in_process}</td></tr>`
    ).join('')
    const html = `<html><head><title>Leads Report — All Branches</title>
    <style>body{font-family:Arial;padding:24px;color:#081427}h2,h3{color:#0d1f3d}
    table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:24px}
    th{background:#0d1f3d;color:#fff;padding:8px 12px;text-align:left}
    td{padding:7px 12px;border-bottom:1px solid #e2e8f0}
    tr:nth-child(even)td{background:#f8fafc}</style></head>
    <body><h2>1 Step Finance Care — All Branches Leads Report</h2>
    <p>${filtered.length} leads · Exported ${new Date().toLocaleString('en-IN')}</p>
    <h3>Branch Summary</h3>
    <table><thead><tr><th>Branch</th><th>Total</th><th>Approved</th><th>In Process</th></tr></thead>
    <tbody>${branchRows}</tbody></table>
    <h3>All Leads</h3>
    <table><thead><tr><th>#</th><th>Name</th><th>Mobile</th><th>Type</th><th>Amount</th><th>Status</th><th>Branch</th><th>Employee</th><th>Date</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`
    const w = window.open('', '_blank'); w.document.write(html); w.document.close()
    w.focus(); setTimeout(() => { w.print(); w.close() }, 400)
  }

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-topbar-title">🎯 Lead Management — All Branches</h1>
            <p className="dash-topbar-sub">Track and manage leads across all branches</p>
          </div>
          <div className="dash-topbar-right">
            <button className="dash-btn" style={{ background: '#d1fae5', color: '#059669', border: 'none' }} onClick={exportExcel}>📊 Excel</button>
            <button className="dash-btn" style={{ background: '#fee2e2', color: '#dc2626', border: 'none' }} onClick={exportPDF}>📄 PDF</button>
            <button className="dash-btn" style={{ background: '#f0f2f8', color: '#0d1f3d', border: 'none' }} onClick={load}>🔄 Refresh</button>
          </div>
        </div>

        <div className="dash-main">

          {/* Stats */}
          <div className="dash-stats">
            {[
              { label: 'Total',      value: stats.total      ?? 0, color: '#0d1f3d' },
              { label: 'Today',      value: stats.today      ?? 0, color: '#d97706' },
              { label: 'In Process', value: stats.in_process ?? 0, color: '#2563eb' },
              { label: 'Approved',   value: stats.approved   ?? 0, color: '#059669' },
              { label: 'Rejected',   value: stats.rejected   ?? 0, color: '#dc2626' },
              { label: 'Value',      value: fmtVal(stats.value ?? 0), color: '#d4af37' },
            ].map(s => (
              <div key={s.label} className="dash-stat">
                <div className="dash-stat-label">{s.label}</div>
                <div className="dash-stat-value" style={{ color: s.color, fontSize: '1.4rem' }}>{loading ? '—' : s.value}</div>
              </div>
            ))}
          </div>

          {/* Branch Stats Cards */}
          {branchStats.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 20 }}>
              {branchStats.map(b => (
                <div key={b.branch} className="sa-card" style={{ cursor: 'pointer', border: filterBranch === b.branch ? '2px solid #0d1f3d' : '2px solid transparent', marginBottom: 0 }}
                  onClick={() => setFilterBranch(filterBranch === b.branch ? '' : b.branch)}>
                  <div className="sa-card-body" style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 800, color: '#081427', fontSize: 14, marginBottom: 6 }}>🏦 {b.branch}</div>
                    <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                      <span style={{ color: '#64748b' }}>Total: <strong style={{ color: '#0d1f3d' }}>{b.total}</strong></span>
                      <span style={{ color: '#059669' }}>✅ {b.approved}</span>
                      <span style={{ color: '#2563eb' }}>🔵 {b.in_process}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
              <input placeholder="Search name, mobile, email, employee..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#0d1f3d'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>✕</button>}
            </div>
            <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit' }}>
              <option value="">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
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
            {(search || filterStatus || filterType || filterBranch) && (
              <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterType(''); setFilterBranch('') }}
                style={{ padding: '9px 14px', borderRadius: 8, border: '1.5px solid #fee2e2', background: '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                ✕ Clear
              </button>
            )}
            <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>{filtered.length} leads</span>
          </div>

          {/* Table */}
          <div className="sa-card">
            <div className="sa-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : filtered.length === 0 ? (
                <div className="sa-empty">No leads found</div>
              ) : (
                <table className="sa-table">
                  <thead>
                    <tr><th>#</th><th>Customer</th><th>Mobile</th><th>Type</th><th>Amount</th><th>Status</th><th>Branch</th><th>Employee</th><th>Follow-up</th><th>Date</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(l => {
                      const sc = STATUS_CONFIG[l.status] || STATUS_CONFIG.new
                      return (
                        <tr key={l.id}>
                          <td style={{ fontFamily: 'monospace', color: '#0d1f3d', fontWeight: 700, fontSize: 11 }}>#{l.id}</td>
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
                          <td><span style={{ background: '#ede9fe', color: '#0d1f3d', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{l.branch || '—'}</span></td>
                          <td style={{ fontSize: 12 }}>{l.employee_name || '—'}</td>
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
        </div>
      </div>

      {/* View Modal */}
      {viewLead && (
        <div onClick={() => setViewLead(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 580, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ background: 'linear-gradient(135deg,#081427,#0d1f3d,#1a365d)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Lead #{viewLead.id} · {viewLead.branch || '—'}</div>
                <div style={{ color: '#fff', fontWeight: 900, fontSize: 18, marginTop: 2 }}>{viewLead.cust_name}</div>
              </div>
              <button onClick={() => setViewLead(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ overflowY: 'auto', padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Update Status</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <button key={k} onClick={() => updateStatus(viewLead.id, k)}
                      style={{ padding: '6px 14px', borderRadius: 20, border: `2px solid ${viewLead.status === k ? v.color : '#e2e8f0'}`, background: viewLead.status === k ? v.bg : '#fff', color: v.color, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Mobile',    value: viewLead.mobile,       link: `tel:${viewLead.mobile}` },
                  { label: 'Email',     value: viewLead.email || '—', link: viewLead.email ? `mailto:${viewLead.email}` : null },
                  { label: 'Lead Type', value: LEAD_TYPES.find(t => t.value === viewLead.lead_type)?.label || viewLead.lead_type },
                  { label: 'Amount',    value: viewLead.required_amount > 0 ? `₹${fmt(viewLead.required_amount)}` : '—', color: '#059669' },
                  { label: 'Job Type',  value: viewLead.job_type     || '—' },
                  { label: 'Company',   value: viewLead.company_name || '—' },
                  { label: 'CIBIL',     value: viewLead.cibil_score  || '—', color: viewLead.cibil_score >= 750 ? '#059669' : '#d97706' },
                  { label: 'Location',  value: viewLead.location     || '—' },
                  { label: 'Branch',    value: viewLead.branch       || '—' },
                  { label: 'Employee',  value: viewLead.employee_name || '—' },
                  { label: 'Follow-up', value: viewLead.followup_date ? new Date(viewLead.followup_date).toLocaleDateString('en-IN') : '—', color: '#d97706' },
                  { label: 'Created',   value: new Date(viewLead.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) },
                ].map(f => (
                  <div key={f.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{f.label}</div>
                    {f.link
                      ? <a href={f.link} style={{ fontSize: 13, fontWeight: 700, color: '#059669', textDecoration: 'none' }}>{f.value}</a>
                      : <div style={{ fontSize: 13, fontWeight: 700, color: f.color || '#081427' }}>{f.value}</div>}
                  </div>
                ))}
              </div>
              {viewLead.remarks && (
                <div style={{ marginTop: 12, background: '#fef3c7', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Remarks</div>
                  <div style={{ fontSize: 13, color: '#92400e' }}>{viewLead.remarks}</div>
                </div>
              )}
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={`tel:${viewLead.mobile}`} style={{ padding: '10px 18px', borderRadius: 10, background: '#d1fae5', color: '#059669', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>📞 Call</a>
                <a href={`https://wa.me/${viewLead.mobile}?text=${encodeURIComponent(`Hi ${viewLead.cust_name}, regarding your ${viewLead.lead_type} application. - 1 Step Finance Care`)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ padding: '10px 18px', borderRadius: 10, background: '#25D366', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>💬 WhatsApp</a>
              </div>
              <button onClick={() => setViewLead(null)} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0d1f3d,#1a365d)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
