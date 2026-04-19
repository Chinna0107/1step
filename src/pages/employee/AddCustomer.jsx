import React, { useState, useEffect } from 'react'
import EmployeeNavbar from '../../components/employee/EmployeeNavbar'
import { useAddCustomer, useMyCustomers } from '../../hooks/useCustomers'
import { getUserByRole } from '../../utils/tokenUtils'
import '../../pages/dashboard.css'

const empty = { name: '', email: '', phone: '', pan: '', aadhar: '', acc_number: '', branch: '', aadhar_img_url: '', pan_img_url: '' }

export default function AddCustomer() {
  const { submitCustomer, loading, error, success } = useAddCustomer()
  const { customers, loading: listLoading, refetch } = useMyCustomers()
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)
  const currentUser = getUserByRole('employee') || getUserByRole('admin')

  // Check for pending customer name from transaction page
  useEffect(() => {
    const pendingName = localStorage.getItem('pendingCustomerName')
    if (pendingName) {
      setForm(f => ({ 
        ...f, 
        name: pendingName,
        branch: currentUser?.branch || 'Kadapa Main' // Set default branch
      }))
      setShowForm(true)
      localStorage.removeItem('pendingCustomerName')
    } else {
      // Set default branch for new customers
      setForm(f => ({ ...f, branch: currentUser?.branch || 'Kadapa Main' }))
    }
  }, [currentUser])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    const ok = await submitCustomer(form)
    if (ok) { setForm(empty); setShowForm(false); refetch() }
  }

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
          <h1>Add New Customer</h1>
          <button className="dash-btn dash-btn-primary" onClick={() => setShowForm(v => !v)}>
            {showForm ? '✕ Cancel' : '+ New Customer'}
          </button>
        </div>

        {success && <div className="dash-alert dash-alert-success">✅ {success}</div>}
        {error   && <div className="dash-alert dash-alert-error">❌ {error}</div>}

        {showForm && (
          <div className="dash-card" style={{ marginBottom: 20 }}>
            <div className="dash-card-header"><h2>Customer Details</h2></div>
            <div className="dash-card-body">
              <form onSubmit={handleSubmit}>
                <div className="dash-form-grid">
                  <div className="dash-form-group">
                    <label>Full Name *</label>
                    <input required placeholder="Customer full name" value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                  <div className="dash-form-group">
                    <label>Email *</label>
                    <input required type="email" placeholder="customer@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div className="dash-form-group">
                    <label>Phone *</label>
                    <input required placeholder="10-digit phone" maxLength={10} value={form.phone}
                      onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} />
                  </div>
                  <div className="dash-form-group">
                    <label>PAN Number *</label>
                    <input required placeholder="ABCDE1234F" maxLength={10} value={form.pan}
                      onChange={e => set('pan', e.target.value.toUpperCase())} />
                    {form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan) && (
                      <span className="dash-field-hint">Format: 5 letters + 4 digits + 1 letter</span>
                    )}
                  </div>
                  <div className="dash-form-group">
                    <label>Aadhar Number *</label>
                    <input required placeholder="12-digit Aadhar" maxLength={12} value={form.aadhar}
                      onChange={e => set('aadhar', e.target.value.replace(/\D/g, '').slice(0, 12))} />
                  </div>
                  <div className="dash-form-group">
                    <label>Account Number *</label>
                    <input required placeholder="Bank account number" value={form.acc_number}
                      onChange={e => set('acc_number', e.target.value.replace(/\D/g, ''))} />
                  </div>
                  <div className="dash-form-group">
                    <label>Branch *</label>
                    <select required value={form.branch} onChange={e => set('branch', e.target.value)}>
                      <option value="">Select branch</option>
                      <option value="Kadapa Main">Kadapa Main</option>
                      <option value="Ananthapur">Ananthapur</option>
                      <option value="Bangalore HSR">Bangalore HSR</option>
                    </select>
                    {currentUser?.branch && (
                      <div style={{ fontSize: 11, color: '#059669', marginTop: 4, fontStyle: 'italic' }}>
                        ℹ️ Default: {currentUser.branch} (your branch)
                      </div>
                    )}
                  </div>
                  <div className="dash-form-group image-upload">
                    <label>Aadhar Card Image URL</label>
                    <div className="dash-image-upload-group">
                      <input 
                        type="url" 
                        placeholder="Paste Aadhar image URL" 
                        value={form.aadhar_img_url}
                        onChange={e => set('aadhar_img_url', e.target.value)} 
                      />
                      <button 
                        type="button" 
                        className="dash-cloudinary-btn"
                        onClick={() => window.open('https://cloudinary.com', '_blank')}
                        title="Upload image to Cloudinary"
                      >
                        <span className="icon">📤</span>
                        Upload
                      </button>
                    </div>
                    <div className="upload-hint">Click upload button to open Cloudinary in new tab</div>
                  </div>
                  <div className="dash-form-group image-upload">
                    <label>PAN Card Image URL</label>
                    <div className="dash-image-upload-group">
                      <input 
                        type="url" 
                        placeholder="Paste PAN image URL" 
                        value={form.pan_img_url}
                        onChange={e => set('pan_img_url', e.target.value)} 
                      />
                      <button 
                        type="button" 
                        className="dash-cloudinary-btn"
                        onClick={() => window.open('https://cloudinary.com', '_blank')}
                        title="Upload image to Cloudinary"
                      >
                        <span className="icon">📤</span>
                        Upload
                      </button>
                    </div>
                    <div className="upload-hint">Click upload button to open Cloudinary in new tab</div>
                  </div>
                </div>
                <button type="submit" className="dash-btn dash-btn-primary"
                  disabled={loading || (form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan))}>
                  {loading ? 'Submitting...' : '📤 Submit for Approval'}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="dash-card">
          <div className="dash-card-header">
            <h2>My Submitted Customers ({customers.length})</h2>
          </div>
          <div className="dash-table-wrap">
            {listLoading ? <div className="dash-loading">Loading...</div> : customers.length === 0 ? (
              <div className="dash-empty">No customers submitted yet. Click "+ New Customer" to add one.</div>
            ) : (
              <table className="dash-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Phone</th><th>PAN</th><th>Branch</th><th>Status</th><th>Submitted</th></tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.email}</td>
                      <td>{c.phone}</td>
                      <td>{c.pan}</td>
                      <td>{c.branch || '—'}</td>
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
