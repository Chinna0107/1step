import React, { useState, useMemo, useEffect } from 'react'
import EmployeeNavbar from '../../components/employee/EmployeeNavbar'
import { useMyCustomers } from '../../hooks/useCustomers'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import '../../pages/dashboard.css'
import './CustomerInfo.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('employee') || getTokenByRole('admin')}` })
const fmt  = n => Number(parseFloat(n) || 0).toLocaleString('en-IN')
const fmtV = n => { const v = parseFloat(n)||0; if (v>=100000) return `₹${(v/100000).toFixed(1)}L`; if (v>=1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }

const statusStyle = s => ({
  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-block',
  background: s === 'approved' ? '#d1fae5' : s === 'rejected' ? '#fee2e2' : '#fef3c7',
  color:      s === 'approved' ? '#059669' : s === 'rejected' ? '#dc2626' : '#d97706',
})

export default function CustomerInfo() {
  const { customers, loading, error } = useMyCustomers()
  const [lightbox, setLightbox]         = useState(null)
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selected, setSelected]         = useState(null)   // customer object
  const [txns, setTxns]                 = useState([])
  const [txnLoading, setTxnLoading]     = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return customers.filter(c => {
      const matchStatus = !filterStatus || c.status === filterStatus
      const matchSearch = !q ||
        c.name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.pan?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [customers, search, filterStatus])

  const approved = customers.filter(c => c.status === 'approved').length
  const pending  = customers.filter(c => c.status === 'pending').length
  const rejected = customers.filter(c => c.status === 'rejected').length

  const openCustomer = async (c) => {
    setSelected(c)
    setTxns([])
    setTxnLoading(true)
    try {
      const data = await api(`/master/transactions?customer_id=${c.id}`, { headers: auth() })
      setTxns(Array.isArray(data) ? data : [])
    } catch { setTxns([]) }
    setTxnLoading(false)
  }

  // service breakdown from txns
  const serviceBreakdown = useMemo(() =>
    txns.reduce((acc, t) => { const k = t.service_type || 'Other'; acc[k] = (acc[k]||0)+1; return acc }, {})
  , [txns])

  const totalAmt    = txns.reduce((s, t) => s + parseFloat(t.amount||0), 0)
  const totalProfit = txns.reduce((s, t) => s + parseFloat(t.profit||0), 0)

  return (
    <div className="emp-page">
      <EmployeeNavbar />
      <div className="emp-page-content">
        <div className="emp-page-header"><h1>Customer Information</h1></div>

        {error && <div className="dash-alert dash-alert-error">❌ {error}</div>}

        {/* Stats */}
        <div className="dash-stats">
          {[
            { icon:'✅', label:'Approved', val: approved, color:'#059669', status:'approved' },
            { icon:'⏳', label:'Pending',  val: pending,  color:'#d97706', status:'pending'  },
            { icon:'❌', label:'Rejected', val: rejected, color:'#dc2626', status:'rejected' },
            { icon:'👥', label:'Total',    val: customers.length, color:'#402070', status:'' },
          ].map(s => (
            <div key={s.label} className="dash-stat" style={{ cursor:'pointer' }}
              onClick={() => setFilterStatus(filterStatus === s.status ? '' : s.status)}>
              <div className="dash-stat-icon">{s.icon}</div>
              <div className="dash-stat-label">{s.label}</div>
              <div className="dash-stat-value" style={{ color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2>All Customers ({filtered.length})</h2>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9ca3af', fontSize:14 }}>🔍</span>
                <input placeholder="Search name, phone, PAN..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft:32, paddingRight:12, paddingTop:8, paddingBottom:8, borderRadius:8, border:'1.5px solid #e2e8f0', fontSize:13, fontFamily:'inherit', width:240, outline:'none' }} />
                {search && <button onClick={() => setSearch('')} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', fontSize:14 }}>✕</button>}
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                style={{ padding:'8px 12px', borderRadius:8, border:'1.5px solid #e2e8f0', fontSize:13, fontFamily:'inherit', color:'#374151' }}>
                <option value="">All Status</option>
                <option value="approved">✅ Approved</option>
                <option value="pending">⏳ Pending</option>
                <option value="rejected">❌ Rejected</option>
              </select>
            </div>
          </div>
          <div className="dash-table-wrap">
            {loading ? <div className="dash-loading">Loading...</div> : filtered.length === 0 ? (
              <div className="dash-empty">{search || filterStatus ? 'No customers match your search.' : 'No customers found.'}</div>
            ) : (
              <table className="dash-table">
                <thead>
                  <tr><th>Name</th><th>Phone</th><th>PAN</th><th>Branch</th><th>Documents</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id} onClick={() => openCustomer(c)}
                      style={{ cursor:'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background='#faf5ff'}
                      onMouseLeave={e => e.currentTarget.style.background=''}>
                      <td><strong style={{ color:'#402070' }}>{c.name}</strong></td>
                      <td style={{ fontSize:12 }}>{c.phone}</td>
                      <td style={{ fontSize:12 }}>{c.pan}</td>
                      <td style={{ fontSize:12 }}>{c.branch || '—'}</td>
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
                      <td><span style={statusStyle(c.status)}>{c.status.charAt(0).toUpperCase()+c.status.slice(1)}</span></td>
                      <td style={{ fontSize:12 }}>{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ── Transaction History Slide Panel ── */}
      {selected && (
        <>
          {/* Backdrop */}
          <div onClick={() => setSelected(null)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:400 }} />

          {/* Panel */}
          <div style={{
            position:'fixed', top:0, right:0, bottom:0, width:'min(520px,100vw)',
            background:'#fff', zIndex:401, display:'flex', flexDirection:'column',
            boxShadow:'-8px 0 40px rgba(0,0,0,0.18)',
            animation:'slideInRight 0.25s ease',
          }}>
            {/* Header */}
            <div style={{ background:'linear-gradient(135deg,#1a0a2e,#402070,#c02040)', padding:'20px 24px', flexShrink:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>Customer Profile</div>
                  <div style={{ color:'#fff', fontWeight:900, fontSize:20, marginTop:2 }}>{selected.name}</div>
                  <div style={{ color:'rgba(255,255,255,0.6)', fontSize:12, marginTop:2 }}>
                    {selected.phone} · {selected.pan} · {selected.branch || '—'}
                  </div>
                  <span style={statusStyle(selected.status)}>{selected.status}</span>
                </div>
                <button onClick={() => setSelected(null)}
                  style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', width:32, height:32, borderRadius:'50%', cursor:'pointer', fontSize:16, flexShrink:0 }}>✕</button>
              </div>

              {/* Stats row */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginTop:16 }}>
                {[
                  { label:'Transactions', val: txns.length,    color:'#c4b5fd' },
                  { label:'Total Amount', val: fmtV(totalAmt), color:'#6ee7b7' },
                  { label:'Total Profit', val: fmtV(totalProfit), color:'#fde68a' },
                ].map(s => (
                  <div key={s.label} style={{ background:'rgba(255,255,255,0.1)', borderRadius:10, padding:'8px 12px', textAlign:'center' }}>
                    <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:0.4 }}>{s.label}</div>
                    <div style={{ fontSize:16, fontWeight:900, color:s.color, marginTop:2 }}>{txnLoading ? '—' : s.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>

              {/* Documents */}
              {(selected.aadhar_img_url || selected.pan_img_url || selected.card_front_img_url) && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Documents</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {[
                      { url: selected.aadhar_img_url,     label: '🪪 Aadhaar' },
                      { url: selected.pan_img_url,        label: '🆔 PAN Card' },
                      { url: selected.card_front_img_url, label: '🏧 Card Front' },
                    ].map(d => d.url && (
                      <div key={d.label} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                        <img src={d.url} alt={d.label}
                          onClick={() => setLightbox({ url: d.url, label: `${selected.name} — ${d.label}` })}
                          style={{ width: 100, height: 68, objectFit: 'cover', borderRadius: 8, border: '1.5px solid rgba(64,32,112,0.2)', cursor: 'pointer' }}
                          onError={e => { e.currentTarget.parentElement.style.display = 'none' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>{d.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Breakdown */}
              {!txnLoading && Object.keys(serviceBreakdown).length > 0 && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>Service Breakdown</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {Object.entries(serviceBreakdown).map(([svc, cnt]) => (
                      <span key={svc} style={{ background:'#ede9fe', color:'#402070', padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700 }}>
                        {svc} ×{cnt}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Transaction History */}
              <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>
                Transaction History {!txnLoading && txns.length > 0 && `· ${txns.length} total`}
              </div>

              {txnLoading ? (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ height:64, borderRadius:12, background:'linear-gradient(90deg,#f0f2f8 25%,#e4e6f0 50%,#f0f2f8 75%)', backgroundSize:'400px 100%', animation:'shimmer 1.4s infinite linear' }} />
                  ))}
                </div>
              ) : txns.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 20px', color:'#9ca3af' }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
                  <div style={{ fontSize:14, fontWeight:600 }}>No transactions yet</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {txns.map(t => (
                    <div key={t.id} style={{ background:'#f8fafc', borderRadius:12, padding:'12px 14px', border:'1px solid #f0f2f8' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:'#374151' }}>{t.service_type}</div>
                          <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>
                            {t.platform || t.bill_platform || '—'} · {new Date(t.created_at).toLocaleDateString('en-IN')} {new Date(t.created_at).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
                          </div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ color:'#059669', fontWeight:900, fontSize:14 }}>₹{fmt(t.amount)}</div>
                          {parseFloat(t.charges_amount) > 0 && (
                            <div style={{ color:'#d97706', fontSize:11 }}>Charges: ₹{fmt(t.charges_amount)}</div>
                          )}
                        </div>
                      </div>
                      {/* Extra details */}
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        {t.card && <span style={{ background:'#e0e7ff', color:'#4338ca', padding:'1px 8px', borderRadius:20, fontSize:10, fontWeight:700 }}>{t.card}{t.card_last4 ? ` ****${t.card_last4}` : ''}</span>}
                        {t.bank && <span style={{ background:'#f0fdf4', color:'#059669', padding:'1px 8px', borderRadius:20, fontSize:10, fontWeight:700 }}>{t.bank}</span>}
                        {t.payment_mode && <span style={{ background:'#fef3c7', color:'#d97706', padding:'1px 8px', borderRadius:20, fontSize:10, fontWeight:700 }}>{t.payment_mode}</span>}
                        {t.note && <span style={{ color:'#9ca3af', fontSize:10, fontStyle:'italic' }}>{t.note}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to   { transform: translateX(0);    opacity: 1; }
            }
            @keyframes shimmer {
              0%   { background-position: -400px 0; }
              100% { background-position:  400px 0; }
            }
          `}</style>
        </>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="ci-lightbox" onClick={() => setLightbox(null)}>
          <div className="ci-lightbox-box" onClick={e => e.stopPropagation()}>
            <div className="ci-lightbox-header">
              <span>{lightbox.label}</span>
              <button onClick={() => setLightbox(null)}>✕</button>
            </div>
            <img src={lightbox.url} alt={lightbox.label} className="ci-lightbox-img" />
          </div>
        </div>
      )}
    </div>
  )
}
