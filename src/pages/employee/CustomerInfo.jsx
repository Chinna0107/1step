import React from 'react'
import EmployeeNavbar from '../../components/employee/EmployeeNavbar'
import { useMyCustomers } from '../../hooks/useCustomers'
import '../../pages/dashboard.css'

export default function CustomerInfo() {
  const { customers, loading, error } = useMyCustomers()

  const approved = customers.filter(c => c.status === 'approved').length
  const pending  = customers.filter(c => c.status === 'pending').length
  const rejected = customers.filter(c => c.status === 'rejected').length

  const statusStyle = s => ({
    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-block',
    background: s === 'approved' ? '#d1fae5' : s === 'rejected' ? '#fee2e2' : '#fef3c7',
    color:      s === 'approved' ? '#059669' : s === 'rejected' ? '#dc2626' : '#d97706',
  })

  return (
    <div className="emp-page">
      <EmployeeNavbar />
      <div className="emp-page-content">
        <div className="emp-page-header">
          <h1>Customer Information</h1>
        </div>

        {error && <div className="dash-alert dash-alert-error">❌ {error}</div>}

        <div className="dash-stats">
          <div className="dash-stat"><div className="dash-stat-icon">✅</div><div className="dash-stat-label">Approved</div><div className="dash-stat-value" style={{ color: '#059669' }}>{approved}</div></div>
          <div className="dash-stat"><div className="dash-stat-icon">⏳</div><div className="dash-stat-label">Pending</div><div className="dash-stat-value" style={{ color: '#d97706' }}>{pending}</div></div>
          <div className="dash-stat"><div className="dash-stat-icon">❌</div><div className="dash-stat-label">Rejected</div><div className="dash-stat-value" style={{ color: '#dc2626' }}>{rejected}</div></div>
          <div className="dash-stat"><div className="dash-stat-icon">👥</div><div className="dash-stat-label">Total</div><div className="dash-stat-value">{customers.length}</div></div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header"><h2>All Customers</h2></div>
          <div className="dash-table-wrap">
            {loading ? <div className="dash-loading">Loading...</div> : customers.length === 0 ? (
              <div className="dash-empty">No customers found. Add a new customer to get started.</div>
            ) : (
              <table className="dash-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Phone</th><th>PAN</th><th>Acc Number</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.email}</td>
                      <td>{c.phone}</td>
                      <td>{c.pan}</td>
                      <td>{c.acc_number}</td>
                      <td><span style={statusStyle(c.status)}>{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span></td>
                      <td>{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
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
