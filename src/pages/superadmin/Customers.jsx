import React, { useState } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import { useBranches } from '../../hooks/useSuperAdmin'
import { useSuperAdminCustomers } from '../../hooks/useLeads'
import '../../pages/employee/CustomerInfo.css'
import './superadmin.css'
import './Dashboard.css'
import '../../pages/dashboard.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin')}` })
const fmt    = n => Number(parseFloat(n)||0).toLocaleString('en-IN')
const fmtVal = n => { const v = parseFloat(n)||0; if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }

const STATUS_STYLE = {
  approved: { bg: '#d1fae5', color: '#059669' },
  pending:  { bg: '#fef3c7', color: '#d97706' },
  rejected: { bg: '#fee2e2', color: '#dc2626' },
}

export default function SuperAdminCustomers() {
  const [branch, setBranch]       = useState('')
  const [status, setStatus]       = useState('')
  const [search, setSearch]       = useState('')
  const [viewCustomer, setViewCustomer] = useState(null)
  const [viewTxns, setViewTxns]   = useState([])
  const [txnLoading, setTxnLoading] = useState(false)
  const [lightbox, setLightbox]   = useState(null)
  const [tagMsg, setTagMsg]       = useState('')
  const [tagging, setTagging]     = useState(false)
  const { branches }              = useBranches()
  const { customers, stats, branchStats, loading, load } = useSuperAdminCustomers(branch, status, search)

  const downloadImage = async (url, filename) => {
    try {
      const res  = await fetch(url)
      const blob = await res.blob()
      const ext  = blob.type.split('/')[1]?.split('+')[0] || 'jpg'
      const a    = document.createElement('a')
      a.href     = URL.createObjectURL(blob)
      a.download = `${filename}.${ext}`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      // fallback: open in new tab
      window.open(url, '_blank')
    }
  }

  const openCustomer = async (c) => {
    setViewCustomer(c)
    setTagMsg('')
    setTxnLoading(true)
    try {
      const txns = await api(`/master/transactions?customer_id=${c.id}`, { headers: auth() })
      setViewTxns(Array.isArray(txns) ? txns : [])
    } catch { setViewTxns([]) }
    setTxnLoading(false)
  }

  const applyTag = async (tag) => {
    setTagging(true); setTagMsg('')
    try {
      const r = await api(`/customers/${viewCustomer.id}/tag`, {
        method: 'PATCH', headers: auth(),
        body: JSON.stringify({ tag }),
      })
      setViewCustomer(v => ({ ...v, tag: r.customer.tag }))
      setTagMsg(r.message)
      load()
    } catch (e) { setTagMsg('Error: ' + e.message) }
    setTagging(false)
  }

  const exportData = async (format) => {
    try {
      const params = new URLSearchParams()
      if (branch) params.append('branch', branch)
      if (status) params.append('status', status)
      if (search) params.append('search', search)
      
      const url = `/customers/export/${format}?${params.toString()}`
      
      // Use config.API_URL for proper URL construction
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const fullUrl = `${apiUrl}${url}`
      
      console.log(`Requesting export: ${fullUrl}`)
      
      // Use fetch directly for file downloads, not the api utility
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getTokenByRole('superadmin')}`
        }
      })
      
      console.log(`Export response status: ${response.status}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Export error response:', errorText)
        throw new Error(`Export failed: ${response.status} - ${errorText}`)
      }
      
      const blob = await response.blob()
      console.log(`Export blob size: ${blob.size} bytes`)
      
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `customers_${new Date(Date.now() + 5.5 * 3600000).toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)
      
      console.log(`✅ ${format.toUpperCase()} export completed successfully`)
    } catch (error) {
      console.error('Export error:', error)
      alert(`Export failed: ${error.message}`)
    }
  }

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-topbar-title">👥 Customers — All Branches</h1>
            <p className="dash-topbar-sub">KYC database · Branch-wise view</p>
          </div>
        </div>

        <div className="dash-main">

          {/* ── Stats ── */}
          <div className="dash-stats-row" style={{ marginBottom: 20 }}>
            {[
              { label: 'Total Customers', value: fmt(stats.total    ?? 0), color: '#0d1f3d', icon: '👥' },
              { label: 'Approved',        value: fmt(stats.approved ?? 0), color: '#059669', icon: '✅' },
              { label: 'Pending KYC',     value: fmt(stats.pending  ?? 0), color: '#d97706', icon: '⏳' },
              { label: 'Rejected',        value: fmt(stats.rejected ?? 0), color: '#dc2626', icon: '❌' },
            ].map(s => (
              <div key={s.label} className="dash-stat" style={{ '--c': s.color, cursor: 'pointer' }}
                onClick={() => setStatus(status === s.label.toLowerCase().split(' ')[0] ? '' : s.label.toLowerCase().split(' ')[0])}>
                <div style={{ fontSize: 22 }}>{s.icon}</div>
                <div className="dash-stat-body">
                  <span className="dash-stat-label">{s.label}</span>
                  <span className="dash-stat-value" style={{ color: s.color }}>{loading ? '—' : s.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Branch Stats ── */}
          {branchStats.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, marginBottom: 20 }}>
              {branchStats.map(b => (
                <div key={b.branch} className="sa-card" style={{ cursor: 'pointer', border: branch === b.branch ? '2px solid #0d1f3d' : '2px solid transparent' }}
                  onClick={() => setBranch(branch === b.branch ? '' : b.branch)}>
                  <div className="sa-card-body" style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 800, color: '#081427', fontSize: 15, marginBottom: 8 }}>🏦 {b.branch || 'Unknown'}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                      <span style={{ color: '#64748b' }}>Total: <strong style={{ color: '#0d1f3d' }}>{b.total}</strong></span>
                      <span style={{ color: '#059669' }}>✅ {b.approved}</span>
                      <span style={{ color: '#d97706' }}>⏳ {b.pending}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Filters ── */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
              <input placeholder="Search name, phone, PAN, email..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
              {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>✕</button>}
            </div>
            <select value={branch} onChange={e => setBranch(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit' }}>
              <option value="">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
            <select value={status} onChange={e => setStatus(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit' }}>
              <option value="">All Status</option>
              <option value="approved">✅ Approved</option>
              <option value="pending">⏳ Pending</option>
              <option value="rejected">❌ Rejected</option>
            </select>
            <button className="sa-btn sa-btn-primary sa-btn-sm" onClick={load}>🔍 Search</button>
            {(branch || status || search) && (
              <button onClick={() => { setBranch(''); setStatus(''); setSearch('') }}
                style={{ padding: '9px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                ✕ Clear
              </button>
            )}
            
            {/* Export Buttons */}
            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
              <button 
                onClick={() => exportData('excel')}
                disabled={loading}
                style={{ 
                  padding: '9px 14px', 
                  borderRadius: 8, 
                  border: 'none', 
                  background: loading ? '#9ca3af' : '#059669', 
                  color: '#fff', 
                  fontSize: 13, 
                  cursor: loading ? 'not-allowed' : 'pointer', 
                  fontFamily: 'inherit', 
                  fontWeight: 700 
                }}>
                📊 Export Excel
              </button>
              <button 
                onClick={() => exportData('pdf')}
                disabled={loading}
                style={{ 
                  padding: '9px 14px', 
                  borderRadius: 8, 
                  border: 'none', 
                  background: loading ? '#9ca3af' : '#dc2626', 
                  color: '#fff', 
                  fontSize: 13, 
                  cursor: loading ? 'not-allowed' : 'pointer', 
                  fontFamily: 'inherit', 
                  fontWeight: 700 
                }}>
                📄 Export PDF
              </button>
            </div>
          </div>

          {/* ── Table ── */}
          <div className="sa-card">
            <div className="sa-card-header">
              <h2>Customers ({customers.length})</h2>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>Click row to view full details</span>
            </div>
            <div className="sa-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : customers.length === 0 ? (
                <div className="sa-empty">No customers found</div>
              ) : (
                <table className="sa-table">
                  <thead>
                    <tr><th>Name</th><th>Phone</th><th>PAN</th><th>Branch</th><th>Coins</th><th>Documents</th><th>Added By</th><th>Txns</th><th>Total Amount</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {customers.map(c => {
                      const ss = STATUS_STYLE[c.status] || STATUS_STYLE.pending
                      return (
                        <tr key={c.id} onClick={() => openCustomer(c)} style={{ cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <td>
                            <strong>{c.name}</strong>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>{c.email}</div>
                            {c.tag && (
                              <span style={{ background: c.tag === 'fraud' ? '#fee2e2' : c.tag === 'blacklisted' ? '#1f2937' : '#fef3c7', color: c.tag === 'fraud' ? '#dc2626' : c.tag === 'blacklisted' ? '#fff' : '#d97706', fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 20, display: 'inline-block', marginTop: 3 }}>
                                ⚠️ {c.tag.toUpperCase()}
                              </span>
                            )}
                          </td>
                          <td>
                            <a href={`tel:${c.phone}`} onClick={e => e.stopPropagation()}
                              style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>📞 {c.phone}</a>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.pan}</td>
                          <td><span style={{ background: '#ede9fe', color: '#0d1f3d', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{c.branch || '—'}</span></td>
                          <td style={{ fontWeight: 700, color: '#d4af37', fontSize: 13 }}><img src="/logo.png" style={{width:14,height:14,objectFit:'contain',verticalAlign:'middle',marginRight:4}} alt="coin"/> {c.coins ?? 0}</td>
                          <td>
                            <div className="ci-doc-thumbs">
                              {c.aadhar_img_url
                                ? <img src={c.aadhar_img_url} alt="Aadhar" className="ci-thumb" title="Aadhar" onClick={e => { e.stopPropagation(); setLightbox({ url: c.aadhar_img_url, label: `${c.name} — Aadhar` }) }} />
                                : <span className="ci-no-doc">No Aadhar</span>}
                              {c.pan_img_url
                                ? <img src={c.pan_img_url} alt="PAN" className="ci-thumb" title="PAN" onClick={e => { e.stopPropagation(); setLightbox({ url: c.pan_img_url, label: `${c.name} — PAN` }) }} />
                                : <span className="ci-no-doc">No PAN</span>}
                              {c.card_front_img_url
                                ? <img src={c.card_front_img_url} alt="Card" className="ci-thumb" title="Card Front" onClick={e => { e.stopPropagation(); setLightbox({ url: c.card_front_img_url, label: `${c.name} — Card Front` }) }} />
                                : <span className="ci-no-doc">No Card</span>}
                            </div>
                          </td>
                          <td style={{ fontSize: 12 }}>{c.added_by_name || '—'}</td>
                          <td style={{ fontWeight: 700, color: '#0d1f3d', textAlign: 'center' }}>{c.txn_count || 0}</td>
                          <td style={{ color: '#059669', fontWeight: 700 }}>{c.total_amount > 0 ? fmtVal(c.total_amount) : '—'}</td>
                          <td><span style={{ background: ss.bg, color: ss.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{c.status}</span></td>
                          <td style={{ fontSize: 12, color: '#64748b' }}>{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
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

      {/* ── Customer Detail Modal ── */}
      {viewCustomer && (
        <div onClick={() => setViewCustomer(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 700, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg,#081427,#0d1f3d,#1a365d)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Customer Profile</div>
                <div style={{ color: '#fff', fontWeight: 900, fontSize: 20, marginTop: 2 }}>{viewCustomer.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 }}>🏦 {viewCustomer.branch || '—'} · Added by {viewCustomer.added_by_name}</div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <a href={`tel:${viewCustomer.phone}`}
                  style={{ padding: '8px 16px', background: '#25D366', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>📞 Call</a>
                <button onClick={() => setViewCustomer(null)}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>✕</button>
              </div>
            </div>

            <div style={{ overflowY: 'auto', padding: 24 }}>

              {/* KYC Details */}
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>KYC Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {[
                  { label: 'Phone',      value: viewCustomer.phone      || '—' },
                  { label: 'Email',      value: viewCustomer.email      || '—' },
                  { label: 'Coins',      value: <><img src="/logo.png" style={{width:14,height:14,objectFit:'contain',verticalAlign:'middle',marginRight:4}} alt="coin"/> {viewCustomer.coins ?? 0}</>, color: '#d4af37' },
                  { label: 'PAN',        value: viewCustomer.pan        || '—' },
                  { label: 'Aadhar',     value: viewCustomer.aadhar ? viewCustomer.aadhar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '—' },
                  { label: 'Account No', value: viewCustomer.acc_number || '—' },
                  { label: 'Branch',     value: viewCustomer.branch     || '—' },
                  { label: 'Status',     value: viewCustomer.status,    color: STATUS_STYLE[viewCustomer.status]?.color },
                  { label: 'Bank Name',  value: viewCustomer.bank_name  || '—' },
                  { label: 'MPIN',       value: viewCustomer.mpin       || '—', mono: true },
                  { label: 'Added',      value: new Date(viewCustomer.created_at).toLocaleDateString('en-IN') },
                  { label: 'Added By',   value: viewCustomer.added_by_name   || '—' },
                  { label: 'Reviewed By',value: viewCustomer.reviewed_by_name || '—' },
                ].map(f => (
                  <div key={f.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: f.color || '#081427' }}>{f.value}</div>
                  </div>
                ))}
              </div>

              {/* Tag Management */}
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Customer Tag</div>
              <div style={{ marginBottom: 20 }}>
                {viewCustomer.tag && (
                  <div style={{ background: viewCustomer.tag === 'fraud' ? '#fee2e2' : viewCustomer.tag === 'blacklisted' ? '#1f2937' : '#fef3c7', color: viewCustomer.tag === 'fraud' ? '#dc2626' : viewCustomer.tag === 'blacklisted' ? '#fff' : '#d97706', borderRadius: 10, padding: '10px 14px', fontWeight: 800, fontSize: 14, marginBottom: 10 }}>
                    ⚠️ Current Tag: {viewCustomer.tag.toUpperCase()}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['fraud', 'blacklisted', 'suspicious', 'vip'].map(t => (
                    <button key={t} disabled={tagging} onClick={() => applyTag(t)}
                      style={{ padding: '7px 16px', borderRadius: 20, border: '2px solid', fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                        borderColor: t === 'fraud' ? '#dc2626' : t === 'blacklisted' ? '#1f2937' : t === 'suspicious' ? '#d97706' : '#059669',
                        background: viewCustomer.tag === t ? (t === 'fraud' ? '#dc2626' : t === 'blacklisted' ? '#1f2937' : t === 'suspicious' ? '#d97706' : '#059669') : '#fff',
                        color: viewCustomer.tag === t ? '#fff' : (t === 'fraud' ? '#dc2626' : t === 'blacklisted' ? '#1f2937' : t === 'suspicious' ? '#d97706' : '#059669'),
                      }}>
                      {t === 'fraud' ? '🚨 Fraud' : t === 'blacklisted' ? '⛔ Blacklisted' : t === 'suspicious' ? '⚠️ Suspicious' : '👑 VIP'}
                    </button>
                  ))}
                  {viewCustomer.tag && (
                    <button disabled={tagging} onClick={() => applyTag(null)}
                      style={{ padding: '7px 16px', borderRadius: 20, border: '2px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                      ✕ Clear Tag
                    </button>
                  )}
                </div>
                {tagMsg && <div style={{ marginTop: 8, fontSize: 12, color: tagMsg.startsWith('Error') ? '#dc2626' : '#059669', fontWeight: 600 }}>{tagMsg}</div>}
              </div>

              {/* Documents */}
              {(viewCustomer.aadhar_img_url || viewCustomer.pan_img_url || viewCustomer.card_front_img_url) && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Documents</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12, marginBottom: 20 }}>
                    {[{ url: viewCustomer.aadhar_img_url, label: 'Aadhar Card', icon: '🪪', key: 'aadhar' },
                      { url: viewCustomer.pan_img_url,        label: 'PAN Card',    icon: '🆔', key: 'pan' },
                      { url: viewCustomer.card_front_img_url, label: 'Card Front',  icon: '🏧', key: 'card' },
                    ].filter(d => d.url).map(d => (
                      <div key={d.key} style={{ background: '#f8fafc', borderRadius: 12, overflow: 'hidden', border: '1.5px solid #e2e8f0' }}>
                        {/* Image */}
                        <div style={{ position: 'relative' }}>
                          <img src={d.url} alt={d.label}
                            onClick={() => setLightbox({ url: d.url, label: `${viewCustomer.name} — ${d.label}`, filename: `${viewCustomer.name}_${d.key}` })}
                            style={{ width: '100%', height: 120, objectFit: 'cover', cursor: 'pointer', display: 'block', transition: 'opacity 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                          />
                          {/* Overlay zoom hint */}
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none' }}
                            className="doc-zoom-hint">
                            <span style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>🔍 View</span>
                          </div>
                        </div>
                        {/* Label + actions */}
                        <div style={{ padding: '8px 10px' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#0d1f3d', marginBottom: 6 }}>{d.icon} {d.label}</div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => setLightbox({ url: d.url, label: `${viewCustomer.name} — ${d.label}`, filename: `${viewCustomer.name}_${d.key}` })}
                              style={{ flex: 1, padding: '5px 0', borderRadius: 6, border: '1.5px solid rgba(13,31,61,0.2)', background: '#fff', color: '#0d1f3d', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                              🔍 View
                            </button>
                            <button
                              onClick={() => downloadImage(d.url, `${viewCustomer.name}_${d.key}`)}
                              style={{ flex: 1, padding: '5px 0', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg,#0d1f3d,#1a365d)', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                              ⬇ Download
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Transaction Summary */}
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                Transaction History ({viewCustomer.txn_count || 0} txns · {fmtVal(viewCustomer.total_amount || 0)} total)
              </div>
              {txnLoading ? (
                <div style={{ textAlign: 'center', padding: 20, color: '#9ca3af' }}>⏳ Loading transactions...</div>
              ) : viewTxns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: '#9ca3af', fontSize: 13 }}>No transactions found</div>
              ) : (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11 }}>Date</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11 }}>Service</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11 }}>Platform</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#64748b', fontSize: 11 }}>Amount</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#64748b', fontSize: 11 }}>Profit</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11 }}>Employee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewTxns.map((t, i) => (
                        <tr key={t.id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                          <td style={{ padding: '8px 12px', color: '#64748b' }}>{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>{t.service_type}</td>
                          <td style={{ padding: '8px 12px', color: '#64748b' }}>{t.platform || '—'}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: '#059669', fontWeight: 700 }}>₹{fmt(t.amount)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: '#d4af37', fontWeight: 700 }}>₹{fmt(t.profit || 0)}</td>
                          <td style={{ padding: '8px 12px', color: '#64748b', fontSize: 11 }}>{t.employee_name || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: '#f0f2f8', fontWeight: 800, borderTop: '2px solid #e2e8f0' }}>
                        <td colSpan={3} style={{ padding: '8px 12px', color: '#0d1f3d' }}>Total ({viewTxns.length} txns)</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: '#059669' }}>₹{fmt(viewTxns.reduce((s, t) => s + parseFloat(t.amount || 0), 0))}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: '#d4af37' }}>₹{fmt(viewTxns.reduce((s, t) => s + parseFloat(t.profit || 0), 0))}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button onClick={() => setViewCustomer(null)}
                style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0d1f3d,#1a365d)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {lightbox && (
        <div className="ci-lightbox" onClick={() => setLightbox(null)}>
          <div className="ci-lightbox-box" onClick={e => e.stopPropagation()}>
            <div className="ci-lightbox-header">
              <span>{lightbox.label}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={() => downloadImage(lightbox.url, lightbox.filename || lightbox.label)}
                  style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>
                  ⬇ Download
                </button>
                <button onClick={() => setLightbox(null)}>✕</button>
              </div>
            </div>
            <img src={lightbox.url} alt={lightbox.label} className="ci-lightbox-img" />
          </div>
        </div>
      )}
    </div>
  )
}
