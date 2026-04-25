import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import EmployeeNavbar from '../../components/employee/EmployeeNavbar'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import { useCharges } from '../../hooks/useCharges'
import { cacheGet, cacheSet, TTL } from '../../utils/cache'
import '../../pages/dashboard.css'
import './Services.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('employee') || getTokenByRole('admin')}` })
const fmt    = n => { const num = parseFloat(n); return isNaN(num) ? '0' : num.toLocaleString('en-IN') }
const fmtVal = n => { const v = parseFloat(n) || 0; if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }

const BILL_WITHDRAWAL = 'Bill Pay + Withdrawal'
const CARD_WITHDRAWAL = 'Card Withdrawal'
const DMT             = 'Money Transfer (DMT)'
const AEPS            = 'AEPS'
const ONLY_BILL       = 'Only Bill Payment'

const emptyForm = {
  service_type: '', note: '',
  customer_id: '', cust_name: '', cust_pan: '', cust_aadhar: '', cust_mobile: '',
  bill_platform: '', bill_amount: '', bill_remaining: '', total_collected: '', received_mode: '',
  platform: '', card: '', card_bank: '', card_last4: '', payment_mode: '', amount: '',
  charges_pct: '', charges_amount: '', settled_amount: '',
  bank: '', acc_no: '',
}

