import { useState } from 'react'
import CustomerSidebar from '../../components/customer/CustomerSidebar'
import '../../components/customer/CustomerSidebar.css'

export function CustomerOffers() {
  const offers = [
    { icon: '💰', title: 'Cashback on DMT', desc: 'Get 0.5% cashback on every money transfer above ₹5,000', tag: 'Active' },
    { icon: '🎁', title: 'Referral Bonus', desc: 'Refer a friend and earn ₹100 credit on their first transaction', tag: 'Active' },
    { icon: '🃏', title: 'Scratch Card', desc: 'Complete 5 transactions this month to unlock a scratch card', tag: 'Eligible' },
    { icon: '🏆', title: 'Loyalty Reward', desc: 'Customers with 20+ transactions get priority service', tag: 'Coming Soon' },
  ]

  return (
    <div className="cust-page">
      <CustomerSidebar />
      <div className="cust-content">
        <div className="cust-topbar"><h1>💰 Offers & Benefits</h1><p>Exclusive rewards for MoneySpot customers</p></div>
        <div className="cust-grid" style={{ marginBottom: 20 }}>
          {offers.map((o, i) => (
            <div key={i} className="cust-card" style={{ margin: 0 }}>
              <div className="cust-card-body">
                <div style={{ fontSize: 28, marginBottom: 10 }}>{o.icon}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <strong style={{ fontSize: 14, color: '#1a0a2e' }}>{o.title}</strong>
                  <span className={`cust-badge ${o.tag === 'Active' ? 'cust-badge-success' : o.tag === 'Eligible' ? 'cust-badge-pending' : ''}`}
                    style={o.tag === 'Coming Soon' ? { background: '#f1f5f9', color: '#64748b' } : {}}>
                    {o.tag}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{o.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CustomerNotifications() {
  const notifs = [
    { icon: '✅', title: 'Account Approved', msg: 'Your MoneySpot account has been approved successfully.', time: 'Today', type: 'success' },
    { icon: '💳', title: 'New Service Available', msg: 'CIBIL Check & Repair service is now available at your branch.', time: 'Yesterday', type: 'info' },
    { icon: '🎁', title: 'Cashback Offer', msg: 'Get 0.5% cashback on DMT transactions this week!', time: '2 days ago', type: 'offer' },
  ]

  const colors = { success: '#d1fae5', info: '#dbeafe', offer: '#fef3c7' }
  const textColors = { success: '#059669', info: '#1d4ed8', offer: '#d97706' }

  return (
    <div className="cust-page">
      <CustomerSidebar />
      <div className="cust-content">
        <div className="cust-topbar"><h1>🔔 Notifications</h1><p>{notifs.length} notifications</p></div>
        <div className="cust-card">
          <div className="cust-card-body" style={{ padding: 0 }}>
            {notifs.map((n, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '16px 20px', borderBottom: i < notifs.length - 1 ? '1px solid #f1f5f9' : 'none', alignItems: 'flex-start' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: colors[n.type], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{n.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1a0a2e' }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{n.msg}</div>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>{n.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const WHATSAPP_NUMBER = '919866440477'

export function CustomerSupport() {
  const [form, setForm] = useState({ name: '', mobile: '', subject: '', message: '' })

  const handleSubmit = () => {
    const { name, mobile, subject, message } = form
    if (!name.trim() || !mobile.trim() || !subject.trim() || !message.trim())
      return alert('Please fill in all fields before submitting.')

    const text = `Hello MoneySpot Support! 👋

*Support Ticket*
----------------------------
*Name:* ${name}
*Mobile:* ${mobile}
*Subject:* ${subject}
*Message:* ${message}
----------------------------
Please assist me at the earliest.`

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank')
    setForm({ name: '', mobile: '', subject: '', message: '' })
  }

  return (
    <div className="cust-page">
      <CustomerSidebar />
      <div className="cust-content">
        <div className="cust-topbar"><h1>📞 Support</h1><p>We're here to help you</p></div>

        <div className="cust-grid" style={{ marginBottom: 20 }}>
          <div className="cust-card" style={{ margin: 0 }}>
            <div className="cust-card-body" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>WhatsApp Support</div>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>Chat with us instantly on WhatsApp for quick help</p>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20MoneySpot%2C%20I%20need%20support.`} target="_blank" rel="noopener noreferrer" className="cust-btn cust-btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Open WhatsApp
              </a>
            </div>
          </div>
          <div className="cust-card" style={{ margin: 0 }}>
            <div className="cust-card-body" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📞</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Call Branch</div>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>Speak directly with your branch representative</p>
              <a href={`tel:+${WHATSAPP_NUMBER}`} className="cust-btn" style={{ display: 'inline-block', textDecoration: 'none', background: '#f1f5f9', color: '#402070', border: '1.5px solid rgba(64,32,112,0.2)', padding: '11px 22px', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
                Call Now
              </a>
            </div>
          </div>
        </div>

        <div className="cust-card">
          <div className="cust-card-header"><h2>Raise a Support Ticket</h2></div>
          <div className="cust-card-body">
            <div className="cust-form-group">
              <label>Full Name</label>
              <input placeholder="Your full name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="cust-form-group">
              <label>Mobile Number</label>
              <input placeholder="Your mobile number" value={form.mobile} onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))} />
            </div>
            <div className="cust-form-group">
              <label>Subject</label>
              <input placeholder="e.g. Transaction issue, Account query..." value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
            </div>
            <div className="cust-form-group">
              <label>Message</label>
              <textarea rows={4} placeholder="Describe your issue in detail..." style={{ resize: 'vertical' }} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
            </div>
            <button className="cust-btn cust-btn-primary" onClick={handleSubmit}>💬 Submit via WhatsApp</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CustomerSecurity() {
  return (
    <div className="cust-page">
      <CustomerSidebar />
      <div className="cust-content">
        <div className="cust-topbar"><h1>🔐 Security</h1><p>Your account security settings</p></div>

        <div className="cust-grid">
          {[
            { icon: '🔑', title: 'PAN + Mobile Login', desc: 'Your account is secured with PAN number and registered mobile verification.', status: 'Active' },
            { icon: '🛡️', title: 'Secure Transactions', desc: 'All transactions are processed through encrypted and verified channels.', status: 'Active' },
            { icon: '👁️', title: 'Account Protection', desc: 'Suspicious login attempts are automatically blocked and flagged.', status: 'Active' },
            { icon: '📱', title: 'Session Management', desc: 'Your session expires automatically after 8 hours of inactivity.', status: 'Active' },
          ].map((s, i) => (
            <div key={i} className="cust-card" style={{ margin: 0 }}>
              <div className="cust-card-body">
                <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <strong style={{ fontSize: 14, color: '#1a0a2e' }}>{s.title}</strong>
                  <span className="cust-badge cust-badge-success">{s.status}</span>
                </div>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="cust-card" style={{ marginTop: 20 }}>
          <div className="cust-card-header"><h2>Security Tips</h2></div>
          <div className="cust-card-body">
            {['Never share your PAN or mobile OTP with anyone.', 'Always log out after using the portal on shared devices.', 'Report any suspicious activity immediately to your branch.', 'Keep your registered mobile number updated with us.'].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none', fontSize: 13, color: '#334155' }}>
                <span style={{ color: '#059669', fontWeight: 700 }}>✓</span> {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
