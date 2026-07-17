import React, { useState } from 'react'
import * as XLSX from 'xlsx'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useAdminTransactions } from '../../hooks/useFinance'
import { MdPrint, MdFilterList, MdRefresh, MdFileDownload } from 'react-icons/md'
import PrintReceipt from '../../components/PrintReceipt'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import '../../pages/dashboard.css'

const fmt    = n => Number(parseFloat(n) || 0).toLocaleString('en-IN')
const fmtVal = n => { const v = parseFloat(n); if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }
const today  = new Date().toISOString().split('T')[0]

const BILL_WITHDRAWAL = 'Bill Pay + Withdrawal'

const buildExcelRows = (txns) => txns.map(t => ({
  'ID':               t.id,
  'Date':             new Date(t.created_at).toLocaleDateString('en-IN'),
  'Time':             new Date(t.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  'Employee':         t.employee_name || '',
  'Branch':           t.branch || '',
  'Customer':         t.cust_name || '',
  'Customer PAN':     t.cust_pan || '',
  'Customer Mobile':  t.cust_mobile || '',
  'Customer Aadhar':  t.cust_aadhar || '',
  'Account No':       t.acc_no || '',
  'Customer Coins':   t.customer_coins ?? 0,
  'Service':          t.service_type || '',
  'Platform':         t.platform || '',
  'Bill Platform':    t.bill_platform || '',
  'Bank':             t.bank || t.card_bank || '',
  'Card Type':        t.card || '',
  'Card Last4':       t.card_last4 ? `****${t.card_last4}` : '',
  'Payment Mode':     t.payment_mode || '',
  'Received Mode':    t.received_mode || '',
  'Amount (₹)':       parseFloat(t.amount) || 0,
  'Charges %':        t.charges_pct || 0,
  'Charges (₹)':      parseFloat(t.charges_amount) || 0,
  'Settled (₹)':      parseFloat(t.service_type === BILL_WITHDRAWAL ? (t.total_collected || t.settled_amount || 0) : (t.settled_amount || 0)),
  'Bill Amount (₹)':  parseFloat(t.bill_amount) || 0,
  'Bill Remaining (₹)': parseFloat(t.bill_remaining) || 0,
  'Total Collected (₹)': parseFloat(t.total_collected) || 0,
  'Net Profit (₹)':   parseFloat(t.profit) || 0,
  'GST 18% (₹)':      parseFloat((parseFloat(t.profit || 0) * 0.18).toFixed(2)),
  'Total Profit After GST (₹)': parseFloat((parseFloat(t.profit || 0) * 0.82).toFixed(2)),
  'Note':             t.note || '',
}))

const exportAllToExcel = async (from, to) => {
  const token = getTokenByRole('admin')
  let allTxns = []
  let page = 1
  while (true) {
    const p = new URLSearchParams({ from, to, page: page.toString() })
    const data = await api(`/dashboard/reports?${p}`, { headers: { Authorization: `Bearer ${token}` } })
    allTxns = allTxns.concat(data?.transactions ?? [])
    if (!data?.pagination?.hasNext) break
    page++
  }
  if (!allTxns.length) { alert('No transactions to export'); return }
  const ws = XLSX.utils.json_to_sheet(buildExcelRows(allTxns))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions')
  XLSX.writeFile(wb, `transactions_${from}_to_${to}.xlsx`)
}

function TxnDetailModal({ txn, onClose }) {
  const fields = [
    { label: 'Transaction ID',  value: `#${txn.id}` },
    { label: 'Date & Time',     value: new Date(txn.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) },
    { label: 'Employee',        value: txn.employee_name || '—' },
    { label: 'Branch',          value: txn.branch || '—' },
    { label: 'Customer',        value: txn.cust_name || '—' },
    { label: 'Customer PAN',    value: txn.cust_pan || '—' },
    { label: 'Customer Mobile', value: txn.cust_mobile || '—' },
    { label: 'Customer Aadhar', value: txn.cust_aadhar || '—' },
    { label: 'Service',         value: txn.service_type || '—' },
    { label: 'Platform',        value: txn.platform || txn.bill_platform || '—' },
    { label: 'Bank',            value: txn.bank || '—' },
    { label: 'Card Type',       value: txn.card || '—' },
    { label: 'Card Bank',       value: txn.card_bank || '—' },
    { label: 'Card Last 4',     value: txn.card_last4 ? `****${txn.card_last4}` : '—' },
    { label: 'Account No.',     value: txn.acc_no || '—' },
    { label: 'Payment Mode',    value: txn.payment_mode || '—' },
    { label: 'Receive Mode',    value: txn.received_mode || '—' },
    { label: 'Amount',          value: `₹${fmt(txn.amount)}`,              color: '#059669' },
    { label: 'Charges %',       value: `${txn.charges_pct || 0}%`,          color: '#d97706' },
    { label: 'Charges ₹',       value: `₹${fmt(txn.charges_amount || 0)}`,  color: '#d97706' },
    { label: 'Settled Amount',  value: `₹${fmt(txn.service_type === 'Bill Pay + Withdrawal' ? (txn.total_collected || txn.settled_amount || 0) : (txn.settled_amount || 0))}`,  color: '#0d1f3d' },
    { label: 'Net Profit',      value: `₹${fmt(txn.profit || 0)}`,          color: '#7c3aed' },
    ...(txn.service_type === BILL_WITHDRAWAL ? [
      { label: 'Bill Platform',   value: txn.bill_platform || '—' },
      { label: 'Bill Amount',     value: `₹${fmt(txn.bill_amount || 0)}` },
      { label: 'Bill Remaining',  value: `₹${fmt(txn.bill_remaining || 0)}` },
      { label: 'Total Collected', value: `₹${fmt(txn.total_collected || 0)}`, color: '#059669' },
    ] : []),
    { label: 'Note', value: txn.note || '—', full: true },
  ]

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 580, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#081427,#0d1f3d,#1a365d)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Transaction Details</div>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 18, marginTop: 2 }}>#{txn.id} · {txn.service_type || 'Transaction'}</div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 }}>
              {new Date(txn.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {fields.map(f => (
              <div key={f.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', ...(f.full ? { gridColumn: '1/-1' } : {}) }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: f.color || '#081427', wordBreak: 'break-all' }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, justifyContent: 'flex-end', flexShrink: 0 }}>
          {txn.cust_mobile && (
            <a href={`https://wa.me/${txn.cust_mobile.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${txn.cust_name}, your ${txn.service_type} of ₹${fmt(txn.amount)} processed. Settled: ₹${fmt(txn.settled_amount || 0)}. - 1 Step Finance Care`)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ padding: '10px 18px', borderRadius: 10, background: '#25D366', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              💬 WhatsApp
            </a>
          )}
          <button onClick={onClose} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0d1f3d,#1a365d)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminTransactions() {
  const [from, setFrom]         = useState(today)
  const [to, setTo]             = useState(today)
  const [page, setPage]         = useState(1)
  const [printTxn, setPrintTxn] = useState(null)
  const [viewTxn, setViewTxn]   = useState(null)

  const { transactions: txns, totals, pagination, loading, refetch } = useAdminTransactions(from, to, page)

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <h1>Transaction Management</h1>
          <div className="dash-topbar-right">
            <button className="dash-btn" style={{ background: '#f0f2f8', color: '#0d1f3d', border: 'none', padding: '7px 14px' }} onClick={refetch}><MdRefresh /></button>
            <button className="dash-btn" style={{ background: '#d1fae5', color: '#059669', border: 'none', padding: '7px 14px', display:'flex', alignItems:'center', gap:4, fontWeight:700, fontSize:12 }}
              onClick={() => exportAllToExcel(from, to)}>
              <MdFileDownload size={15} /> Excel
            </button>
            <span className="dash-badge">{loading ? '...' : `Page ${page} of ${pagination?.totalPages || 1}`} Records</span>
          </div>
        </div>

        <div className="dash-main">

          {/* Summary */}
          <div className="dash-stats">
            <div className="dash-stat"><div className="dash-stat-label">Total Transactions</div><div className="dash-stat-value">{loading ? '—' : fmt(totals.count ?? 0)}</div></div>
            <div className="dash-stat"><div className="dash-stat-label">Total Value</div><div className="dash-stat-value" style={{ color: '#059669' }}>{loading ? '—' : fmtVal(totals.amount ?? 0)}</div></div>
            <div className="dash-stat"><div className="dash-stat-label">Total Profit</div><div className="dash-stat-value" style={{ color: '#d4af37' }}>{loading ? '—' : fmtVal(totals.profit ?? 0)}</div></div>
          </div>

          {/* Filters */}
          <div className="dash-card">
            <div className="dash-card-body" style={{ padding: '16px 22px' }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div className="dash-form-group">
                  <label>From Date</label>
                  <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
                </div>
                <div className="dash-form-group">
                  <label>To Date</label>
                  <input type="date" value={to} onChange={e => setTo(e.target.value)} />
                </div>
                <button className="dash-btn dash-btn-primary" onClick={() => { setPage(1); refetch() }}><MdFilterList /> Filter</button>
                <button className="dash-btn" style={{ background: '#f0f2f8', color: '#666', border: 'none' }}
                  onClick={() => { setFrom(today); setTo(today); setPage(1); setTimeout(refetch, 0) }}>Today</button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h2>Transactions (Page {page} - {fmt(txns.length)} of {fmt(totals.count ?? 0)})</h2>
              <div style={{ fontSize: 13, color: '#9ca3af' }}>
                Total: <strong style={{ color: '#059669' }}>{fmtVal(totals.amount ?? 0)}</strong> · Profit: <strong style={{ color: '#d4af37' }}>{fmtVal(totals.profit ?? 0)}</strong>
              </div>
            </div>
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date & Time</th>
                      <th>Employee</th>
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
                      <th>Profit</th>
                      <th>Mode</th>
                      <th>Note</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {txns.map(t => (
                      <tr key={t.id}
                        onClick={() => setViewTxn(t)}
                        style={{ cursor: 'pointer', background: t.is_edited ? '#fef2f2' : '' }}
                        onMouseEnter={e => e.currentTarget.style.background = t.is_edited ? '#fee2e2' : '#f0f2f8'}
                        onMouseLeave={e => e.currentTarget.style.background = t.is_edited ? '#fef2f2' : ''}>
                        <td style={{ fontFamily: 'monospace', color: t.is_edited ? '#dc2626' : '#0d1f3d', fontWeight: 700, fontSize: 11 }}>
                          #{t.id}{t.is_edited ? ' ✏️' : ''}
                        </td>
                        <td style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                          <div>{new Date(t.created_at).toLocaleDateString('en-IN')}</div>
                          <div style={{ color: '#9ca3af' }}>{new Date(t.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td style={{ fontSize: 12 }}><strong>{t.employee_name || '—'}</strong></td>
                        <td><strong>{t.cust_name || '—'}</strong></td>
                        <td style={{ fontSize: 11, color: '#64748b' }}>{t.cust_pan || '—'}</td>
                        <td style={{ fontSize: 11 }}>{t.cust_mobile || '—'}</td>
                        <td style={{ fontSize: 12 }}>{t.service_type || '—'}</td>
                        <td>
                          {(t.platform || t.bill_platform)
                            ? <span style={{ background: '#ede9fe', color: '#0d1f3d', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{t.platform || t.bill_platform}</span>
                            : '—'}
                        </td>
                        <td style={{ fontSize: 11 }}>{t.bank || t.card_bank || '—'}</td>
                        <td style={{ fontSize: 11 }}>
                          {t.card ? `${t.card}${t.card_last4 ? ` ****${t.card_last4}` : ''}` : '—'}
                        </td>
                        <td style={{ color: '#059669', fontWeight: 700, whiteSpace: 'nowrap' }}>₹{fmt(t.amount)}</td>
                        <td style={{ color: '#d97706', fontSize: 12 }}>{t.charges_pct || 0}%</td>
                        <td style={{ color: '#dc2626', fontSize: 12 }}>₹{fmt(t.charges_amount || 0)}</td>
                        <td style={{ color: '#0d1f3d', fontWeight: 700, whiteSpace: 'nowrap' }}>₹{fmt(t.service_type === 'Bill Pay + Withdrawal' ? (t.total_collected || t.settled_amount || 0) : (t.settled_amount || 0))}</td>
                        <td style={{ color: '#7c3aed', fontWeight: 700, whiteSpace: 'nowrap' }}>₹{fmt(t.profit || 0)}</td>
                        <td style={{ fontSize: 11 }}>{t.payment_mode || t.received_mode || '—'}</td>
                        <td style={{ fontSize: 11, color: '#9ca3af', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.note || '—'}</td>
                        <td onClick={e => e.stopPropagation()}>
                          <button onClick={() => setPrintTxn(t)}
                            style={{ background: 'linear-gradient(135deg,#0d1f3d,#1a365d)', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                            <MdPrint size={13} /> Print
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!txns.length && <tr><td colSpan={18} className="dash-empty">No transactions found</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="dash-card">
              <div className="dash-card-body" style={{ padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14, color: '#6b7280' }}>
                  Showing {((page - 1) * 500) + 1} to {Math.min(page * 500, totals.count)} of {fmt(totals.count)} transactions
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button 
                    onClick={() => { setPage(1); refetch() }}
                    disabled={page === 1}
                    style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 6, background: page === 1 ? '#f9fafb' : '#fff', color: page === 1 ? '#9ca3af' : '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    First
                  </button>
                  <button 
                    onClick={() => { setPage(page - 1); refetch() }}
                    disabled={!pagination.hasPrev}
                    style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 6, background: !pagination.hasPrev ? '#f9fafb' : '#fff', color: !pagination.hasPrev ? '#9ca3af' : '#374151', cursor: !pagination.hasPrev ? 'not-allowed' : 'pointer' }}
                  >
                    Previous
                  </button>
                  <span style={{ padding: '6px 12px', fontSize: 14, fontWeight: 600, color: '#0d1f3d' }}>
                    Page {page} of {pagination.totalPages}
                  </span>
                  <button 
                    onClick={() => { setPage(page + 1); refetch() }}
                    disabled={!pagination.hasNext}
                    style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 6, background: !pagination.hasNext ? '#f9fafb' : '#fff', color: !pagination.hasNext ? '#9ca3af' : '#374151', cursor: !pagination.hasNext ? 'not-allowed' : 'pointer' }}
                  >
                    Next
                  </button>
                  <button 
                    onClick={() => { setPage(pagination.totalPages); refetch() }}
                    disabled={page === pagination.totalPages}
                    style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 6, background: page === pagination.totalPages ? '#f9fafb' : '#fff', color: page === pagination.totalPages ? '#9ca3af' : '#374151', cursor: page === pagination.totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {viewTxn  && <TxnDetailModal txn={viewTxn}  onClose={() => setViewTxn(null)} />}
      {printTxn && <PrintReceipt  txn={printTxn} onClose={() => setPrintTxn(null)} showFinancials={true} />}
    </div>
  )
}
