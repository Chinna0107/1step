import React from 'react'
import EmployeeNavbar from '../../components/employee/EmployeeNavbar'
import '../../pages/dashboard.css'

const services = [
  { id: 1, icon: '💰', name: 'Personal Loan', desc: 'Quick personal loans with minimal documentation', price: '₹2,000/case', color: '#402070' },
  { id: 2, icon: '🏠', name: 'Home Loan',     desc: 'Affordable home loans for your dream home',      price: '₹3,000/case', color: '#c02040' },
  { id: 3, icon: '🚗', name: 'Vehicle Loan',  desc: 'Two-wheeler and four-wheeler loans',              price: '₹1,500/case', color: '#d4af37' },
  { id: 4, icon: '📋', name: 'Insurance',     desc: 'Life, health and general insurance plans',        price: '₹1,000/plan', color: '#059669' },
  { id: 5, icon: '💳', name: 'Credit Card',   desc: 'Premium credit cards with rewards',               price: '₹500/card',   color: '#0284c7' },
  { id: 6, icon: '📈', name: 'Investments',   desc: 'Mutual funds and SIP advisory',                   price: '₹2,500/plan', color: '#7c3aed' },
]

export default function Services() {
  return (
    <div className="emp-page">
      <EmployeeNavbar />
      <div className="emp-page-content">
        <div className="emp-page-header">
          <h1>Available Services</h1>
          <span className="dash-badge">{services.length} Services</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {services.map(s => (
            <div key={s.id} className="dash-card" style={{ marginBottom: 0, cursor: 'default', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(64,32,112,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
              <div style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}18`, border: `1.5px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--ms-purple)', fontSize: 15 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Service</div>
                  </div>
                </div>
                <p style={{ color: '#666', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>{s.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, color: s.color, fontSize: 16 }}>{s.price}</span>
                  <span style={{ padding: '4px 12px', borderRadius: 20, background: '#d1fae5', color: '#059669', fontSize: 11, fontWeight: 700 }}>Available</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
