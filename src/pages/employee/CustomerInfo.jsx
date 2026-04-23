import React, { useState, useMemo } from 'react'
import EmployeeNavbar from '../../components/employee/EmployeeNavbar'
import { useMyCustomers } from '../../hooks/useCustomers'
import '../../pages/dashboard.css'
import './CustomerInfo.css'

export default function CustomerInfo() {
  const { customers, loading, error } = useMyCustomers()
  const [lightbox, setLightbox]       = useState(null)
  const [search, setSearch]           = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return customers.filter(c => {
      const matchStatus = !filterStatus || c.status === filterStatus
      const matchSearch = !q ||
        c.name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.pan?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [customers, search, filterStatus])

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
          <div className="dash-stat" style={{ cursor: 'pointer' }} onClick={() => setFilterStatus(filterStatus === 'approved' ? '' : 'approved')}><div className="dash-stat-icon">✅</div><div className="dash-stat-label">Approved</div><div className="dash-stat-value" style={{ color: '#059669' }}>{approved}</div></div>
          <div className="dash-stat" style={{ cursor: 'pointer' }} onClick={() => setFilterStatus(filterStatus === 'pending'  ? '' : 'pending')} ><div className="dash-stat-icon">⏳</div><div className="dash-stat-label">Pending</div><div className="dash-stat-value"  style={{ color: '#d97706' }}>{pending}</div></div>
          <div className="dash-stat" style={{ cursor: 'pointer' }} onClick={() => setFilterStatus(filterStatus === 'rejected' ? '' : 'rejected')}><div className="dash-stat-icon">❌</div><div className="dash-stat-label">Rejected</div><div className="dash-stat-value" style={{ color: '#dc2626' }}>{rejected}</div></div>
          <div className="dash-stat" style={{ cursor: 'pointer' }} onClick={() => setFilterStatus('')}><div className="dash-stat-icon">👥</div><div className="dash-stat-label">Total</div><div className="dash-stat-value">{customers.length}</div></div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <h2>All Customers ({filtered.length})</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }}>🔍</span>
                <input
                  placeholder="Search name, phone, PAN, email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit', width: 240, outline: 'none' }}
                />
                {search && (
                  <button onClick={() => setSearch('')}
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 14 }}>✕</button>
                )}
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit', color: '#374151' }}>
                <option value="">All Status</option>
                <option value="approved">✅ Approved</option>
                <option value="pending">⏳ Pending</option>
                <option value="rejected">❌ Rejected</option>
              </select>
            </div>
          </div>
          <div className="dash-table-wrap">
            {loading ? <div className="dash-loading">Loading...</div> : filtered.length === 0 ? (
              <div className="dash-empty">{search || filterStatus ? 'No customers match your search.' : 'No customers found. Add a new customer to get started.'}</div>
            ) : (
              <table className="dash-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Phone</th><th>PAN</th><th>Acc Number</th><th>Branch</th><th>Documents</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.email}</td>
                      <td>{c.phone}</td>
                      <td>{c.pan}</td>
                      <td>{c.acc_number}</td>
                      <td>{c.branch || '—'}</td>
                      <td>
                        <div className="ci-doc-thumbs">
                          {c.aadhar_img_url
                            ? <img src={c.aadhar_img_url} alt="Aadhar" className="ci-thumb" title="Aadhar Card" onClick={() => setLightbox({ url: c.aadhar_img_url, label: `${c.name} — Aadhar Card` })} />
                            : <span className="ci-no-doc">No Aadhar</span>}
                          {c.pan_img_url
                            ? <img src={c.pan_img_url} alt="PAN" className="ci-thumb" title="PAN Card" onClick={() => setLightbox({ url: c.pan_img_url, label: `${c.name} — PAN Card` })} />
                            : <span className="ci-no-doc">No PAN</span>}
                        </div>
                      </td>
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

      {lightbox && (
        <div className="ci-lightbox" onClick={() => setLightbox(null)}>
          <div className="ci-lightbox-box" onClick={e => e.stopPropagation()}>
            <div className="ci-lightbox-header">
              <span>{lightbox.label}</span>
              <button onClick={() => setLightbox(null)}>✕</button>
            </div>
            <img src={lightbox.url} alt={lightbox.label} className="ci-lightbox-img" />
          </div>
        </div>
      )}
    </div>
  )
}
