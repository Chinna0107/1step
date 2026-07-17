import { useCustomerProfile, useCustomerTransactions, useCustomerCoins, getCustomerUser } from '../../hooks/useCustomerAuth'
import CustomerSidebar from '../../components/customer/CustomerSidebar'
import { SkeletonStat, SkeletonCard, SkeletonTable } from '../../components/customer/Skeleton'
import '../../components/customer/CustomerSidebar.css'
import './CustomerDashboard.css'

const fmt = n => Number(n).toLocaleString('en-IN')

export default function CustomerDashboard() {
  const user = getCustomerUser()
  const { profile, loading: pLoading } = useCustomerProfile()
  const { txns, loading: tLoading }    = useCustomerTransactions()

  const { coins: coinsData } = useCustomerCoins()
  const total   = txns.length
  const amount  = txns.reduce((s, t) => s + parseFloat(t.amount || 0), 0)
  const success = txns.filter(t => t.status === 'success' || !t.status).length
  const now     = new Date()
  const hour    = now.getHours()
  const coinsBal = coinsData?.coins ?? 0
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div className="cust-page">
      <CustomerSidebar />
      <div className="cust-content">

        {/* ── Hero ── */}
        <div className="cd-hero">
          <div className="cd-hero-orb cd-orb1" />
          <div className="cd-hero-orb cd-orb2" />
          <div className="cd-hero-inner">
            <div>
              <div className="cd-greeting">{greeting} 👋</div>
              <h1 className="cd-hero-name">{user?.name || 'Customer'}</h1>
              <div className="cd-hero-meta">
                {now.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                {profile?.branch && <span className="cd-branch-pill">🏦 {profile.branch}</span>}
              </div>
            </div>
            <div className="cd-kyc-badge">
              <span className="cd-kyc-dot" />
              KYC Verified
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="cd-stats">
          {tLoading ? [1,2,3,4,5].map(i => <SkeletonStat key={i} />) : (
            <>
              {[
                { icon: '💳', label: 'Total Transactions', value: total, color: '#0d1f3d' },
                { icon: '₹',  label: 'Total Amount',       value: `₹${fmt(amount)}`, color: '#1a365d' },
                { icon: '✅', label: 'Successful',          value: success, color: '#059669' },
                { icon: '🪙', label: 'MS Coins',            value: fmt(coinsBal), color: '#b8860b' },
                { icon: '🏦', label: 'Branch',              value: profile?.branch || '—', color: '#d97706', small: true },
              ].map((s, i) => (
                <div key={i} className="cd-stat" style={{ '--c': s.color, animationDelay: `${i * 80}ms` }}>
                  <div className="cd-stat-glow" />
                  <div className="cd-stat-icon">{s.icon}</div>
                  <div className="cd-stat-label">{s.label}</div>
                  <div className="cd-stat-value" style={s.small ? { fontSize: 18 } : {}}>{s.value}</div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* ── Account + Recent Txns ── */}
        <div className="cd-grid">

          {/* Account Details */}
          {pLoading ? <SkeletonCard rows={6} /> : (
            <div className="cd-card cd-card-anim">
              <div className="cd-card-header">
                <span className="cd-card-icon">👤</span>
                <h2>Account Details</h2>
                <span className="cd-verified">✅ Approved</span>
              </div>
              <div className="cd-card-body">
                {[
                  { label: 'Full Name',    value: profile?.name },
                  { label: 'PAN Number',   value: profile?.pan },
                  { label: 'Mobile',       value: profile?.phone },
                  { label: 'Email',        value: profile?.email || '—' },
                  { label: 'Account No.',  value: profile?.acc_number },
                  { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN') : '—' },
                ].map((row, i) => (
                  <div key={i} className="cd-info-row" style={{ animationDelay: `${i * 50}ms` }}>
                    <span className="cd-info-label">{row.label}</span>
                    <span className="cd-info-value">{row.value || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="cd-card cd-card-anim" style={{ animationDelay: '100ms' }}>
            <div className="cd-card-header">
              <span className="cd-card-icon">⚡</span>
              <h2>Quick Actions</h2>
            </div>
            <div className="cd-card-body">
              <div className="cd-quick-grid">
                {[
                  { icon: '💸', label: 'Money Transfer', color: '#0d1f3d' },
                  { icon: '💳', label: 'Card Withdrawal', color: '#1a365d' },
                  { icon: '📄', label: 'Bill Payment', color: '#059669' },
                  { icon: '🏧', label: 'AEPS', color: '#d97706' },
                  { icon: '📈', label: 'CIBIL Check', color: '#0284c7' },
                  { icon: '🛡️', label: 'Insurance', color: '#7c3aed' },
                ].map((a, i) => (
                  <a key={i} href="https://wa.me/919581611711" target="_blank" rel="noopener noreferrer"
                    className="cd-quick-btn" style={{ '--qc': a.color, animationDelay: `${i * 60}ms` }}>
                    <span className="cd-quick-icon">{a.icon}</span>
                    <span className="cd-quick-label">{a.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Transactions ── */}
        <div className="cd-card cd-card-anim" style={{ animationDelay: '200ms' }}>
          <div className="cd-card-header">
            <span className="cd-card-icon">📊</span>
            <h2>Recent Transactions</h2>
            <span className="cd-card-badge">{total} total</span>
          </div>
          {tLoading ? <SkeletonTable rows={4} cols={4} /> : (
            <div className="cust-table-wrap">
              {txns.length === 0 ? (
                <div className="cd-empty">
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
                  <div>No transactions yet</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Contact your branch to get started</div>
                </div>
              ) : (
                <table className="cust-table">
                  <thead><tr><th>Service</th><th>Platform</th><th>Amount</th><th>Date</th></tr></thead>
                  <tbody>
                    {txns.slice(0, 5).map((t, i) => (
                      <tr key={t.id} className="cd-tr" style={{ animationDelay: `${i * 50}ms` }}>
                        <td><strong>{t.service_type || '—'}</strong></td>
                        <td>{t.platform ? <span className="cd-platform-tag">{t.platform}</span> : '—'}</td>
                        <td><span style={{ color: '#059669', fontWeight: 700 }}>₹{fmt(t.amount)}</span></td>
                        <td style={{ fontSize: 12, color: '#64748b' }}>{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* ── Support Banner ── */}
        <div className="cd-support-banner">
          <div className="cd-support-orb" />
          <div className="cd-support-inner">
            <div>
              <div className="cd-support-title">Need Help?</div>
              <div className="cd-support-sub">Our team is available 24/7 to assist you</div>
            </div>
            <div className="cd-support-btns">
              <a href="https://wa.me/919581611711" target="_blank" rel="noopener noreferrer" className="cd-wa-btn">💬 WhatsApp</a>
              <a href="tel:+919581611711" className="cd-call-btn">📞 Call</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
