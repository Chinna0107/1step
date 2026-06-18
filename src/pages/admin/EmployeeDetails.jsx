import React, { useState, useCallback, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole, getUserByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import { cacheGet, cacheSet, cacheClear, TTL } from '../../utils/cache'
import '../../pages/dashboard.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })
const fmt  = n => Number(parseFloat(n) || 0).toLocaleString('en-IN')
const fmtV = n => { const v = parseFloat(n)||0; if (v>=100000) return `₹${(v/100000).toFixed(1)}L`; if (v>=1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }
const today = new Date().toISOString().split('T')[0]

function EmployeeDetailModal({ emp, onClose }) {
  const [tab, setTab]         = useState('details')
  const [txns, setTxns]       = useState(null)
  const [txnLoad, setTxnLoad] = useState(false)
  const [att, setAtt]         = useState(null)
  const [attLoad, setAttLoad] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  const loadTxns = useCallback(async () => {
    if (txns) return
    setTxnLoad(true)
    try {
      const data = await api(`/dashboard/reports?employee_id=${emp.id}&from=2020-01-01&to=${today}`, { headers: auth() })
      setTxns(data?.transactions ?? [])
      if (data?.totals) setTxnMeta({ count: data.totals.count, amount: data.totals.amount, profit: data.totals.profit })
    } catch { setTxns([]) }
    setTxnLoad(false)
  }, [emp.id, txns])

  const loadAtt = useCallback(async () => {
    if (att) return
    setAttLoad(true)
    try {
      const data = await api(`/dashboard/attendance?view=month&month=${new Date().getMonth()+1}&year=${new Date().getFullYear()}`, { headers: auth() })
      setAtt((data || []).filter(a => a.employee_name === emp.name))
    } catch { setAtt([]) }
    setAttLoad(false)
  }, [emp.name, att])

  const handleTab = t => {
    setTab(t)
    if (t === 'transactions') loadTxns()
    if (t === 'attendance')   loadAtt()
  }

  const docs = [
    { label: '🧑 Photo',         url: emp.photo_url },
    { label: '🪪 Aadhaar Card',  url: emp.aadhar_img_url },
    { label: '🆔 PAN Card',      url: emp.pan_img_url },
    { label: '📄 Document/ID',   url: emp.docx_url },
    { label: '📋 Resume',        url: emp.resume_url },
  ]

  const fields = [
    { label: 'Employee ID',   value: `#${emp.id}` },
    { label: 'Full Name',     value: emp.name || '—' },
    { label: 'Email',         value: emp.email || '—' },
    { label: 'Mobile',        value: emp.mobile || '—' },
    { label: 'PAN Number',    value: emp.pan || '—',    mono: true },
    { label: 'Aadhar Number', value: emp.aadhar ? emp.aadhar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '—', mono: true },
    { label: 'Branch',        value: emp.branch || '—' },
    { label: 'Role',          value: emp.role || '—' },
    { label: 'Coins',         value: `🪙 ${emp.coins ?? 0}` },
    { label: 'Access Level',  value: emp.is_admin ? '🔑 Admin' : '👤 Employee' },
    { label: 'Status',        value: emp.is_active ? '✅ Active' : '❌ Inactive' },
    { label: 'Joined',        value: new Date(emp.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) },
  ]

  const [txnMeta, setTxnMeta] = useState(null)

  const txnTotals = txnMeta ?? (txns ? {
    count:  txns.length,
    amount: txns.reduce((s,t) => s + parseFloat(t.amount||0), 0),
    profit: txns.reduce((s,t) => s + parseFloat(t.profit||0), 0),
  } : null)

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:660, maxHeight:'92vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 32px 80px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#1a0a2e,#402070,#c02040)', padding:'20px 24px', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              {emp.photo_url
                ? <img src={emp.photo_url} alt={emp.name} style={{ width:52, height:52, borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(255,255,255,0.3)' }} />
                : <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:900, color:'#d4af37' }}>
                    {emp.name?.[0]?.toUpperCase()}
                  </div>
              }
              <div>
                <div style={{ color:'#fff', fontWeight:900, fontSize:18 }}>{emp.name}</div>
                <div style={{ color:'rgba(255,255,255,0.55)', fontSize:12, marginTop:2 }}>{emp.email} · {emp.branch}</div>
                <div style={{ display:'flex', gap:6, marginTop:6 }}>
                  <span style={{ background: emp.is_active ? '#d1fae5' : '#fee2e2', color: emp.is_active ? '#059669' : '#dc2626', padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:800 }}>
                    {emp.is_active ? '✅ Active' : '❌ Inactive'}
                  </span>
                  {emp.is_admin && <span style={{ background:'#ede9fe', color:'#7c3aed', padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:800 }}>🔑 Admin</span>}
                  <span style={{ background:'rgba(212,175,55,0.2)', color:'#d4af37', padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:800 }}>🪙 {emp.coins ?? 0}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', width:32, height:32, borderRadius:'50%', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:6, marginTop:16 }}>
            {[['details','👤 Details'],['documents','🖼️ Documents'],['transactions','📋 Transactions'],['attendance','✅ Attendance']].map(([key,label]) => (
              <button key={key} onClick={() => handleTab(key)}
                style={{ padding:'6px 14px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, fontWeight:700,
                  background: tab===key ? '#fff' : 'rgba(255,255,255,0.15)',
                  color: tab===key ? '#402070' : 'rgba(255,255,255,0.8)' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY:'auto', flex:1, padding:20 }}>

          {/* Details */}
          {tab === 'details' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {fields.map(f => (
                <div key={f.label} style={{ background:'#f8fafc', borderRadius:10, padding:'10px 14px' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>{f.label}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#1a0a2e', fontFamily:f.mono?'monospace':'inherit', wordBreak:'break-all' }}>{f.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Documents */}
          {tab === 'documents' && (
            <div>
              {docs.length === 0 ? (
                <div className="dash-empty">No documents uploaded</div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:16 }}>
                  {docs.map(d => (
                    <div key={d.label} style={{ background:'#f8fafc', borderRadius:12, overflow:'hidden', border:'1.5px solid #e2e8f0' }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'#402070', padding:'8px 12px', borderBottom:'1px solid #e2e8f0' }}>{d.label}</div>
                      <img src={d.url} alt={d.label} onClick={() => setLightbox({ url:d.url, label:`${emp.name} — ${d.label}` })}
                        style={{ width:'100%', height:140, objectFit:'cover', cursor:'pointer', display:'block' }} />
                      <div style={{ padding:'8px 12px' }}>
                        <a href={d.url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize:11, color:'#402070', fontWeight:700, textDecoration:'none' }}>🔗 Open Full Size</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Transactions */}
          {tab === 'transactions' && (
            <div>
              {txnLoad ? <div className="dash-loading">Loading...</div> : txns === null ? (
                <div className="dash-empty">Loading...</div>
              ) : (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
                    {[
                      { label:'Total Txns',   value: txnTotals.count,              color:'#402070' },
                      { label:'Total Amount', value: fmtV(txnTotals.amount),       color:'#059669' },
                      { label:'Total Profit', value: fmtV(txnTotals.profit),       color:'#d97706' },
                    ].map(s => (
                      <div key={s.label} style={{ background:'#f8fafc', borderRadius:10, padding:'12px 14px', textAlign:'center' }}>
                        <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', marginBottom:4 }}>{s.label}</div>
                        <div style={{ fontSize:18, fontWeight:900, color:s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                  {txns.length === 0 ? <div className="dash-empty">No transactions found</div> : (
                    <div style={{ overflowX:'auto' }}>
                      <table className="dash-table">
                        <thead><tr><th>#</th><th>Date</th><th>Customer</th><th>Service</th><th>Platform</th><th>Amount</th><th>Profit</th></tr></thead>
                        <tbody>
                          {txns.map(t => (
                            <tr key={t.id}>
                              <td style={{ fontFamily:'monospace', color:'#402070', fontWeight:700, fontSize:11 }}>#{t.id}</td>
                              <td style={{ fontSize:11 }}>
                                <div>{new Date(t.created_at).toLocaleDateString('en-IN')}</div>
                                <div style={{ color:'#9ca3af' }}>{new Date(t.created_at).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
                              </td>
                              <td><strong>{t.cust_name||'—'}</strong><div style={{ fontSize:11,color:'#9ca3af' }}>{t.cust_pan||''}</div></td>
                              <td style={{ fontSize:12 }}>{t.service_type||'—'}</td>
                              <td><span style={{ background:'#ede9fe',color:'#402070',padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:700 }}>{t.platform||t.bill_platform||'—'}</span></td>
                              <td style={{ color:'#059669',fontWeight:700 }}>₹{fmt(t.amount)}</td>
                              <td style={{ color:'#d97706',fontWeight:700 }}>₹{fmt(t.profit||0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Attendance */}
          {tab === 'attendance' && (
            <div>
              {attLoad ? <div className="dash-loading">Loading...</div> : att === null ? (
                <div className="dash-empty">Loading...</div>
              ) : att.length === 0 ? (
                <div className="dash-empty">No attendance records this month</div>
              ) : (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
                    {[
                      { label:'Present Days', value: att.filter(a=>a.status==='Present').length, color:'#059669' },
                      { label:'Late Check-ins', value: att.filter(a => { if(!a.check_in) return false; const [h,m]=a.check_in.split(':').map(Number); return h*60+m > 9*60+15 }).length, color:'#d97706' },
                      { label:'Total Minutes', value: att.reduce((s,a)=>s+(a.minutes||0),0), color:'#402070' },
                    ].map(s => (
                      <div key={s.label} style={{ background:'#f8fafc', borderRadius:10, padding:'12px 14px', textAlign:'center' }}>
                        <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', marginBottom:4 }}>{s.label}</div>
                        <div style={{ fontSize:18, fontWeight:900, color:s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ overflowX:'auto' }}>
                    <table className="dash-table">
                      <thead><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Minutes</th><th>Status</th></tr></thead>
                      <tbody>
                        {att.map(a => {
                          const late = a.check_in && (() => { const [h,m]=a.check_in.split(':').map(Number); return h*60+m > 9*60+15 })()
                          return (
                            <tr key={a.id}>
                              <td style={{ fontSize:12 }}>{new Date(a.date).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</td>
                              <td style={{ color: late ? '#d97706' : '#374151', fontWeight: late ? 700 : 400 }}>
                                {a.check_in || '—'}{late && <span style={{ marginLeft:4, background:'#fef3c7', color:'#d97706', padding:'1px 6px', borderRadius:20, fontSize:10, fontWeight:700 }}>⏰ Late</span>}
                              </td>
                              <td>{a.check_out || '—'}</td>
                              <td style={{ fontWeight:700, color:(a.minutes||0)>500?'#059669':'#374151' }}>{a.minutes||0} min</td>
                              <td><span className={`dash-status ${a.status?.toLowerCase()}`}>{a.status}</span></td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:'14px 20px', borderTop:'1px solid #f1f5f9', display:'flex', gap:10, justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', gap:8 }}>
            {emp.mobile && <a href={`tel:${emp.mobile}`} style={{ padding:'8px 16px', borderRadius:10, background:'#d1fae5', color:'#059669', fontWeight:700, fontSize:13, textDecoration:'none' }}>📞 Call</a>}
            {emp.mobile && <a href={`https://wa.me/${emp.mobile.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${emp.name}, this is MoneySpot management.`)}`} target="_blank" rel="noopener noreferrer"
              style={{ padding:'8px 16px', borderRadius:10, background:'#25D366', color:'#fff', fontWeight:700, fontSize:13, textDecoration:'none' }}>💬 WhatsApp</a>}
          </div>
          <button onClick={onClose} style={{ padding:'8px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#402070,#c02040)', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14 }}>Close</button>
        </div>
      </div>

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:16, overflow:'hidden', maxWidth:700, width:'100%' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'#1a0a2e' }}>
              <span style={{ color:'#fff', fontWeight:700 }}>{lightbox.label}</span>
              <button onClick={() => setLightbox(null)} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', width:28, height:28, borderRadius:'50%', cursor:'pointer' }}>✕</button>
            </div>
            <img src={lightbox.url} alt={lightbox.label} style={{ width:'100%', maxHeight:'70vh', objectFit:'contain', display:'block' }} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminEmployeeDetails() {
  const user = getUserByRole('admin')
  const [employees, setEmployees] = useState(() => cacheGet('admin:employees') || [])
  const [loading, setLoading]     = useState(!cacheGet('admin:employees'))
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected]   = useState(null)

  const load = useCallback((force = false) => {
    if (!force && cacheGet('admin:employees')) return
    setLoading(true)
    api('/dashboard/employees', { headers: auth() })
      .then(d => { cacheSet('admin:employees', d, TTL.list); setEmployees(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = employees.filter(e => {
    const q = search.toLowerCase()
    const matchSearch = !q || e.name?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q) || e.mobile?.includes(q) || e.pan?.toLowerCase().includes(q)
    const matchStatus = !statusFilter || (statusFilter === 'active' ? e.is_active : !e.is_active)
    return matchSearch && matchStatus
  })

  const counts = {
    total:    employees.length,
    active:   employees.filter(e => e.is_active).length,
    inactive: employees.filter(e => !e.is_active).length,
    admins:   employees.filter(e => e.is_admin).length,
  }

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <div>
            <h1>👨‍💼 Employee Details</h1>
            <p style={{ margin:0, fontSize:12, color:'#9ca3af' }}>Branch: {user?.branch || '—'}</p>
          </div>
          <div className="dash-topbar-right">
            <input placeholder="Search name / email / mobile / PAN..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ padding:'7px 14px', borderRadius:8, border:'1.5px solid rgba(64,32,112,0.2)', fontFamily:'inherit', fontSize:13, width:280 }} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ padding:'7px 12px', borderRadius:8, border:'1.5px solid rgba(64,32,112,0.2)', fontFamily:'inherit', fontSize:13 }}>
              <option value="">All Status</option>
              <option value="active">✅ Active</option>
              <option value="inactive">❌ Inactive</option>
            </select>
            <button className="dash-btn" style={{ background:'#f0f2f8', color:'#402070', border:'none' }} onClick={() => { cacheClear('admin:employees'); load(true) }}>🔄</button>
          </div>
        </div>

        <div className="dash-main">

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
            {[
              { label:'Total',    value:counts.total,    color:'#402070', bg:'#ede9fe', icon:'👥' },
              { label:'Active',   value:counts.active,   color:'#059669', bg:'#d1fae5', icon:'✅' },
              { label:'Inactive', value:counts.inactive, color:'#dc2626', bg:'#fee2e2', icon:'❌' },
              { label:'Admins',   value:counts.admins,   color:'#7c3aed', bg:'#ede9fe', icon:'🔑' },
            ].map(s => (
              <div key={s.label} style={{ background:'#fff', borderRadius:14, padding:'16px 18px', boxShadow:'0 2px 12px rgba(64,32,112,0.08)', borderLeft:`4px solid ${s.color}`, display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.5 }}>{s.label}</div>
                  <div style={{ fontSize:22, fontWeight:900, color:s.color, lineHeight:1.1 }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h2>All Employees ({filtered.length})</h2>
              <span style={{ fontSize:12, color:'#9ca3af' }}>Click any row to view full details</span>
            </div>
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : (
                <table className="dash-table">
                  <thead>
                    <tr><th>#</th><th>Employee</th><th>Mobile</th><th>PAN</th><th>Aadhar</th><th>Branch</th><th>Role</th><th>Coins</th><th>Access</th><th>Status</th><th>Joined</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(e => (
                      <tr key={e.id} onClick={() => setSelected(e)} style={{ cursor:'pointer' }}
                        onMouseEnter={el => el.currentTarget.style.background = '#f0f2f8'}
                        onMouseLeave={el => el.currentTarget.style.background = ''}>
                        <td style={{ fontFamily:'monospace', color:'#402070', fontWeight:700, fontSize:11 }}>#{e.id}</td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            {e.photo_url
                              ? <img src={e.photo_url} alt={e.name} style={{ width:30, height:30, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} />
                              : <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#402070,#c02040)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:900, color:'#fff', flexShrink:0 }}>{e.name?.[0]?.toUpperCase()}</div>
                            }
                            <div>
                              <strong>{e.name}</strong>
                              <div style={{ fontSize:11, color:'#9ca3af' }}>{e.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize:12 }}>{e.mobile || '—'}</td>
                        <td style={{ fontFamily:'monospace', fontSize:12 }}>{e.pan || '—'}</td>
                        <td style={{ fontFamily:'monospace', fontSize:12 }}>{e.aadhar ? e.aadhar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '—'}</td>
                        <td style={{ fontSize:12 }}>{e.branch || '—'}</td>
                        <td style={{ fontSize:12 }}>{e.role || '—'}</td>
                        <td style={{ color:'#b8860b', fontWeight:700, fontSize:12 }}>🪙 {e.coins ?? 0}</td>
                        <td>
                          {e.is_admin
                            ? <span style={{ background:'#ede9fe', color:'#7c3aed', padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:700 }}>🔑 Admin</span>
                            : <span style={{ background:'#f0f2f8', color:'#64748b', padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:700 }}>👤 Employee</span>}
                        </td>
                        <td>
                          <span style={{ background: e.is_active ? '#d1fae5' : '#fee2e2', color: e.is_active ? '#059669' : '#dc2626', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>
                            {e.is_active ? '✅ Active' : '❌ Inactive'}
                          </span>
                        </td>
                        <td style={{ fontSize:11, color:'#64748b' }}>{new Date(e.created_at).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                    {!filtered.length && <tr><td colSpan={11} className="dash-empty">No employees found</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {selected && <EmployeeDetailModal emp={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
