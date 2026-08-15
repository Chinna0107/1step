import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import EmployeeNavbar from '../../components/employee/EmployeeNavbar'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import config from '../../config'
import '../../pages/dashboard.css'
import './Services.css'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { cacheGet, cacheSet, TTL } from '../../utils/cache'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('employee') || getTokenByRole('admin')}` })
const fmt    = n => { const num = parseFloat(n); return isNaN(num) ? '0' : num.toLocaleString('en-IN') }

const CIBIL_SERVICES = [
  "DPD'S",
  "ENQUIRES",
  "GUARANTOR",
  "WRITTEN-OFF",
  "SETTLEMENT AMOUNT",
  "FRAUD ACCOUNTS",
  "ACTIVE LOAN AFTER CLOSURE",
  "SUIT FILED",
  "OVERDUE",
  "LOAN TRACK"
];

const emptyForm = {
  customer_id: '', cust_name: '', cust_pan: '', cust_aadhar: '', cust_mobile: '', balance: '',
  cibil_service: '', card_last4: '', tenure_days: '', total_amount: '',
  amount_collected: '', balance_due: '', received_mode: '', remarks: '', is_active: 'true', initial_score: ''
};

export default function CibilRepairTransactions() {
  const navigate = useNavigate()
  const [master, setMaster] = useState(null)
  const [customers, setCustomers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [custMode, setCustMode] = useState('search')
  const [search, setSearch] = useState('')
  const [file, setFile] = useState(null)
  const [customerProfile, setCustomerProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  const [viewRepair, setViewRepair] = useState(null)
  const [payForm, setPayForm] = useState({ amount: '', received_mode: '' })
  const [viewFiles, setViewFiles] = useState({ noc: null, middle_report: null, final_report: null })
  const [uploading, setUploading] = useState(false)
  const [finalScore, setFinalScore] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    // Serve from cache instantly, then revalidate in background
    const cachedMaster    = cacheGet('cibil:master')
    const cachedCustomers = cacheGet('cibil:customers')
    const cachedHistory   = cacheGet('cibil:history')

    if (cachedMaster)    setMaster(cachedMaster)
    if (cachedCustomers) setCustomers(cachedCustomers)
    if (cachedHistory)   setHistory(cachedHistory)

    const fetches = []

    if (!cachedMaster)
      fetches.push(
        api('/master/all', { headers: auth() })
          .then(d => { setMaster(d); cacheSet('cibil:master', d, TTL.master) })
          .catch(() => {})
      )

    // Load generic customers like Services page to pre-fill cache
    if (!cachedCustomers)
      fetches.push(
        api('/customers/approved', { headers: auth() })
          .then(d => { setCustomers(d); cacheSet('cibil:customers', d, TTL.list) })
          .catch(() => {})
      )

    if (!cachedHistory)
      fetches.push(
        api('/cibil-repairs/all', { headers: auth() })
          .then(d => { setHistory(d); cacheSet('cibil:history', d, TTL.dashboard) })
          .catch(() => {})
      )
      
    // Background revalidate stale cache
    if (cachedMaster)
      api('/master/all', { headers: auth() })
        .then(d => { setMaster(d); cacheSet('cibil:master', d, TTL.master) }).catch(() => {})
        
    if (cachedCustomers)
      api('/customers/approved', { headers: auth() })
        .then(d => { setCustomers(d); cacheSet('cibil:customers', d, TTL.list) }).catch(() => {})
        
    if (cachedHistory)
      api('/cibil-repairs/all', { headers: auth() })
        .then(d => { setHistory(d); cacheSet('cibil:history', d, TTL.dashboard) }).catch(() => {})
  }, [])

  // Auto-calc balance due
  useEffect(() => {
    const total = parseFloat(form.total_amount) || 0;
    const collected = parseFloat(form.amount_collected) || 0;
    const prevBal = parseFloat(form.balance) || 0;
    const due = Math.max(0, (total + prevBal) - collected);
    if (parseFloat(form.balance_due) !== due) {
      set('balance_due', due.toFixed(2));
    }
  }, [form.total_amount, form.amount_collected, form.balance]);

  // Load specific customer history when selected
  useEffect(() => {
    if (form.customer_id) {
      api(`/cibil-repairs/${form.customer_id}`, { headers: auth() })
        .then(data => setHistory(data))
        .catch(() => setHistory([]))
    } else {
      const cachedHistory = cacheGet('cibil:history')
      if (cachedHistory) setHistory(cachedHistory)
      else {
        api('/cibil-repairs/all', { headers: auth() })
          .then(data => { setHistory(data); cacheSet('cibil:history', data, TTL.dashboard) })
          .catch(() => setHistory([]))
      }
    }
  }, [form.customer_id])

  const filteredCusts = useMemo(() => {
    if (search.length < 2) return []
    const q = search.toLowerCase()
    return customers.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      (c.pan && c.pan.toLowerCase().includes(q))
    )
  }, [search, customers])

  // Search customers from API when search term changes
  useEffect(() => {
    if (search.length < 2 || form.customer_id) return
    const t = setTimeout(() => {
      api(`/customers/approved?search=${encodeURIComponent(search)}`, { headers: auth() })
        .then(d => setCustomers(d))
        .catch(() => {})
    }, 300)
    return () => clearTimeout(t)
  }, [search, form.customer_id])

  const selectCustomer = async (c) => {
    setForm(f => ({ ...f, customer_id: c.id, cust_name: c.name, cust_pan: c.pan, cust_aadhar: c.aadhar, cust_mobile: c.phone, balance: c.balance }))
    setSearch('')
    setLoadingProfile(true)
    try {
      const [profile, txns] = await Promise.all([
        api(`/customers/${c.id}`, { headers: auth() }),
        api(`/master/transactions?customer_id=${c.id}`, { headers: auth() }).catch(() => []),
      ])
      const txnsArray = Array.isArray(txns) ? txns : []
      const actualBalance = txnsArray.length > 0 ? (parseFloat(txnsArray[0].balance_due) || 0) : (parseFloat(profile.balance) || 0)
      setCustomerProfile({ ...profile, transactions: txnsArray, balance: actualBalance })
      setForm(f => ({ ...f, balance: actualBalance || '' }))
    } catch {
      setCustomerProfile({ ...c, transactions: [] })
    }
    setLoadingProfile(false)
  }

  const clearCustomer = () => {
    setForm(emptyForm)
    setFile(null)
    setHistory([])
    setError('')
    setMsg('')
    setCustomerProfile(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.customer_id) return setError('Please select a customer first')
    if (!form.cibil_service) return setError('Please select a CIBIL service')
    if (parseFloat(form.amount_collected) > 0 && !form.received_mode) return setError('Please select a receive mode')

    setSaving(true)
    setError('')
    setMsg('')

    try {
      const fd = new FormData()
      Object.keys(form).forEach(k => fd.append(k, form[k]))
      if (file) fd.append('initial_report', file)

      const token = getTokenByRole('employee') || getTokenByRole('admin')
      const res = await fetch(`${config.API_URL}/cibil-repairs`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create request')

      setMsg('✅ CIBIL repair request created successfully!')
      
      // Refresh customer data and history
      api(`/cibil-repairs/${form.customer_id}`, { headers: auth() }).then(d => setHistory(d)).catch(()=>{})
      api('/customers/approved?type=credit_repair', { headers: auth() }).then(d => setCustomers(d)).catch(()=>{})
      
      // Reset form but keep customer selected
      setForm(f => ({ ...emptyForm, customer_id: f.customer_id, cust_name: f.cust_name, cust_pan: f.cust_pan, cust_aadhar: f.cust_aadhar, cust_mobile: f.cust_mobile, balance: parseFloat(f.balance) + parseFloat(f.balance_due) }))
      setFile(null)

      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  const [repairTxns, setRepairTxns] = useState([])
  
  useEffect(() => {
    if (viewRepair) {
      setViewFiles({ noc: [], middle_report: [], final_report: [] })
      setPayForm({ amount: '', received_mode: '' })
      setFinalScore(viewRepair.final_score || '')
      api(`/master/transactions?customer_id=${viewRepair.customer_id}`, { headers: auth() })
        .then(d => setRepairTxns(Array.isArray(d) ? d : []))
        .catch(() => setRepairTxns([]))
    }
  }, [viewRepair])

  const handleUpdateFinalScore = async () => {
    if (!finalScore) return;
    setUploading(true);
    try {
      const token = getTokenByRole('employee') || getTokenByRole('admin');
      const res = await fetch(`${config.API_URL}/cibil-repairs/${viewRepair.id}/final-score`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ final_score: finalScore })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setViewRepair(data.repair);
      setHistory(prev => prev.map(h => h.id === data.repair.id ? data.repair : h));
      alert('Final score updated successfully!');
    } catch (e) {
      alert('Failed to update final score: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!window.confirm(`Are you sure you want to mark this repair as ${viewRepair.is_active ? 'Closed' : 'Active'}?`)) return;
    setUploading(true);
    try {
      const token = getTokenByRole('employee') || getTokenByRole('admin');
      const res = await fetch(`${config.API_URL}/cibil-repairs/${viewRepair.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: !viewRepair.is_active })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setViewRepair(data.repair);
      setHistory(prev => prev.map(h => h.id === data.repair.id ? data.repair : h));
    } catch (e) {
      alert('Failed to update status: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleExportExcel = () => {
    const data = history.filter(h => custMode === 'closed' ? !h.is_active : h.is_active).map(h => ({
      'Date': new Date(h.created_at).toLocaleDateString('en-IN'),
      'Customer Name': h.customer_name || '—',
      'PAN': h.customer_pan || '—',
      'Aadhar': h.customer_aadhar || '—',
      'Mobile': h.customer_phone || '—',
      'Service Type': h.cibil_service,
      'Card Last 4': h.card_last4 || '—',
      'Tenure (Days)': h.tenure_days,
      'Total Fee (₹)': h.total_amount,
      'Paid (₹)': h.amount_collected,
      'Balance (₹)': h.total_amount - h.amount_collected,
      'Initial Score': h.initial_score || '—',
      'Final Score': h.final_score || '—',
      'Status': h.is_active ? 'Active' : 'Closed'
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Repairs")
    XLSX.writeFile(wb, `CIBIL_Repairs_${custMode}.xlsx`)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape')
    doc.text(`CIBIL Repairs (${custMode})`, 14, 15)
    const tableData = history.filter(h => custMode === 'closed' ? !h.is_active : h.is_active).map(h => [
      new Date(h.created_at).toLocaleDateString('en-IN'),
      h.customer_name || '—',
      h.customer_pan || '—',
      h.customer_phone || '—',
      h.cibil_service,
      h.tenure_days,
      h.total_amount,
      h.amount_collected,
      h.total_amount - h.amount_collected,
      h.initial_score || '—',
      h.final_score || '—',
      h.is_active ? 'Active' : 'Closed'
    ])
    doc.autoTable({
      head: [['Date', 'Customer', 'PAN', 'Phone', 'Service', 'Tenure', 'Fee', 'Paid', 'Bal', 'Ini Scr', 'Fin Scr', 'Status']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 }
    })
    doc.save(`CIBIL_Repairs_${custMode}.pdf`)
  }

  const handleEditDocument = async (field, index, file) => {
    if (!file) return;
    if (!window.confirm('Are you sure you want to replace this document?')) return;
    setUploading(true);
    try {
      const token = getTokenByRole('employee') || getTokenByRole('admin');
      const fd = new FormData();
      fd.append('file', file);
      fd.append('field', field);
      fd.append('index', index);
      const res = await fetch(`${config.API_URL}/cibil-repairs/${viewRepair.id}/document`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setViewRepair(data.repair);
      setHistory(prev => prev.map(h => h.id === data.repair.id ? data.repair : h));
    } catch (e) {
      alert('Failed to replace document: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (field, index) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    setUploading(true);
    try {
      const token = getTokenByRole('employee') || getTokenByRole('admin');
      const res = await fetch(`${config.API_URL}/cibil-repairs/${viewRepair.id}/document?field=${field}&index=${index}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setViewRepair(data.repair);
      setHistory(prev => prev.map(h => h.id === data.repair.id ? data.repair : h));
    } catch (e) {
      alert('Failed to delete document: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateFiles = async (e) => {
    e.preventDefault()
    const nocFiles = (viewFiles.noc || []).filter(Boolean);
    const middleFiles = (viewFiles.middle_report || []).filter(Boolean);
    const finalFiles = (viewFiles.final_report || []).filter(Boolean);

    if (nocFiles.length === 0 && middleFiles.length === 0 && finalFiles.length === 0) {
      return alert('Please select at least one file to upload.')
    }
    
    setUploading(true)
    try {
      const fd = new FormData()
      nocFiles.forEach(f => fd.append('noc', f))
      middleFiles.forEach(f => fd.append('middle_report', f))
      finalFiles.forEach(f => fd.append('final_report', f))

      const token = getTokenByRole('employee') || getTokenByRole('admin')
      const res = await fetch(`${config.API_URL}/cibil-repairs/${viewRepair.id}/update`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update documents')

      setViewRepair(data.repair)
      setHistory(h => h.map(x => x.id === data.repair.id ? data.repair : x))
      setViewFiles({ noc: null, middle_report: null, final_report: null })
      alert('Documents uploaded successfully!')
    } catch (err) {
      alert(err.message)
    }
    setUploading(false)
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    if (!payForm.amount || !payForm.received_mode) return alert('Please enter amount and receive mode')
    
    setUploading(true)
    try {
      const res = await api(`/cibil-repairs/${viewRepair.id}/payment`, {
        method: 'POST',
        headers: auth(),
        body: JSON.stringify(payForm)
      })
      
      setViewRepair(res.repair)
      setHistory(h => h.map(x => x.id === res.repair.id ? res.repair : x))
      setPayForm({ amount: '', received_mode: '' })
      
      if (res.transaction) {
        if (customerProfile) {
          setCustomerProfile(p => ({ ...p, transactions: [res.transaction, ...(p.transactions || [])] }))
        }
        setRepairTxns(prev => [res.transaction, ...prev])
      }
      cacheSet('cibil:history', null, 0)
      if (!form.customer_id) {
        api('/cibil-repairs/all', { headers: auth() })
          .then(data => { setHistory(data); cacheSet('cibil:history', data, TTL.dashboard) })
          .catch(() => {})
      }
      
      // Update form balance if this customer is currently selected
      if (form.customer_id === viewRepair.customer_id) {
        api(`/customers/${form.customer_id}`, { headers: auth() })
          .then(d => setForm(f => ({ ...f, balance: d.balance })))
          .catch(()=>{})
      }
      
      alert('Payment processed successfully!')
    } catch (err) {
      alert(err.message)
    }
    setUploading(false)
  }

  const receiveModes = master?.receive_modes?.map(m => <option key={m.id} value={m.name}>{m.name}</option>) || []

  // UI Helpers
  const fg = (label, el, full) => (
    <div className="dash-form-group" style={full ? { gridColumn: '1/-1' } : {}}>
      <label>{label}</label>
      {el}
    </div>
  )

  const sel = (key, opts) => (
    <select value={form[key]} onChange={e => set(key, e.target.value)}>
      <option value="">Select...</option>
      {opts}
    </select>
  )

  const inp = (key, placeholder, type = 'text') => (
    <input type={type} placeholder={placeholder} value={form[key]} onChange={e => set(key, e.target.value)} />
  )

  // Calculate remaining days
  const getRemainingDays = (createdAt, totalDays) => {
    const start = new Date(createdAt);
    const today = new Date();
    // Reset times to start of day for accurate day diff
    start.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffTime = Math.abs(today - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, totalDays - diffDays);
  }

  return (
    <div className="dashboard-layout">
      <EmployeeNavbar />
      <div className="dashboard-content">
        <div className="dashboard-header" style={{ marginBottom: 24 }}>
          <h1>🔧 CIBIL Repair Requests</h1>
          <p>Create and manage CIBIL repair tasks for customers</p>
        </div>

        {error && <div className="dash-alert dash-alert-error" style={{ marginBottom: 20 }}>❌ {error}</div>}
        {msg && <div className="dash-alert dash-alert-success" style={{ marginBottom: 20 }}>{msg}</div>}

        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          
          {/* LEFT: Entry Form */}
          <div>
            <form onSubmit={handleSubmit}>
              
              {/* Customer Selection */}
              <div className="dash-card" style={{ marginBottom: 16 }}>
                <div className="dash-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>👤 Customer Details</h2>
                </div>
                <div className="dash-card-body" style={{ overflow: 'visible' }}>
                  {!form.customer_id ? (
                    <>
                      <div style={{ position: 'relative', marginBottom: 12, zIndex: 200 }}>
                        <input placeholder="Search CIBIL customers by name, phone or PAN..." value={search}
                          onChange={e => { setSearch(e.target.value) }}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(13,31,61,0.2)', fontFamily: 'inherit', fontSize: 14, boxSizing: 'border-box' }} />

                        {filteredCusts.length > 0 && (
                          <div className="customer-search-dropdown" style={{ zIndex: 1000 }}>
                            {filteredCusts.map(c => (
                              <div key={c.id} onClick={() => selectCustomer(c)} className="customer-search-item">
                                <div style={{ fontWeight: 700, color: '#0d1f3d', fontSize: 14 }}>{c.name}</div>
                                <div style={{ fontSize: 12, color: '#9ca3af' }}>{c.phone} · PAN: {c.pan}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: '#9ca3af' }}>Type at least 2 characters to search approved CIBIL customers</div>
                    </>
                  ) : (
                    <>
                      {loadingProfile ? (
                        <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
                          ⏳ Loading customer profile...
                        </div>
                      ) : (
                        !loadingProfile && customerProfile && (() => {
                          const txns      = customerProfile.transactions || []
                          const totalAmt  = txns.reduce((s, t) => s + parseFloat(t.amount || 0), 0)
                          const totalProfit = txns.reduce((s, t) => s + parseFloat(t.profit || 0), 0)
                          const isPremium = txns.length >= 10 || totalAmt >= 100000
                          const isVip     = txns.length >= 5  || totalAmt >= 50000
                          const tag       = customerProfile.tag
                          const tagConfig = {
                            fraud:       { bg: '#fee2e2', border: '#fca5a5', color: '#dc2626', icon: '🚨', label: 'FRAUD ALERT', msg: 'This customer is marked as FRAUD. Do NOT proceed with any transaction.' },
                            blacklisted: { bg: '#1f2937', border: '#374151', color: '#fff',    icon: '⛔',    label: 'BLACKLISTED',   msg: 'This customer is blacklisted. Transactions are not allowed.' },
                            suspicious:  { bg: '#fef3c7', border: '#fcd34d', color: '#92400e', icon: '⚠️',   label: 'SUSPICIOUS',    msg: 'This customer is flagged as suspicious. Proceed with caution.' },
                            vip:         { bg: '#f0fdf4', border: '#86efac', color: '#166534', icon: '👑',   label: 'VIP CUSTOMER',  msg: 'This is a VIP customer. Provide priority service.' },
                          }
                          const tc = tag ? tagConfig[tag] : null
                          const badge = !tag && (isPremium ? { label: '👑 Premium', bg: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#fff' }
                                          : isVip     ? { label: '⭐ VIP',     bg: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: '#fff' }
                                          : null)
                          const serviceBreakdown = txns.reduce((acc, t) => {
                            if (t.service_type === 'CIBIL Repair (Payment)' || t.service_type === 'CIBIL Repair') return acc;
                            const k = t.service_type || 'Other'
                            acc[k] = (acc[k] || 0) + 1
                            return acc
                          }, {})
                          
                          // Add specific CIBIL services from history
                          history.filter(h => h.customer_id === customerProfile.id).forEach(h => {
                            const k = h.cibil_service || 'CIBIL Repair'
                            serviceBreakdown[k] = (serviceBreakdown[k] || 0) + 1
                          })
                          return (
                            <div style={{ border:'1.5px solid #e2e8f0', borderRadius:16, overflow:'hidden', animation:'cd-card-in 0.4s ease both', marginTop: 12 }}>

                              {/* Tag Warning Banner */}
                              {tc && (
                                <div style={{ background: tc.bg, border: `2px solid ${tc.border}`, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                  <span style={{ fontSize: 28 }}>{tc.icon}</span>
                                  <div>
                                    <div style={{ fontWeight: 900, fontSize: 15, color: tc.color }}>{tc.label}</div>
                                    <div style={{ fontSize: 12, color: tc.color, opacity: 0.85, marginTop: 2 }}>{tc.msg}</div>
                                  </div>
                                </div>
                              )}

                              {/* Header */}
                              <div style={{ background:'linear-gradient(135deg,#081427 0%,#2d1155 50%,#1a365d 100%)', padding:'16px 18px', position:'relative', overflow:'hidden' }}>
                                <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:'rgba(212,175,55,0.15)', filter:'blur(20px)' }} />
                                <div style={{ position:'absolute', bottom:-20, left:'20%', width:80, height:80, borderRadius:'50%', background:'rgba(13,31,61,0.3)', filter:'blur(15px)' }} />
                                <div style={{ position:'relative', zIndex:1, display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                                  <div>
                                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                                      <span style={{ fontWeight:900, color:'#fff', fontSize:17 }}>{customerProfile.name}</span>
                                      {badge && <span style={{ background:badge.bg, color:badge.color, fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:20 }}>{badge.label}</span>}
                                      {tag && <span style={{ background: tc.bg, color: tc.color, fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:20, border:`1px solid ${tc.border}` }}>{tc.icon} {tc.label}</span>}
                                    </div>
                                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)' }}>ID: #{customerProfile.id} · {customerProfile.branch || '—'}</div>
                                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', marginTop:2 }}>
                                      <span style={{ background:'rgba(16,185,129,0.2)', border:'1px solid rgba(16,185,129,0.3)', color:'#10b981', padding:'1px 8px', borderRadius:20, fontSize:10, fontWeight:700 }}>✅ {customerProfile.status}</span>
                                      <span style={{ marginLeft: 6, background:'rgba(59,130,246,0.2)', border:'1px solid rgba(59,130,246,0.3)', color:'#60a5fa', padding:'1px 8px', borderRadius:20, fontSize:10, fontWeight:700 }}>🏷️ {customerProfile.customer_type === 'credit_repair' ? 'CIBIL Repair' : 'General'}</span>
                                    </div>
                                  </div>
                                  <button type="button" onClick={clearCustomer} style={{ background:'rgba(255,255,255,0.15)', color:'#fff', border:'none', borderRadius:8, padding:'5px 12px', cursor:'pointer', fontSize:12, fontWeight:700 }}>✕ Clear</button>
                                </div>
                              </div>

                              {/* Stats Row */}
                              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
                                {[
                                  { label:'Transactions', value: txns.length,          color:'#0d1f3d' },
                                  { label:'Total Amount', value: totalAmt >= 100000 ? `₹${(totalAmt/100000).toFixed(1)}L` : totalAmt >= 1000 ? `₹${(totalAmt/1000).toFixed(1)}K` : `₹${totalAmt}`, color:'#059669' },
                                  { label:'Total Charges', value: totalProfit >= 1000 ? `₹${(totalProfit/1000).toFixed(1)}K` : `₹${totalProfit.toFixed(0)}`, color:'#d4af37' },
                                  { label:'Avg / Txn',    value: txns.length ? (totalAmt/txns.length >= 1000 ? `₹${((totalAmt/txns.length)/1000).toFixed(1)}K` : `₹${Math.round(totalAmt/txns.length)}`) : '—', color:'#1a365d' },
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
                                  ...(customerProfile.address ? [{ icon:'📍', label:'Address', value: customerProfile.address }] : []),
                                  { icon:'👤', label:'Added By',   value: customerProfile.added_by_name || '—' },
                                  { icon:'📅', label:'Member Since',value: customerProfile.created_at ? new Date(customerProfile.created_at).toLocaleDateString('en-IN') : '—' },
                                  ...(customerProfile.reviewed_by_name ? [{ icon:'✅', label:'Approved By', value: customerProfile.reviewed_by_name }] : []),
                                  ...(customerProfile.reviewed_at ? [{ icon:'📅', label:'Approved On', value: new Date(customerProfile.reviewed_at).toLocaleDateString('en-IN') }] : []),
                                  ...(customerProfile.pan_img_url ? [{ icon:'🖼️', label:'PAN Image', value: <a href={customerProfile.pan_img_url} target="_blank" rel="noopener noreferrer"><img src={customerProfile.pan_img_url} alt="PAN" style={{ width:60, height:40, objectFit:'cover', borderRadius:4, border:'1.5px solid rgba(13,31,61,0.2)', cursor:'pointer' }} /></a> }] : []),
                                  ...(customerProfile.aadhar_img_url ? [{ icon:'🖼️', label:'Aadhar Image', value: <a href={customerProfile.aadhar_img_url} target="_blank" rel="noopener noreferrer"><img src={customerProfile.aadhar_img_url} alt="Aadhar" style={{ width:60, height:40, objectFit:'cover', borderRadius:4, border:'1.5px solid rgba(13,31,61,0.2)', cursor:'pointer' }} /></a> }] : []),
                                  ...(customerProfile.card_front_img_url ? [{ icon:'🏧', label:'Card Front', value: <a href={customerProfile.card_front_img_url} target="_blank" rel="noopener noreferrer"><img src={customerProfile.card_front_img_url} alt="Card" style={{ width:60, height:40, objectFit:'cover', borderRadius:4, border:'1.5px solid rgba(13,31,61,0.2)', cursor:'pointer' }} /></a> }] : []),
                                ].map((f, i) => (
                                  <div key={i} style={{ background:'#fff', padding:'8px 14px' }}>
                                    <div style={{ fontSize:9, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.4 }}>{f.icon} {f.label}</div>
                                    <div style={{ fontSize:12, fontWeight:700, color:'#081427', marginTop:2, wordBreak:'break-all' }}>{f.value}</div>
                                  </div>
                                ))}
                              </div>

                              {/* Service Breakdown */}
                              {Object.keys(serviceBreakdown).length > 0 && (
                                <div style={{ borderTop:'1px solid #e2e8f0', background:'#fafbff', padding:'10px 14px' }}>
                                  <div style={{ fontSize:9, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.4, marginBottom:8 }}>Service Breakdown</div>
                                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                                    {Object.entries(serviceBreakdown).map(([svc, cnt]) => (
                                      <span key={svc} style={{ background:'#ede9fe', color:'#0d1f3d', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>
                                        {svc} ×{cnt}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Balance / Debt field */}
                              {form.balance !== undefined && (
                                <div style={{ borderTop: '1px solid #e2e8f0', padding: '12px 14px', background: parseFloat(form.balance) > 0 ? '#fff5f5' : '#f8fafc' }}>
                                  <div style={{ fontSize: 10, fontWeight: 700, color: parseFloat(form.balance) > 0 ? '#dc2626' : '#64748b', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>💰 Pending Balance (Debt)</div>
                                  <div style={{ fontSize: 16, fontWeight: 900, color: parseFloat(form.balance) > 0 ? '#dc2626' : '#0d1f3d' }}>₹{parseFloat(form.balance || 0).toLocaleString('en-IN')}</div>
                                </div>
                              )}

                            </div>
                          )
                        })()
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Service Details */}
              {form.customer_id && (
                <div className="dash-card" style={{ marginBottom: 16 }}>
                  <div className="dash-card-header"><h2>📄 CIBIL Service Details</h2></div>
                  <div className="dash-card-body">
                    <div className="dash-form-grid">
                      {fg('CIBIL Service *', (
                        <select required value={form.cibil_service} onChange={e => set('cibil_service', e.target.value)}>
                          <option value="">Select Service...</option>
                          {CIBIL_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ))}
                      {fg('Card Last 4 Digits', <input placeholder="e.g. 1234" maxLength={4} value={form.card_last4} onChange={e => set('card_last4', e.target.value.replace(/\D/g,'').slice(0,4))} />)}
                      {fg('Tenure (Days) *', <input required type="number" placeholder="e.g. 60" min="1" value={form.tenure_days} onChange={e => set('tenure_days', e.target.value)} />)}
                      {fg('Is Active?', (
                        <select value={form.is_active} onChange={e => set('is_active', e.target.value)}>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      ))}
                      {fg('Initial Score', <input type="number" placeholder="e.g. 550" value={form.initial_score} onChange={e => set('initial_score', e.target.value)} />)}
                      {fg('Initial Report (File)', <input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files[0])} />)}
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Details */}
              {form.customer_id && (
                <div className="dash-card" style={{ marginBottom: 16 }}>
                  <div className="dash-card-header"><h2>💰 Financial Details</h2></div>
                  <div className="dash-card-body">
                    <div className="dash-form-grid">
                      {fg('Total Fee Amount (₹) *', <input required type="number" placeholder="₹" value={form.total_amount} onChange={e => set('total_amount', e.target.value)} />)}
                      {fg('Amount Collected Now (₹) *', <input required type="number" placeholder="₹" value={form.amount_collected} onChange={e => set('amount_collected', e.target.value)} />)}
                      
                      {fg('Balance Due (₹)', <input readOnly value={form.balance_due} style={{ background: parseFloat(form.balance_due) > 0 ? '#fff5f5' : '#f0fdf4', color: parseFloat(form.balance_due) > 0 ? '#dc2626' : '#059669', fontWeight: 900, border: `1.5px solid ${parseFloat(form.balance_due) > 0 ? '#fca5a5' : '#86efac'}` }} />)}
                      {parseFloat(form.amount_collected) > 0 && fg('Receive Mode *', sel('received_mode', receiveModes))}
                      
                      {fg('Remarks', inp('remarks', 'Any comments about this request'), true)}
                    </div>

                    <div style={{ marginTop: 24, textAlign: 'right' }}>
                      <button type="submit" className="dash-btn dash-btn-primary" style={{ padding: '12px 32px', fontSize: 15 }} disabled={saving}>
                        {saving ? '⏳ Submitting...' : '✅ Submit Request'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </form>
          </div>

        </div>

        {/* BOTTOM: Full width history table */}
        <div style={{ marginTop: 32 }}>
          <div className="dash-card">
            <div className="dash-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2>📋 Recent Transactions</h2>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{history.length} records · click a row to view/update</span>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={handleExportExcel} className="dash-btn" style={{ padding: '6px 12px', fontSize: 12, background: '#10b981', color: '#fff' }}>📄 Export Excel</button>
                <button onClick={handleExportPDF} className="dash-btn" style={{ padding: '6px 12px', fontSize: 12, background: '#ef4444', color: '#fff' }}>🖨️ Export PDF</button>
                
                <div onClick={() => setCustMode('active')} style={{ paddingBottom: 8, cursor: 'pointer', borderBottom: custMode !== 'closed' ? '2px solid #0d1f3d' : '2px solid transparent', color: custMode !== 'closed' ? '#0d1f3d' : '#9ca3af', fontWeight: custMode !== 'closed' ? 700 : 500 }}>
                  Active ({history.filter(h => h.is_active).length})
                </div>
                <div onClick={() => setCustMode('closed')} style={{ paddingBottom: 8, cursor: 'pointer', borderBottom: custMode === 'closed' ? '2px solid #0d1f3d' : '2px solid transparent', color: custMode === 'closed' ? '#0d1f3d' : '#9ca3af', fontWeight: custMode === 'closed' ? 700 : 500 }}>
                  Closed ({history.filter(h => !h.is_active).length})
                </div>
              </div>
            </div>
            
            <div className="dash-card-body" style={{ padding: 0, overflowX: 'auto' }}>
              {history.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No repairs found.</div>
              ) : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>Date & Time</th>
                      <th style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>Customer Name</th>
                      <th style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>PAN Number</th>
                      <th style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>Aadhar Number</th>
                      <th style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>Mobile Number</th>
                      <th style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>Service Type</th>
                      <th style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>Card Details</th>
                      <th style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>Tenure</th>
                      <th style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>Total Fee</th>
                      <th style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>Paid</th>
                      <th style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>Balance Due</th>
                      <th style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>Initial Score</th>
                      <th style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>Final Score</th>
                      <th style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.filter(h => custMode === 'closed' ? !h.is_active : h.is_active).map(h => {
                      const remain = getRemainingDays(h.created_at, h.tenure_days);
                      const isOverdue = remain === 0;
                      return (
                        <tr key={h.id} onClick={() => setViewRepair(h)} style={{ cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f0f2f8'}
                            onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <td style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 11, color: '#0d1f3d' }}>#{h.id}</div>
                            <div>{new Date(h.created_at).toLocaleDateString('en-IN')}</div>
                            <div style={{ color: '#9ca3af' }}>{new Date(h.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td><strong>{h.customer_name || form.cust_name || '—'}</strong></td>
                          <td style={{ fontSize: 11, color: '#64748b' }}>{h.customer_pan || form.cust_pan || '—'}</td>
                          <td style={{ fontSize: 11, color: '#64748b' }}>{h.customer_aadhar || form.cust_aadhar || '—'}</td>
                          <td style={{ fontSize: 11 }}>{h.customer_phone || form.cust_mobile || '—'}</td>
                          <td style={{ fontSize: 12 }}><strong>{h.cibil_service}</strong></td>
                          <td style={{ fontSize: 12 }}>{h.card_last4 ? `**** ${h.card_last4}` : '—'}</td>
                          <td style={{ fontSize: 12 }}>{h.tenure_days} Days</td>
                          <td style={{ fontWeight: 700, color: '#0d1f3d', whiteSpace: 'nowrap' }}>₹{fmt(h.total_amount)}</td>
                          <td style={{ fontWeight: 700, color: '#059669', whiteSpace: 'nowrap' }}>₹{fmt(h.amount_collected)}</td>
                          <td style={{ fontWeight: 700, color: '#dc2626', whiteSpace: 'nowrap' }}>₹{fmt(h.total_amount - h.amount_collected)}</td>
                          <td style={{ fontWeight: 700, fontSize: 12, color: '#0d1f3d' }}>{h.initial_score || '—'}</td>
                          <td style={{ fontWeight: 700, fontSize: 12, color: h.final_score ? '#059669' : '#9ca3af' }}>{h.final_score || '—'}</td>
                          <td>
                            {h.is_active ? (
                              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: isOverdue ? '#fee2e2' : '#e0e7ff', color: isOverdue ? '#dc2626' : '#4338ca', whiteSpace: 'nowrap' }}>
                                {isOverdue ? 'Overdue' : `${remain} Days Left`}
                              </span>
                            ) : (
                              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: '#f3f4f6', color: '#6b7280', whiteSpace: 'nowrap' }}>Closed</span>
                            )}
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

        {/* View / Update Modal */}
        {viewRepair && (
          <div onClick={() => setViewRepair(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:800, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.2)' }}>
              
              <div style={{ background:'linear-gradient(135deg,#081427,#0d1f3d,#1a365d)', padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>Repair Details</div>
                  <div style={{ color:'#fff', fontWeight:900, fontSize:18, marginTop:2 }}>#{viewRepair.id} · {viewRepair.cibil_service}</div>
                </div>
                <button onClick={() => setViewRepair(null)} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', width:32, height:32, borderRadius:'50%', cursor:'pointer', fontSize:16 }}>✕</button>
              </div>

              <div style={{ overflowY:'auto', padding:24, flex: 1 }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  
                  {/* Left Column: Details */}
                  <div>
                    <h3 style={{ marginBottom: 12, color: '#0d1f3d' }}>Repair Information</h3>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      {[
                        { label:'Customer',       value: viewRepair.customer_name || form.cust_name || '—' },
                        { label:'Service',        value: viewRepair.cibil_service },
                        { label:'Card Last 4',    value: viewRepair.card_last4 || '—' },
                        { label:'Tenure',         value: viewRepair.tenure_days + ' Days' },
                        { label:'Total Fee',      value: `₹${fmt(viewRepair.total_amount)}`, color:'#0d1f3d' },
                        { label:'Paid',           value: `₹${fmt(viewRepair.amount_collected)}`, color:'#059669' },
                        { label:'Balance Due',    value: `₹${fmt(viewRepair.total_amount - viewRepair.amount_collected)}`, color:'#dc2626' },
                        { label:'Status',         value: viewRepair.is_active ? 'Active' : 'Closed' }
                      ].map((f, i) => (
                        <div key={i} style={{ background:'#f8fafc', borderRadius:10, padding:'10px 14px' }}>
                          <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>{f.label}</div>
                          <div style={{ fontSize:14, fontWeight:700, color: f.color || '#081427', wordBreak:'break-all' }}>
                            {f.label === 'Status' ? (
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                 <span>{f.value}</span>
                                 <button onClick={handleToggleStatus} disabled={uploading} className="dash-btn" style={{ padding: '4px 10px', fontSize: 11, background: '#e2e8f0', color: '#0f172a', whiteSpace: 'nowrap' }}>
                                   {uploading ? '...' : (viewRepair.is_active ? 'Close Repair' : 'Reopen Repair')}
                                 </button>
                               </div>
                            ) : f.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    <h3 style={{ marginTop: 24, marginBottom: 12, color: '#0d1f3d' }}>CIBIL Scores</h3>
                    <div style={{ background:'#f1f5f9', padding:16, borderRadius:12, border:'1px solid #e2e8f0', display: 'flex', gap: 16, alignItems: 'flex-end' }}>
                      <div className="dash-form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label>Initial Score</label>
                        <div style={{ padding: '8px 12px', background: '#e2e8f0', borderRadius: 6, fontWeight: 700 }}>{viewRepair.initial_score || '—'}</div>
                      </div>
                      <div className="dash-form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label>Final Score</label>
                        <input type="number" placeholder="Enter Final Score" value={finalScore} onChange={e => setFinalScore(e.target.value)} />
                      </div>
                      <button onClick={handleUpdateFinalScore} disabled={uploading || !finalScore || finalScore == viewRepair.final_score} className="dash-btn dash-btn-primary" style={{ padding: '10px 16px', height: 'fit-content', whiteSpace: 'nowrap' }}>
                        {uploading ? '...' : 'Save Score'}
                      </button>
                    </div>

                    <h3 style={{ marginTop: 24, marginBottom: 12, color: '#0d1f3d' }}>Make a Payment</h3>
                    <div style={{ background:'#f1f5f9', padding:16, borderRadius:12, border:'1px solid #e2e8f0' }}>
                      {parseFloat(viewRepair.total_amount) - parseFloat(viewRepair.amount_collected) <= 0 ? (
                        <div style={{ color: '#059669', fontWeight: 700, textAlign: 'center' }}>✅ Fully Paid</div>
                      ) : (
                        <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div className="dash-form-group">
                            <label>Amount (₹)</label>
                            <input type="number" required placeholder="Amount to pay" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} />
                          </div>
                          <div className="dash-form-group">
                            <label>Receive Mode</label>
                            <select required value={payForm.received_mode} onChange={e => setPayForm({...payForm, received_mode: e.target.value})}>
                              <option value="">Select Mode</option>
                              {receiveModes}
                            </select>
                          </div>
                          <button type="submit" disabled={uploading} className="dash-btn dash-btn-primary" style={{ width: '100%', padding: '10px' }}>
                            {uploading ? 'Processing...' : 'Submit Payment'}
                          </button>
                        </form>
                      )}
                    </div>

                    {repairTxns && repairTxns.filter(t => t.service_type === 'CIBIL Repair (Payment)' || t.service_type === 'CIBIL Repair').length > 0 && (
                      <div style={{ marginTop: 24 }}>
                        <h4 style={{ fontSize: 13, color: '#0d1f3d', marginBottom: 12 }}>CIBIL Payment History</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {repairTxns.filter(t => t.service_type === 'CIBIL Repair (Payment)' || t.service_type === 'CIBIL Repair').map(t => (
                            <div key={t.id} style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#0d1f3d' }}>{new Date(t.created_at).toLocaleDateString('en-IN')}</div>
                                <div style={{ fontSize: 11, color: '#64748b' }}>{t.received_mode || '—'}</div>
                              </div>
                              <div style={{ fontWeight: 800, color: '#059669', fontSize: 13 }}>+ ₹{parseFloat(t.amount_collected || t.amount).toLocaleString('en-IN')}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Documents */}
                  <div>
                    <h3 style={{ marginBottom: 12, color: '#0d1f3d' }}>Documents</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      
                      {[
                        { key: 'initial_report', label: 'Initial Report', url: viewRepair.initial_report_url, readonly: true },
                        { key: 'noc', label: 'NOC Document', url: viewRepair.noc_url, accept: 'image/*' },
                        { key: 'middle_report', label: 'Middle Report', url: viewRepair.middle_report_url, accept: '.pdf' },
                        { key: 'final_report', label: 'Final Report', url: viewRepair.final_report_url, accept: 'image/*,.pdf' }
                      ].map(doc => {
                        let links = []
                        if (doc.url) {
                          if (Array.isArray(doc.url)) links = doc.url
                          else if (typeof doc.url === 'string' && doc.url.startsWith('[')) {
                            try { links = JSON.parse(doc.url) } catch(e) { links = [doc.url] }
                          }
                          else links = [doc.url]
                        }

                        return (
                          <div key={doc.key} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{doc.label}</div>
                            {links.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                                {links.map((link, i) => (
                                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                    <a href={link.startsWith('http') || link.startsWith('/') ? link : `/${link}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                                      View File {links.length > 1 ? i + 1 : ''}
                                    </a>
                                    {!doc.readonly && (
                                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <label style={{ cursor: 'pointer', fontSize: 14 }} title="Replace Document">
                                          ✏️
                                          <input type="file" accept={doc.accept} style={{ display: 'none' }} onChange={e => handleEditDocument(doc.key, i, e.target.files[0])} />
                                        </label>
                                        <span onClick={() => handleDeleteDocument(doc.key, i)} style={{ cursor: 'pointer', fontSize: 14 }} title="Delete Document">🗑️</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, marginBottom: 12 }}>Not uploaded</div>
                            )}
                            {!doc.readonly && (
                              <div style={{ marginTop: 12 }}>
                                {viewFiles[doc.key] && viewFiles[doc.key].length > 0 && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                                    {viewFiles[doc.key].map((f, i) => (
                                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontWeight: 600, color: '#0d1f3d' }}>
                                          {doc.label} {links.length + i + 1}
                                        </div>
                                        {f ? (
                                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 150, color: '#475569', fontSize: 11 }}>{f.name}</span>
                                            <span onClick={() => setViewFiles(prev => ({ ...prev, [doc.key]: prev[doc.key].filter((_, idx) => idx !== i) }))} style={{ cursor: 'pointer', color: '#dc2626', fontWeight: 900 }}>✕</span>
                                          </div>
                                        ) : (
                                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <label style={{ cursor: 'pointer', background: '#e0e7ff', color: '#4338ca', padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                                              Upload
                                              <input type="file" accept={doc.accept} style={{ display: 'none' }} onChange={e => {
                                                if (!e.target.files[0]) return;
                                                setViewFiles(prev => {
                                                  const newArr = [...(prev[doc.key] || [])];
                                                  newArr[i] = e.target.files[0];
                                                  return { ...prev, [doc.key]: newArr };
                                                });
                                              }} />
                                            </label>
                                            <span onClick={() => setViewFiles(prev => ({ ...prev, [doc.key]: prev[doc.key].filter((_, idx) => idx !== i) }))} style={{ cursor: 'pointer', color: '#dc2626', fontWeight: 900 }}>✕</span>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <button type="button" onClick={() => setViewFiles(prev => ({ ...prev, [doc.key]: [...(prev[doc.key] || []), null] }))}
                                  style={{ background: 'transparent', border: '1px dashed #9ca3af', color: '#475569', padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, width: '100%', cursor: 'pointer' }}>
                                  ➕ Add {doc.label}
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}

                    </div>
                    
                    <button onClick={handleUpdateFiles} disabled={uploading || ((viewFiles.noc || []).filter(Boolean).length === 0 && (viewFiles.middle_report || []).filter(Boolean).length === 0 && (viewFiles.final_report || []).filter(Boolean).length === 0)} 
                      className="dash-btn dash-btn-primary" style={{ width: '100%', marginTop: 16, padding: '10px' }}>
                      {uploading ? 'Uploading...' : 'Save Documents'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
