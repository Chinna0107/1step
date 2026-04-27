import React, { useState, useEffect, useCallback, useRef } from 'react'
import EmployeeNavbar from '../../components/employee/EmployeeNavbar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import { MdDownload, MdPictureAsPdf, MdTableChart, MdRefresh, MdFilterList } from 'react-icons/md'
import './EmployeeReports.css'

const auth   = () => ({ Authorization: `Bearer ${getTokenByRole('employee') || getTokenByRole('admin')}` })
const fmt    = n => Number(n).toLocaleString('en-IN')
const fmtVal = n => { const v = parseFloat(n); if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }
const today  = new Date().toISOString().split('T')[0]
const monthStart = today.slice(0, 7) + '-01'

const SERVICE_ICONS = {
  'Card Withdrawal':       '💳',
  'Bill Pay + Withdrawal': '📄',
  'Money Transfer (DMT)':  '💸',
  'AEPS':                  '🏧',
  'Only Bill Payment':     '🧾',
}

const COLORS = ['#402070','#c02040','#d4af37','#059669','#0ea5e9','#f59e0b','#8b5cf6','#ec4899']

// ── Txn Detail Modal ────────────────────────────────────────────────────
function TxnDetailModal({ txn, onClose }) {
  if (!txn) return null
  const fields = [
    { label: 'Transaction ID', value: `#${txn.id}` },
    { label: 'Date & Time',    value: new Date(txn.created_at).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' }) },
    { label: 'Customer',       value: txn.cust_name   || '—' },
    { label: 'Customer PAN',   value: txn.cust_pan    || '—' },
    { label: 'Customer Mobile',value: txn.cust_mobile || '—' },
    { label: 'Aadhar',         value: txn.cust_aadhar || '—' },
    { label: 'Service',        value: txn.service_type || '—' },
    { label: 'Platform',       value: txn.platform || txn.bill_platform || '—' },
    { label: 'Bank',           value: txn.bank || '—' },
    { label: 'Card Type',      value: txn.card || '—' },
    { label: 'Card Bank',      value: txn.card_bank || '—' },
    { label: 'Card Last 4',    value: txn.card_last4 || '—' },
    { label: 'Account No.',    value: txn.acc_no || '—' },
    { label: 'Amount',         value: `₹${fmt(txn.amount)}`,         color: '#059669' },
    { label: 'Charges %',      value: `${txn.charges_pct || 0}%`,      color: '#d97706' },
    { label: 'Charges ₹',      value: `₹${fmt(txn.charges_amount || 0)}`, color: '#d97706' },
    { label: 'Settled Amount', value: `₹${fmt(txn.settled_amount || 0)}` },
    ...(txn.service_type === 'Bill Pay + Withdrawal' ? [
      { label: 'Bill Platform',  value: txn.bill_platform || '—' },
      { label: 'Bill Amount',    value: `₹${fmt(txn.bill_amount || 0)}` },
      { label: 'Bill Remaining', value: `₹${fmt(txn.bill_remaining || 0)}` },
      { label: 'Total Collected',value: `₹${fmt(txn.total_collected || 0)}`, color: '#059669' },
      { label: 'Receive Mode',   value: txn.received_mode || '—' },
    ] : []),
    { label: 'Payment Mode',   value: txn.payment_mode  || '—' },
    { label: 'Note',           value: txn.note || '—' },
  ]
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:540, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.2)' }}>
        <div style={{ background:'linear-gradient(135deg,#1a0a2e,#402070,#c02040)', padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>Transaction Details</div>
            <div style={{ color:'#fff', fontWeight:900, fontSize:18, marginTop:2 }}>{SERVICE_ICONS[txn.service_type] || '📋'} {txn.service_type || 'Transaction'}</div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', width:32, height:32, borderRadius:'50%', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        <div style={{ overflowY:'auto', padding:24 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {fields.map(f => (
              <div key={f.label} style={{ background:'#f8fafc', borderRadius:10, padding:'10px 14px' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>{f.label}</div>
                <div style={{ fontSize:14, fontWeight:700, color: f.color || '#1a0a2e', wordBreak:'break-all' }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding:'14px 24px', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end', flexShrink:0 }}>
          <button onClick={onClose} style={{ padding:'10px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#402070,#c02040)', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14 }}>Close</button>
        </div>
      </div>
    </div>
  )
}

// ── Group Txns Modal (clicking count badge) ───────────────────────────
function GroupTxnsModal({ label, name, txns, onClose, onViewTxn }) {
  if (!txns) return null
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:680, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.2)' }}>
        <div style={{ background:'linear-gradient(135deg,#1a0a2e,#402070,#c02040)', padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>{label} Transactions</div>
            <div style={{ color:'#fff', fontWeight:900, fontSize:18, marginTop:2 }}>{SERVICE_ICONS[name] || '📋'} {name} · {txns.length} records</div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', width:32, height:32, borderRadius:'50%', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        <div style={{ overflowY:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'#f8fafc', position:'sticky', top:0 }}>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:0.4, borderBottom:'1px solid #e2e8f0' }}>#</th>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:0.4, borderBottom:'1px solid #e2e8f0' }}>Date</th>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:0.4, borderBottom:'1px solid #e2e8f0' }}>Customer</th>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:0.4, borderBottom:'1px solid #e2e8f0' }}>Amount</th>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:0.4, borderBottom:'1px solid #e2e8f0' }}>Settled</th>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:0.4, borderBottom:'1px solid #e2e8f0' }}>View</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t, i) => (
                <tr key={t.id} style={{ borderBottom:'1px solid #f1f5f9', transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='#faf5ff'}
                  onMouseLeave={e => e.currentTarget.style.background=''}>
                  <td style={{ padding:'11px 16px', color:'#94a3b8', fontSize:12 }}>{i+1}</td>
                  <td style={{ padding:'11px 16px', fontSize:11, whiteSpace:'nowrap' }}>
                    <div>{new Date(t.created_at).toLocaleDateString('en-IN')}</div>
                    <div style={{ color:'#9ca3af' }}>{new Date(t.created_at).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}</div>
                  </td>
                  <td style={{ padding:'11px 16px', fontWeight:700, color:'#1a0a2e' }}>
                    {t.cust_name || '—'}
                    <div style={{ fontSize:11, color:'#9ca3af', fontWeight:400 }}>{t.cust_pan || ''}</div>
                  </td>
                  <td style={{ padding:'11px 16px', color:'#059669', fontWeight:700 }}>₹{fmt(t.amount)}</td>
                  <td style={{ padding:'11px 16px', color:'#402070', fontWeight:700 }}>₹{fmt(t.settled_amount || 0)}</td>
                  <td style={{ padding:'11px 16px' }}>
                    <button onClick={() => onViewTxn(t)}
                      style={{ background:'#ede9fe', border:'none', color:'#402070', borderRadius:6, padding:'4px 12px', cursor:'pointer', fontSize:12, fontWeight:700 }}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding:'14px 24px', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end', flexShrink:0 }}>
          <button onClick={onClose} style={{ padding:'10px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#402070,#c02040)', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14 }}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default function EmployeeReports() {
  const [data, setData]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [from, setFrom]               = useState(monthStart)
  const [to, setTo]                   = useState(today)
  const [tab, setTab]                 = useState('service')
  const [selectedTxn, setSelectedTxn] = useState(null)
  const [groupTxns, setGroupTxns]     = useState(null)
  const [search, setSearch]           = useState('')
  const [svcFilter, setSvcFilter]     = useState('')
  const printRef                      = useRef()

  const load = useCallback(() => {
    setLoading(true)
    const p = new URLSearchParams({ from, to })
    api(`/dashboard/reports?${p}`, { headers: auth() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [from, to])

  useEffect(() => { load() }, [load])

  const txns            = data?.transactions    ?? []
  const totals          = data?.totals          ?? {}
  const platformSummary = data?.platformSummary ?? []
  const serviceSummary  = data?.serviceSummary  ?? []

  // filtered txns for the Transactions tab
  const filteredTxns = txns.filter(t => {
    const matchSvc    = !svcFilter || t.service_type === svcFilter
    const q           = search.toLowerCase()
    const matchSearch = !search || t.cust_name?.toLowerCase().includes(q) || t.cust_pan?.toLowerCase().includes(q) || t.cust_mobile?.includes(search) || t.platform?.toLowerCase().includes(q)
    return matchSvc && matchSearch
  })

  const serviceOptions = [...new Set(txns.map(t => t.service_type).filter(Boolean))]

  const serviceRows  = serviceSummary.map(s => ({ name: s.name, count: s.count, amount: s.amount, profit: s.commission ?? 0 }))
  const platformRows = platformSummary.map(p => ({ name: p.name, count: p.count, amount: p.amount, profit: 0 }))

  const maxSvcAmt = Math.max(1, ...serviceRows.map(r => r.amount))
  const maxPltAmt = Math.max(1, ...platformRows.map(r => r.amount))

  const activeRows = tab === 'service' ? serviceRows : platformRows
  const maxAmt     = tab === 'service' ? maxSvcAmt   : maxPltAmt

  const exportExcel = () => {
    if (tab === 'txns') {
      if (!filteredTxns.length) return
      const header = 'Date,Time,Customer,PAN,Mobile,Service,Platform,Bank,Card,Amount,Charges%,Charges,Settled,Mode,Note'
      const rows   = filteredTxns.map(t => [
        new Date(t.created_at).toLocaleDateString('en-IN'),
        new Date(t.created_at).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }),
        t.cust_name || '', t.cust_pan || '', t.cust_mobile || '',
        t.service_type || '', t.platform || t.bill_platform || '',
        t.bank || '', t.card || '',
        t.amount, t.charges_pct || 0, t.charges_amount || 0, t.settled_amount || 0,
        t.payment_mode || '', t.note || ''
      ].join(','))
      const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' })
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `transactions_${from}_${to}.csv`; a.click()
      return
    }
    if (!activeRows.length) return
    const label = tab === 'service' ? 'Service' : 'Platform'
    const header = `${label},Transactions,Total Amount,Total Profit`
    const rows   = activeRows.map(r => `${r.name},${r.count},${r.amount.toFixed(2)},${r.profit.toFixed(2)}`)
    const blob   = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' })
    const a      = document.createElement('a')
    a.href       = URL.createObjectURL(blob)
    a.download   = `${tab}_report_${from}_${to}.csv`
    a.click()
  }

  const exportPDF = () => {
    if (tab === 'txns') {
      const rows = filteredTxns.map(t =>
        `<tr><td>${new Date(t.created_at).toLocaleDateString('en-IN')} ${new Date(t.created_at).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</td><td>${t.cust_name||''}</td><td>${t.cust_pan||''}</td><td>${t.service_type||''}</td><td>${t.platform||t.bill_platform||''}</td><td>₹${fmt(t.amount)}</td><td>₹${fmt(t.charges_amount||0)}</td><td>₹${fmt(t.settled_amount||0)}</td></tr>`
      ).join('')
      const html = `<html><head><title>Transactions</title><style>body{font-family:Arial;padding:24px;color:#1a0a2e}h2{color:#402070}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#402070;color:#fff;padding:8px 12px;text-align:left}td{padding:7px 12px;border-bottom:1px solid #e2e8f0}tr:nth-child(even)td{background:#f8fafc}</style></head><body><h2>MoneySpot — All Transactions</h2><p>Period: ${from} to ${to} · ${filteredTxns.length} records</p><table><thead><tr><th>Date & Time</th><th>Customer</th><th>PAN</th><th>Service</th><th>Platform</th><th>Amount</th><th>Charges</th><th>Settled</th></tr></thead><tbody>${rows}</tbody></table></body></html>`
      const w = window.open('', '_blank'); w.document.write(html); w.document.close(); w.focus(); setTimeout(() => { w.print(); w.close() }, 400)
      return
    }
    const label = tab === 'service' ? 'Service' : 'Platform'
    const rows  = activeRows.map(r =>
      `<tr><td>${r.name}</td><td>${r.count}</td><td>₹${fmt(r.amount)}</td><td>₹${fmt(r.profit)}</td></tr>`
    ).join('')
    const html = `
      <html><head><title>${label} Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #1a0a2e; }
        h2   { color: #402070; margin-bottom: 4px; }
        p    { color: #64748b; font-size: 13px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #402070; color: #fff; padding: 10px 14px; text-align: left; }
        td { padding: 9px 14px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) td { background: #f8fafc; }
        .summary { display: flex; gap: 24px; margin-bottom: 20px; }
        .s-box { background: #f0f2f8; border-radius: 8px; padding: 12px 20px; }
        .s-label { font-size: 11px; color: #64748b; text-transform: uppercase; }
        .s-val   { font-size: 20px; font-weight: 800; color: #402070; }
      </style></head><body>
      <h2>MoneySpot — ${label}-wise Report</h2>
      <p>Period: ${from} to ${to}</p>
      <div class="summary">
        <div class="s-box"><div class="s-label">Total Transactions</div><div class="s-val">${fmt(totals.count ?? 0)}</div></div>
        <div class="s-box"><div class="s-label">Total Value</div><div class="s-val">₹${fmt(totals.amount ?? 0)}</div></div>
        <div class="s-box"><div class="s-label">Total Charges</div><div class="s-val">₹${fmt(totals.charges ?? 0)}</div></div>
      </div>
      <table><thead><tr><th>${label}</th><th>Transactions</th><th>Total Amount</th><th>Total Charges</th></tr></thead>
      <tbody>${rows}</tbody></table>
      </body></html>`
    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => { w.print(); w.close() }, 400)
  }

  return (
    <div className="er-page">
      {selectedTxn && <TxnDetailModal txn={selectedTxn} onClose={() => setSelectedTxn(null)} />}
      {groupTxns  && <GroupTxnsModal label={groupTxns.label} name={groupTxns.name} txns={groupTxns.txns}
        onClose={() => setGroupTxns(null)}
        onViewTxn={t => { setGroupTxns(null); setSelectedTxn(t) }} />}
      <EmployeeNavbar />
      <div className="er-content">

        {/* ── Header ── */}
        <div className="er-header">
          <div className="er-header-bg" />
          <div className="er-header-inner">
            <div>
              <div className="er-header-label">My Reports</div>
              <h1 className="er-header-title">Transaction Analytics</h1>
              <div className="er-header-sub">Service-wise & Platform-wise breakdown</div>
            </div>
            <div className="er-header-actions">
              <button className="er-btn er-btn-ghost" onClick={load}><MdRefresh size={16} /> Refresh</button>
              <button className="er-btn er-btn-excel" onClick={exportExcel}><MdTableChart size={16} /> Excel</button>
              <button className="er-btn er-btn-pdf"   onClick={exportPDF}><MdPictureAsPdf size={16} /> PDF</button>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="er-filters">
          <div className="er-filter-icon"><MdFilterList size={18} /></div>
          <div className="er-filter-group">
            <label>From</label>
            <input type="date" value={from} max={to} onChange={e => setFrom(e.target.value)} />
          </div>
          <div className="er-filter-group">
            <label>To</label>
            <input type="date" value={to} min={from} max={today} onChange={e => setTo(e.target.value)} />
          </div>
          <button className="er-btn er-btn-primary" onClick={load}>Generate</button>
        </div>

        {/* ── Summary Cards ── */}
        <div className="er-summary">
          {[
            { label: 'Total Transactions', value: fmt(totals.count ?? 0),    color: '#402070', icon: '📊' },
            { label: 'Total Value',        value: fmtVal(totals.amount ?? 0), color: '#059669', icon: '💰' },
            { label: 'Total Charges',       value: fmtVal(totals.profit ?? 0), color: '#d4af37', icon: '📈' },
            { label: 'Services Used',      value: serviceRows.length,         color: '#c02040', icon: '🔧' },
            { label: 'Platforms Used',     value: platformRows.length,        color: '#0ea5e9', icon: '📱' },
          ].map(c => (
            <div key={c.label} className="er-sum-card" style={{ '--c': c.color }}>
              <div className="er-sum-icon">{c.icon}</div>
              <div className="er-sum-val">{loading ? '—' : c.value}</div>
              <div className="er-sum-label">{c.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="er-tabs">
          <button className={`er-tab ${tab === 'service'  ? 'active' : ''}`} onClick={() => setTab('service')}>🔧 Service-wise</button>
          <button className={`er-tab ${tab === 'platform' ? 'active' : ''}`} onClick={() => setTab('platform')}>📱 Platform-wise</button>
          <button className={`er-tab ${tab === 'txns'     ? 'active' : ''}`} onClick={() => setTab('txns')}>📋 Transactions</button>
          <div className="er-tab-actions">
            <button className="er-btn er-btn-sm er-btn-excel" onClick={exportExcel}><MdDownload size={14} /> Excel</button>
            <button className="er-btn er-btn-sm er-btn-pdf"   onClick={exportPDF}><MdDownload size={14} /> PDF</button>
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="er-skeleton-wrap">
            {[1,2,3,4].map(i => <div key={i} className="er-skel" style={{ animationDelay: `${i*80}ms` }} />)}
          </div>
        ) : tab === 'txns' ? (
          txns.length === 0 ? (
            <div className="er-empty">
              <div className="er-empty-icon">💭</div>
              <div>No transactions found for this period</div>
            </div>
          ) : (
            <div className="er-table-card">
              <div className="er-table-header">
                <h2>📋 All Transactions ({filteredTxns.length}{filteredTxns.length !== txns.length ? ` of ${txns.length}` : ''})</h2>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="er-btn er-btn-sm er-btn-excel" onClick={exportExcel}><MdTableChart size={13} /> Excel</button>
                  <button className="er-btn er-btn-sm er-btn-pdf"   onClick={exportPDF}><MdPictureAsPdf size={13} /> PDF</button>
                </div>
              </div>
              <div style={{ padding:'12px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', gap:10, flexWrap:'wrap', alignItems:'center', background:'#fafbff' }}>
                <div style={{ position:'relative', flex:1, minWidth:180 }}>
                  <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', fontSize:14 }}>🔍</span>
                  <input placeholder="Search customer, PAN, mobile, platform..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    style={{ width:'100%', padding:'8px 12px 8px 32px', borderRadius:8, border:'1.5px solid #e2e8f0', fontSize:13, fontFamily:'inherit', boxSizing:'border-box', outline:'none' }}
                    onFocus={e => e.target.style.borderColor='#402070'}
                    onBlur={e => e.target.style.borderColor='#e2e8f0'} />
                </div>
                <select value={svcFilter} onChange={e => setSvcFilter(e.target.value)}
                  style={{ padding:'8px 12px', borderRadius:8, border:'1.5px solid #e2e8f0', fontSize:13, fontFamily:'inherit', color:'#374151', background:'#fff', cursor:'pointer', outline:'none' }}>
                  <option value="">All Services</option>
                  {serviceOptions.map(s => <option key={s} value={s}>{SERVICE_ICONS[s] || ''} {s}</option>)}
                </select>
                {(search || svcFilter) && (
                  <button onClick={() => { setSearch(''); setSvcFilter('') }}
                    style={{ padding:'8px 14px', borderRadius:8, border:'1.5px solid #fee2e2', background:'#fee2e2', color:'#dc2626', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                    ✕ Clear
                  </button>
                )}
              </div>
              <div className="er-table-wrap">
                {filteredTxns.length === 0 ? (
                  <div className="er-empty" style={{ padding:'32px 20px' }}>
                    <div className="er-empty-icon">🔍</div>
                    <div>No transactions match your filters</div>
                  </div>
                ) : (
                  <table className="er-table">
                    <thead>
                      <tr><th>#</th><th>Date &amp; Time</th><th>Customer</th><th>Service</th><th>Platform</th><th>Amount</th><th>Charges</th><th>Settled</th></tr>
                    </thead>
                    <tbody>
                      {filteredTxns.map((t, i) => (
                        <tr key={t.id} className="er-tr" onClick={() => setSelectedTxn(t)}
                          style={{ cursor:'pointer', animationDelay:`${i*30}ms` }}
                          onMouseEnter={e => e.currentTarget.style.background='#f0f2f8'}
                          onMouseLeave={e => e.currentTarget.style.background=''}>
                          <td><span className="er-rank" style={{ background: COLORS[i % COLORS.length] }}>{i+1}</span></td>
                          <td style={{ fontSize:11, whiteSpace:'nowrap' }}>
                            <div>{new Date(t.created_at).toLocaleDateString('en-IN')}</div>
                            <div style={{ color:'#9ca3af' }}>{new Date(t.created_at).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}</div>
                          </td>
                          <td><strong>{t.cust_name || '—'}</strong><div style={{ fontSize:11, color:'#9ca3af' }}>{t.cust_pan || ''}</div></td>
                          <td style={{ fontSize:12 }}>{SERVICE_ICONS[t.service_type] || ''} {t.service_type || '—'}</td>
                          <td>{t.platform || t.bill_platform || '—'}</td>
                          <td><span className="er-amt">₹{fmt(t.amount)}</span></td>
                          <td style={{ color:'#d97706', fontWeight:700 }}>₹{fmt(t.charges_amount || 0)}</td>
                          <td style={{ fontWeight:600 }}>₹{fmt(t.settled_amount || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )
        ) : activeRows.length === 0 ? (
          <div className="er-empty">
            <div className="er-empty-icon">📭</div>
            <div>No transactions found for this period</div>
          </div>
        ) : (
          <>
            {/* Bar Chart */}
            <div className="er-chart-card">
              <div className="er-chart-header">
                <h2>{tab === 'service' ? 'Service' : 'Platform'}-wise Amount Distribution</h2>
                <span className="er-chart-badge">{activeRows.length} {tab === 'service' ? 'services' : 'platforms'}</span>
              </div>
              <div className="er-chart-body">
                {activeRows.map((r, i) => {
                  const pct = Math.round((r.amount / maxAmt) * 100)
                  return (
                    <div key={r.name} className="er-bar-row" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="er-bar-label">{r.name}</div>
                      <div className="er-bar-track">
                        <div className="er-bar-fill" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}>
                          <span className="er-bar-pct">{pct}%</span>
                        </div>
                      </div>
                      <div className="er-bar-meta">
                        <span className="er-bar-amt">{fmtVal(r.amount)}</span>
                        <span className="er-bar-cnt">{r.count} txns</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Breakdown cards */}
            <div className="er-breakdown-grid">
              {activeRows.map((r, i) => (
                <div key={r.name} className="er-breakdown-card" style={{ '--bc': COLORS[i % COLORS.length] }}>
                  <div className="er-bc-accent" />
                  <div className="er-bc-name">{r.name}</div>
                  <div className="er-bc-stats">
                    <div>
                      <div className="er-bc-val">₹{fmt(r.amount)}</div>
                      <div className="er-bc-lbl">Amount</div>
                    </div>
                    <div>
                      <div className="er-bc-val er-bc-profit">₹{fmt(r.profit)}</div>
                      <div className="er-bc-lbl">Profit</div>
                    </div>
                    <div>
                      <div className="er-bc-val er-bc-count">{r.count}</div>
                      <div className="er-bc-lbl">Txns</div>
                    </div>
                  </div>
                  <div className="er-bc-bar">
                    <div className="er-bc-bar-fill" style={{ width: `${Math.round(r.amount / maxAmt * 100)}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Table */}
            <div className="er-table-card">
              <div className="er-table-header">
                <h2>Detailed {tab === 'service' ? 'Service' : 'Platform'} Breakdown</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="er-btn er-btn-sm er-btn-excel" onClick={exportExcel}><MdTableChart size={13} /> Excel</button>
                  <button className="er-btn er-btn-sm er-btn-pdf"   onClick={exportPDF}><MdPictureAsPdf size={13} /> PDF</button>
                </div>
              </div>
              <div className="er-table-wrap">
                <table className="er-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{tab === 'service' ? 'Service' : 'Platform'}</th>
                      <th>Transactions</th>
                      <th>Total Amount</th>
                      <th>Total Charges</th>
                      <th>Avg Amount</th>
                      <th>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRows.map((r, i) => (
                      <tr key={r.name} className="er-tr" style={{ animationDelay: `${i * 40}ms` }}>
                        <td><span className="er-rank" style={{ background: COLORS[i % COLORS.length] }}>{i + 1}</span></td>
                        <td><strong>{r.name}</strong></td>
                        <td>
                          <span
                            className="er-tag"
                            title="Click to view transactions"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              const filtered = txns.filter(t =>
                                tab === 'service'
                                  ? t.service_type === r.name
                                  : (t.platform || t.bill_platform) === r.name
                              )
                              setGroupTxns({ label: tab === 'service' ? 'Service' : 'Platform', name: r.name, txns: filtered })
                            }}
                          >
                            {r.count}
                          </span>
                        </td>
                        <td><span className="er-amt">₹{fmt(r.amount)}</span></td>
                        <td><span className="er-profit">₹{fmt(r.profit)}</span></td>
                        <td style={{ color: '#64748b' }}>₹{fmt(Math.round(r.amount / r.count))}</td>
                        <td>
                          <div className="er-share-bar">
                            <div className="er-share-fill" style={{ width: `${Math.round(r.amount / maxAmt * 100)}%`, background: COLORS[i % COLORS.length] }} />
                            <span className="er-share-pct">{Math.round(r.amount / (totals.amount || 1) * 100)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
