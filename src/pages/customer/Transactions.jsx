import { useState, useEffect } from 'react'
import { useCustomerTransactions } from '../../hooks/useCustomerAuth'
import CustomerSidebar from '../../components/customer/CustomerSidebar'
import { SkeletonTable } from '../../components/customer/Skeleton'
import '../../components/customer/CustomerSidebar.css'

const fmt = n => Number(parseFloat(n) || 0).toLocaleString('en-IN')

const RECEIPT_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; display: flex; justify-content: center; padding: 20px; }
  .receipt { background: #fff; width: 400px; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.15); }
  .receipt-header {
    background: linear-gradient(135deg, #081427 0%, #0d1f3d 50%, #1a365d 100%);
    padding: 28px 24px 32px; text-align: center; color: #fff; position: relative;
  }
  .receipt-header::after {
    content: ''; position: absolute; bottom: -12px; left: 0; right: 0;
    height: 24px; background: #fff; border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  }
  .logo-wrap { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 6px; }
  .logo-img { width: 44px; height: 44px; object-fit: contain; }
  .brand-name { font-size: 20px; font-weight: 900; letter-spacing: 1px; color: #fff; }
  .brand-name span { color: #d4af37; }
  .brand-sub { font-size: 11px; color: rgba(255,255,255,0.65); letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
  .receipt-badge {
    display: inline-block; background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3); color: #fff;
    font-size: 11px; font-weight: 700; padding: 4px 14px;
    border-radius: 20px; margin-top: 12px; letter-spacing: 0.5px;
  }
  .txn-id-chip {
    display: inline-block; background: rgba(212,175,55,0.2);
    border: 1px solid rgba(212,175,55,0.4); color: #d4af37;
    font-size: 13px; font-weight: 900; padding: 4px 14px;
    border-radius: 20px; margin-top: 8px; letter-spacing: 1px;
  }
  .receipt-body { padding: 32px 22px 20px; }
  .section-title {
    font-size: 9px; font-weight: 800; color: #0d1f3d;
    text-transform: uppercase; letter-spacing: 2px;
    margin: 18px 0 8px; padding-bottom: 5px;
    border-bottom: 2px solid #f0f2f8;
    display: flex; align-items: center; gap: 6px;
  }
  .section-title:first-child { margin-top: 0; }
  .row {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding: 7px 0; border-bottom: 1px dashed #f0f2f8; gap: 12px;
  }
  .row:last-child { border-bottom: none; }
  .row-label { font-size: 12px; color: #64748b; font-weight: 500; flex-shrink: 0; }
  .row-value { font-size: 12px; font-weight: 700; color: #081427; text-align: right; word-break: break-all; }
  .amount-box {
    background: linear-gradient(135deg, #f8f5ff, #fdf2f8);
    border-radius: 12px; padding: 16px 18px; margin: 18px 0;
    border: 1.5px solid #e8d5f5;
  }
  .amt-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; }
  .amt-label { font-size: 12px; color: #64748b; font-weight: 500; }
  .amt-val { font-size: 13px; font-weight: 800; }
  .amt-divider { border: none; border-top: 1.5px dashed #d8b4fe; margin: 10px 0; }
  .total-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0 0; }
  .total-label { font-size: 15px; font-weight: 900; color: #0d1f3d; }
  .total-val { font-size: 22px; font-weight: 900; color: #0d1f3d; }
  .settled-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0 0; }
  .settled-label { font-size: 11px; color: #64748b; }
  .settled-val { font-size: 13px; font-weight: 800; }
  .note-box { background: #fef9e7; border-radius: 8px; padding: 10px 14px; font-size: 11px; color: #92400e; border: 1px solid #fde68a; margin-top: 12px; }
  .receipt-footer {
    background: linear-gradient(135deg, #081427, #0d1f3d);
    padding: 20px 24px; text-align: center; color: rgba(255,255,255,0.8); position: relative;
  }
  .receipt-footer::before {
    content: ''; position: absolute; top: -12px; left: 0; right: 0;
    height: 24px; background: #fff; border-radius: 0 0 50% 50% / 0 0 100% 100%;
  }
  .footer-thanks { font-size: 14px; font-weight: 700; color: #d4af37; margin-bottom: 5px; }
  .footer-phone { font-size: 12px; color: rgba(255,255,255,0.65); margin-bottom: 6px; }
  .footer-note { font-size: 10px; color: rgba(255,255,255,0.35); letter-spacing: 0.5px; }
  .watermark { text-align: center; padding: 10px; font-size: 10px; color: #cbd5e1; letter-spacing: 0.5px; }
  @media print {
    body { background: #fff; padding: 0; }
    .receipt { box-shadow: none; border-radius: 0; width: 100%; }
  }
`

function buildReceiptHTML(t) {
  const amount     = parseFloat(t.amount || 0)
  const chargesPct = parseFloat(t.charges_pct || 0)
  const chargesAmt = parseFloat(t.charges_amount || 0)
  const settled    = parseFloat(t.settled_amount || 0)

  const serviceRows = [
    t.service_type  && `<div class="row"><span class="row-label">Service</span><span class="row-value">${t.service_type}</span></div>`,
    t.platform      && `<div class="row"><span class="row-label">Platform</span><span class="row-value">${t.platform}</span></div>`,
    t.bill_platform && `<div class="row"><span class="row-label">Bill Platform</span><span class="row-value">${t.bill_platform}</span></div>`,
    t.bank          && `<div class="row"><span class="row-label">Bank</span><span class="row-value">${t.bank}</span></div>`,
    t.card          && `<div class="row"><span class="row-label">Card Type</span><span class="row-value">${t.card}</span></div>`,
    t.card_bank     && `<div class="row"><span class="row-label">Card Bank</span><span class="row-value">${t.card_bank}</span></div>`,
    t.card_last4    && `<div class="row"><span class="row-label">Card Last 4</span><span class="row-value">****${t.card_last4}</span></div>`,
    t.payment_mode  && `<div class="row"><span class="row-label">Payment Mode</span><span class="row-value">${t.payment_mode}</span></div>`,
  ].filter(Boolean).join('')

  return `<!DOCTYPE html>
<html><head>
  <meta charset="UTF-8">
  <title>Receipt #${t.id} — 1 Step Finance Care</title>
  <style>${RECEIPT_CSS}</style>
</head><body>
<div class="receipt">
  <div class="receipt-header">
    <div class="logo-wrap">
      <img class="logo-img" src="/logo.png" alt="One Step Finance Care" onerror="this.style.display='none'" />
      <div class="brand-name">One <span>Step</span> Finance Care</div>
    </div>

    <div class="receipt-badge">✓ Transaction Receipt</div>
    <div class="txn-id-chip">#${t.id}</div>
  </div>

  <div class="receipt-body">
    <div class="section-title">📋 Transaction Info</div>
    <div class="row"><span class="row-label">Date & Time</span><span class="row-value">${new Date(t.created_at).toLocaleString('en-IN')}</span></div>
    <div class="row"><span class="row-label">Employee</span><span class="row-value">${t.employee_name || '—'}</span></div>
    <div class="row"><span class="row-label">Branch</span><span class="row-value">${t.branch || '—'}</span></div>

    <div class="section-title">🔧 Service Details</div>
    ${serviceRows}

    <div class="section-title">👤 Customer Details</div>
    <div class="row"><span class="row-label">Customer</span><span class="row-value">${t.cust_name || '—'}</span></div>
    <div class="row"><span class="row-label">PAN</span><span class="row-value">${t.cust_pan || '—'}</span></div>
    <div class="row"><span class="row-label">Mobile</span><span class="row-value">${t.cust_mobile || '—'}</span></div>

    <div class="amount-box">
      <div class="amt-row">
        <span class="amt-label">Transaction Amount</span>
        <span class="amt-val" style="color:#059669">₹${fmt(amount)}</span>
      </div>
      <div class="amt-row">
        <span class="amt-label">Charges (${chargesPct}%)</span>
        <span class="amt-val" style="color:#d97706">₹${fmt(chargesAmt)}</span>
      </div>
      <hr class="amt-divider">
      <div class="total-row">
        <span class="total-label">Settled Amount</span>
        <span class="total-val" style="color:#059669">₹${fmt(settled)}</span>
      </div>
    </div>

    ${t.note ? `<div class="note-box">📝 ${t.note}</div>` : ''}
  </div>

  <div class="receipt-footer">
    <div class="footer-thanks">Thank you for choosing 1 Step Finance Care!</div>
    <div class="footer-phone">📞 +91 95816 11711</div>
    <div class="footer-note">This is a computer generated receipt</div>
  </div>
  <div class="watermark">1stepfinancecare.com</div>
</div>
</body></html>`
}

export default function CustomerTransactions() {
  const { txns, loading, refetch } = useCustomerTransactions()
  const [printTxn, setPrintTxn] = useState(null)

  // Force fresh data every time this page mounts (bypass 5-min cache)
  useEffect(() => { refetch(true) }, [])

  useEffect(() => {
    if (txns && txns.length > 0) {
      console.log('FIRST TXN DATA:', txns[0])
    }
  }, [txns])

  const openPrint = (t) => {
    const win = window.open('', '_blank', 'width=480,height=820')
    win.document.write(buildReceiptHTML(t))
    win.document.close()
    win.focus()
    setTimeout(() => { win.print() }, 400)
  }

  return (
    <div className="cust-page">
      <CustomerSidebar />
      <div className="cust-content">
        <div className="cust-topbar">
          <h1>📊 Transaction History</h1>
          <p>{loading ? 'Loading...' : `${txns.length} total transactions`}</p>
        </div>

        <div className="cust-card">
          <div className="cust-card-header"><h2>All Transactions</h2></div>
          {loading ? <SkeletonTable rows={6} cols={6} /> : (
            <div className="cust-table-wrap">
              {txns.length === 0 ? (
                <div className="cust-empty">No transactions found</div>
              ) : (
                <table className="cust-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Customer Name</th>
                      <th>PAN Number</th>
                      <th>Aadhar Number</th>
                      <th>Mobile Number</th>
                      <th>Service Type</th>
                      <th>Bill Platform</th>
                      <th>Bill Amount</th>
                      <th>Withdrawal Platform</th>
                      <th>Card Type</th>
                      <th>Card Bank</th>
                      <th>Card Last 4</th>
                      <th>Bank Name</th>
                      <th>Account No.</th>
                      <th>Total Amount</th>
                      <th>Charges %</th>
                      <th>Charges ₹</th>
                      <th>Settled Amount</th>
                      <th>Collectable</th>
                      <th>Collected</th>
                      <th>Balance Due</th>
                      <th>Payment Mode</th>
                      <th>Receive Mode</th>
                      <th>Remarks</th>
                      <th>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txns.map(t => {
                      const isBW = t.service_type === 'Bill Pay + Withdrawal'
                      const collectable = isBW ? (parseFloat(t.total_collected) || 0) : (parseFloat(t.settled_amount) || 0)
                      return (
                        <tr key={t.id}>
                          <td style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 11, color: '#0d1f3d' }}>#{t.id}</div>
                            <div>{new Date(t.created_at).toLocaleDateString('en-IN')}</div>
                            <div style={{ color: '#9ca3af' }}>{new Date(t.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td><strong>{t.cust_name || '—'}</strong></td>
                          <td style={{ fontSize: 11, color: '#64748b' }}>{t.cust_pan || '—'}</td>
                          <td style={{ fontSize: 11, color: '#64748b' }}>{t.cust_aadhar || '—'}</td>
                          <td style={{ fontSize: 11 }}>{t.cust_mobile || '—'}</td>
                          <td style={{ fontWeight: 600, color: '#1e293b', fontSize: 12 }}>{t.service_type || '—'}</td>
                          <td style={{ fontSize: 11 }}>{t.bill_platform || '—'}</td>
                          <td style={{ fontWeight: 600 }}>{parseFloat(t.bill_amount) > 0 ? `₹${fmt(t.bill_amount)}` : (t.service_type === 'AEPS' ? `₹${fmt(t.amount)}` : '—')}</td>
                          <td style={{ fontSize: 11 }}>{t.platform || '—'}</td>
                          <td style={{ fontSize: 11 }}>{t.card || '—'}</td>
                          <td style={{ fontSize: 11 }}>{t.card_bank || '—'}</td>
                          <td style={{ fontSize: 11 }}>{t.card_last4 || '—'}</td>
                          <td style={{ fontSize: 11 }}>{t.bank || '—'}</td>
                          <td style={{ fontSize: 11, fontFamily: 'monospace' }}>{t.acc_no || '—'}</td>
                          <td><strong style={{ color: '#0d1f3d' }}>₹{fmt(t.amount)}</strong></td>
                          <td style={{ color: '#d97706', fontWeight: 700, fontSize: 12 }}>{parseFloat(t.charges_pct || 0)}%</td>
                          <td style={{ color: '#dc2626', fontWeight: 700 }}>₹{fmt(t.charges_amount)}</td>
                          <td><strong style={{ color: '#059669', fontSize: 14, background: '#d1fae5', padding: '2px 6px', borderRadius: 6 }}>₹{fmt(t.settled_amount)}</strong></td>
                          <td style={{ color: '#0d1f3d', fontWeight: 700 }}>₹{fmt(collectable)}</td>
                          <td style={{ color: '#059669', fontWeight: 700 }}>{parseFloat(t.amount_collected) > 0 ? `₹${fmt(t.amount_collected)}` : '—'}</td>
                          <td>
                            {parseFloat(t.balance_due) > 0
                              ? <span style={{ background: '#fee2e2', color: '#dc2626', fontWeight: 800, padding: '2px 8px', borderRadius: 8, fontSize: 12 }}>₹{fmt(t.balance_due)}</span>
                              : <span style={{ background: '#d1fae5', color: '#059669', fontWeight: 700, padding: '2px 8px', borderRadius: 8, fontSize: 11 }}>✅ Paid</span>}
                          </td>
                          <td style={{ fontSize: 11 }}>{t.payment_mode || '—'}</td>
                          <td style={{ fontSize: 11 }}>{t.received_mode || '—'}</td>
                          <td style={{ fontSize: 11, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.note}>{t.note || '—'}</td>
                          <td>
                            <button onClick={() => openPrint(t)}
                              style={{ background: 'linear-gradient(135deg,#0d1f3d,#1a365d)', border: 'none', color: '#fff', padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              🖨️ Print
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