export default function Services() {
  const navigate = useNavigate()
  const [master, setMaster]       = useState(null)
  const [customers, setCustomers] = useState([])
  const [form, setForm]           = useState(emptyForm)
  const [saving, setSaving]       = useState(false)
  const [msg, setMsg]             = useState('')
  const [error, setError]         = useState('')
  const [history, setHistory]     = useState([])
  const [custMode, setCustMode]   = useState('search')
  const [search, setSearch]       = useState('')
  const [customerProfile, setCustomerProfile]   = useState(null)
  const [loadingProfile, setLoadingProfile]     = useState(false)
  const [menuTxnId, setMenuTxnId] = useState(null)
  const [menuPos, setMenuPos]     = useState({ top: 0, left: 0 })
  const [editTxn, setEditTxn]     = useState(null)
  const [viewTxn, setViewTxn]     = useState(null)

  const { lookup } = useCharges()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    // Serve from cache instantly, then revalidate in background
    const cachedMaster    = cacheGet('svc:master')
    const cachedCustomers = cacheGet('svc:customers')
    const cachedHistory   = cacheGet('svc:history')

    if (cachedMaster)    setMaster(cachedMaster)
    if (cachedCustomers) setCustomers(cachedCustomers)
    if (cachedHistory)   setHistory(cachedHistory)

    // Fetch stale/missing in parallel
    const fetches = []

    if (!cachedMaster)
      fetches.push(
        api('/master/all', { headers: auth() })
          .then(d => { setMaster(d); cacheSet('svc:master', d, TTL.master) })
          .catch(() => {})
      )

    if (!cachedCustomers)
      fetches.push(
        api('/customers/approved', { headers: auth() })
          .then(d => { setCustomers(d); cacheSet('svc:customers', d, TTL.list) })
          .catch(() => {})
      )

    if (!cachedHistory)
      fetches.push(
        api('/master/transactions/mine', { headers: auth() })
          .then(d => { setHistory(d); cacheSet('svc:history', d, TTL.dashboard) })
          .catch(() => {})
      )

    // Background revalidate stale cache
    if (cachedMaster)
      api('/master/all', { headers: auth() })
        .then(d => { setMaster(d); cacheSet('svc:master', d, TTL.master) }).catch(() => {})

    if (cachedCustomers)
      api('/customers/approved', { headers: auth() })
        .then(d => { setCustomers(d); cacheSet('svc:customers', d, TTL.list) }).catch(() => {})

    if (cachedHistory)
      api('/master/transactions/mine', { headers: auth() })
        .then(d => { setHistory(d); cacheSet('svc:history', d, TTL.dashboard) }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!form.service_type) return
    if (!form.platform) { setForm(f => ({ ...f, charges_pct: '' })); return }
    const { customer_rate } = lookup(form.service_type, form.platform, form.card)
    setForm(f => ({ ...f, charges_pct: customer_rate || '' }))
  }, [form.service_type, form.platform, form.card, lookup])

  // Auto-calc derived fields
  // Fix #5: Total Collected = Withdrawal Amount + Charges on withdrawal only (NOT bill amount)
  useEffect(() => {
    const amt     = parseFloat(form.amount)     || 0
    const billAmt = parseFloat(form.bill_amount) || 0
    const pct     = parseFloat(form.charges_pct) || 0
    if (!amt && !billAmt) return
    const chargesAmt = parseFloat((amt * pct / 100).toFixed(2))
    const settledAmt = parseFloat((amt - chargesAmt).toFixed(2))
    const billRemain = parseFloat((billAmt > 0 && amt > 0 ? Math.max(0, billAmt - amt) : 0).toFixed(2))
    // Total Collected = Bill Remaining Balance + Charges only
    const totalColl  = parseFloat((billRemain + chargesAmt).toFixed(2))
    setForm(f => ({
      ...f,
      charges_amount:  chargesAmt,
      settled_amount:  settledAmt,
      bill_remaining:  billAmt && amt ? (billRemain > 0 ? billRemain : 0) : f.bill_remaining,
      total_collected: totalColl,
    }))
  }, [form.amount, form.bill_amount, form.charges_pct])

  const selectCustomer = async (c) => {
    setForm(f => ({ ...f, customer_id: c.id, cust_name: c.name, cust_pan: c.pan || '', cust_aadhar: c.aadhar || '', cust_mobile: c.phone || '' }))
    setSearch(c.name)
    setLoadingProfile(true)
    try {
      const [profile, txns] = await Promise.all([
        api(`/customers/${c.id}`, { headers: auth() }),
        api(`/master/transactions?customer_id=${c.id}`, { headers: auth() }).catch(() => []),
      ])
      setCustomerProfile({ ...profile, transactions: Array.isArray(txns) ? txns : [] })
    } catch {
      setCustomerProfile({ ...c, transactions: [] })
    }
    setLoadingProfile(false)
  }

  const clearCustomer = () => {
    setForm(f => ({ ...f, customer_id: '', cust_name: '', cust_pan: '', cust_aadhar: '', cust_mobile: '' }))
    setSearch('')
    setCustomerProfile(null)
  }

  const filteredCusts = useMemo(() => {
    if (search.length < 2) return []
    const q = search.toLowerCase()
    return customers.filter(c => c.status === 'approved' &&
      (c.name?.toLowerCase().includes(q) || c.phone?.includes(search) || c.pan?.toLowerCase().includes(q)))
  }, [customers, search])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.cust_name.trim()) { setError('Customer name is required'); return }
    if (!form.cust_pan.trim())  { setError('Customer PAN is required'); return }
    setSaving(true); setMsg(''); setError('')
    try {
      const mainAmount = form.service_type === BILL_WITHDRAWAL
        ? (parseFloat(form.total_collected) || parseFloat(form.amount) || 0)
        : parseFloat(form.amount) || 0
      const r = await api('/master/transactions', {
        method: 'POST', headers: auth(),
        body: JSON.stringify({ ...form, amount: mainAmount }),
      })
      setMsg(`✅ Transaction recorded! `)
      setForm(emptyForm); setSearch('')
      // Bust history cache and refresh
      cacheSet('svc:history', null, 0)
      api('/master/transactions/mine', { headers: auth() })
        .then(d => { setHistory(d); cacheSet('svc:history', d, TTL.dashboard) }).catch(() => {})
    } catch (err) { setError(err.message) }
    setSaving(false)
  }

  if (!master) return (
    <div className="emp-page"><EmployeeNavbar />
      <div className="emp-page-content"><div className="dash-loading">Loading services...</div></div>
    </div>
  )

  const svcType    = form.service_type
  const isBillWd   = svcType === BILL_WITHDRAWAL
  const isCardWd   = svcType === CARD_WITHDRAWAL
  const isDMT      = svcType === DMT
  const isAEPS     = svcType === AEPS
  const isOnlyBill = svcType === ONLY_BILL

  const platforms = master?.platforms?.map(p => p.name) || []
  const banks     = master?.banks?.map(b => b.name)     || []
  const cards     = master?.cards?.map(c => c.name)     || []
  const receiveModes = master?.receive_modes?.map(r => r.name) || []
  const paymentModes = master?.payment_modes?.map(p => p.name) || []

  const fg = (label, children, full = false) => (
    <div className="dash-form-group" style={full ? { gridColumn: '1 / -1' } : {}}>
      <label>{label}</label>
      {children}
    </div>
  )

  const inp = (k, placeholder, type = 'text') => (
    <input type={type} placeholder={placeholder} value={form[k]} onChange={e => set(k, e.target.value)} />
  )

  const sel = (k, options, placeholder = 'Select') => (
    <select value={form[k]} onChange={e => set(k, e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((o, i) => <option key={i} value={o}>{o}</option>)}
    </select>
  )

  const roInp = (k, color) => (
    <input readOnly value={form[k] === 0 || form[k] === '' ? '' : form[k]} style={{ background: '#f8fafc', color: color || '#402070', fontWeight: 700 }} />
  )

  return (
    <div className="emp-page">
      <EmployeeNavbar />
      <div className="emp-page-content">
        <div className="emp-page-header"><h1>New Transaction</h1></div>

        {msg   && <div className="dash-alert dash-alert-success" style={{ marginBottom: 16 }}>{msg}</div>}
        {error && <div className="dash-alert dash-alert-error"   style={{ marginBottom: 16 }}>❌ {error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
          <form onSubmit={handleSubmit}>

            {/* ── Customer ── */}
            <div className="dash-card" style={{ marginBottom: 16, overflow: 'visible' }}>
              <div className="dash-card-header">
                <h2>👤 Customer Details</h2>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['search', 'manual'].map(m => (
                    <button key={m} type="button" className="dash-btn dash-btn-sm"
                      style={{ background: custMode === m ? 'linear-gradient(135deg,#402070,#c02040)' : '#f0f2f8', color: custMode === m ? '#fff' : '#666', border: 'none' }}
                      onClick={() => { setCustMode(m); clearCustomer() }}>
                      {m === 'search' ? '🔍 From Profile' : '✏️ Manual Entry'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="dash-card-body" style={{ overflow: 'visible' }}>
                {custMode === 'search' ? (
                  <>
                    <div style={{ position: 'relative', marginBottom: 12, zIndex: 200 }}>
                      <input placeholder="Search by name, phone or PAN..." value={search}
                        onChange={e => { setSearch(e.target.value); if (form.customer_id) clearCustomer() }}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(64,32,112,0.2)', fontFamily: 'inherit', fontSize: 14, boxSizing: 'border-box' }} />

                      {filteredCusts.length > 0 && !form.customer_id && (
                        <div className="customer-search-dropdown" style={{ zIndex: 1000 }}>
                          {filteredCusts.map(c => (
                            <div key={c.id} onClick={() => selectCustomer(c)} className="customer-search-item">
                              <div style={{ fontWeight: 700, color: '#402070', fontSize: 14 }}>{c.name}</div>
                              <div style={{ fontSize: 12, color: '#9ca3af' }}>{c.phone} · PAN: {c.pan}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {search.length >= 2 && filteredCusts.length === 0 && !form.customer_id && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1.5px solid #e2e8f0', zIndex: 1000, padding: 16, marginTop: 4 }}>
                          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>No customer found for <strong style={{ color: '#1a0a2e' }}>'{search}'</strong></div>
                          <button type="button"
                            onClick={() => { localStorage.setItem('pendingCustomerName', search); navigate('/employee/add-customer') }}
                            style={{ width: '100%', padding: '12px 16px', background: 'linear-gradient(135deg,#402070,#c02040)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            ➕ Add "{search}" as New Customer
                          </button>
                        </div>
                      )}
                    </div>

                    {form.customer_id ? (
                      <>
                        {loadingProfile && (
                          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                            {[80,60,100,60].map((w,i) => (
                              <div key={i} style={{ height:16, borderRadius:8, background:'linear-gradient(90deg,#f0f2f8 25%,#e4e6f0 50%,#f0f2f8 75%)', backgroundSize:'400px 100%', animation:'shimmer 1.4s infinite linear', width:`${w}%` }} />
                            ))}
                          </div>
                        )}

                        {!loadingProfile && customerProfile && (() => {
                          const txns      = customerProfile.transactions || []
                          const totalAmt  = txns.reduce((s, t) => s + parseFloat(t.amount || 0), 0)
                          const totalProfit = txns.reduce((s, t) => s + parseFloat(t.profit || 0), 0)
                          const isPremium = txns.length >= 10 || totalAmt >= 100000
                          const isVip     = txns.length >= 5  || totalAmt >= 50000
                          const badge     = isPremium ? { label: '👑 Premium', bg: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#fff' }
                                          : isVip     ? { label: '⭐ VIP',     bg: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: '#fff' }
                                          : null
                          const serviceBreakdown = txns.reduce((acc, t) => {
                            const k = t.service_type || 'Other'
                            acc[k] = (acc[k] || 0) + 1
                            return acc
                          }, {})
                          return (
                            <div style={{ border:'1.5px solid #e2e8f0', borderRadius:16, overflow:'hidden', animation:'cd-card-in 0.4s ease both' }}>

                              {/* Header */}
                              <div style={{ background:'linear-gradient(135deg,#1a0a2e 0%,#2d1155 50%,#c02040 100%)', padding:'16px 18px', position:'relative', overflow:'hidden' }}>
                                <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:'rgba(212,175,55,0.15)', filter:'blur(20px)' }} />
                                <div style={{ position:'absolute', bottom:-20, left:'20%', width:80, height:80, borderRadius:'50%', background:'rgba(64,32,112,0.3)', filter:'blur(15px)' }} />
                                <div style={{ position:'relative', zIndex:1, display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                                  <div>
                                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                                      <span style={{ fontWeight:900, color:'#fff', fontSize:17 }}>{customerProfile.name}</span>
                                      {badge && <span style={{ background:badge.bg, color:badge.color, fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:20 }}>{badge.label}</span>}
                                    </div>
                                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)' }}>ID: #{customerProfile.id} · {customerProfile.branch || '—'}</div>
                                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', marginTop:2 }}>
                                      <span style={{ background:'rgba(16,185,129,0.2)', border:'1px solid rgba(16,185,129,0.3)', color:'#10b981', padding:'1px 8px', borderRadius:20, fontSize:10, fontWeight:700 }}>✅ {customerProfile.status}</span>
                                    </div>
                                  </div>
                                  <button type="button" onClick={clearCustomer} style={{ background:'rgba(255,255,255,0.15)', color:'#fff', border:'none', borderRadius:8, padding:'5px 12px', cursor:'pointer', fontSize:12, fontWeight:700 }}>✕ Clear</button>
                                </div>
                              </div>

                              {/* Stats Row */}
                              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
                                {[
                                  { label:'Transactions', value: txns.length,          color:'#402070' },
                                  { label:'Total Amount', value: totalAmt >= 100000 ? `₹${(totalAmt/100000).toFixed(1)}L` : totalAmt >= 1000 ? `₹${(totalAmt/1000).toFixed(1)}K` : `₹${totalAmt}`, color:'#059669' },
                                  { label:'Total Charges', value: totalProfit >= 1000 ? `₹${(totalProfit/1000).toFixed(1)}K` : `₹${totalProfit.toFixed(0)}`, color:'#d4af37' },
                                  { label:'Avg / Txn',    value: txns.length ? (totalAmt/txns.length >= 1000 ? `₹${((totalAmt/txns.length)/1000).toFixed(1)}K` : `₹${Math.round(totalAmt/txns.length)}`) : '—', color:'#c02040' },
                                ].map((s, i) => (
                                  <div key={i} style={{ padding:'10px 12px', textAlign:'center', borderRight: i < 3 ? '1px solid #e2e8f0' : 'none' }}>
                                    <div style={{ fontSize:9, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.4 }}>{s.label}</div>
                                    <div style={{ fontSize:15, fontWeight:900, color:s.color, marginTop:3 }}>{s.value}</div>
                                  </div>
                                ))}
                              </div>

                              {/* Details Grid */}
                              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'#f1f5f9' }}>
                                {[
                                  { icon:'🪪', label:'PAN',        value: customerProfile.pan || '—' },
                                  { icon:'📱', label:'Mobile',     value: customerProfile.phone || '—' },
                                  { icon:'🔢', label:'Aadhar',     value: customerProfile.aadhar ? customerProfile.aadhar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '—' },
                                  { icon:'✉️',  label:'Email',      value: customerProfile.email || '—' },
                                  { icon:'🏦', label:'Account No', value: customerProfile.acc_number || '—' },
                                  { icon:'🏢', label:'Branch',     value: customerProfile.branch || '—' },
                                  { icon:'👤', label:'Added By',   value: customerProfile.added_by_name || '—' },
                                  { icon:'📅', label:'Member Since',value: customerProfile.created_at ? new Date(customerProfile.created_at).toLocaleDateString('en-IN') : '—' },
                                  ...(customerProfile.reviewed_by_name ? [{ icon:'✅', label:'Approved By', value: customerProfile.reviewed_by_name }] : []),
                                  ...(customerProfile.reviewed_at ? [{ icon:'📅', label:'Approved On', value: new Date(customerProfile.reviewed_at).toLocaleDateString('en-IN') }] : []),
                                  ...(customerProfile.pan_img_url ? [{ icon:'🖼️', label:'PAN Image', value: <a href={customerProfile.pan_img_url} target="_blank" rel="noopener noreferrer"><img src={customerProfile.pan_img_url} alt="PAN" style={{ width:60, height:40, objectFit:'cover', borderRadius:4, border:'1.5px solid rgba(64,32,112,0.2)', cursor:'pointer' }} /></a> }] : []),
                                  ...(customerProfile.aadhar_img_url ? [{ icon:'🖼️', label:'Aadhar Image', value: <a href={customerProfile.aadhar_img_url} target="_blank" rel="noopener noreferrer"><img src={customerProfile.aadhar_img_url} alt="Aadhar" style={{ width:60, height:40, objectFit:'cover', borderRadius:4, border:'1.5px solid rgba(64,32,112,0.2)', cursor:'pointer' }} /></a> }] : []),
                                  ...(customerProfile.card_front_img_url ? [{ icon:'🏧', label:'Card Front', value: <a href={customerProfile.card_front_img_url} target="_blank" rel="noopener noreferrer"><img src={customerProfile.card_front_img_url} alt="Card" style={{ width:60, height:40, objectFit:'cover', borderRadius:4, border:'1.5px solid rgba(64,32,112,0.2)', cursor:'pointer' }} /></a> }] : []),
                                ].map((f, i) => (
                                  <div key={i} style={{ background:'#fff', padding:'8px 14px' }}>
                                    <div style={{ fontSize:9, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.4 }}>{f.icon} {f.label}</div>
                                    <div style={{ fontSize:12, fontWeight:700, color:'#1a0a2e', marginTop:2, wordBreak:'break-all' }}>{f.value}</div>
                                  </div>
                                ))}
                              </div>

                              {/* Service Breakdown */}
                              {Object.keys(serviceBreakdown).length > 0 && (
                                <div style={{ borderTop:'1px solid #e2e8f0', background:'#fafbff', padding:'10px 14px' }}>
                                  <div style={{ fontSize:9, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.4, marginBottom:8 }}>Service Breakdown</div>
                                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                                    {Object.entries(serviceBreakdown).map(([svc, cnt]) => (
                                      <span key={svc} style={{ background:'#ede9fe', color:'#402070', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>
                                        {svc} ×{cnt}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                            </div>
                          )
                        })()}
                      </>
                    ) : (
                      <div style={{ fontSize: 13, color: '#9ca3af' }}>Type at least 2 characters to search approved customers</div>
                    )}
                  </>
                ) : (
                  <div className="dash-form-grid">
                    {fg('Customer Name *', <input required placeholder="Full name" value={form.cust_name} onChange={e => set('cust_name', e.target.value)} />)}
                    {fg('PAN Number *', <>
                      <input required placeholder="ABCDE1234F" maxLength={10} value={form.cust_pan} onChange={e => set('cust_pan', e.target.value.toUpperCase())} />
                      {form.cust_pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.cust_pan) && <span style={{ fontSize: 11, color: '#dc2626' }}>Format: ABCDE1234F</span>}
                    </>)}
                    {fg('Aadhar Number', inp('cust_aadhar', '12-digit Aadhar'))}
                    {fg('Mobile Number', inp('cust_mobile', '10-digit mobile'))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Service Type — show only after customer selected ── */}
            {(form.customer_id || form.cust_name) && (
              <>
                <div className="dash-card" style={{ marginBottom: 16 }}>
                  <div className="dash-card-header"><h2>🔧 Service Type</h2></div>
                  <div className="dash-card-body">
                    <div className="dash-form-group">
                      <label>Service Type *</label>
                      <select required value={form.service_type} onChange={e => setForm({ ...emptyForm, service_type: e.target.value, charges_pct: '', cust_name: form.cust_name, cust_pan: form.cust_pan, cust_aadhar: form.cust_aadhar, cust_mobile: form.cust_mobile, customer_id: form.customer_id })}>
                        <option value="">Select service</option>
                        {master?.service_types?.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── Bill Pay + Withdrawal ── */}
                {isBillWd && (
                  <div className="dash-card" style={{ marginBottom: 16 }}>
                    <div className="dash-card-header"><h2>📄 Card Withdrawal & Bill Payment</h2></div>
                    <div className="dash-card-body">
                      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>Please fill all information below</p>
                      <div className="dash-form-grid">
                        {fg('Bill Payment Platform', sel('bill_platform', platforms))}
                        {fg('Bill Paid Amount (₹)', inp('bill_amount', '₹', 'number'))}
                        {fg('Withdrawal Platform', sel('platform', platforms))}
                        {fg('Card Type', sel('card', cards))}
                        {fg('Withdrawal Amount (₹)', <input required type="number" placeholder="₹" value={form.amount} onChange={e => set('amount', e.target.value)} />)}
                        {fg('Card Bank', sel('card_bank', banks))}
                        {fg('Card Last 4 Digits', <input placeholder="Card Last 4 Digits" maxLength={4} value={form.card_last4} onChange={e => set('card_last4', e.target.value.replace(/\D/g,'').slice(0,4))} />)}
                        {fg('Charges %', roInp('charges_pct'))}
                        {fg('Charges Amount (₹)', roInp('charges_amount', '#555'))}
                        {fg('Bill Payment Remaining Balance (₹)', roInp('bill_remaining', '#555'))}
                        {fg('Total Amount Collected (₹)', roInp('total_collected', '#059669'))}
                        {fg('Receive Mode', sel('received_mode', receiveModes))}
                        {fg('Remarks', inp('note', 'Remarks'), true)}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Card Withdrawal ── */}
                {isCardWd && (
                  <div className="dash-card" style={{ marginBottom: 16 }}>
                    <div className="dash-card-header"><h2>💳 Card Withdrawal</h2></div>
                    <div className="dash-card-body">
                      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>Please fill all information below</p>
                      <div className="dash-form-grid">
                        {fg('Platform', sel('platform', platforms))}
                        {fg('Card Type', sel('card', cards))}
                        {fg('Card Bank', sel('card_bank', banks))}
                        {fg('Card Last 4 Digits', <input placeholder="Card Last 4 Digits" maxLength={4} value={form.card_last4} onChange={e => set('card_last4', e.target.value.replace(/\D/g,'').slice(0,4))} />)}
                        {fg('Payment Mode', sel('payment_mode', paymentModes))}
                        {fg('Total Amount (₹) *', <input required type="number" placeholder="₹" value={form.amount} onChange={e => set('amount', e.target.value)} />)}
                        {fg('Remarks', inp('note', 'Remarks'), true)}
                        {fg('Charges %', roInp('charges_pct'))}
                        {fg('Charges Amount (₹)', roInp('charges_amount', '#555'))}
                        {fg('Settled Amount (₹)', roInp('settled_amount', '#059669'))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Money Transfer (DMT) / Only Bill Payment ── */}
                {(isDMT || isOnlyBill) && (
                  <div className="dash-card" style={{ marginBottom: 16 }}>
                    <div className="dash-card-header"><h2>💸 {svcType}</h2></div>
                    <div className="dash-card-body">
                      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>Please fill all information below</p>
                      <div className="dash-form-grid">
                        {fg('Platform', sel('platform', platforms))}
                        {fg('Bank', sel('bank', banks))}
                        {fg('Account No.', inp('acc_no', 'Account No.'))}
                        {fg('Payment Mode', sel('payment_mode', paymentModes))}
                        {fg('Total Amount (₹) *', <input required type="number" placeholder="₹" value={form.amount} onChange={e => set('amount', e.target.value)} />)}
                        {fg('Remarks', inp('note', 'Remarks'), true)}
                        {fg('Charges %', roInp('charges_pct'))}
                        {fg('Charges Amount (₹)', roInp('charges_amount', '#555'))}
                        {fg('Settled Amount (₹)', roInp('settled_amount', '#059669'))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── AEPS ── */}
                {isAEPS && (
                  <div className="dash-card" style={{ marginBottom: 16 }}>
                    <div className="dash-card-header"><h2>🏧 AEPS</h2></div>
                    <div className="dash-card-body">
                      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>Please fill all information below</p>
                      <div className="dash-form-grid">
                        {fg('Platform', sel('platform', platforms))}
                        {fg('Bank', sel('bank', banks))}
                        {fg('Aadhar No.', <input placeholder="Aadhar No." maxLength={12} value={form.cust_aadhar} onChange={e => set('cust_aadhar', e.target.value.replace(/\D/g,'').slice(0,12))} />)}
                        {fg('Payment Mode', sel('payment_mode', paymentModes))}
                        {fg('Total Amount (₹) *', <input required type="number" placeholder="₹" value={form.amount} onChange={e => set('amount', e.target.value)} />)}
                        {fg('Remarks', inp('note', 'Remarks'), true)}
                        {fg('Charges %', roInp('charges_pct'))}
                        {fg('Charges Amount (₹)', roInp('charges_amount', '#555'))}
                        {fg('Settled Amount (₹)', roInp('settled_amount', '#059669'))}
                      </div>
                    </div>
                  </div>
                )}

                {svcType && (
                  <button type="submit" className="dash-btn dash-btn-primary"
                    disabled={saving || !form.cust_name || !form.cust_pan}>
                    {saving ? 'Submitting...' : '✅ Submit Transaction'}
                  </button>
                )}
              </>
            )}
          </form>

          {/* ── Sidebar ── */}
          <div style={{ position: 'sticky', top: 80 }}>
            {form.cust_name && (
              <div className="dash-card" style={{ marginBottom: 16 }}>
                <div className="dash-card-header"><h2>👤 Customer</h2></div>
                <div className="dash-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  <div style={{ fontWeight: 800, color: '#402070', fontSize: 15 }}>{form.cust_name}</div>
                  <div style={{ color: '#6b7280' }}>PAN: <strong>{form.cust_pan || '—'}</strong></div>
                  <div style={{ color: '#6b7280' }}>Mobile: <strong>{form.cust_mobile || '—'}</strong></div>
                </div>
              </div>
            )}

            {(form.amount || form.total_collected) && svcType && form.cust_name && (
              <div className="dash-card" style={{ marginBottom: 16 }}>
                <div className="dash-card-header"><h2>💰 Summary</h2></div>
                <div className="dash-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                  {isBillWd && <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Bill Amount</span><strong>₹{fmt(form.bill_amount || 0)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Withdrawal</span><strong>₹{fmt(form.amount || 0)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Charges</span><strong style={{ color: '#dc2626' }}>₹{fmt(form.charges_amount || 0)}</strong></div>
                    <div style={{ borderTop: '2px solid #f0f2f8', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}><strong>Total Collected</strong><strong style={{ color: '#059669', fontSize: 18 }}>₹{fmt(form.total_collected || 0)}</strong></div>
                  </>}
                  {(isCardWd || isDMT || isAEPS || isOnlyBill) && <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Amount</span><strong>₹{fmt(form.amount || 0)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Charges ({form.charges_pct || 0}%)</span><strong style={{ color: '#dc2626' }}>₹{fmt(form.charges_amount || 0)}</strong></div>
                    <div style={{ borderTop: '2px solid #f0f2f8', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}><strong>Settled</strong><strong style={{ color: '#059669', fontSize: 18 }}>₹{fmt(form.settled_amount || 0)}</strong></div>
                  </>}
                </div>
              </div>
            )}

            {!form.cust_name && (
              <div className="dash-card">
                <div className="dash-card-header"><h2>🚀 Getting Started</h2></div>
                <div className="dash-card-body" style={{ textAlign: 'center', padding: 24 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#402070', marginBottom: 8 }}>Select a Customer</div>
                  <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>Search for an existing customer or add a new one to start.</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Transactions — always visible ── */}
        {history.length > 0 && (
          <div className="dash-card" style={{ marginTop: 24 }}>
            <div className="dash-card-header">
              <h2>📋 Recent Transactions</h2>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>{history.length} records · click ⋯ for actions</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Customer</th>
                    <th>PAN</th>
                    <th>Mobile</th>
                    <th>Service</th>
                    <th>Platform</th>
                    <th>Bank</th>
                    <th>Card</th>
                    <th>Amount</th>
                    <th>Charges %</th>
                    <th>Charges ₹</th>
                    <th>Settled</th>
                    <th>Mode</th>
                    <th>Note</th>
                    <th style={{ width: 60 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                        <div>{new Date(t.created_at).toLocaleDateString('en-IN')}</div>
                        <div style={{ color: '#9ca3af' }}>{new Date(t.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td><strong>{t.cust_name || '—'}</strong></td>
                      <td style={{ fontSize: 11, color: '#64748b' }}>{t.cust_pan || '—'}</td>
                      <td style={{ fontSize: 11 }}>{t.cust_mobile || '—'}</td>
                      <td style={{ fontSize: 12 }}><strong>{t.service_type}</strong></td>
                      <td style={{ fontSize: 12 }}>{t.platform || t.bill_platform || '—'}</td>
                      <td style={{ fontSize: 12 }}>{t.bank || '—'}</td>
                      <td style={{ fontSize: 11 }}>{t.card ? `${t.card}${t.card_last4 ? ` ****${t.card_last4}` : ''}` : '—'}</td>
                      <td style={{ fontWeight: 700, color: '#059669', whiteSpace: 'nowrap' }}>₹{fmt(t.amount)}</td>
                      <td style={{ color: '#d97706', fontSize: 12 }}>{t.charges_pct || 0}%</td>
                      <td style={{ color: '#dc2626', fontSize: 12 }}>₹{fmt(t.charges_amount || 0)}</td>
                      <td style={{ color: '#059669', fontWeight: 800, whiteSpace: 'nowrap' }}>₹{fmt(t.settled_amount || t.profit || 0)}</td>
                      <td style={{ fontSize: 11 }}>{t.payment_mode || t.received_mode || '—'}</td>
                      <td style={{ fontSize: 11, color: '#9ca3af', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.note || '—'}</td>
                      <td className="txn-action-cell">
                        <button className="txn-menu-btn" onClick={e => {
                          e.stopPropagation()
                          if (menuTxnId === t.id) { setMenuTxnId(null); return }
                          const rect = e.currentTarget.getBoundingClientRect()
                          setMenuPos({ top: rect.bottom + 6, left: rect.right - 180 })
                          setMenuTxnId(t.id)
                        }}>⋯</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── View Modal ── */}
        {viewTxn && (
          <div onClick={() => setViewTxn(null)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:520, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.2)' }}>
              <div style={{ background:'linear-gradient(135deg,#1a0a2e,#402070,#c02040)', padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>Transaction Details</div>
                  <div style={{ color:'#fff', fontWeight:900, fontSize:18, marginTop:2 }}>#{viewTxn.id} · {viewTxn.service_type}</div>
                </div>
                <button onClick={() => setViewTxn(null)} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', width:32, height:32, borderRadius:'50%', cursor:'pointer', fontSize:16 }}>✕</button>
              </div>
              <div style={{ overflowY:'auto', padding:24 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {[
                    { label:'Transaction ID', value: `#${viewTxn.id}` },
                    { label:'Date & Time',    value: new Date(viewTxn.created_at).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' }) },
                    { label:'Customer',       value: viewTxn.cust_name || '—' },
                    { label:'PAN',            value: viewTxn.cust_pan  || '—' },
                    { label:'Mobile',         value: viewTxn.cust_mobile || '—' },
                    { label:'Aadhar',         value: viewTxn.cust_aadhar || '—' },
                    { label:'Service',        value: viewTxn.service_type || '—' },
                    { label:'Platform',       value: viewTxn.platform || viewTxn.bill_platform || '—' },
                    { label:'Bank',           value: viewTxn.bank || '—' },
                    { label:'Card',           value: viewTxn.card ? `${viewTxn.card}${viewTxn.card_last4 ? ` ****${viewTxn.card_last4}` : ''}` : '—' },
                    { label:'Card Bank',      value: viewTxn.card_bank || '—' },
                    { label:'Account No.',    value: viewTxn.acc_no || '—' },
                    { label:'Amount',         value: `₹${fmt(viewTxn.amount)}`,              color:'#059669' },
                    { label:'Charges %',      value: `${viewTxn.charges_pct || 0}%`,           color:'#d97706' },
                    { label:'Charges ₹',      value: `₹${fmt(viewTxn.charges_amount || 0)}`,  color:'#d97706' },
                    { label:'Settled Amount', value: `₹${fmt(viewTxn.settled_amount || 0)}`,  color:'#402070' },
                    ...(viewTxn.service_type === BILL_WITHDRAWAL ? [
                      { label:'Bill Platform',  value: viewTxn.bill_platform || '—' },
                      { label:'Bill Amount',    value: `₹${fmt(viewTxn.bill_amount || 0)}` },
                      { label:'Bill Remaining', value: `₹${fmt(viewTxn.bill_remaining || 0)}` },
                      { label:'Total Collected',value: `₹${fmt(viewTxn.total_collected || 0)}`, color:'#059669' },
                      { label:'Receive Mode',   value: viewTxn.received_mode || '—' },
                    ] : []),
                    { label:'Payment Mode',   value: viewTxn.payment_mode  || '—' },
                    { label:'Note',           value: viewTxn.note || '—', full: true },
                  ].map(f => (
                    <div key={f.label} style={{ background:'#f8fafc', borderRadius:10, padding:'10px 14px', ...(f.full ? { gridColumn:'1/-1' } : {}) }}>
                      <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>{f.label}</div>
                      <div style={{ fontSize:14, fontWeight:700, color: f.color || '#1a0a2e', wordBreak:'break-all' }}>{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding:'14px 24px', borderTop:'1px solid #f1f5f9', display:'flex', gap:10, justifyContent:'flex-end' }}>
                <a href={`https://wa.me/${viewTxn.cust_mobile?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${viewTxn.cust_name}, your ${viewTxn.service_type} of ₹${fmt(viewTxn.amount)} processed. Settled: ₹${fmt(viewTxn.settled_amount || 0)}. - MoneySpot`)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ padding:'10px 20px', borderRadius:10, background:'#25D366', color:'#fff', fontWeight:700, fontSize:13, textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>
                  💬 WhatsApp
                </a>
                <button onClick={() => setViewTxn(null)} style={{ padding:'10px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#402070,#c02040)', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14 }}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Edit Modal ── */}
        {editTxn && (() => {
          const isBW = editTxn.service_type === BILL_WITHDRAWAL
          const isCW = editTxn.service_type === CARD_WITHDRAWAL
          const isDM = editTxn.service_type === DMT
          const isAE = editTxn.service_type === AEPS
          const isOB = editTxn.service_type === ONLY_BILL
          const [ef, setEf] = [editTxn, (patch) => setEditTxn(t => ({ ...t, ...patch }))]
          const eInp = (k, label, type = 'text') => (
            <div className="dash-form-group">
              <label>{label}</label>
              <input type={type} value={ef[k] || ''} onChange={e => setEf({ [k]: e.target.value })} />
            </div>
          )
          const eSel = (k, label, opts) => (
            <div className="dash-form-group">
              <label>{label}</label>
              <select value={ef[k] || ''} onChange={e => setEf({ [k]: e.target.value })}>
                <option value="">Select</option>
                {opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )
          return (
            <div onClick={() => setEditTxn(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
              <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:600, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.2)' }}>
                <div style={{ background:'linear-gradient(135deg,#1a0a2e,#402070)', padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
                  <div>
                    <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>Edit Transaction</div>
                    <div style={{ color:'#fff', fontWeight:900, fontSize:16 }}>#{editTxn.id} · {editTxn.service_type}</div>
                  </div>
                  <button onClick={() => setEditTxn(null)} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', width:32, height:32, borderRadius:'50%', cursor:'pointer', fontSize:16 }}>✕</button>
                </div>
                <div style={{ overflowY:'auto', padding:24 }}>
                  <div style={{ background:'#fef3c7', border:'1px solid #fcd34d', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13, color:'#92400e', fontWeight:600 }}>
                    ⚠️ Editing transaction form data only. Customer identity (Name, PAN, Aadhar) cannot be changed.
                  </div>
                  <div className="dash-form-grid">
                    {eSel('platform', 'Platform', platforms)}
                    {(isCW || isBW) && eSel('card', 'Card Type', cards)}
                    {(isCW || isBW) && eSel('card_bank', 'Card Bank', banks)}
                    {(isCW || isBW) && (
                      <div className="dash-form-group">
                        <label>Card Last 4</label>
                        <input maxLength={4} value={ef.card_last4 || ''} onChange={e => setEf({ card_last4: e.target.value.replace(/\D/g,'').slice(0,4) })} />
                      </div>
                    )}
                    {(isDM || isAE || isOB) && eSel('bank', 'Bank', banks)}
                    {(isDM || isOB) && eInp('acc_no', 'Account No.')}
                    {isBW && eSel('bill_platform', 'Bill Platform', platforms)}
                    {isBW && eInp('bill_amount', 'Bill Amount (₹)', 'number')}
                    {eSel('payment_mode', 'Payment Mode', paymentModes)}
                    {isBW && eSel('received_mode', 'Receive Mode', receiveModes)}
                    {eInp('amount', 'Amount (₹) *', 'number')}
                    {eInp('charges_pct', 'Charges %', 'number')}
                    {eInp('charges_amount', 'Charges Amount (₹)', 'number')}
                    {eInp('settled_amount', 'Settled Amount (₹)', 'number')}
                    {isBW && eInp('bill_remaining', 'Bill Remaining (₹)', 'number')}
                    {isBW && eInp('total_collected', 'Total Collected (₹)', 'number')}
                    <div className="dash-form-group" style={{ gridColumn:'1/-1' }}>
                      <label>Note / Remarks</label>
                      <textarea rows={2} value={ef.note || ''} onChange={e => setEf({ note: e.target.value })} style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:'1.5px solid rgba(64,32,112,0.2)', fontSize:14, fontFamily:'inherit', resize:'vertical', boxSizing:'border-box' }} />
                    </div>
                  </div>
                </div>
                <div style={{ padding:'14px 24px', borderTop:'1px solid #f1f5f9', display:'flex', gap:10, justifyContent:'flex-end', flexShrink:0 }}>
                  <button onClick={() => setEditTxn(null)} style={{ padding:'10px 20px', borderRadius:10, border:'1.5px solid #e2e8f0', background:'#f8fafc', color:'#64748b', fontWeight:600, cursor:'pointer', fontSize:13 }}>Cancel</button>
                  <button onClick={async () => {
                    try {
                      const payload = {
                        note:           editTxn.note,
                        platform:       editTxn.platform,
                        bank:           editTxn.bank,
                        card:           editTxn.card,
                        card_bank:      editTxn.card_bank,
                        card_last4:     editTxn.card_last4,
                        payment_mode:   editTxn.payment_mode,
                        received_mode:  editTxn.received_mode,
                        amount:         editTxn.amount,
                        charges_pct:    editTxn.charges_pct,
                        charges_amount: editTxn.charges_amount,
                        settled_amount: editTxn.settled_amount,
                        bill_platform:  editTxn.bill_platform,
                        bill_amount:    editTxn.bill_amount,
                        bill_remaining: editTxn.bill_remaining,
                        total_collected:editTxn.total_collected,
                        acc_no:         editTxn.acc_no,
                      }
                      const updated = await api(`/master/transactions/${editTxn.id}`, { method:'PATCH', headers: auth(), body: JSON.stringify(payload) })
                      setHistory(h => h.map(t => t.id === editTxn.id ? { ...t, ...updated } : t))
                      setEditTxn(null)
                    } catch (err) { alert(err.message) }
                  }} style={{ padding:'10px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#402070,#c02040)', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14 }}>💾 Save Changes</button>
                </div>
              </div>
            </div>
          )
        })()}

        {/* close menu on outside click */}
        {menuTxnId && (
          <>
            <div onClick={() => setMenuTxnId(null)} style={{ position:'fixed', inset:0, zIndex:998 }} />
            <div className="txn-menu-dropdown" style={{ top: menuPos.top, left: menuPos.left }}>
              {(() => { const t = history.find(x => x.id === menuTxnId); if (!t) return null; return (
                <>
                  <button className="txn-menu-item" onClick={() => { setViewTxn(t); setMenuTxnId(null) }}>👁️ View Details</button>
                  <button className="txn-menu-item" onClick={() => { setEditTxn(t); setMenuTxnId(null) }}>✏️ Edit</button>
                  <a className="txn-menu-item txn-menu-wa"
                    href={`https://wa.me/${t.cust_mobile?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${t.cust_name}, your ${t.service_type} transaction of ₹${fmt(t.amount)} on ${new Date(t.created_at).toLocaleDateString('en-IN')} has been processed. Settled: ₹${fmt(t.settled_amount || 0)}. - MoneySpot`)}`}
                    target="_blank" rel="noopener noreferrer"
                    onClick={() => setMenuTxnId(null)}>💬 Send WhatsApp</a>
                </>
              )})()} 
            </div>
          </>
        )}
      </div>
    </div>
  )
}
