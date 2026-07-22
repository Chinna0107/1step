import { useState } from 'react'
import CustomerSidebar from '../../components/customer/CustomerSidebar'
import '../../components/customer/CustomerSidebar.css'
import './Misc.css'

import { 
  MdCardGiftcard, MdGroupAdd, MdStar, MdEmojiEvents, 
  MdCheckCircle, MdInfo, MdLocalOffer, MdNotifications,
  MdChat, MdPhone, MdSend, MdSupportAgent,
  MdVpnKey, MdSecurity, MdVisibility, MdDevices
} from 'react-icons/md'

export function CustomerOffers() {
  const offers = [
    { icon: <MdCardGiftcard />, title: 'Cashback on DMT', desc: 'Get 0.5% cashback on every money transfer above ₹5,000', tag: 'Active', color: '#0ea5e9', shadow: 'rgba(14,165,233,0.3)' },
    { icon: <MdGroupAdd />, title: 'Referral Bonus', desc: 'Refer a friend and earn ₹100 credit on their first transaction', tag: 'Active', color: '#10b981', shadow: 'rgba(16,185,129,0.3)' },
    { icon: <MdStar />, title: 'Scratch Card', desc: 'Complete 5 transactions this month to unlock a scratch card', tag: 'Eligible', color: '#f59e0b', shadow: 'rgba(245,158,11,0.3)' },
    { icon: <MdEmojiEvents />, title: 'Loyalty Reward', desc: 'Customers with 20+ transactions get priority service', tag: 'Coming Soon', color: '#6366f1', shadow: 'rgba(99,102,241,0.3)' },
  ]

  return (
    <div className="cust-page">
      <CustomerSidebar />
      <div className="cust-content">
        <div className="cust-topbar">
          <h1><MdLocalOffer color="#3b82f6" /> Offers & Benefits</h1>
          <p>Exclusive rewards for 1 Step Finance Care customers</p>
        </div>
        <div className="offers-grid">
          {offers.map((o, i) => (
            <div key={i} className="offer-card" style={{ '--c': o.color, '--c-shadow': o.shadow }}>
              <div className="offer-bg-glow" />
              <div className="offer-icon-wrap">{o.icon}</div>
              <div className={`offer-tag ${o.tag.replace(' ', '')}`}>{o.tag}</div>
              <h3 className="offer-title">{o.title}</h3>
              <p className="offer-desc">{o.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CustomerNotifications() {
  const notifs = [
    { icon: <MdCheckCircle />, title: 'Account Approved', msg: 'Your 1 Step Finance Care account has been approved successfully.', time: 'Today', type: 'success' },
    { icon: <MdInfo />, title: 'New Service Available', msg: 'CIBIL Check & Repair service is now available at your branch.', time: 'Yesterday', type: 'info' },
    { icon: <MdLocalOffer />, title: 'Cashback Offer', msg: 'Get 0.5% cashback on DMT transactions this week!', time: '2 days ago', type: 'offer' },
  ]

  const colors = { success: '#059669', info: '#3b82f6', offer: '#d97706' }
  const bgColors = { success: '#d1fae5', info: '#dbeafe', offer: '#fef3c7' }

  return (
    <div className="cust-page">
      <CustomerSidebar />
      <div className="cust-content">
        <div className="cust-topbar">
          <h1><MdNotifications color="#3b82f6" /> Notifications</h1>
          <p>You have {notifs.length} new alerts</p>
        </div>
        <div className="notif-card">
          {notifs.map((n, i) => (
            <div key={i} className="notif-item">
              <div className="notif-icon" style={{ '--c': colors[n.type], '--c-light': bgColors[n.type] }}>
                {n.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div className="notif-title">{n.title}</div>
                <div className="notif-msg">{n.msg}</div>
              </div>
              <div className="notif-time">{n.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const WHATSAPP_NUMBER = '919581611711'

export function CustomerSupport() {
  const [form, setForm] = useState({ name: '', mobile: '', subject: '', message: '' })

  const handleSubmit = () => {
    const { name, mobile, subject, message } = form
    if (!name.trim() || !mobile.trim() || !subject.trim() || !message.trim())
      return alert('Please fill in all fields before submitting.')

    const text = `Hello 1 Step Finance Care Support! 👋

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
        <div className="cust-topbar">
          <h1><MdSupportAgent color="#3b82f6" /> Support</h1>
          <p>We're here to help you anytime</p>
        </div>

        <div className="support-grid">
          <div className="support-contact-card whatsapp" onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%201 Step Finance Care%2C%20I%20need%20support.`, '_blank')}>
            <div className="support-icon"><MdChat /></div>
            <h3 style={{ fontSize: 18, margin: '0 0 8px', color: '#0f172a' }}>WhatsApp Support</h3>
            <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 20px' }}>Chat with us instantly on WhatsApp</p>
            <span className="support-btn whatsapp">Open WhatsApp</span>
          </div>
          
          <a href={`tel:+${WHATSAPP_NUMBER}`} className="support-contact-card call" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="support-icon"><MdPhone /></div>
            <h3 style={{ fontSize: 18, margin: '0 0 8px', color: '#0f172a' }}>Call Branch</h3>
            <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 20px' }}>Speak directly with a representative</p>
            <span className="support-btn call">Call Now</span>
          </a>

          <div className="support-form-card">
            <h2 style={{ fontSize: 20, margin: '0 0 20px', color: '#0f172a' }}>Raise a Support Ticket</h2>
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
              <textarea rows={4} placeholder="Describe your issue in detail..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
            </div>
            <button className="submit-btn" onClick={handleSubmit}><MdSend size={18}/> Submit via WhatsApp</button>
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
        <div className="cust-topbar">
          <h1><MdSecurity color="#3b82f6" /> Security</h1>
          <p>Your account security and privacy settings</p>
        </div>

        <div className="sec-grid">
          {[
            { icon: <MdVpnKey />, title: 'PAN + Mobile Login', desc: 'Secured with PAN number and registered mobile verification.', status: 'Active' },
            { icon: <MdSecurity />, title: 'Secure Transactions', desc: 'All transactions are processed through encrypted channels.', status: 'Active' },
            { icon: <MdVisibility />, title: 'Account Protection', desc: 'Suspicious login attempts are blocked and flagged.', status: 'Active' },
            { icon: <MdDevices />, title: 'Session Management', desc: 'Your session expires automatically after 8 hours.', status: 'Active' },
          ].map((s, i) => (
            <div key={i} className="sec-card">
              <div className="sec-icon-wrap">{s.icon}</div>
              <div>
                <div className="sec-title">{s.title} <span className="sec-status">{s.status}</span></div>
                <p className="sec-desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="sec-tips">
          <h2 style={{ fontSize: 20, margin: '0 0 20px', color: '#fff' }}>Security Tips</h2>
          {['Never share your PAN or mobile OTP with anyone.', 'Always log out after using the portal on shared devices.', 'Report any suspicious activity immediately to your branch.', 'Keep your registered mobile number updated with us.'].map((tip, i) => (
            <div key={i} className="sec-tip-item">
              <MdCheckCircle className="sec-tip-icon" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
