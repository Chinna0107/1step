import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import EmployeeNavbar from '../../components/employee/EmployeeNavbar'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import { useCharges } from '../../hooks/useCharges'
import '../../pages/dashboard.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('employee') || getTokenByRole('admin')}` })
const fmt = n => { const num = parseFloat(n); return isNaN(num) ? '0' : num.toLocaleString('en-IN') }

const PAYMENT_MODES = ['Cash', 'UPI', 'NEFT', 'IMPS', 'RTGS', 'Cheque']

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

  const { lookup } = useCharges()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    api('/master/all', { headers: auth() }).then(d => setMaster(d)).catch(() => {})
    api('/customers/approved', { headers: auth() }).then(d => setCustomers(d)).catch(() => {})
  }, [])

  useEffect(() => {
    if (form.customer_id || form.cust_name)
      api('/master/transactions/mine', { headers: auth() }).then(d => setHistory(d)).catch(() => {})
  }, [form.customer_id, form.cust_name])

  // Instant charge lookup from pre-fetched map
  useEffect(() => {
    if (!form.service_type) return
    if (!form.platform) { setForm(f => ({ ...f, charges_pct: '' })); return }
    const { customer_rate } = lookup(form.service_type, form.platform, form.card)
    setForm(f => ({ ...f, charges_pct: customer_rate || '' }))
  }, [form.service_type, form.platform, form.card, lookup])

  // Auto-calc derived fields
  useEffect(() => {
    const amt     = parseFloat(form.amount)     || 0
    const billAmt = parseFloat(form.bill_amount) || 0
    const pct     = parseFloat(form.charges_pct) || 0
    if (!amt && !billAmt) return
    const chargesAmt = parseFloat((amt * pct / 100).toFixed(2))
    const settledAmt = parseFloat((amt - chargesAmt).toFixed(2))
    const billRemain = parseFloat((billAmt - amt).toFixed(2))
    const totalColl  = parseFloat((billAmt + amt + chargesAmt).toFixed(2))
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
      setMsg(`✅ Transaction recorded! Profit: ₹${r.transaction.profit}`)
      setForm(emptyForm); setSearch('')
      api('/master/transactions/mine', { headers: auth() }).then(d => setHistory(d)).catch(() => {})
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
            <div className="dash-card" style={{ marginBottom: 16 }}>
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
              <div className="dash-card-body">
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
                        <div className="add-customer-dropdown" style={{ zIndex: 1000 }}>
                          <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                            <div style={{ fontSize: 14, color: '#374151', marginBottom: 12, fontWeight: 600 }}>
                              No customers found for "{search}"
                            </div>
                            <button type="button" onClick={() => { localStorage.setItem('pendingCustomerName', search); navigate('/employee/add-customer') }} className="add-customer-btn">
                              ➕ Add "{search}" as New Customer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {form.customer_id ? (
                      <>
                        <div style={{ background: '#f0fdf4', border: '1.5px solid #a7f3d0', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div>
                            <div style={{ fontWeight: 800, color: '#059669', fontSize: 15 }}>✅ {form.cust_name}</div>
                            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>PAN: {form.cust_pan} · Mobile: {form.cust_mobile || '—'}</div>
                          </div>
                          <button type="button" onClick={clearCustomer} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>✕ Clear</button>
                        </div>

                        {loadingProfile && <div style={{ textAlign: 'center', padding: 16, color: '#6b7280' }}>⏳ Loading profile...</div>}

                        {!loadingProfile && customerProfile && customerProfile.transactions?.length > 0 && (
                          <div style={{ background: '#f9fafb', borderRadius: 8, padding: 12, fontSize: 12 }}>
                            <div style={{ fontWeight: 600, color: '#374151', marginBottom: 8 }}>📊 Last {Math.min(customerProfile.transactions.length, 3)} transactions</div>
                            {customerProfile.transactions.slice(0, 3).map(t => (
                              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e5e7eb' }}>
                                <span>{t.service_type} · {t.platform || '—'}</span>
                                <strong style={{ color: '#059669' }}>₹{fmt(t.amount)}</strong>
                              </div>
                            ))}
                          </div>
                        )}
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
                        {fg('Receive Mode', sel('received_mode', PAYMENT_MODES))}
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
                        {fg('Payment Mode', sel('payment_mode', PAYMENT_MODES))}
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
                        {fg('Payment Mode', sel('payment_mode', PAYMENT_MODES))}
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
                        {fg('Payment Mode', sel('payment_mode', PAYMENT_MODES))}
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

        {/* ── Recent Transactions ── */}
        {form.cust_name && history.length > 0 && (
          <div className="dash-card" style={{ marginTop: 24 }}>
            <div className="dash-card-header"><h2>My Recent Transactions</h2></div>
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr><th>Date</th><th>Customer</th><th>Service</th><th>Platform</th><th>Amount</th><th>Charges</th><th>Settled</th></tr>
                </thead>
                <tbody>
                  {history.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontSize: 12 }}>{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                      <td>{t.cust_name || '—'}</td>
                      <td><strong>{t.service_type}</strong></td>
                      <td>{t.platform || t.bill_platform || '—'}</td>
                      <td style={{ fontWeight: 700 }}>₹{fmt(t.amount)}</td>
                      <td style={{ color: '#dc2626' }}>₹{fmt(t.charges_amount || 0)}</td>
                      <td style={{ color: '#059669', fontWeight: 800 }}>₹{fmt(t.settled_amount || t.profit || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
