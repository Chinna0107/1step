import React, { useState } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import './superadmin.css'
import './Dashboard.css'

const BRANCHES = [
  { id: 1, name: 'Kadapa Main',   city: 'Kadapa',     manager: 'Ravi Kumar',  customers: 320, visits: 58, revenue: '₹7.2L', growth: '+12%', status: 'active' },
  { id: 2, name: 'Ananthapur',    city: 'Ananthapur', manager: 'Priya S.',    customers: 240, visits: 44, revenue: '₹5.8L', growth: '+8%',  status: 'active' },
  { id: 3, name: 'Bangalore HSR', city: 'Bangalore',  manager: 'Mohammed A.', customers: 210, visits: 40, revenue: '₹5.4L', growth: '+5%',  status: 'active' },
]

const empty = { name: '', city: '', manager: '', address: '' }

export default function Branches() {
  const [branches, setBranches] = useState(BRANCHES)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [selected, setSelected] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = e => {
    e.preventDefault()
    setBranches(b => [...b, { id: Date.now(), ...form, customers: 0, visits: 0, revenue: '₹0', growth: '—', status: 'active' }])
    setForm(empty); setShowForm(false)
  }

  const toggleStatus = id => setBranches(b => b.map(br => br.id === id ? { ...br, status: br.status === 'active' ? 'inactive' : 'active' } : br))

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-topbar-title">Branch Management</h1>
            <p className="dash-topbar-sub">All branch intelligence in one place</p>
          </div>
          <div className="dash-topbar-right">
            <button className="sa-btn sa-btn-primary" onClick={() => setShowForm(v => !v)}>
              {showForm ? '✕ Cancel' : '+ Add Branch'}
            </button>
          </div>
        </div>

        <div className="dash-main">

          {/* Add Branch Form */}
          {showForm && (
            <div className="sa-card" style={{ marginBottom: 20 }}>
              <div className="sa-card-header"><h2>New Branch</h2></div>
              <div className="sa-card-body">
                <form onSubmit={handleSubmit}>
                  <div className="sa-form-grid">
                    <div className="sa-form-group"><label>Branch Name *</label><input required placeholder="e.g. Kadapa Main" value={form.name} onChange={e => set('name', e.target.value)} /></div>
                    <div className="sa-form-group"><label>City *</label><input required placeholder="City" value={form.city} onChange={e => set('city', e.target.value)} /></div>
                    <div className="sa-form-group"><label>Branch Manager</label><input placeholder="Manager name" value={form.manager} onChange={e => set('manager', e.target.value)} /></div>
                    <div className="sa-form-group"><label>Address</label><input placeholder="Full address" value={form.address} onChange={e => set('address', e.target.value)} /></div>
                  </div>
                  <button type="submit" className="sa-btn sa-btn-primary">✅ Create Branch</button>
                </form>
              </div>
            </div>
          )}

          {/* Branch Analytics */}
          <div className="dash-section-label">📍 Branch Analytics</div>
          <div className="sa-card">
            <div className="sa-card-header"><h2>All Branches ({branches.length})</h2></div>
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead><tr><th>Branch</th><th>City</th><th>Manager</th><th>Active Customers</th><th>Visits Today</th><th>Revenue</th><th>Growth</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {branches.map(b => (
                    <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(selected?.id === b.id ? null : b)}>
                      <td><strong>{b.name}</strong></td>
                      <td>{b.city}</td>
                      <td>{b.manager || '—'}</td>
                      <td>{b.customers}</td>
                      <td>{b.visits}</td>
                      <td style={{ color: '#059669', fontWeight: 700 }}>{b.revenue}</td>
                      <td style={{ color: '#10b981', fontWeight: 700 }}>{b.growth}</td>
                      <td><span className={`sa-status ${b.status}`}>{b.status === 'active' ? 'Active' : 'Inactive'}</span></td>
                      <td onClick={e => e.stopPropagation()}>
                        <button className="sa-btn sa-btn-warning sa-btn-sm" onClick={() => toggleStatus(b.id)}>
                          {b.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Branch Detail Drill-down */}
          {selected && (
            <>
              <div className="dash-section-label">📊 {selected.name} — Detailed Analytics</div>
              <div className="dash-grid-3">
                <div className="dash-card">
                  <div className="dash-card-head"><span>💰</span><h3>Revenue</h3></div>
                  <div className="dash-card-body">
                    <div className="dash-kv-list">
                      <div className="dash-kv"><span>Today</span><span className="kv-green">{selected.revenue}</span></div>
                      <div className="dash-kv"><span>This Week</span><span className="kv-green">₹42.8L</span></div>
                      <div className="dash-kv"><span>This Month</span><span className="kv-green">₹1.8Cr</span></div>
                    </div>
                  </div>
                </div>
                <div className="dash-card">
                  <div className="dash-card-head"><span>👥</span><h3>Customers</h3></div>
                  <div className="dash-card-body">
                    <div className="dash-kv-list">
                      <div className="dash-kv"><span>Active Customers</span><span className="kv-green">{selected.customers}</span></div>
                      <div className="dash-kv"><span>Visits Today</span><span className="kv-gold">{selected.visits}</span></div>
                      <div className="dash-kv"><span>New This Month</span><span className="kv-green">+24</span></div>
                    </div>
                  </div>
                </div>
                <div className="dash-card">
                  <div className="dash-card-head"><span>📈</span><h3>Growth Trend</h3></div>
                  <div className="dash-card-body">
                    <div className="dash-kv-list">
                      <div className="dash-kv"><span>WoW Growth</span><span className="kv-green">{selected.growth}</span></div>
                      <div className="dash-kv"><span>MoM Growth</span><span className="kv-green">+18%</span></div>
                      <div className="dash-kv"><span>Target Achievement</span><span className="kv-gold">92%</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
