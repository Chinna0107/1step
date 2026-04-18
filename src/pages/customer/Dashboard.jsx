import { useCustomerProfile, useCustomerTransactions, getCustomerUser } from '../../hooks/useCustomerAuth'
import CustomerSidebar from '../../components/customer/CustomerSidebar'
import { SkeletonStat, SkeletonCard, SkeletonTable } from '../../components/customer/Skeleton'
import '../../components/customer/CustomerSidebar.css'

export default function CustomerDashboard() {
  const user = getCustomerUser()
  const { profile, loading: pLoading } = useCustomerProfile()
  const { txns, loading: tLoading }    = useCustomerTransactions()

  const total  = txns.length
  const amount = txns.reduce((s, t) => s + parseFloat(t.amount || 0), 0)
  const success = txns.filter(t => t.status === 'success' || !t.status).length

  return (
    <div className="cust-page">
      <CustomerSidebar />
      <div className="cust-content">
        <div className="cust-topbar">
          <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Here's your MoneySpot account summary</p>
        </div>

        {/* Stats */}
        <div className="cust-stats">
          {tLoading ? (
            [1,2,3,4].map(i => <SkeletonStat key={i} />)
          ) : (
            <>
              <div className="cust-stat" style={{ borderColor: '#402070' }}>
                <div className="cust-stat-icon">💳</div>
                <div className="cust-stat-label">Total Transactions</div>
                <div className="cust-stat-value">{total}</div>
              </div>
              <div className="cust-stat" style={{ borderColor: '#c02040' }}>
                <div className="cust-stat-icon">₹</div>
                <div className="cust-stat-label">Total Amount</div>
                <div className="cust-stat-value">₹{amount.toLocaleString('en-IN')}</div>
              </div>
              <div className="cust-stat" style={{ borderColor: '#059669' }}>
                <div className="cust-stat-icon">✅</div>
                <div className="cust-stat-label">Successful</div>
                <div className="cust-stat-value">{success}</div>
              </div>
              <div className="cust-stat" style={{ borderColor: '#d97706' }}>
                <div className="cust-stat-icon">🏦</div>
                <div className="cust-stat-label">Branch</div>
                <div className="cust-stat-value" style={{ fontSize: 16 }}>{profile?.branch || '—'}</div>
              </div>
            </>
          )}
        </div>

        {/* Account Details */}
        {pLoading ? <SkeletonCard rows={5} /> : (
          <div className="cust-card">
            <div className="cust-card-header"><h2>Account Details</h2></div>
            <div className="cust-card-body">
              <div className="cust-info-row"><span className="cust-info-label">Full Name</span><span className="cust-info-value">{profile?.name || '—'}</span></div>
              <div className="cust-info-row"><span className="cust-info-label">PAN Number</span><span className="cust-info-value">{profile?.pan || '—'}</span></div>
              <div className="cust-info-row"><span className="cust-info-label">Mobile</span><span className="cust-info-value">{profile?.phone || '—'}</span></div>
              <div className="cust-info-row"><span className="cust-info-label">Email</span><span className="cust-info-value">{profile?.email || '—'}</span></div>
              <div className="cust-info-row"><span className="cust-info-label">Account No.</span><span className="cust-info-value">{profile?.acc_number || '—'}</span></div>
              <div className="cust-info-row"><span className="cust-info-label">KYC Status</span><span className="cust-info-value"><span className="cust-badge cust-badge-success">✅ Approved</span></span></div>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="cust-card">
          <div className="cust-card-header"><h2>Recent Transactions</h2></div>
          {tLoading ? <SkeletonTable rows={4} cols={4} /> : (
            <div className="cust-table-wrap">
              {txns.length === 0 ? (
                <div className="cust-empty">No transactions yet</div>
              ) : (
                <table className="cust-table">
                  <thead><tr><th>Service</th><th>Platform</th><th>Amount</th><th>Date</th></tr></thead>
                  <tbody>
                    {txns.slice(0, 5).map(t => (
                      <tr key={t.id}>
                        <td>{t.service_type || '—'}</td>
                        <td>{t.platform || '—'}</td>
                        <td>₹{parseFloat(t.amount).toLocaleString('en-IN')}</td>
                        <td>{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
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
