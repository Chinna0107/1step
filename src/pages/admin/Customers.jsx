import React, { useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useCustomerRequests } from '../../hooks/useCustomers'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import '../../pages/dashboard.css'
import '../employee/CustomerInfo.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })
const fmt  = n => Number(parseFloat(n) || 0).toLocaleString('en-IN')

function CustomerDetailModal({ customer: c, onClose, onUpdate }) {
  const [txns, setTxns]         = useState(null)
  const [txnLoad, setTxnLoad]   = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const [tab, setTab]           = useState('details')
  const [editing, setEditing]   = useState(false)
  const [editingDetails, setEditingDetails] = useState(false)
  const [imgUrls, setImgUrls]   = useState({ aadhar_img_url: c.aadhar_img_url || '', pan_img_url: c.pan_img_url || '', card_front_img_url: c.card_front_img_url || '' })
  const [saving, setSaving]     = useState(false)
  const [saveMsg, setSaveMsg]   = useState('')
  const [customer, setCustomer] = useState(c)
  const [editForm, setEditForm] = useState({
    name: c.name || '',
    email: c.email || '',
    phone: c.phone || '',
    pan: c.pan || '',
    aadhar: c.aadhar || '',
    acc_number: c.acc_number || '',
    address: c.address || '',
    referral_name: c.referral_name || '',
    referral_phone: c.referral_phone || '',
    bank_name: c.bank_name || '',
    mpin: c.mpin || '',
    cards: Array.isArray(c.cards) ? c.cards : [],
  })
  const [editError, setEditError] = useState('')

  const handleCustomerUpdate = async () => {
    // Validation
    if (!editForm.name?.trim()) {
      setEditError('Name is required')
      return
    }
    if (!editForm.email?.trim()) {
      setEditError('Email is required')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())) {
      setEditError('Please enter a valid email address')
      return
    }
    if (!editForm.phone?.trim()) {
      setEditError('Phone is required')
      return
    }
    if (!/^\d{10}$/.test(editForm.phone.trim())) {
      setEditError('Phone must be exactly 10 digits')
      return
    }
    if (!editForm.pan?.trim()) {
      setEditError('PAN is required')
      return
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(editForm.pan.trim().toUpperCase())) {
      setEditError('PAN must be in format ABCDE1234F')
      return
    }
    if (editForm.aadhar?.trim() && !/^\d{12}$/.test(editForm.aadhar.trim())) {
      setEditError('Aadhar must be exactly 12 digits')
      return
    }
    if (editForm.referral_phone?.trim() && !/^\d{10}$/.test(editForm.referral_phone.trim())) {
      setEditError('Referral phone must be exactly 10 digits')
      return
    }

    setSaving(true)
    setEditError('')
    try {
      await onUpdate(customer.id, {
        ...editForm,
        pan: editForm.pan.trim().toUpperCase(),
        phone: editForm.phone.trim(),
        aadhar: editForm.aadhar?.trim() || null,
        address: editForm.address?.trim() || null,
        referral_phone: editForm.referral_phone?.trim() || null,
        bank_name: editForm.bank_name?.trim() || null,
        mpin: editForm.mpin?.trim() || null,
        cards: editForm.cards,
      })
      setCustomer(prev => ({ ...prev, ...editForm }))
      setEditingDetails(false)
      setSaveMsg('Customer details updated successfully!')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch (err) {
      setEditError(err.message || 'Failed to update customer')
    } finally {
      setSaving(false)
    }
  }

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
    if (editError) setEditError('')
  }

  const saveImages = async () => {
    setSaving(true); setSaveMsg('')
    try {
      const data = await api(`/customers/${customer.id}/images`, {
        method: 'PATCH', headers: { ...auth(), 'Content-Type': 'application/json' },
        body: JSON.stringify(imgUrls),
      })
      setCustomer(prev => ({ ...prev, ...data.customer }))
      setSaveMsg('Images updated successfully!')
      setEditing(false)
    } catch (e) { setSaveMsg('Error: ' + e.message) }
    setSaving(false)
  }

  const loadTxns = async () => {
    if (txns) return
    setTxnLoad(true)
    try {
      const data = await api(`/master/transactions?customer_id=${customer.id}`, { headers: auth() })
      setTxns(Array.isArray(data) ? data : [])
    } catch { setTxns([]) }
    setTxnLoad(false)
  }

  const handleTab = t => { setTab(t); if (t === 'transactions') loadTxns() }

  const statusColor = s => s === 'approved' ? '#059669' : s === 'rejected' ? '#dc2626' : '#d97706'
  const statusBg    = s => s === 'approved' ? '#d1fae5' : s === 'rejected' ? '#fee2e2' : '#fef3c7'

  const fields = [
    { label: 'Customer ID',   value: `#${customer.id}` },
    { label: 'Full Name',     value: customer.name || '—' },
    { label: 'Email',         value: customer.email || '—' },
    { label: 'Phone',         value: customer.phone || '—' },
    { label: 'Coins',         value: <><img src="/logo.png" style={{width:14,height:14,objectFit:'contain',verticalAlign:'middle',marginRight:4}} alt="coin"/> {customer.coins ?? 0}</>, color: '#d4af37' },
    { label: 'PAN Number',    value: customer.pan || '—',    mono: true },
    { label: 'Aadhar Number', value: customer.aadhar ? customer.aadhar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '—', mono: true },
    { label: 'Account No.',   value: customer.acc_number || '—', mono: true },
    { label: 'Branch',        value: customer.branch || '—' },
    ...(customer.address ? [{ label: 'Address', value: customer.address }] : []),
    { label: 'Category',       value: customer.customer_type === 'credit_repair' ? '🔧 CIBIL Repair' : '👤 General' },
    { label: 'Added By',      value: customer.added_by_name || '—' },
    { label: 'Reviewed By',   value: customer.reviewed_by_name || '—' },
    { label: 'Reviewed At',   value: customer.reviewed_at ? new Date(customer.reviewed_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—' },
    { label: 'Member Since',  value: new Date(customer.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) },
    ...(customer.bank_name ? [{ label: 'Bank Name', value: customer.bank_name }] : []),
    ...(customer.mpin ? [{ label: 'MPIN', value: customer.mpin, mono: true }] : []),
    ...(customer.referral_name || customer.referral_phone ? [
      { label: 'Referred By (Name)',   value: customer.referral_name  || '—' },
      { label: 'Referred By (Phone)',  value: customer.referral_phone || '—' },
    ] : []),
  ]

  const docs = [
    { key: 'aadhar_img_url',     label: '🪪 Aadhaar Card' },
    { key: 'pan_img_url',        label: '🆔 PAN Card' },
    { key: 'card_front_img_url', label: '🏧 Card Front' },
  ]

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#081427,#0d1f3d,#1a365d)', padding: '20px 24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#d4af37' }}>
                {customer.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>{customer.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 }}>{customer.email} · {customer.phone}</div>
                <span style={{ background: statusBg(customer.status), color: statusColor(customer.status), padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, marginTop: 6, display: 'inline-block' }}>
                  {customer.status === 'approved' ? '✅ Verified' : customer.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
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
                  color: tab === key ? '#0d1f3d' : 'rgba(255,255,255,0.8)' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 20 }}>

          {/* ── Details Tab ── */}
          {tab === 'details' && (
            <div>
              {/* Edit/Save Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0d1f3d' }}>
                  {editingDetails ? '✏️ Editing Customer Details' : '👤 Customer Information'}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {editingDetails ? (
                    <>
                      <button 
                        onClick={() => {
                          setEditingDetails(false)
                          setEditError('')
                          setEditForm({
                            name: customer.name || '',
                            email: customer.email || '',
                            phone: customer.phone || '',
                            pan: customer.pan || '',
                            aadhar: customer.aadhar || '',
                            acc_number: customer.acc_number || '',
                            address: customer.address || '',
                            referral_name: customer.referral_name || '',
                            referral_phone: customer.referral_phone || '',
                            bank_name: customer.bank_name || '',
                            mpin: customer.mpin || '',
                            cards: Array.isArray(customer.cards) ? customer.cards : [],
                          })
                        }}
                        style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', color: '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleCustomerUpdate}
                        disabled={saving}
                        style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: saving ? '#9ca3af' : 'linear-gradient(135deg,#0d1f3d,#1a365d)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        {saving ? 'Saving...' : '✓ Save Changes'}
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setEditingDetails(true)}
                      style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(13,31,61,0.3)', background: '#fff', color: '#0d1f3d', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      ✏️ Edit Details
                    </button>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {editError && (
                <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
                  {editError}
                </div>
              )}

              {/* Success Message */}
              {saveMsg && (
                <div style={{ background: '#d1fae5', color: '#059669', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
                  {saveMsg}
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {editingDetails ? (
                  // Edit Form
                  <>
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '2px solid rgba(13,31,61,0.1)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Full Name *</div>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={e => handleEditChange('name', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#081427', outline: 'none' }}
                      />
                    </div>
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '2px solid rgba(13,31,61,0.1)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Email *</div>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={e => handleEditChange('email', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#081427', outline: 'none' }}
                      />
                    </div>
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '2px solid rgba(13,31,61,0.1)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Phone *</div>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={e => {
                          const value = e.target.value.replace(/\D/g, '')
                          if (value.length <= 10) handleEditChange('phone', value)
                        }}
                        style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#081427', outline: 'none' }}
                        maxLength={10}
                      />
                    </div>
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '2px solid rgba(13,31,61,0.1)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>PAN *</div>
                      <input
                        type="text"
                        value={editForm.pan}
                        onChange={e => handleEditChange('pan', e.target.value.toUpperCase())}
                        style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#081427', outline: 'none', textTransform: 'uppercase', fontFamily: 'monospace' }}
                        maxLength={10}
                      />
                    </div>
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '2px solid rgba(13,31,61,0.1)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Aadhar</div>
                      <input
                        type="text"
                        value={editForm.aadhar}
                        onChange={e => {
                          const value = e.target.value.replace(/\D/g, '')
                          if (value.length <= 12) handleEditChange('aadhar', value)
                        }}
                        style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#081427', outline: 'none', fontFamily: 'monospace' }}
                        maxLength={12}
                      />
                    </div>
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '2px solid rgba(13,31,61,0.1)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Account Number</div>
                      <input
                        type="text"
                        value={editForm.acc_number}
                        onChange={e => handleEditChange('acc_number', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#081427', outline: 'none', fontFamily: 'monospace' }}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1', background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '2px solid rgba(13,31,61,0.1)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Address</div>
                      <textarea
                        value={editForm.address}
                        onChange={e => handleEditChange('address', e.target.value)}
                        placeholder="House/Flat No., Street, City, State, PIN code"
                        rows={2}
                        style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#081427', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                      />
                    </div>
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '2px solid rgba(13,31,61,0.1)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Referral Name</div>
                      <input
                        type="text"
                        value={editForm.referral_name}
                        onChange={e => handleEditChange('referral_name', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#081427', outline: 'none' }}
                      />
                    </div>
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '2px solid rgba(13,31,61,0.1)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Referral Phone</div>
                      <input
                        type="tel"
                        value={editForm.referral_phone}
                        onChange={e => {
                          const value = e.target.value.replace(/\D/g, '')
                          if (value.length <= 10) handleEditChange('referral_phone', value)
                        }}
                        style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#081427', outline: 'none' }}
                        maxLength={10}
                      />
                    </div>
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '2px solid rgba(13,31,61,0.1)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Bank Name</div>
                      <input
                        type="text"
                        value={editForm.bank_name}
                        onChange={e => handleEditChange('bank_name', e.target.value)}
                        placeholder="e.g. HDFC Bank"
                        style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#081427', outline: 'none' }}
                      />
                    </div>
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '2px solid rgba(13,31,61,0.1)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>MPIN</div>
                      <input
                        type="text"
                        value={editForm.mpin}
                        onChange={e => handleEditChange('mpin', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="4–6 digit MPIN"
                        maxLength={6}
                        style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#081427', outline: 'none', fontFamily: 'monospace' }}
                      />
                    </div>
                    {/* Cards — full width */}
                    <div style={{ gridColumn: '1 / -1', background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '2px solid rgba(13,31,61,0.1)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Credit Cards</div>
                      {editForm.cards.map((card, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                          <input
                            placeholder="Bank name (e.g. ICICI)"
                            value={card.bank}
                            onChange={e => {
                              const updated = [...editForm.cards]
                              updated[i] = { ...updated[i], bank: e.target.value }
                              handleEditChange('cards', updated)
                            }}
                            style={{ padding: '6px 10px', borderRadius: 6, border: '1.5px solid #e2e8f0', fontSize: 12, fontWeight: 600, outline: 'none' }}
                          />
                          <input
                            placeholder="Last 4 digits"
                            maxLength={4}
                            value={card.last4}
                            onChange={e => {
                              const updated = [...editForm.cards]
                              updated[i] = { ...updated[i], last4: e.target.value.replace(/\D/g, '').slice(0, 4) }
                              handleEditChange('cards', updated)
                            }}
                            style={{ padding: '6px 10px', borderRadius: 6, border: '1.5px solid #e2e8f0', fontSize: 12, fontWeight: 600, outline: 'none', fontFamily: 'monospace' }}
                          />
                          <button type="button"
                            onClick={() => handleEditChange('cards', editForm.cards.filter((_, j) => j !== i))}
                            style={{ padding: '6px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>✕</button>
                        </div>
                      ))}
                      <button type="button"
                        onClick={() => handleEditChange('cards', [...editForm.cards, { bank: '', last4: '' }])}
                        style={{ padding: '6px 14px', background: '#ede9fe', color: '#4c1d95', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                        + Add Card
                      </button>
                    </div>
                  </>
                ) : (
                  // Display Mode
                  fields.map(f => (
                    <div key={f.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{f.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#081427', fontFamily: f.mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{f.value}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Cards */}
              {!editingDetails && Array.isArray(customer.cards) && customer.cards.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Credit Cards ({customer.cards.length})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {customer.cards.map((card, i) => (
                      <span key={i} style={{ background: '#ede9fe', color: '#4c1d95', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                        💳 {card.bank}{card.last4 ? ` ****${card.last4}` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Documents Tab ── */}
          {tab === 'documents' && (
            <div>
              {saveMsg && (
                <div style={{ marginBottom: 12, padding: '8px 14px', borderRadius: 8, background: saveMsg.startsWith('Error') ? '#fee2e2' : '#d1fae5', color: saveMsg.startsWith('Error') ? '#dc2626' : '#059669', fontSize: 13, fontWeight: 600 }}>
                  {saveMsg}
                </div>
              )}

              {/* Edit / Save toolbar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14, gap: 8 }}>
                {editing ? (
                  <>
                    <button onClick={() => { setEditing(false); setSaveMsg(''); setImgUrls({ aadhar_img_url: customer.aadhar_img_url || '', pan_img_url: customer.pan_img_url || '', card_front_img_url: customer.card_front_img_url || '' }) }}
                      style={{ padding: '6px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button onClick={saveImages} disabled={saving}
                      style={{ padding: '6px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#0d1f3d,#1a365d)', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                      {saving ? 'Saving...' : '✓ Save Images'}
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setEditing(true); setSaveMsg('') }}
                    style={{ padding: '6px 16px', borderRadius: 8, border: '1.5px solid rgba(13,31,61,0.3)', background: '#fff', color: '#0d1f3d', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                    ✏️ Edit Images
                  </button>
                )}
              </div>

              {/* Document cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16 }}>
                {docs.map(d => {
                  const url = editing ? imgUrls[d.key] : customer[d.key]
                  return (
                    <div key={d.key} style={{ background: '#f8fafc', borderRadius: 12, overflow: 'hidden', border: `1.5px solid ${editing ? 'rgba(13,31,61,0.3)' : '#e2e8f0'}` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0d1f3d', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{d.label}</span>
                        {url && !editing && (
                          <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: '#0d1f3d', textDecoration: 'none' }}>🔗</a>
                        )}
                      </div>
                      {url
                        ? <img src={url} alt={d.label}
                            onClick={() => !editing && setLightbox({ url, label: `${customer.name} — ${d.label}` })}
                            style={{ width: '100%', height: 140, objectFit: 'cover', cursor: editing ? 'default' : 'pointer', display: 'block' }}
                            onError={e => { e.currentTarget.style.display = 'none' }} />
                        : <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 12, flexDirection: 'column', gap: 6 }}>
                            <span style={{ fontSize: 28 }}>{d.label.split(' ')[0]}</span>
                            <span>Not uploaded</span>
                          </div>
                      }
                      {editing && (
                        <div style={{ padding: '8px 10px', borderTop: '1px solid #e2e8f0' }}>
                          <input
                            placeholder="Paste image URL..."
                            value={imgUrls[d.key]}
                            onChange={e => setImgUrls(prev => ({ ...prev, [d.key]: e.target.value }))}
                            style={{ width: '100%', padding: '5px 8px', borderRadius: 6, border: '1.5px solid rgba(13,31,61,0.2)', fontSize: 11, fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none' }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
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
                      { label: 'Total Txns',   value: txns.length,                                                    color: '#0d1f3d' },
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
                            <td style={{ fontFamily: 'monospace', color: '#0d1f3d', fontWeight: 700, fontSize: 11 }}>#{t.id}</td>
                            <td style={{ fontSize: 11 }}>
                              <div>{new Date(t.created_at).toLocaleDateString('en-IN')}</div>
                              <div style={{ color: '#9ca3af' }}>{new Date(t.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                            <td style={{ fontSize: 12 }}>{t.service_type || '—'}</td>
                            <td><span style={{ background: '#ede9fe', color: '#0d1f3d', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{t.platform || t.bill_platform || '—'}</span></td>
                            <td style={{ color: '#059669', fontWeight: 700 }}>₹{fmt(t.amount)}</td>
                            <td style={{ color: '#d97706', fontSize: 12 }}>₹{fmt(t.charges_amount || 0)}</td>
                            <td style={{ color: '#0d1f3d', fontWeight: 700 }}>₹{fmt(t.settled_amount || 0)}</td>
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
            <a href={`tel:${customer.phone}`} style={{ padding: '8px 16px', borderRadius: 10, background: '#d1fae5', color: '#059669', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>📞 Call</a>
            <a href={`https://wa.me/${customer.phone?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${customer.name}, this is 1 Step Finance Care. How can we help you?`)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ padding: '8px 16px', borderRadius: 10, background: '#25D366', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>💬 WhatsApp</a>
          </div>
          <button onClick={onClose} style={{ padding: '8px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0d1f3d,#1a365d)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Close</button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', maxWidth: 700, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#081427' }}>
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
  const { all, loading, error, msg, approve, reject, updateCustomer } = useCustomerRequests()
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
              style={{ padding: '7px 14px', borderRadius: 8, border: '1.5px solid rgba(13,31,61,0.2)', fontFamily: 'inherit', fontSize: 13, width: 260 }} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid rgba(13,31,61,0.2)', fontFamily: 'inherit', fontSize: 13 }}>
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
              { label: 'Total',    value: counts.total,    color: '#0d1f3d', bg: '#ede9fe', icon: '👥' },
              { label: 'Approved', value: counts.approved, color: '#059669', bg: '#d1fae5', icon: '✅' },
              { label: 'Pending',  value: counts.pending,  color: '#d97706', bg: '#fef3c7', icon: '⏳' },
              { label: 'Rejected', value: counts.rejected, color: '#dc2626', bg: '#fee2e2', icon: '❌' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 2px 12px rgba(13,31,61,0.08)', borderLeft: `4px solid ${s.color}`, display: 'flex', alignItems: 'center', gap: 12 }}>
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
                    <tr><th>#</th><th>Name</th><th>Phone</th><th>PAN</th><th>Aadhar</th><th>Branch</th><th>Category</th><th>Coins</th><th>Documents</th><th>Status</th><th>Added By</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => (
                      <tr key={c.id} onClick={() => setSelected(c)} style={{ cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f0f2f8'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td style={{ fontFamily: 'monospace', color: '#0d1f3d', fontWeight: 700, fontSize: 11 }}>#{c.id}</td>
                        <td>
                          <strong>{c.name}</strong>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>{c.email}</div>
                        </td>
                        <td style={{ fontSize: 12 }}>{c.phone}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.pan}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.aadhar ? c.aadhar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '—'}</td>
                        <td style={{ fontSize: 12 }}>{c.branch || '—'}</td>
                        <td>
                          <span style={{
                            background: c.customer_type === 'credit_repair' ? '#fef3c7' : '#ede9fe',
                            color: c.customer_type === 'credit_repair' ? '#92400e' : '#4c1d95',
                            padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700
                          }}>
                            {c.customer_type === 'credit_repair' ? '🔧 CIBIL Repair' : '👤 General'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: '#d4af37', fontSize: 13 }}><img src="/logo.png" style={{width:14,height:14,objectFit:'contain',verticalAlign:'middle',marginRight:4}} alt="coin"/> {c.coins ?? 0}</td>
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
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                              <button 
                                onClick={() => setSelected(c)}
                                style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', color: '#0d1f3d', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                              >
                                ✏️ Edit
                              </button>
                              <span style={{ fontSize: 11, color: '#9ca3af' }}>{c.reviewed_by_name || '—'}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!filtered.length && <tr><td colSpan={11} className="dash-empty">No customers found</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {selected && <CustomerDetailModal customer={selected} onClose={() => setSelected(null)} onUpdate={updateCustomer} />}

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', maxWidth: 700, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#081427' }}>
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
