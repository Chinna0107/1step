import CustomerSidebar from '../../components/customer/CustomerSidebar'
import '../../components/customer/CustomerSidebar.css'

const services = [
  { icon: '💳', name: 'Credit Card Withdrawal', desc: 'Withdraw cash using your credit card instantly' },
  { icon: '📄', name: 'Credit Card Bill Payment', desc: 'Pay your credit card bills hassle-free' },
  { icon: '💸', name: 'Money Transfer (DMT)', desc: 'Send money to any bank account across India' },
  { icon: '🏦', name: 'Loan Services', desc: 'Personal, home & business loan assistance' },
  { icon: '📈', name: 'CIBIL Check & Repair', desc: 'Check your credit score and improve it' },
  { icon: '🛡️', name: 'Insurance Services', desc: 'Life, health & vehicle insurance plans' },
]

export default function CustomerServices() {
  return (
    <div className="cust-page">
      <CustomerSidebar />
      <div className="cust-content">
        <div className="cust-topbar">
          <h1>💳 Services</h1>
          <p>All financial services available at 1 Step Finance Care</p>
        </div>

        <div className="cust-card">
          <div className="cust-card-header"><h2>Available Services</h2></div>
          <div className="cust-card-body">
            <div className="cust-grid">
              {services.map((s, i) => (
                <div key={i} className="cust-service-card">
                  <div className="cust-service-icon">{s.icon}</div>
                  <div className="cust-service-name">{s.name}</div>
                  <div className="cust-service-desc">{s.desc}</div>
                  <div style={{ marginTop: 14 }}>
                    <a href="https://wa.me/919581611711" target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, fontWeight: 700, color: '#0d1f3d', textDecoration: 'none' }}>
                      📞 Contact Branch →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="cust-card">
          <div className="cust-card-header"><h2>Need Help?</h2></div>
          <div className="cust-card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="https://wa.me/919581611711?text=Hi%201 Step Finance Care%2C%20I%20need%20help%20with%20a%20service."
              target="_blank" rel="noopener noreferrer" className="cust-btn cust-btn-primary">
              💬 WhatsApp Us
            </a>
            <a href="tel:+919581611711" className="cust-btn" style={{ background: '#f1f5f9', color: '#0d1f3d', border: '1.5px solid rgba(13,31,61,0.2)' }}>
              📞 Call Branch
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
