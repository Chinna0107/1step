import React, { useState, useEffect, useRef } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import { MdPrint, MdFilterList, MdRefresh, MdClose } from 'react-icons/md'
import '../../pages/dashboard.css'

const auth   = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })
const fmt    = n => Number(n).toLocaleString('en-IN')
const fmtVal = n => { const v = parseFloat(n); if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }
const today  = new Date().toISOString().split('T')[0]

function PrintReceipt({ txn, onClose }) {
  const ref = useRef()

  const handlePrint = () => {
    const content = ref.current.innerHTML
    const win = window.open('', '_blank', 'width=420,height=700')
    win.document.write(`
      <html><head><title>Receipt #${txn.id}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 20px; max-width: 380px; margin: 0 auto; color: #000; }
        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 12px; margin-bottom: 12px; }
        .logo { font-size: 22px; font-weight: 900; letter-spacing: 2px; }
        .sub { font-size: 11px; color: #555; }
        .row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; border-bottom: 1px dotted #ccc; }
        .row:last-child { border-bottom: none; }
        .label { color: #555; }
        .value { font-weight: 700; text-align: right; max-width: 55%; word-break: break-all; }
        .total { border-top: 2px dashed #000; margin-top: 10px; padding-top: 10px; }
        .total .row { font-size: 15px; font-weight: 900; }
        .footer { text-align: center; margin-top: 16px; font-size: 11px; color: #555; border-top: 2px dashed #000; padding-top: 10px; }
        @media print { body { padding: 0; } }
      </style></head><body>${content}</body></html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 300)
  }

  const rows = [
    { label: 'Transaction ID', value: `#${txn.id}` },
    { label: 'Date & Time',    value: new Date(txn.created_at).toLocaleString('en-IN') },
    { label: 'Employee',       value: txn.employee_name || '—' },
    { label: 'Branch',         value: txn.branch || '—' },
    { label: 'Service',        value: txn.service_type || '—' },
    { label: 'Platform',       value: txn.platform || '—' },
    { label: 'Bank',           value: txn.bank || '—' },
    { label: 'Card Type',      value: txn.card || '—' },
    { label: 'Card Bank',      value: txn.card_bank || '—' },
    { label: 'Card Last 4',    value: txn.card_last4 ? `****${txn.card_last4}` : '—' },
    { label: 'Payment Mode',   value: txn.payment_mode || '—' },
    { label: 'Customer',       value: txn.cust_name || '—' },
    { label: 'Customer PAN',   value: txn.cust_pan || '—' },
    { label: 'Customer Mobile',value: txn.cust_mobile || '—' },
    { label: 'Amount',         value: `₹${fmt(txn.amount)}` },
    { label: 'Charges %',      value: `${txn.charges_pct || txn.commission_pct || 0}%` },
    { label: 'Charges Amount', value: `₹${fmt(txn.charges_amount || 0)}` },
    { label: 'Settled Amount', value: `₹${fmt(txn.settled_amount || txn.profit || 0)}` },
    txn.note ? { label: 'Note', value: txn.note } : null,
  ].filter(Boolean)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>

        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'linear-gradient(135deg,#402070,#c02040)', color: '#fff', borderRadius: '16px 16px 0 0' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Transaction Receipt</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>#{txn.id}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handlePrint} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit' }}>
              <MdPrint size={16} /> Print
            </button>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 34, height: 34, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MdClose size={18} />
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div ref={ref} style={{ padding: 20 }}>
          <div className="header">
            <div className="logo">MONEYSPOT</div>
            <div className="sub">Fintech Services · Transaction Receipt</div>
            <div className="sub">{new Date(txn.created_at).toLocaleString('en-IN')}</div>
          </div>

          {rows.map((r, i) => (
            <div key={i} className="row">
              <span className="label">{r.label}</span>
              <span className="value">{r.value}</span>
            </div>
          ))}

          <div className="total">
            <div className="row">
              <span className="label">Total Amount</span>
              <span className="value" style={{ color: '#059669' }}>₹{fmt(txn.amount)}</span>
            </div>
            <div className="row">
              <span className="label">Settled Amount</span>
              <span className="value" style={{ color: '#402070' }}>₹{fmt(txn.settled_amount || txn.profit || 0)}</span>
            </div>
          </div>

          <div className="footer">
            <div>Thank you for choosing MoneySpot!</div>
            <div>📞 +91 98664 40477</div>
            <div style={{ marginTop: 6, fontSize: 10 }}>This is a computer generated receipt</div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function AdminTransactions() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [from, setFrom]       = useState(today)
  const [to, setTo]           = useState(today)
  const [printTxn, setPrintTxn] = useState(null)

  const load = () => {
    setLoading(true)
    const p = new URLSearchParams({ from, to })
    api(`/dashboard/reports?${p}`, { headers: auth() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const txns   = data?.transactions ?? []
  const totals = data?.totals       ?? {}

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <h1>Transaction Management</h1>
          <div className="dash-topbar-right">
            <button className="dash-btn" style={{ background: '#f0f2f8', color: '#402070', border: 'none', padding: '7px 14px' }} onClick={load}><MdRefresh /></button>
            <span className="dash-badge">{loading ? '...' : txns.length} Records</span>
          </div>
        </div>
        <div className="dash-main">

          {/* Summary */}
          <div className="dash-stats">
            <div className="dash-stat"><div className="dash-stat-label">Total Transactions</div><div className="dash-stat-value">{loading ? '—' : fmt(totals.count ?? 0)}</div></div>
            <div className="dash-stat"><div className="dash-stat-label">Total Value</div><div className="dash-stat-value">{loading ? '—' : fmtVal(totals.amount ?? 0)}</div></div>
            <div className="dash-stat"><div className="dash-stat-label">Total Profit</div><div className="dash-stat-value">{loading ? '—' : fmtVal(totals.profit ?? 0)}</div></div>
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
                <button className="dash-btn dash-btn-primary" onClick={load}><MdFilterList /> Filter</button>
                <button className="dash-btn" style={{ background: '#f0f2f8', color: '#666', border: 'none' }}
                  onClick={() => { setFrom(today); setTo(today); setTimeout(load, 0) }}>Today</button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h2>Transactions</h2>
              <div style={{ fontSize: 13, color: '#9ca3af' }}>
                Total: <strong style={{ color: '#059669' }}>{fmtVal(totals.amount ?? 0)}</strong> · Profit: <strong style={{ color: '#d4af37' }}>{fmtVal(totals.profit ?? 0)}</strong>
              </div>
            </div>
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : (
                <table className="dash-table">
                  <thead>
                    <tr><th>#</th><th>Date</th><th>Employee</th><th>Customer</th><th>Service</th><th>Platform</th><th>Amount</th><th>Charges</th><th>Settled</th><th>Print</th></tr>
                  </thead>
                  <tbody>
                    {txns.map(t => (
                      <tr key={t.id}>
                        <td style={{ fontFamily: 'monospace', color: '#402070', fontWeight: 700, fontSize: 12 }}>#{t.id}</td>
                        <td style={{ fontSize: 12 }}>{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                        <td><strong>{t.employee_name || '—'}</strong></td>
                        <td style={{ fontSize: 12 }}>{t.cust_name || '—'}</td>
                        <td>{t.service_type || '—'}</td>
                        <td>{t.platform ? <span style={{ background: '#ede9fe', color: '#402070', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{t.platform}</span> : '—'}</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>₹{fmt(t.amount)}</td>
                        <td style={{ color: '#dc2626', fontWeight: 600 }}>₹{fmt(t.charges_amount || 0)}</td>
                        <td style={{ color: '#402070', fontWeight: 800 }}>₹{fmt(t.settled_amount || t.profit || 0)}</td>
                        <td>
                          <button onClick={() => setPrintTxn(t)}
                            style={{ background: 'linear-gradient(135deg,#402070,#c02040)', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
                            <MdPrint size={14} /> Print
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!txns.length && <tr><td colSpan={10} className="dash-empty">No transactions found</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>

      {printTxn && <PrintReceipt txn={printTxn} onClose={() => setPrintTxn(null)} />}
    </div>
  )
}
