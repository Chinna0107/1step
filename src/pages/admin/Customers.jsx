import React, { useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useCustomerRequests } from '../../hooks/useCustomers'
import '../../pages/dashboard.css'

export default function AdminCustomers() {
  const { all, loading, error, msg, approve, reject } = useCustomerRequests()
  const [search, setSearch] = useState('')

  const filtered = search
    ? all.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search) || c.pan?.toLowerCase().includes(search.toLowerCase()))
    : all

  const approved = all.filter(c => c.status === 'approved').length
  const pending  = all.filter(c => c.status === 'pending').length
  const rejected = all.filter(c => c.status === 'rejected').length

  const statusStyle = s => ({
    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-block',
    background: s === 'approved' ? '#d1fae5' : s === 'rejected' ? '#fee2e2' : '#fef3c7',
    color:      s === 'approved' ? '#059669' : s === 'rejected' ? '#dc2626' : '#d97706',
  })

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <h1>Customer Management</h1>
          <div className="dash-topbar-right">
            <input placeholder="Search name / phone / PAN..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ padding: '7px 14px', borderRadius: 8, border: '1.5px solid rgba(64,32,112,0.2)', fontFamily: 'inherit', fontSize: 13, width: 240 }} />
          </div>
        </div>
        <div className="dash-main">

          {msg   && <div className="dash-alert dash-alert-success">✅ {msg}</div>}
          {error && <div className="dash-alert dash-alert-error">❌ {error}</div>}

          <div className="dash-stats">
            <div className="dash-stat"><div className="dash-stat-label">Total</div><div className="dash-stat-value">{all.length}</div></div>
            <div className="dash-stat"><div className="dash-stat-label">Approved</div><div className="dash-stat-value" style={{ color: '#059669' }}>{approved}</div></div>
            <div className="dash-stat"><div className="dash-stat-label">Pending</div><div className="dash-stat-value" style={{ color: '#d97706' }}>{pending}</div></div>
            <div className="dash-stat"><div className="dash-stat-label">Rejected</div><div className="dash-stat-value" style={{ color: '#dc2626' }}>{rejected}</div></div>
          </div>

          <div className="dash-card">
            <div className="dash-card-header"><h2>All Customers ({filtered.length})</h2></div>
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : (
                <table className="dash-table">
                  <thead><tr><th>Name</th><th>Phone</th><th>PAN</th><th>Aadhar</th><th>Acc No.</th><th>KYC</th><th>Added By</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filtered.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.name}</strong><br /><span style={{ fontSize: 11, color: '#888' }}>{c.email}</span></td>
                        <td>{c.phone}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.pan}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.aadhar}</td>
                        <td style={{ fontSize: 12 }}>{c.acc_number}</td>
                        <td>
                          <span style={{ background: c.status === 'approved' ? '#d1fae5' : '#fef3c7', color: c.status === 'approved' ? '#059669' : '#d97706', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {c.status === 'approved' ? '✅ Verified' : '⏳ Pending'}
                          </span>
                        </td>
                        <td style={{ fontSize: 12 }}>{c.added_by_name || '—'}</td>
                        <td><span style={statusStyle(c.status)}>{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span></td>
                        <td>
                          {c.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="dash-btn dash-btn-success dash-btn-sm" onClick={() => approve(c.id)}>✅ Approve</button>
                              <button className="dash-btn dash-btn-danger  dash-btn-sm" onClick={() => reject(c.id)}>❌ Reject</button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, color: '#9ca3af' }}>by {c.reviewed_by_name || '—'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!filtered.length && <tr><td colSpan={9} className="dash-empty">No customers found</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
