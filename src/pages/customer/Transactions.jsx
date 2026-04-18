import { useCustomerTransactions } from '../../hooks/useCustomerAuth'
import CustomerSidebar from '../../components/customer/CustomerSidebar'
import { SkeletonTable } from '../../components/customer/Skeleton'
import '../../components/customer/CustomerSidebar.css'

export default function CustomerTransactions() {
  const { txns, loading } = useCustomerTransactions()

  const downloadReceipt = (t) => {
    const content = `MoneySpot - Transaction Receipt
================================
Transaction ID : #${t.id}
Date           : ${new Date(t.created_at).toLocaleString('en-IN')}
Service        : ${t.service_type || '—'}
Platform       : ${t.platform || '—'}
Bank           : ${t.bank || '—'}
Amount         : ₹${parseFloat(t.amount).toLocaleString('en-IN')}
Employee       : ${t.employee_name || '—'}
Note           : ${t.note || '—'}
================================
Thank you for choosing MoneySpot!
`
    const blob = new Blob([content], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `receipt-${t.id}.txt`
    a.click()
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
                    <tr><th>#</th><th>Service</th><th>Platform</th><th>Bank</th><th>Amount</th><th>Date</th><th>Receipt</th></tr>
                  </thead>
                  <tbody>
                    {txns.map(t => (
                      <tr key={t.id}>
                        <td style={{ color: '#94a3b8' }}>#{t.id}</td>
                        <td>{t.service_type || '—'}</td>
                        <td>{t.platform || '—'}</td>
                        <td>{t.bank || '—'}</td>
                        <td><strong>₹{parseFloat(t.amount).toLocaleString('en-IN')}</strong></td>
                        <td>{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                        <td>
                          <button onClick={() => downloadReceipt(t)}
                            style={{ background: 'none', border: '1.5px solid rgba(64,32,112,0.25)', color: '#402070', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                            ⬇ Download
                          </button>
                        </td>
                      </tr>
                    ))}
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
