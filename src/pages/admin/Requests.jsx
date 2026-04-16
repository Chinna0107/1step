import React, { useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useCustomerRequests } from '../../hooks/useCustomers'
import '../../pages/dashboard.css'

export default function Requests() {
  const { pending, all, loading, error, msg, approve, reject } = useCustomerRequests()
  const [tab, setTab] = useState('pending')

  const rows = tab === 'pending' ? pending : all

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
          <h1>Customer Requests</h1>
          <div className="dash-topbar-right">
            <span className="dash-badge">🔔 {pending.length} Pending</span>
          </div>
        </div>
        <div className="dash-main">
          {msg   && <div className="dash-alert dash-alert-success">✅ {msg}</div>}
          {error && <div className="dash-alert dash-alert-error">❌ {error}</div>}

          <div className="dash-tabs">
            <button className={`dash-tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
              Pending ({pending.length})
            </button>
            <button className={`dash-tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
              All Requests ({all.length})
            </button>
          </div>

          <div className="dash-card">
            <div className="dash-card-header"><h2>{tab === 'pending' ? 'Pending Approvals' : 'All Customer Requests'}</h2></div>
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : rows.length === 0 ? (
                <div className="dash-empty">No {tab === 'pending' ? 'pending' : ''} requests found</div>
              ) : (
                <table className="dash-table">
                  <thead>
                    <tr><th>Customer</th><th>Email</th><th>Phone</th><th>PAN</th><th>Aadhar</th><th>Acc No.</th><th>Submitted By</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {rows.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.name}</strong></td>
                        <td>{c.email}</td>
                        <td>{c.phone}</td>
                        <td>{c.pan}</td>
                        <td>{c.aadhar}</td>
                        <td>{c.acc_number}</td>
                        <td>{c.added_by_name}</td>
                        <td><span style={statusStyle(c.status)}>{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span></td>
                        <td>
                          {c.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="dash-btn dash-btn-success dash-btn-sm" onClick={() => approve(c.id)}>✅ Approve</button>
                              <button className="dash-btn dash-btn-danger  dash-btn-sm" onClick={() => reject(c.id)}>❌ Reject</button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: '#888' }}>by {c.reviewed_by_name || '—'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
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
