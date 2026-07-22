import { useState } from 'react'
import CustomerSidebar from '../../components/customer/CustomerSidebar'
import { useCustomerCoins, useCustomerTransactions } from '../../hooks/useCustomerAuth'
import '../../components/customer/CustomerSidebar.css'
import './Coins.css'

const fmt = n => Number(n).toLocaleString('en-IN')

export default function CustomerCoins() {
  const { coins, loading, redeeming, msg, error, redeem, setMsg, setError } = useCustomerCoins()
  const { txns } = useCustomerTransactions()
  const [redeemAmt, setRedeemAmt] = useState(10)

  const balance       = coins?.coins          ?? 0
  const totalRedeemed = coins?.coins_redeemed ?? 0
  const discount      = Math.floor(redeemAmt / 10)
  const maxRedeem     = Math.floor(balance / 10) * 10

  const handleRedeem = () => {
    setMsg(''); setError('')
    if (redeemAmt < 10)    return setError('Minimum 10 coins to redeem')
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
              <div className="coins-hero-label">1 Step Finance Care Rewards</div>
              <h1 className="coins-hero-title"><img src="/logo.png" style={{width: 36, height: 36, objectFit: 'contain', verticalAlign: 'bottom', marginRight: 8}} alt="coin"/>Your Coins</h1>
              <div className="coins-hero-sub">Earn coins on every transaction · Redeem 10 coins = ₹1 discount</div>
            </div>
            <div className="coins-balance-pill">
              <div className="coins-balance-icon"><img src="/logo.png" style={{width: 44, height: 44, objectFit: 'contain'}} alt="coin"/></div>
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
            // { icon: '🪙', label: 'Available Coins',  value: fmt(balance),        color: '#d4af37', sub: `≈ ₹${fmt(Math.floor(balance / 10))} redeemable` },
            { icon: '📈', label: 'Total Earned',      value: fmt(totalEarned),    color: '#059669', sub: 'Coins earned on transactions' },
            { icon: '🎁', label: 'Total Redeemed',    value: fmt(totalRedeemed),  color: '#1a365d', sub: `₹${fmt(Math.floor(totalRedeemed / 10))} saved` },
            // { icon: '💡', label: 'Redeem Rate',       value: 'upda',           color: '#0d1f3d', sub: '1 coin = ₹0.10 (10 paise)' },
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

        {/* ── Gifts & Rewards ── */}
        <div className="coins-gifts-section">
          <div className="coins-gifts-header">
            <div>
              <div className="coins-gifts-eyebrow">🎁 Rewards Catalogue</div>
              <h2 className="coins-gifts-title">Gifts You Can Win</h2>
              <p className="coins-gifts-sub">Earn coins on every transaction and unlock amazing gifts. The more you transact, the bigger the reward!</p>
            </div>
            <div className="coins-gifts-balance-chip">
              <span className="coins-gifts-chip-icon"><img src="/logo.png" style={{width: 20, height: 20, objectFit: 'contain'}} alt="coin"/></span>
              <div>
                <div className="coins-gifts-chip-val">{fmt(balance)}</div>
                <div className="coins-gifts-chip-lbl">Your Coins</div>
              </div>
            </div>
          </div>

          <div className="coins-gifts-grid">
            {[
              {
                name: 'Premium Water Bottle',
                desc: 'Stainless steel insulated bottle — keeps drinks cold for 24hrs',
                coins: 5000,
                color: '#0ea5e9',
                img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&q=80&auto=format&fit=crop',
              },
              {
                name: 'Stylish Backpack',
                desc: 'Spacious laptop backpack with multiple compartments',
                coins: 15000,
                color: '#8b5cf6',
                img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&q=80&auto=format&fit=crop',
              },
              {
                name: 'Wireless Earphones',
                desc: 'Bluetooth earbuds with noise cancellation & 20hr battery',
                coins: 30000,
                color: '#ec4899',
                img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&q=80&auto=format&fit=crop',
              },
              {
                name: 'Office Desk Kit',
                desc: 'Premium stationery & organiser set for your workspace',
                coins: 40000,
                color: '#d97706',
                img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=80&auto=format&fit=crop',
              },
              {
                name: 'Smart Study Table',
                desc: 'Foldable wooden table with storage — perfect for home use',
                coins: 50000,
                color: '#10b981',
                img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=300&q=80&auto=format&fit=crop',
              },
              {
                name: '1 Step Finance Care Gift Box',
                desc: 'Exclusive curated gift hamper from 1 Step Finance Care Fintech',
                coins: 80000,
                color: '#1a365d',
                img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&q=80&auto=format&fit=crop',
              },
            ].map((g, i) => {
              const unlocked = balance >= g.coins
              const progress = Math.min(100, Math.floor((balance / g.coins) * 100))
              const remaining = Math.max(0, g.coins - balance)
              return (
                <div key={i} className={`coins-gift-card ${unlocked ? 'gift-unlocked' : ''}`} style={{ '--gc': g.color, animationDelay: `${i * 70}ms` }}>
                  <div className="gift-img-wrap">
                    <img src={g.img} alt={g.name} className="gift-img" />
                    <div className="gift-img-overlay" />
                    {unlocked
                      ? <div className="gift-status gift-status-unlocked">🎉 Unlocked!</div>
                      : <div className="gift-status gift-status-locked">🔒 {remaining.toLocaleString('en-IN')} more coins</div>
                    }
                    <div className="gift-coins-badge"><img src="/logo.png" style={{width: 14, height: 14, objectFit: 'contain', verticalAlign: 'middle', marginRight: 4}} alt="coin"/>{g.coins.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="gift-body">
                    <div className="gift-name">{g.name}</div>
                    <div className="gift-desc">{g.desc}</div>
                    <div className="gift-progress-wrap">
                      <div className="gift-progress-top">
                        <span className="gift-progress-label">Progress</span>
                        <span className="gift-progress-pct" style={{ color: g.color }}>{progress}%</span>
                      </div>
                      <div className="gift-bar-track">
                        <div className="gift-bar-fill" style={{ width: `${progress}%`, background: g.color }} />
                      </div>
                    </div>
                    {unlocked
                      ? <button className="gift-claim-btn" style={{ '--gc': g.color }}>🎁 Claim Gift</button>
                      : <div className="gift-need">{remaining.toLocaleString('en-IN')} coins to go</div>
                    }
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="coins-grid">

          {/* ── Redeem Card ── */}
          <div className="coins-card">
            <div className="coins-card-header">
              <span>🎁</span>
              <h2>Redeem Coins</h2>
              <span className="coins-card-badge" style={{ background: '#fef9c3', color: '#92400e' }}>Coming Soon</span>
            </div>
            <div className="coins-card-body coins-redeem-locked">
              <div className="coins-coming-soon">
                <div className="coins-coming-icon">🔒</div>
                <div className="coins-coming-title">Redemption Coming Soon</div>
                <div className="coins-coming-desc">We're working on the coin redemption feature. Stay tuned — it will be available soon!</div>
              </div>
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
                { icon: '💳', step: '1', title: 'Updated soon', desc: 'It will updated soon...' },
                // { icon: '🪙', step: '2', title: 'Coins Accumulate', desc: 'Coins are credited instantly after each transaction. No minimum required to earn.' },
                // { icon: '🎁', step: '3', title: 'Redeem for Discounts', desc: 'Use 10 coins to get ₹1 off on your next transaction. Minimum 10 coins to redeem.' },
                // { icon: '♾️', step: '4', title: 'No Expiry', desc: 'Your 1 Step Finance Care Coins never expire. Accumulate as many as you want!' },
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
        {/* <div className="coins-card">
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
                      <td><span className="coins-earned-tag"><img src="/logo.png" style={{width: 14, height: 14, objectFit: 'contain', verticalAlign: 'middle', marginRight: 2}} alt="coin"/> +{fmt(Math.floor(parseFloat(t.amount || 0) / 10))}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div> */}

      </div>
    </div>
  )
}
