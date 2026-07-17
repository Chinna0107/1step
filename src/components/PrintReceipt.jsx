import React, { useRef } from 'react'
import { MdPrint, MdClose, MdDownload } from 'react-icons/md'

const fmt = n => Number(parseFloat(n) || 0).toLocaleString('en-IN')

const RECEIPT_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    background: #f5f5f5;
    display: flex;
    justify-content: center;
    padding: 20px;
  }
  .receipt {
    background: #fff;
    width: 380px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  }
  .receipt-header {
    background: linear-gradient(135deg, #081427 0%, #0d1f3d 50%, #1a365d 100%);
    padding: 24px 20px 20px;
    text-align: center;
    color: #fff;
    position: relative;
  }
  .receipt-header::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0; right: 0;
    height: 20px;
    background: #fff;
    border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  }
  .brand-logo {
    font-size: 26px;
    font-weight: 900;
    letter-spacing: 4px;
    color: #fff;
    text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  .brand-logo span { color: #d4af37; }
  .brand-sub {
    font-size: 11px;
    color: rgba(255,255,255,0.7);
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-top: 4px;
  }
  .receipt-badge {
    display: inline-block;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 20px;
    margin-top: 10px;
    letter-spacing: 0.5px;
  }
  .receipt-body { padding: 28px 20px 20px; }
  .section-title {
    font-size: 10px;
    font-weight: 800;
    color: #0d1f3d;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin: 16px 0 8px;
    padding-bottom: 4px;
    border-bottom: 2px solid #f0f2f8;
  }
  .section-title:first-child { margin-top: 0; }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 6px 0;
    border-bottom: 1px dashed #f0f2f8;
    gap: 12px;
  }
  .row:last-child { border-bottom: none; }
  .row-label {
    font-size: 12px;
    color: #64748b;
    font-weight: 500;
    flex-shrink: 0;
  }
  .row-value {
    font-size: 12px;
    font-weight: 700;
    color: #081427;
    text-align: right;
    word-break: break-all;
  }
  .amount-section {
    background: linear-gradient(135deg, #f8f5ff, #fdf2f8);
    border-radius: 10px;
    padding: 14px 16px;
    margin: 16px 0;
    border: 1.5px solid #e8d5f5;
  }
  .amount-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;
  }
  .amount-label { font-size: 12px; color: #64748b; font-weight: 500; }
  .amount-value { font-size: 13px; font-weight: 800; }
  .amount-divider {
    border: none;
    border-top: 1.5px dashed #d8b4fe;
    margin: 8px 0;
  }
  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0 0;
  }
  .total-label { font-size: 14px; font-weight: 800; color: #0d1f3d; }
  .total-value { font-size: 20px; font-weight: 900; color: #0d1f3d; }
  .settled-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0 0;
  }
  .settled-label { font-size: 11px; color: #64748b; }
  .settled-value { font-size: 13px; font-weight: 800; color: #059669; }
  .receipt-footer {
    background: linear-gradient(135deg, #081427, #0d1f3d);
    padding: 16px 20px;
    text-align: center;
    color: rgba(255,255,255,0.8);
    position: relative;
  }
  .receipt-footer::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 0; right: 0;
    height: 20px;
    background: #fff;
    border-radius: 0 0 50% 50% / 0 0 100% 100%;
  }
  .footer-thanks {
    font-size: 13px;
    font-weight: 700;
    color: #d4af37;
    margin-bottom: 4px;
  }
  .footer-phone { font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 6px; }
  .footer-note { font-size: 10px; color: rgba(255,255,255,0.4); letter-spacing: 0.5px; }
  .status-chip {
    display: inline-block;
    background: #d1fae5;
    color: #059669;
    font-size: 10px;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  @media print {
    body { background: #fff; padding: 0; }
    .receipt { box-shadow: none; border-radius: 0; width: 100%; }
  }
`

function buildReceiptHTML(txn) {
  const rows = {
    transaction: [
      { label: 'Transaction ID', value: `#${txn.id}` },
      { label: 'Date & Time',    value: new Date(txn.created_at).toLocaleString('en-IN') },
      { label: 'Employee',       value: txn.employee_name || '—' },
      { label: 'Branch',         value: txn.branch || '—' },
    ],
    service: [
      { label: 'Service',        value: txn.service_type || '—' },
      { label: 'Platform',       value: txn.platform || txn.bill_platform || '—' },
      ...(txn.bank        ? [{ label: 'Bank',         value: txn.bank }]        : []),
      ...(txn.card        ? [{ label: 'Card Type',    value: txn.card }]        : []),
      ...(txn.card_bank   ? [{ label: 'Card Bank',    value: txn.card_bank }]   : []),
      ...(txn.card_last4  ? [{ label: 'Card Last 4',  value: `****${txn.card_last4}` }] : []),
      ...(txn.payment_mode ? [{ label: 'Payment Mode', value: txn.payment_mode }] : []),
    ],
    customer: [
      { label: 'Customer',        value: txn.cust_name   || '—' },
      { label: 'Customer PAN',    value: txn.cust_pan    || '—' },
      { label: 'Customer Mobile', value: txn.cust_mobile || '—' },
    ],
  }

  const renderRows = arr => arr.map(r => `
    <div class="row">
      <span class="row-label">${r.label}</span>
      <span class="row-value">${r.value}</span>
    </div>`).join('')

  const chargesPct    = parseFloat(txn.charges_pct || txn.commission_pct || 0)
  const chargesAmt    = parseFloat(txn.charges_amount || 0)
  const isBillWd      = txn.service_type === 'Bill Pay + Withdrawal'
  const settledAmt    = isBillWd
    ? parseFloat(txn.total_collected || txn.settled_amount || 0)
    : parseFloat(txn.settled_amount || txn.profit || 0)
  const amount        = parseFloat(txn.amount || 0)
  const netProfit     = parseFloat(txn.profit || 0)
  const gst           = parseFloat((netProfit * 0.18).toFixed(2))

  return `<!DOCTYPE html>
<html><head>
  <meta charset="UTF-8">
  <title>Receipt #${txn.id} — 1 Step Finance Care</title>
  <style>${RECEIPT_CSS}</style>
</head><body>
<div class="receipt">
  <div class="receipt-header">
    <div class="brand-logo">MONEY<span>SPOT</span></div>
    <div class="brand-sub">Fintech Services</div>
    <div class="receipt-badge">✓ Transaction Receipt</div>
  </div>

  <div class="receipt-body">
    <div class="section-title">Transaction Info</div>
    ${renderRows(rows.transaction)}

    <div class="section-title">Service Details</div>
    ${renderRows(rows.service)}

    <div class="section-title">Customer Details</div>
    ${renderRows(rows.customer)}

    <div class="amount-section">
      <div class="amount-row">
        <span class="amount-label">Transaction Amount</span>
        <span class="amount-value" style="color:#059669">₹${fmt(amount)}</span>
      </div>
      <div class="amount-row">
        <span class="amount-label">Charges (${chargesPct}%)</span>
        <span class="amount-value" style="color:#d97706">₹${fmt(chargesAmt)}</span>
      </div>
      <hr class="amount-divider">
      <div class="total-row">
        <span class="total-label">Total Paid</span>
        <span class="total-value">₹${fmt(amount)}</span>
      </div>
      <div class="settled-row">
        <span class="settled-label">Settled Amount</span>
        <span class="settled-value">₹${fmt(settledAmt)}</span>
      </div>
      <div class="settled-row">
        <span class="settled-label">Net Profit</span>
        <span class="settled-value" style="color:#7c3aed">₹${fmt(netProfit)}</span>
      </div>
      <div class="settled-row">
        <span class="settled-label">GST (18%)</span>
        <span class="settled-value" style="color:#dc2626">- ₹${fmt(gst)}</span>
      </div>
      <div class="settled-row" style="border-top:1.5px solid #d8b4fe;margin-top:6px;padding-top:6px">
        <span class="settled-label" style="font-weight:800;color:#059669">Total Profit</span>
        <span class="settled-value" style="color:#059669;font-size:15px">₹${fmt((netProfit - gst).toFixed(2))}</span>
      </div>
    </div>

    ${txn.note ? `<div class="section-title">Note</div><div class="row"><span class="row-label">Note</span><span class="row-value">${txn.note}</span></div>` : ''}
  </div>

  <div class="receipt-footer">
    <div class="footer-thanks">Thank you for choosing 1 Step Finance Care!</div>
    <div class="footer-phone">📞 +91 95816 11711</div>
    <div class="footer-note">This is a computer generated receipt</div>
  </div>
</div>
</body></html>`
}

export default function PrintReceipt({ txn, onClose, showFinancials = false }) {
  const ref = useRef()

  const openPrint = () => {
    const win = window.open('', '_blank', 'width=460,height=780')
    win.document.write(buildReceiptHTML(txn))
    win.document.close()
    win.focus()
    setTimeout(() => { win.print() }, 400)
  }

  const chargesPct = parseFloat(txn.charges_pct || txn.commission_pct || 0)
  const chargesAmt = parseFloat(txn.charges_amount || 0)
  const isBillWd   = txn.service_type === 'Bill Pay + Withdrawal'
  const settledAmt = isBillWd
    ? parseFloat(txn.total_collected || txn.settled_amount || 0)
    : parseFloat(txn.settled_amount || txn.profit || 0)
  const amount     = parseFloat(txn.amount || 0)
  const netProfit  = parseFloat(txn.profit || 0)
  const gst        = parseFloat((netProfit * 0.18).toFixed(2))

  const infoRows = [
    { label: 'Transaction ID', value: `#${txn.id}` },
    { label: 'Date & Time',    value: new Date(txn.created_at).toLocaleString('en-IN') },
    { label: 'Employee',       value: txn.employee_name || '—' },
    { label: 'Branch',         value: txn.branch || '—' },
    { label: 'Service',        value: txn.service_type || '—' },
    { label: 'Platform',       value: txn.platform || txn.bill_platform || '—' },
    txn.bank        && { label: 'Bank',          value: txn.bank },
    txn.card        && { label: 'Card Type',     value: txn.card },
    txn.card_bank   && { label: 'Card Bank',     value: txn.card_bank },
    txn.card_last4  && { label: 'Card Last 4',   value: `****${txn.card_last4}` },
    txn.payment_mode && { label: 'Payment Mode', value: txn.payment_mode },
    { label: 'Customer',        value: txn.cust_name   || '—' },
    { label: 'Customer PAN',    value: txn.cust_pan    || '—' },
    { label: 'Customer Mobile', value: txn.cust_mobile || '—' },
    showFinancials && txn.profit !== undefined && { label: 'Net Profit', value: `₹${fmt(txn.profit)}` },
    txn.note && { label: 'Note', value: txn.note },
  ].filter(Boolean)

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
    >
      <div style={{ background: '#f5f5f5', borderRadius: 20, width: '100%', maxWidth: 440, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>

        {/* Modal toolbar */}
        <div style={{ background: 'linear-gradient(135deg,#081427,#0d1f3d,#1a365d)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Transaction Receipt</div>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>#{txn.id} · {txn.service_type || 'Transaction'}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={openPrint}
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit' }}>
              <MdPrint size={15} /> Print
            </button>
            <button onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MdClose size={17} />
            </button>
          </div>
        </div>

        {/* Receipt preview */}
        <div style={{ overflowY: 'auto', padding: 16 }}>
          <div ref={ref} style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg,#081427 0%,#0d1f3d 50%,#1a365d 100%)', padding: '22px 20px 28px', textAlign: 'center', position: 'relative' }}>
              <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: 4, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                MONEY<span style={{ color: '#d4af37' }}>SPOT</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>Fintech Services</div>
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 20, marginTop: 10, letterSpacing: 0.5 }}>
                ✓ Transaction Receipt
              </div>
              {/* Scallop edge */}
              <div style={{ position: 'absolute', bottom: -10, left: 0, right: 0, height: 20, background: '#fff', borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />
            </div>

            {/* Body */}
            <div style={{ padding: '24px 18px 18px' }}>

              {/* Info rows */}
              {[
                { title: 'Transaction Info', rows: infoRows.slice(0, 4) },
                { title: 'Service Details',  rows: infoRows.slice(4, infoRows.findIndex(r => r.label === 'Customer')) },
                { title: 'Customer Details', rows: infoRows.filter(r => ['Customer','Customer PAN','Customer Mobile'].includes(r.label)) },
              ].map(section => (
                <div key={section.title} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: '#0d1f3d', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, paddingBottom: 4, borderBottom: '2px solid #f0f2f8' }}>
                    {section.title}
                  </div>
                  {section.rows.map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '5px 0', borderBottom: '1px dashed #f0f2f8', gap: 12 }}>
                      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500, flexShrink: 0 }}>{r.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#081427', textAlign: 'right', wordBreak: 'break-all' }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              ))}

              {/* Amount box */}
              <div style={{ background: 'linear-gradient(135deg,#f8f5ff,#fdf2f8)', borderRadius: 10, padding: '14px 16px', margin: '14px 0', border: '1.5px solid #e8d5f5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Transaction Amount</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#059669' }}>₹{fmt(amount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Charges ({chargesPct}%)</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#d97706' }}>₹{fmt(chargesAmt)}</span>
                </div>
                <div style={{ borderTop: '1.5px dashed #d8b4fe', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#0d1f3d' }}>Total Paid</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: '#0d1f3d' }}>₹{fmt(amount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Settled Amount</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#059669' }}>₹{fmt(settledAmt)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Net Profit</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#7c3aed' }}>₹{fmt(netProfit)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 4, borderTop: '1px dashed #d8b4fe' }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>GST (18%)</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#dc2626' }}>- ₹{fmt(gst)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 6, borderTop: '1.5px solid #d8b4fe' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#059669' }}>Total Profit</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: '#059669' }}>₹{fmt((netProfit - gst).toFixed(2))}</span>
                </div>
              </div>

              {txn.note && (
                <div style={{ background: '#fef9e7', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#92400e', border: '1px solid #fde68a' }}>
                  📝 {txn.note}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ background: 'linear-gradient(135deg,#081427,#0d1f3d)', padding: '18px 20px', textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -10, left: 0, right: 0, height: 20, background: '#fff', borderRadius: '0 0 50% 50% / 0 0 100% 100%' }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: '#d4af37', marginBottom: 4 }}>Thank you for choosing 1 Step Finance Care!</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>📞 +91 95816 11711</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5 }}>This is a computer generated receipt</div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
