import React, { useState, useEffect } from 'react'
import EmployeeNavbar from '../../components/employee/EmployeeNavbar'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import '../../pages/dashboard.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('employee') || getTokenByRole('admin')}` })
const fmt = n => Number(n).toLocaleString('en-IN')

const emptyForm = {
  service_type: '', platform: '', bank: '', card: '', category: '',
  amount: '', note: '',
  customer_id: '', cust_name: '', cust_pan: '', cust_aadhar: '', cust_mobile: ''
}

export default function Services() {
  const [master, setMaster]       = useState(null)
  const [customers, setCustomers] = useState([])
  const [form, setForm]           = useState(emptyForm)
  const [preview, setPreview]     = useState(null)
  const [saving, setSaving]       = useState(false)
  const [msg, setMsg]             = useState('')
  const [error, setError]         = useState('')
  const [history, setHistory]     = useState([])
  const [custMode, setCustMode]   = useState('search') // 'search' | 'manual'
  const [search, setSearch]       = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    // Always fetch fresh — superadmin may have blocked services
    api('/master/all', { headers: auth() }).then(d => setMaster(d)).catch(() => {})
    api('/master/transactions/mine', { headers: auth() }).then(d => setHistory(d)).catch(() => {})
    api('/customers/my', { headers: auth() }).then(d => setCustomers(d)).catch(() => {})
  }, [])

  // profit preview
  useEffect(() => {
    if (!master || !form.service_type || !form.amount || isNaN(form.amount)) { setPreview(null); return }
    const svc = master.service_types.find(s => s.name === form.service_type)
    const crd = form.card ? master.cards.find(c => c.name === form.card) : null
    const commission_pct = parseFloat(svc?.commission ?? 0)
    const charge_pct     = parseFloat(crd?.charge ?? 0)
    const amt            = parseFloat(form.amount)
    setPreview({ commission_pct, charge_pct, profit: ((commission_pct + charge_pct) / 100 * amt).toFixed(2), amt })
  }, [form.service_type, form.card, form.amount, master])

  const selectCustomer = c => {
    setForm(f => ({ ...f, customer_id: c.id, cust_name: c.name, cust_pan: c.pan || '', cust_aadhar: c.aadhar || '', cust_mobile: c.phone || '' }))
    setSearch(c.name)
    setCustMode('search')
  }

  const clearCustomer = () => {
    setForm(f => ({ ...f, customer_id: '', cust_name: '', cust_pan: '', cust_aadhar: '', cust_mobile: '' }))
    setSearch('')
  }

  const filteredCusts = search.length >= 2
    ? customers.filter(c =>
        c.status === 'approved' &&
        (c.name?.toLowerCase().includes(search.toLowerCase()) ||
         c.phone?.includes(search) ||
         c.pan?.toLowerCase().includes(search.toLowerCase()))
      )
    : []

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.cust_name.trim()) { setError('Customer name is required'); return }
    if (!form.cust_pan.trim())  { setError('Customer PAN is required'); return }
    setSaving(true); setMsg(''); setError('')
    try {
      const r = await api('/master/transactions', {
        method: 'POST', headers: auth(),
        body: JSON.stringify({
          customer_id:   form.customer_id || null,
          service_type:  form.service_type,
          platform:      form.platform,
          bank:          form.bank,
          card:          form.card,
          category:      form.category,
          amount:        form.amount,
          note:          form.note,
          cust_name:     form.cust_name,
          cust_pan:      form.cust_pan,
          cust_aadhar:   form.cust_aadhar,
          cust_mobile:   form.cust_mobile,
        })
      })
      setMsg(`✅ Transaction recorded! Profit: ₹${r.transaction.profit}`)
      setForm(emptyForm); setPreview(null); setSearch('')
      api('/master/transactions/mine', { headers: auth() }).then(d => setHistory(d)).catch(() => {})
    } catch (err) { setError(err.message) }
    setSaving(false)
  }

  if (!master) return (
    <div className="emp-page"><EmployeeNavbar />
      <div className="emp-page-content"><div className="dash-loading">Loading...</div></div>
    </div>
  )

  const approvedCusts = customers.filter(c => c.status === 'approved')

  return (
    <div className="emp-page">
      <EmployeeNavbar />
      <div className="emp-page-content">
        <div className="emp-page-header"><h1>New Transaction</h1></div>

        {msg   && <div className="dash-alert dash-alert-success" style={{ marginBottom: 16 }}>{msg}</div>}
        {error && <div className="dash-alert dash-alert-error"   style={{ marginBottom: 16 }}>❌ {error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

          <form onSubmit={handleSubmit}>

            {/* ── Customer Section ── */}
            <div className="dash-card" style={{ marginBottom: 16 }}>
              <div className="dash-card-header">
                <h2>👤 Customer Details</h2>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="dash-btn dash-btn-sm"
                    style={{ background: custMode === 'search' ? 'linear-gradient(135deg,#402070,#c02040)' : '#f0f2f8', color: custMode === 'search' ? '#fff' : '#666', border: 'none' }}
                    onClick={() => { setCustMode('search'); clearCustomer() }}>
                    🔍 From Profile
                  </button>
                  <button type="button" className="dash-btn dash-btn-sm"
                    style={{ background: custMode === 'manual' ? 'linear-gradient(135deg,#402070,#c02040)' : '#f0f2f8', color: custMode === 'manual' ? '#fff' : '#666', border: 'none' }}
                    onClick={() => { setCustMode('manual'); clearCustomer() }}>
                    ✏️ Manual Entry
                  </button>
                </div>
              </div>
              <div className="dash-card-body">

                {custMode === 'search' ? (
                  <>
                    {/* Search from approved customers */}
                    <div style={{ position: 'relative', marginBottom: 12 }}>
                      <input
                        placeholder="Search customer by name, phone or PAN..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); if (form.customer_id) clearCustomer() }}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(64,32,112,0.2)', fontFamily: 'inherit', fontSize: 14, boxSizing: 'border-box' }}
                      />
                      {filteredCusts.length > 0 && !form.customer_id && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1.5px solid rgba(64,32,112,0.15)', borderRadius: 8, boxShadow: '0 8px 24px rgba(64,32,112,0.12)', zIndex: 100, maxHeight: 220, overflowY: 'auto' }}>
                          {filteredCusts.map(c => (
                            <div key={c.id} onClick={() => selectCustomer(c)}
                              style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f0f2f8', transition: 'background 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#faf5ff'}
                              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                              <div style={{ fontWeight: 700, color: '#402070', fontSize: 14 }}>{c.name}</div>
                              <div style={{ fontSize: 12, color: '#9ca3af' }}>{c.phone} · PAN: {c.pan}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selected customer card */}
                    {form.customer_id ? (
                      <div style={{ background: '#f0fdf4', border: '1.5px solid #a7f3d0', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 800, color: '#059669', fontSize: 15 }}>✅ {form.cust_name}</div>
                          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                            PAN: {form.cust_pan} &nbsp;·&nbsp; Aadhar: {form.cust_aadhar || '—'} &nbsp;·&nbsp; Mobile: {form.cust_mobile || '—'}
                          </div>
                        </div>
                        <button type="button" onClick={clearCustomer}
                          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                          ✕ Clear
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: '#9ca3af' }}>
                        {approvedCusts.length === 0
                          ? 'No approved customers yet. Use Manual Entry or add a customer first.'
                          : 'Type at least 2 characters to search from your approved customers'}
                      </div>
                    )}
                  </>
                ) : (
                  /* Manual entry */
                  <div className="dash-form-grid">
                    <div className="dash-form-group">
                      <label>Customer Name *</label>
                      <input required placeholder="Full name" value={form.cust_name} onChange={e => set('cust_name', e.target.value)} />
                    </div>
                    <div className="dash-form-group">
                      <label>PAN Number *</label>
                      <input required placeholder="ABCDE1234F" maxLength={10} value={form.cust_pan}
                        onChange={e => set('cust_pan', e.target.value.toUpperCase())} />
                      {form.cust_pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.cust_pan) && (
                        <span style={{ fontSize: 11, color: '#dc2626' }}>Format: ABCDE1234F</span>
                      )}
                    </div>
                    <div className="dash-form-group">
                      <label>Aadhar Number</label>
                      <input placeholder="12-digit Aadhar" maxLength={12} value={form.cust_aadhar}
                        onChange={e => set('cust_aadhar', e.target.value.replace(/\D/g, '').slice(0, 12))} />
                    </div>
                    <div className="dash-form-group">
                      <label>Mobile Number</label>
                      <input placeholder="10-digit mobile" maxLength={10} value={form.cust_mobile}
                        onChange={e => set('cust_mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Transaction Section ── */}
            <div className="dash-card">
              <div className="dash-card-header"><h2>💳 Transaction Details</h2></div>
              <div className="dash-card-body">
                <div className="dash-form-grid">
                  <div className="dash-form-group">
                    <label>Service Type *</label>
                    <select required value={form.service_type} onChange={e => set('service_type', e.target.value)}>
                      <option value="">Select service</option>
                      {master.service_types.map(s => <option key={s.id} value={s.name}>{s.name} ({s.commission}%)</option>)}
                    </select>
                  </div>
                  <div className="dash-form-group">
                    <label>Amount (₹) *</label>
                    <input required type="number" min="1" step="0.01" placeholder="Enter amount"
                      value={form.amount} onChange={e => set('amount', e.target.value)} />
                  </div>
                  <div className="dash-form-group">
                    <label>Platform</label>
                    <select value={form.platform} onChange={e => set('platform', e.target.value)}>
                      <option value="">Select platform</option>
                      {master.platforms.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="dash-form-group">
                    <label>Bank</label>
                    <select value={form.bank} onChange={e => set('bank', e.target.value)}>
                      <option value="">Select bank</option>
                      {master.banks.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="dash-form-group">
                    <label>Card Type</label>
                    <select value={form.card} onChange={e => set('card', e.target.value)}>
                      <option value="">Select card</option>
                      {master.cards.map(c => <option key={c.id} value={c.name}>{c.name} ({c.charge}%)</option>)}
                    </select>
                  </div>
                  <div className="dash-form-group">
                    <label>Category</label>
                    <select value={form.category} onChange={e => set('category', e.target.value)}>
                      <option value="">Select category</option>
                      {master.categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="dash-form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Note</label>
                    <input placeholder="Optional note" value={form.note} onChange={e => set('note', e.target.value)} />
                  </div>
                </div>
                <button type="submit" className="dash-btn dash-btn-primary"
                  disabled={saving || !form.service_type || !form.amount || (!form.cust_name && custMode === 'manual') || (custMode === 'search' && !form.customer_id && !form.cust_name)}>
                  {saving ? 'Submitting...' : '✅ Submit Transaction'}
                </button>
              </div>
            </div>

          </form>

          {/* Profit Preview */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div className="dash-card">
              <div className="dash-card-header"><h2>💰 Profit Preview</h2></div>
              <div className="dash-card-body">
                {preview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>Amount</span><strong>₹{preview.amt.toLocaleString('en-IN')}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>Service Commission</span><strong style={{ color: '#402070' }}>{preview.commission_pct}%</strong></div>
                    {preview.charge_pct > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>Card Charge</span><strong style={{ color: '#c02040' }}>{preview.charge_pct}%</strong></div>}
                    <div style={{ borderTop: '2px solid #f0f2f8', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                      <strong>Total Profit</strong>
                      <strong style={{ color: '#059669', fontSize: 20 }}>₹{parseFloat(preview.profit).toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                ) : <p style={{ color: '#9ca3af', fontSize: 13 }}>Select service & enter amount to preview profit</p>}
              </div>
            </div>

            {/* Selected customer summary in sidebar */}
            {form.cust_name && (
              <div className="dash-card" style={{ marginTop: 16 }}>
                <div className="dash-card-header"><h2>👤 Customer</h2></div>
                <div className="dash-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  <div style={{ fontWeight: 800, color: '#402070', fontSize: 15 }}>{form.cust_name}</div>
                  <div style={{ color: '#6b7280' }}>PAN: <strong>{form.cust_pan || '—'}</strong></div>
                  <div style={{ color: '#6b7280' }}>Aadhar: <strong>{form.cust_aadhar || '—'}</strong></div>
                  <div style={{ color: '#6b7280' }}>Mobile: <strong>{form.cust_mobile || '—'}</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transaction History */}
        {history.length > 0 && (
          <div className="dash-card" style={{ marginTop: 24 }}>
            <div className="dash-card-header"><h2>My Recent Transactions</h2></div>
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr><th>Date</th><th>Customer</th><th>Service</th><th>Platform</th><th>Amount</th><th>Profit</th></tr>
                </thead>
                <tbody>
                  {history.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontSize: 12 }}>{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                      <td>{t.cust_name || '—'}</td>
                      <td><strong>{t.service_type}</strong></td>
                      <td>{t.platform || '—'}</td>
                      <td style={{ fontWeight: 700 }}>₹{fmt(t.amount)}</td>
                      <td style={{ color: '#059669', fontWeight: 800 }}>₹{fmt(t.profit)}</td>
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
