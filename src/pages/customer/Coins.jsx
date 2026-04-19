import { useState } from 'react'
import CustomerSidebar from '../../components/customer/CustomerSidebar'
import { useCustomerCoins, useCustomerTransactions } from '../../hooks/useCustomerAuth'
import '../../components/customer/CustomerSidebar.css'
import './Coins.css'

const fmt = n => Number(n).toLocaleString('en-IN')

export default function CustomerCoins() {
  const { coins, loading, redeeming, msg, error, redeem, setMsg, setError } = useCustomerCoins()
  const { txns } = useCustomerTransactions()
  const [redeemAmt, setRedeemAmt] = useState(100)

  const balance      = coins?.coins          ?? 0
  const totalRedeemed = coins?.coins_redeemed ?? 0
  const discount     = Math.floor(redeemAmt / 100)
  const maxRedeem    = Math.floor(balance / 100) * 100

  const handleRedeem = () => {
    setMsg(''); setError('')
    if (redeemAmt < 100)   return setError('Minimum 100 coins to redeem')
    if (redeemAmt > balance) return setError('Not enough coins')
    redeem(redeemAmt)
  }

  // Total earned from database (actual coins earned + redeemed)
  const totalEarned = balance + totalRedeemed

  return (
    <div className="cust-page">
      <CustomerSidebar />
      <div className="cust-content">

        {/* ── Hero ── */}
        <div className="coins-hero">
          <div className="coins-hero-orb coins-orb1" />
          <div className="coins-hero-orb coins-orb2" />
          <div className="coins-hero-inner">
            <div>
              <div className="coins-hero-label">MoneySpot Rewards</div>
              <h1 className="coins-hero-title">🪙 Your Coins</h1>
              <div className="coins-hero-sub">Earn 1 coin for every ₹1 spent · Redeem 100 coins = ₹1 discount</div>
            </div>
            <div className="coins-balance-pill">
              <div className="coins-balance-icon">🪙</div>
              <div>
                <div className="coins-balance-val">{loading ? '...' : fmt(balance)}</div>
                <div className="coins-balance-lbl">Available Coins</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Summary Cards ── */}
        <div className="coins-summary">
          {[
            { icon: '🪙', label: 'Available Coins',  value: fmt(balance),        color: '#d4af37', sub: `≈ ₹${fmt(Math.floor(balance / 100))} redeemable` },
            { icon: '📈', label: 'Total Earned',      value: fmt(totalEarned),    color: '#059669', sub: '1 coin per ₹1 spent' },
            { icon: '🎁', label: 'Total Redeemed',    value: fmt(totalRedeemed),  color: '#c02040', sub: `₹${fmt(Math.floor(totalRedeemed / 100))} saved` },
            { icon: '💡', label: 'Redeem Rate',       value: '100 = ₹1',          color: '#402070', sub: 'Min 100 coins to redeem' },
          ].map((c, i) => (
            <div key={i} className="coins-sum-card" style={{ '--cc': c.color, animationDelay: `${i * 80}ms` }}>
              <div className="coins-sum-glow" />
              <div className="coins-sum-icon">{c.icon}</div>
              <div className="coins-sum-val">{loading ? '—' : c.value}</div>
              <div className="coins-sum-label">{c.label}</div>
              <div className="coins-sum-sub">{c.sub}</div>
            </div>
          ))}
        </div>

        <div className="coins-grid">

          {/* ── Redeem Card ── */}
          <div className="coins-card">
            <div className="coins-card-header">
              <span>🎁</span>
              <h2>Redeem Coins</h2>
            </div>
            <div className="coins-card-body">
              {msg   && <div className="coins-alert coins-alert-success">✅ {msg}</div>}
              {error && <div className="coins-alert coins-alert-error">❌ {error}</div>}

              <div className="coins-redeem-balance">
                <span className="coins-redeem-bal-label">Your Balance</span>
                <span className="coins-redeem-bal-val">🪙 {fmt(balance)}</span>
              </div>

              <div className="coins-slider-wrap">
                <label className="coins-slider-label">
                  Coins to Redeem: <strong>{fmt(redeemAmt)}</strong>
                </label>
                <input
                  type="range"
                  min={100}
                  max={Math.max(100, maxRedeem)}
                  step={100}
                  value={Math.min(redeemAmt, Math.max(100, maxRedeem))}
                  onChange={e => setRedeemAmt(Number(e.target.value))}
                  className="coins-slider"
                  disabled={balance < 100}
                />
                <div className="coins-slider-range">
                  <span>100</span>
                  <span>{fmt(Math.max(100, maxRedeem))}</span>
                </div>
              </div>

              <div className="coins-redeem-preview">
                <div className="coins-preview-row">
                  <span>Coins to use</span>
                  <span className="coins-preview-coins">🪙 {fmt(redeemAmt)}</span>
                </div>
                <div className="coins-preview-row">
                  <span>Discount value</span>
                  <span className="coins-preview-discount">₹{fmt(discount)}</span>
                </div>
                <div className="coins-preview-row">
                  <span>Remaining coins</span>
                  <span>{fmt(Math.max(0, balance - redeemAmt))}</span>
                </div>
              </div>

              <button
                className="coins-redeem-btn"
                onClick={handleRedeem}
                disabled={redeeming || balance < 100}
              >
                {redeeming ? 'Redeeming...' : `🎁 Redeem ${fmt(redeemAmt)} Coins for ₹${fmt(discount)}`}
              </button>

              {balance < 100 && (
                <div className="coins-need-more">
                  You need {100 - balance} more coins to redeem. Keep transacting!
                </div>
              )}
            </div>
          </div>

          {/* ── How to Earn ── */}
          <div className="coins-card">
            <div className="coins-card-header">
              <span>💡</span>
              <h2>How It Works</h2>
            </div>
            <div className="coins-card-body">
              {[
                { icon: '💳', step: '1', title: 'Make a Transaction', desc: 'Every ₹1 you spend earns you 1 MoneySpot Coin automatically.' },
                { icon: '🪙', step: '2', title: 'Coins Accumulate', desc: 'Coins are credited instantly after each transaction. No minimum required to earn.' },
                { icon: '🎁', step: '3', title: 'Redeem for Discounts', desc: 'Use 100 coins to get ₹1 off on your next transaction. Minimum 100 coins to redeem.' },
                { icon: '♾️', step: '4', title: 'No Expiry', desc: 'Your MoneySpot Coins never expire. Accumulate as many as you want!' },
              ].map((s, i) => (
                <div key={i} className="coins-step" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="coins-step-num">{s.step}</div>
                  <div className="coins-step-icon">{s.icon}</div>
                  <div>
                    <div className="coins-step-title">{s.title}</div>
                    <div className="coins-step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent Earning History ── */}
        <div className="coins-card">
          <div className="coins-card-header">
            <span>📋</span>
            <h2>Earning History</h2>
            <span className="coins-card-badge">{txns.length} transactions</span>
          </div>
          <div className="coins-table-wrap">
            {txns.length === 0 ? (
              <div className="coins-empty">
                <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
                <div>No transactions yet — start transacting to earn coins!</div>
              </div>
            ) : (
              <table className="coins-table">
                <thead>
                  <tr><th>Date</th><th>Service</th><th>Amount</th><th>Coins Earned</th></tr>
                </thead>
                <tbody>
                  {txns.map((t, i) => (
                    <tr key={t.id} className="coins-tr" style={{ animationDelay: `${i * 40}ms` }}>
                      <td style={{ fontSize: 12, color: '#64748b' }}>{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                      <td><strong>{t.service_type || '—'}</strong></td>
                      <td><span style={{ color: '#059669', fontWeight: 700 }}>₹{fmt(t.amount)}</span></td>
                      <td><span className="coins-earned-tag">🪙 +{fmt(Math.floor(parseFloat(t.amount || 0)))}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
