import React, { useState } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import './superadmin.css'

const initialServices = [
  { id: 1, name: 'Consulting', description: 'Business consulting services', price: '₹5,000/hr', status: 'Active' },
  { id: 2, name: 'Loan Processing', description: 'Personal & business loans', price: '₹2,000/case', status: 'Active' },
  { id: 3, name: 'Insurance', description: 'Life & health insurance plans', price: '₹1,500/plan', status: 'Active' },
]

export default function ServicesData() {
  const [services, setServices] = useState(initialServices)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ name: '', description: '', price: '', status: 'Active' })

  const handleSubmit = e => {
    e.preventDefault()
    setServices([...services, { id: Date.now(), ...form }])
    setForm({ name: '', description: '', price: '', status: 'Active' })
    setShowForm(false)
  }

  const handleDelete = id => setServices(services.filter(s => s.id !== id))

  const toggleStatus = id => setServices(services.map(s =>
    s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s
  ))

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="sa-topbar">
          <h1>Manage Services</h1>
          <div className="sa-topbar-right">
            <button className="sa-btn sa-btn-primary" onClick={() => setShowForm(v => !v)}>
              {showForm ? '✕ Cancel' : '+ Add Service'}
            </button>
          </div>
        </div>

        <div className="sa-main">
          {showForm && (
            <div className="sa-card" style={{ marginBottom: 24 }}>
              <div className="sa-card-header"><h2>New Service</h2></div>
              <div className="sa-card-body">
                <form onSubmit={handleSubmit}>
                  <div className="sa-form-grid">
                    <div className="sa-form-group">
                      <label>Service Name</label>
                      <input required placeholder="e.g. Loan Processing" value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="sa-form-group">
                      <label>Price</label>
                      <input required placeholder="e.g. ₹2,000/case" value={form.price}
                        onChange={e => setForm({ ...form, price: e.target.value })} />
                    </div>
                    <div className="sa-form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Description</label>
                      <input required placeholder="Brief description" value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                  </div>
                  <button type="submit" className="sa-btn sa-btn-primary">✅ Add Service</button>
                </form>
              </div>
            </div>
          )}

          <div className="sa-card">
            <div className="sa-card-header">
              <h2>All Services ({services.length})</h2>
            </div>
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.description}</td>
                      <td style={{ fontWeight: 700, color: 'var(--ms-purple)' }}>{s.price}</td>
                      <td><span className={`sa-status ${s.status.toLowerCase()}`}>{s.status}</span></td>
                      <td style={{ display: 'flex', gap: 6 }}>
                        <button className="sa-btn sa-btn-warning sa-btn-sm" onClick={() => toggleStatus(s.id)}>
                          {s.status === 'Active' ? 'Disable' : 'Enable'}
                        </button>
                        <button className="sa-btn sa-btn-danger sa-btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
