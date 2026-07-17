import React, { useState, useEffect, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { api } from '../../utils/api'
import PrintReceipt from '../../components/PrintReceipt'
import { MdPrint } from 'react-icons/md'

const fmt    = n => Number(parseFloat(n) || 0).toLocaleString('en-IN')
const fmtVal = n => { const v = parseFloat(n) || 0; if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }
const today  = new Date().toISOString().split('T')[0]
const monthStart = today.slice(0, 7) + '-01'

const SERVICE_ICONS = {
  'Card Withdrawal':       '💳',
  'Bill Pay + Withdrawal': '📄',
  'Money Transfer (DMT)':  '💸',
  'AEPS':                  '🏧',
  'Only Bill Payment':     '🧾',
}

const COLORS = ['#0d1f3d','#1a365d','#d4af37','#059669','#0ea5e9','#f59e0b','#8b5cf6','#ec4899']

function TxnDetailModal({ txn, onClose, showFinancials }) {
  if (!txn) return null
  const fields = [
    { label: 'Transaction ID',      value: `#${txn.id}` },
    { label: 'Date & Time',         value: new Date(txn.created_at).toLocaleString('en-IN') },
    { label: 'Employee',            value: txn.employee_name || '—' },
    { label: 'Branch',              value: txn.branch || '—' },
    { label: 'Customer',            value: txn.cust_name || '—' },
    { label: 'Customer PAN',        value: txn.cust_pan  || '—' },
    { label: 'Customer Mobile',     value: txn.cust_mobile || '—' },
    { label: 'Customer Aadhar',     value: txn.cust_aadhar || '—' },
    { label: 'Account No.',         value: txn.acc_no || '—' },
    { label: 'Customer Coins',      value: txn.customer_coins != null ? `🪙 ${txn.customer_coins}` : '—' },
    { label: 'Service',             value: txn.service_type || '—' },
    { label: 'Platform',            value: txn.platform || txn.bill_platform || '—' },
    { label: 'Bill Platform',       value: txn.bill_platform || '—' },
    { label: 'Bank',                value: txn.bank || '—' },
    { label: 'Card Type',           value: txn.card || '—' },
    { label: 'Card Bank',           value: txn.card_bank || '—' },
    { label: 'Card Last 4',         value: txn.card_last4 ? `****${txn.card_last4}` : '—' },
    { label: 'Payment Mode',        value: txn.payment_mode  || '—' },
    { label: 'Received Mode',       value: txn.received_mode || '—' },
    { label: 'Amount',              value: `₹${fmt(txn.amount)}`,                  color: '#059669' },
    { label: 'Charges %',           value: `${txn.charges_pct || 0}%`,               color: '#d97706' },
    { label: 'Charges ₹',           value: `₹${fmt(txn.charges_amount)}`,            color: '#d97706' },
    { label: 'Settled Amount',      value: `₹${fmt(txn.settled_amount)}` },
    ...(txn.service_type === 'Bill Pay + Withdrawal' ? [
      { label: 'Bill Amount',       value: `₹${fmt(txn.bill_amount || 0)}` },
      { label: 'Bill Remaining',    value: `₹${fmt(txn.bill_remaining || 0)}` },
      { label: 'Total Collected',   value: `₹${fmt(txn.total_collected || 0)}`, color: '#059669' },
    ] : []),
    ...(showFinancials ? [
      { label: 'Commission %',      value: `${txn.commission_pct || 0}%` },
      { label: 'Net Profit',        value: `₹${fmt(txn.profit)}`,                   color: '#0d1f3d' },
      { label: 'GST (18%)',         value: `₹${fmt(txn.gst ?? (parseFloat(txn.profit||0)*0.18))}`,                                     color: '#dc2626' },
      { label: 'Total Profit',      value: `₹${fmt(txn.profitWithGst ?? (parseFloat(txn.profit||0)*0.82).toFixed(2))}`, color: '#059669', bold: true },
    ] : []),
    ...(txn.is_edited ? [
      { label: 'Edited',            value: 'Yes', color: '#dc2626' },
      { label: 'Edited At',         value: txn.edited_at ? new Date(txn.edited_at).toLocaleString('en-IN') : '—', color: '#dc2626' },
    ] : []),
    { label: 'Note', value: txn.note || '—', full: true },
  ]

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:560, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.2)' }}>
        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#081427,#0d1f3d,#1a365d)', padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>Transaction Details</div>
            <div style={{ color:'#fff', fontWeight:900, fontSize:18, marginTop:2 }}>{SERVICE_ICONS[txn.service_type] || '📋'} {txn.service_type || 'Transaction'}</div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', width:32, height:32, borderRadius:'50%', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ overflowY:'auto', padding:24 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {fields.map(f => (
              <div key={f.label} style={{ background:'#f8fafc', borderRadius:10, padding:'10px 14px', ...(f.full ? { gridColumn: '1/-1' } : {}) }}>
                <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>{f.label}</div>
                <div style={{ fontSize:14, fontWeight: f.bold ? 800 : 700, color: f.color || '#081427', wordBreak:'break-all' }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Footer */}
        <div style={{ padding:'14px 24px', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end', flexShrink:0 }}>
          <button onClick={onClose} style={{ padding:'10px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#0d1f3d,#1a365d)', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14 }}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default function ReportView({ authHeader, showFinancials = true, branches = [], employees = [] }) {
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [from, setFrom]         = useState(monthStart)
  const [to, setTo]             = useState(today)
  const [branch, setBranch]     = useState('')
  const [empId, setEmpId]       = useState('')
  const [tab, setTab]           = useState('service')
  const [page, setPage]         = useState(1)
  const [selectedTxn, setSelectedTxn] = useState(null)
  const [printTxn, setPrintTxn]       = useState(null)

  const load = useCallback((p = page) => {
    setLoading(true)
    const params = new URLSearchParams({ from, to, page: p })
    if (branch) params.set('branch', branch)
    if (empId)  params.set('employee_id', empId)
    api(`/dashboard/reports?${params}`, { headers: authHeader() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [from, to, branch, empId, page, authHeader])

  useEffect(() => { load() }, [load])

  // Reset to page 1 when filters change
  const generate = () => { setPage(1); load(1) }

  const goPage = (p) => { setPage(p); load(p) }

  const txns            = data?.transactions    ?? []
  const totals          = data?.totals          ?? {}
  const platformSummary = data?.platformSummary ?? []
  const serviceSummary  = data?.serviceSummary  ?? []

  const activeRows = tab === 'service' ? serviceSummary : platformSummary
  const maxAmt     = Math.max(1, ...activeRows.map(r => r.amount))

  // ── Export Excel (all pages, all sheets) ──
  const exportExcel = async () => {
    setLoading(true)
    try {
      let allTxns = []
      let p = 1
      while (true) {
        const params = new URLSearchParams({ from, to, page: p })
        if (branch) params.set('branch', branch)
        if (empId)  params.set('employee_id', empId)
        const d = await api(`/dashboard/reports?${params}`, { headers: authHeader() })
        allTxns = allTxns.concat(d?.transactions ?? [])
        if (!d?.pagination?.hasNext) break
        p++
      }

      const txnRows = allTxns.map(t => ({
        'ID':                   t.id,
        'Date':                 new Date(t.created_at).toLocaleDateString('en-IN'),
        'Time':                 new Date(t.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        'Employee':             t.employee_name || '',
        'Branch':               t.branch || '',
        'Customer':             t.cust_name || '',
        'Customer PAN':         t.cust_pan || '',
        'Customer Mobile':      t.cust_mobile || '',
        'Customer Aadhar':      t.cust_aadhar || '',
        'Account No':           t.acc_no || '',
        'Customer Coins':       t.customer_coins ?? 0,
        'Service':              t.service_type || '',
        'Platform':             t.platform || '',
        'Bill Platform':        t.bill_platform || '',
        'Bank':                 t.bank || t.card_bank || '',
        'Card Type':            t.card || '',
        'Card Last4':           t.card_last4 ? `****${t.card_last4}` : '',
        'Payment Mode':         t.payment_mode || '',
        'Received Mode':        t.received_mode || '',
        'Amount (₹)':           parseFloat(t.amount) || 0,
        'Charges %':            t.charges_pct || 0,
        'Charges (₹)':          parseFloat(t.charges_amount) || 0,
        'Settled (₹)':          parseFloat(t.service_type === 'Bill Pay + Withdrawal' ? (t.total_collected || t.settled_amount || 0) : (t.settled_amount || 0)),
        'Bill Amount (₹)':      parseFloat(t.bill_amount) || 0,
        'Bill Remaining (₹)':   parseFloat(t.bill_remaining) || 0,
        'Total Collected (₹)':  parseFloat(t.total_collected) || 0,
        ...(showFinancials ? {
          'Net Profit (₹)':     parseFloat(t.profit) || 0,
          'GST 18% (₹)':        parseFloat((parseFloat(t.profit || 0) * 0.18).toFixed(2)),
          'Total Profit After GST (₹)': parseFloat((parseFloat(t.profit || 0) * 0.82).toFixed(2)),
        } : {}),
        'Note': t.note || '',
      }))

      const svcRows = serviceSummary.map(s => ({
        'Service':              s.name,
        'Transactions':         s.count,
        'Total Amount (₹)':     parseFloat(s.amount) || 0,
        'Settled (₹)':          parseFloat(s.settled) || 0,
        'Customer Charges (₹)': parseFloat(s.customer_charges) || 0,
        ...(showFinancials ? {
          'Platform Charges (₹)': parseFloat(s.platform_charges) || 0,
          'Commission (₹)':       parseFloat(s.commission) || 0,
        } : {}),
      }))

      const platRows = platformSummary.map(p => ({
        'Platform':         p.name,
        'Transactions':     p.count,
        'Total Amount (₹)': parseFloat(p.amount) || 0,
      }))

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(txnRows),  'Transactions')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(svcRows),  'Service Summary')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(platRows), 'Platform Summary')
      XLSX.writeFile(wb, `report_${from}_${to}.xlsx`)
    } finally {
      setLoading(false)
    }
  }

  // ── Export PDF ──
  const exportPDF = () => {
    const label = tab === 'service' ? 'Service' : 'Platform'
    const rows  = activeRows.map((r, i) =>
      `<tr>
        <td>${SERVICE_ICONS[r.name] || ''} ${r.name}</td>
        <td>${r.count}</td>
        <td>₹${fmt(r.amount)}</td>
        ${showFinancials ? `<td>₹${fmt(r.commission ?? r.profit ?? 0)}</td>` : ''}
      </tr>`
    ).join('')
    const html = `<html><head><title>${label} Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #081427; }
        h2   { color: #0d1f3d; }
        p    { color: #64748b; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 16px; }
        th { background: #0d1f3d; color: #fff; padding: 10px 14px; text-align: left; }
        td { padding: 9px 14px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) td { background: #f8fafc; }
        .summary { display: flex; gap: 20px; margin: 16px 0; }
        .s-box { background: #f0f2f8; border-radius: 8px; padding: 10px 18px; }
        .s-label { font-size: 11px; color: #64748b; text-transform: uppercase; }
        .s-val   { font-size: 20px; font-weight: 800; color: #0d1f3d; }
      </style></head><body>
      <h2>1 Step Finance Care — ${label}-wise Report</h2>
      <p>Period: ${from} → ${to}${branch ? ` · Branch: ${branch}` : ''}</p>
      <div class="summary">
        <div class="s-box"><div class="s-label">Transactions</div><div class="s-val">${fmt(totals.count ?? 0)}</div></div>
        <div class="s-box"><div class="s-label">Total Amount</div><div class="s-val">₹${fmt(totals.amount ?? 0)}</div></div>
        ${showFinancials ? `<div class="s-box"><div class="s-label">Commission</div><div class="s-val">₹${fmt(totals.profit ?? 0)}</div></div>` : ''}
      </div>
      <table><thead><tr>
        <th>${label}</th><th>Transactions</th><th>Amount</th>
        ${showFinancials ? '<th>Commission</th>' : ''}
      </tr></thead><tbody>${rows}</tbody></table>
      </body></html>`
    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => { w.print(); w.close() }, 400)
  }

  return (
    <div>
      {selectedTxn && <TxnDetailModal txn={selectedTxn} onClose={() => setSelectedTxn(null)} showFinancials={showFinancials} />}
      {printTxn   && <PrintReceipt txn={printTxn} onClose={() => setPrintTxn(null)} showFinancials={showFinancials} />}
      {/* ── Filters ── */}
      <div className="rv-filters">
        <div className="dash-form-group" style={{ margin: 0 }}>
          <label>From</label>
          <input type="date" value={from} max={to} onChange={e => setFrom(e.target.value)} />
        </div>
        <div className="dash-form-group" style={{ margin: 0 }}>
          <label>To</label>
          <input type="date" value={to} min={from} max={today} onChange={e => setTo(e.target.value)} />
        </div>
        {branches.length > 0 && (
          <div className="dash-form-group" style={{ margin: 0 }}>
            <label>Branch</label>
            <select value={branch} onChange={e => setBranch(e.target.value)}>
              <option value="">All Branches</option>
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        )}
        {employees.length > 0 && (
          <div className="dash-form-group" style={{ margin: 0 }}>
            <label>Employee</label>
            <select value={empId} onChange={e => setEmpId(e.target.value)}>
              <option value="">All Employees</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
        )}
        <button className="dash-btn dash-btn-primary" onClick={generate}>🔍 Generate</button>
        <button className="dash-btn" style={{ background: '#d1fae5', color: '#059669', border: 'none' }} onClick={exportExcel}>📊 Excel</button>
        <button className="dash-btn" style={{ background: '#fee2e2', color: '#dc2626', border: 'none' }} onClick={exportPDF}>📄 PDF</button>
      </div>

      {loading ? <div className="dash-loading">Loading...</div> : (
        <>
          {/* ── Summary Stats ── */}
          <div className="dash-stats" style={{ marginBottom: 20 }}>
            <div className="dash-stat">
              <div className="dash-stat-label">Total Transactions</div>
              <div className="dash-stat-value">{fmt(totals.count ?? 0)}</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-label">Total Amount</div>
              <div className="dash-stat-value" style={{ color: '#059669' }}>{fmtVal(totals.amount ?? 0)}</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-label">Customer Charges</div>
              <div className="dash-stat-value" style={{ color: '#d97706' }}>{fmtVal(totals.charges_amount ?? 0)}</div>
            </div>
            {showFinancials && (
              <>
                <div className="dash-stat">
                  <div className="dash-stat-label">Net Profit</div>
                  <div className="dash-stat-value" style={{ color: '#0d1f3d' }}>{fmtVal(totals.netProfit ?? totals.profit ?? 0)}</div>
                </div>
                <div className="dash-stat">
                  <div className="dash-stat-label">GST (18%)</div>
                  <div className="dash-stat-value" style={{ color: '#d97706' }}>{fmtVal(totals.gst ?? (parseFloat(totals.profit||0)*0.18))}</div>
                </div>
                <div className="dash-stat" style={{ background: 'linear-gradient(135deg,#ede9fe,#fce7f3)', border: '2px solid #0d1f3d' }}>
                  <div className="dash-stat-label" style={{ fontWeight: 800 }}>Total Profit</div>
                  <div className="dash-stat-value" style={{ color: '#059669', fontWeight: 900 }}>{fmtVal((parseFloat(totals.profit||0) - parseFloat(totals.profit||0)*0.18))}</div>
                </div>
              </>
            )}
          </div>

          {/* ── Tabs ── */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <button
              onClick={() => setTab('service')}
              className="dash-btn"
              style={{ background: tab === 'service' ? '#0d1f3d' : '#f1f5f9', color: tab === 'service' ? '#fff' : '#64748b', border: 'none', fontWeight: 700 }}
            >🔧 Service-wise</button>
            <button
              onClick={() => setTab('platform')}
              className="dash-btn"
              style={{ background: tab === 'platform' ? '#0d1f3d' : '#f1f5f9', color: tab === 'platform' ? '#fff' : '#64748b', border: 'none', fontWeight: 700 }}
            >📱 Platform-wise</button>
          </div>

          {/* ── Bar Chart ── */}
          {activeRows.length > 0 && (
            <div className="dash-card" style={{ marginBottom: 20 }}>
              <div className="dash-card-header">
                <h2>{tab === 'service' ? '🔧 Service' : '📱 Platform'}-wise Distribution</h2>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{from === to ? from : `${from} → ${to}`}</span>
              </div>
              <div style={{ padding: '16px 20px' }}>
                {activeRows.map((r, i) => {
                  const pct = Math.round((r.amount / maxAmt) * 100)
                  return (
                    <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 140, fontSize: 12, fontWeight: 700, color: '#081427', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 }}>
                        {SERVICE_ICONS[r.name] || ''} {r.name}
                      </div>
                      <div style={{ flex: 1, height: 26, background: '#f1f5f9', borderRadius: 8, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: COLORS[i % COLORS.length], borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, minWidth: 32, transition: 'width 0.8s ease' }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.9)' }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ width: 90, textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#081427' }}>{fmtVal(r.amount)}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.count} txns</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Service Cards ── */}
          {tab === 'service' && serviceSummary.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
              {serviceSummary.map((s, i) => (
                <div key={s.name} className="dash-card" style={{ marginBottom: 0, borderTop: `3px solid ${COLORS[i % COLORS.length]}` }}>
                  <div className="dash-card-header" style={{ background: 'linear-gradient(135deg, #f8f9fa, #f0f2f8)' }}>
                    <h2 style={{ fontSize: 14 }}>{SERVICE_ICONS[s.name] || '🔧'} {s.name}</h2>
                  </div>
                  <div className="dash-card-body" style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                      <Row label="No. of Trans"     value={s.count} />
                      <Row label="Total Amt"        value={`₹${fmt(s.amount)}`} color="#059669" />
                      <Row label="Settled Amt"      value={`₹${fmt(s.settled)}`} />
                      <Row label="Cust. Charges"    value={`₹${fmt(s.customer_charges)}`} color="#d97706" />
                      {showFinancials && <>
                        <Row label="Platform Charges" value={`₹${fmt(s.platform_charges)}`} color="#dc2626" />
                        <Row label="Commission"       value={`₹${fmt(s.commission)}`}       color="#0d1f3d" bold />
                      </>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Platform Table ── */}
          {tab === 'platform' && (
            <div className="dash-card" style={{ marginBottom: 20 }}>
              <div className="dash-card-header">
                <h2>📊 Platform Summary</h2>
              </div>
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Platform</th>
                      <th>Transactions</th>
                      <th>Total Amount</th>
                      <th>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platformSummary.map((p, i) => (
                      <tr key={p.name}>
                        <td><span style={{ background: COLORS[i % COLORS.length], color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{i + 1}</span></td>
                        <td><strong>{p.name}</strong></td>
                        <td>{p.count}</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>₹{fmt(p.amount)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 60, height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                              <div style={{ width: `${Math.round(p.amount / maxAmt * 100)}%`, height: '100%', background: COLORS[i % COLORS.length], borderRadius: 999 }} />
                            </div>
                            <span style={{ fontSize: 11, color: '#64748b' }}>{Math.round(p.amount / (totals.amount || 1) * 100)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {platformSummary.length > 0 && (
                      <tr style={{ background: '#f8f9fa', fontWeight: 800 }}>
                        <td colSpan={2}>Total</td>
                        <td>{platformSummary.reduce((s, p) => s + p.count, 0)}</td>
                        <td style={{ color: '#059669' }}>₹{fmt(platformSummary.reduce((s, p) => s + p.amount, 0))}</td>
                        <td>100%</td>
                      </tr>
                    )}
                    {!platformSummary.length && <tr><td colSpan={5} className="dash-empty">No data</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Transactions Table ── */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h2>📋 Transactions ({txns.length}{data?.pagination ? ` of ${data.pagination.total}` : ''})</h2>
              {data?.pagination && data.pagination.totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => goPage(page - 1)} disabled={!data.pagination.hasPrev}
                    style={{ padding: '4px 10px', borderRadius: 6, border: '1.5px solid #e2e8f0', background: data.pagination.hasPrev ? '#fff' : '#f8fafc', color: data.pagination.hasPrev ? '#0d1f3d' : '#cbd5e1', cursor: data.pagination.hasPrev ? 'pointer' : 'default', fontWeight: 700, fontSize: 13 }}>
                    ‹
                  </button>
                  {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => goPage(p)}
                      style={{ padding: '4px 10px', borderRadius: 6, border: '1.5px solid', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                        borderColor: p === page ? '#0d1f3d' : '#e2e8f0',
                        background:  p === page ? '#0d1f3d' : '#fff',
                        color:       p === page ? '#fff'    : '#64748b' }}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => goPage(page + 1)} disabled={!data.pagination.hasNext}
                    style={{ padding: '4px 10px', borderRadius: 6, border: '1.5px solid #e2e8f0', background: data.pagination.hasNext ? '#fff' : '#f8fafc', color: data.pagination.hasNext ? '#0d1f3d' : '#cbd5e1', cursor: data.pagination.hasNext ? 'pointer' : 'default', fontWeight: 700, fontSize: 13 }}>
                    ›
                  </button>
                  <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 4 }}>Page {page} of {data.pagination.totalPages}</span>
                </div>
              )}
            </div>
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    {showFinancials && <th>Employee</th>}
                    <th>Customer</th>
                    <th>PAN</th>
                    <th>Mobile</th>
                    <th>Coins</th>
                    <th>Service</th>
                    <th>Platform</th>
                    <th>W. Platform</th>
                    <th>Bank</th>
                    <th>Card</th>
                    <th>Acc No</th>
                    <th>Amount</th>
                    <th>Charges</th>
                    <th>Settled</th>
                    <th>Pay Mode</th>
                    <th>Recv Mode</th>
                    {showFinancials && <th>Net Profit</th>}
                    {showFinancials && <th>GST (18%)</th>}
                    {showFinancials && <th style={{ color: '#059669' }}>Total Profit</th>}
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {txns.map(t => (
                    <tr key={t.id} onClick={() => setSelectedTxn(t)}
                      style={{ cursor: 'pointer', backgroundColor: t.is_edited ? '#fef2f2' : '' }}
                      onMouseEnter={e => e.currentTarget.style.background = t.is_edited ? '#fee2e2' : '#f0f2f8'}
                      onMouseLeave={e => e.currentTarget.style.background = t.is_edited ? '#fef2f2' : ''}>
                      <td style={{ fontFamily: 'monospace', color: t.is_edited ? '#dc2626' : '#0d1f3d', fontWeight: 700, fontSize: 11 }}>#{t.id}{t.is_edited ? ' ✏️' : ''}</td>
                      <td style={{ fontSize: 12 }}>{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                      {showFinancials && <td style={{ fontSize: 12 }}>{t.employee_name || '—'}</td>}
                      <td><strong style={{ color: t.is_edited ? '#dc2626' : 'inherit' }}>{t.cust_name || '—'}</strong></td>
                      <td style={{ fontSize: 11, color: '#64748b' }}>{t.cust_pan || '—'}</td>
                      <td style={{ fontSize: 11 }}>{t.cust_mobile || '—'}</td>
                      <td style={{ color: '#d4af37', fontWeight: 700, fontSize: 12 }}>🪙 {t.customer_coins ?? 0}</td>
                      <td style={{ fontSize: 12 }}>{t.service_type || '—'}</td>
                      <td>{t.platform || '—'}</td>
                      <td style={{ fontSize: 11, color: '#64748b' }}>{t.bill_platform || '—'}</td>
                      <td style={{ fontSize: 11 }}>{t.bank || t.card_bank || '—'}</td>
                      <td style={{ fontSize: 11 }}>{t.card ? `${t.card}${t.card_last4 ? ` ****${t.card_last4}` : ''}` : '—'}</td>
                      <td style={{ fontSize: 11, color: '#64748b' }}>{t.acc_no || '—'}</td>
                      <td style={{ color: '#059669', fontWeight: 700 }}>₹{fmt(t.amount)}</td>
                      <td style={{ color: '#d97706' }}>₹{fmt(t.charges_amount || 0)}</td>
                      <td style={{ fontWeight: 600 }}>₹{fmt(t.service_type === 'Bill Pay + Withdrawal' ? (t.total_collected || t.settled_amount || 0) : (t.settled_amount || 0))}</td>
                      <td style={{ fontSize: 11 }}>{t.payment_mode || '—'}</td>
                      <td style={{ fontSize: 11 }}>{t.received_mode || '—'}</td>
                      {showFinancials && <td style={{ color: '#7c3aed', fontWeight: 700 }}>₹{fmt(parseFloat(t.profit||0).toFixed(2))}</td>}
                      {showFinancials && <td style={{ color: '#dc2626', fontWeight: 700 }}>₹{fmt((parseFloat(t.profit||0)*0.18).toFixed(2))}</td>}
                      {showFinancials && <td style={{ color: '#059669', fontWeight: 800 }}>₹{fmt((parseFloat(t.profit||0)*0.82).toFixed(2))}</td>}
                      <td onClick={e => e.stopPropagation()}>
                        <button onClick={() => setPrintTxn(t)}
                          style={{ background: 'linear-gradient(135deg,#0d1f3d,#1a365d)', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'inherit' }}>
                          <MdPrint size={13} /> Print
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!txns.length && <tr><td colSpan={showFinancials ? 21 : 15} className="dash-empty">No transactions found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Row({ label, value, color, bold }) {
  return (
    <div style={{ padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: bold ? 800 : 600, color: color || '#374151', marginTop: 2 }}>{value}</div>
    </div>
  )
}
