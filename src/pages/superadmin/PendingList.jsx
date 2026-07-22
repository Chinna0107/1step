import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import './superadmin.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin') || getTokenByRole('admin')}` })
const fmt = n => parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Sub-component for displaying a customer's transactions
function CustomerTransactions({ customerId }) {
  const [txns, setTxns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api(`/master/transactions?customer_id=${customerId}`, { headers: auth() })
      .then(data => setTxns(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [customerId])

  if (loading) return <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>Loading transactions...</div>
  if (txns.length === 0) return <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>No transactions found.</div>

  return (
    <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Transaction History</div>
      <table className="sa-table" style={{ background: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <thead>
          <tr>
            <th style={{ background: '#e2e8f0', color: '#334155', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Date</th>
            <th style={{ background: '#e2e8f0', color: '#334155', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Service</th>
            <th style={{ background: '#e2e8f0', color: '#334155', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Amount</th>
            <th style={{ background: '#e2e8f0', color: '#334155', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Settled</th>
            <th style={{ background: '#e2e8f0', color: '#334155', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Collected</th>
            <th style={{ background: '#fee2e2', color: '#b91c1c', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Balance Due</th>
          </tr>
        </thead>
        <tbody>
          {txns.map(t => (
            <tr key={t.id}>
              <td style={{ fontSize: 12 }}>{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
              <td style={{ fontSize: 12, fontWeight: 600 }}>{t.service_type || '—'}</td>
              <td style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>₹{fmt(t.amount)}</td>
              <td style={{ fontSize: 12 }}>{parseFloat(t.settled_amount) > 0 ? `₹${fmt(t.settled_amount)}` : '—'}</td>
              <td style={{ fontSize: 12 }}>{parseFloat(t.amount_collected) > 0 ? `₹${fmt(t.amount_collected)}` : '—'}</td>
              <td>
                {parseFloat(t.balance_due) > 0 ? (
                  <span style={{ background: '#fee2e2', color: '#dc2626', fontWeight: 800, padding: '2px 8px', borderRadius: 8, fontSize: 11 }}>
                    ₹{fmt(t.balance_due)}
                  </span>
                ) : (
                  <span style={{ color: '#64748b', fontSize: 12 }}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PendingList() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    // Fetch all customers, then filter those with pending balance > 0
    api('/customers/superadmin/all', { headers: auth() })
      .then(data => {
        // The endpoint returns an array of objects [customersR.rows, statsR.rows[0], branchStatsR.rows]
        const custList = data.customers || []
        const withDues = custList.filter(c => parseFloat(c.balance) > 0)
        setCustomers(withDues)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter(c => {
    const q = search.toLowerCase()
    return !q || 
      c.name?.toLowerCase().includes(q) || 
      c.phone?.includes(q) || 
      c.pan?.toLowerCase().includes(q) ||
      c.aadhar?.includes(q)
  })

  const totalDues = filtered.reduce((s, c) => s + parseFloat(c.balance || 0), 0)

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map(c => ({
      'Customer Name': c.name,
      'Mobile': c.phone,
      'PAN': c.pan,
      'Aadhar': c.aadhar,
      'Total Debt (₹)': parseFloat(c.balance || 0)
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Pending Dues")
    XLSX.writeFile(wb, "Customer_Pending_Dues.xlsx")
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.text("Customer Pending Dues", 14, 15)
    doc.autoTable({
      startY: 20,
      head: [['Customer', 'Mobile', 'PAN', 'Aadhar', 'Total Debt']],
      body: filtered.map(c => [
        c.name || '—',
        c.phone || '—',
        c.pan || '—',
        c.aadhar || '—',
        `Rs. ${fmt(c.balance)}`
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [220, 38, 38] }
    })
    doc.save("Customer_Pending_Dues.pdf")
  }

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="sa-topbar">
          <h1>💰 Customer Pending Dues</h1>
        </div>

        <div className="sa-main">
          {/* Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 20 }}>
            <div style={{ background: '#fee2e2', borderRadius: 14, padding: '18px 20px', border: '1px solid #dc262630' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: 0.5 }}>Customers in Debt</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#dc2626', marginTop: 6 }}>{filtered.length}</div>
            </div>
            <div style={{ background: '#fef3c7', borderRadius: 14, padding: '18px 20px', border: '1px solid #d9770630' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Pending Dues</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#d97706', marginTop: 6 }}>₹{fmt(totalDues)}</div>
            </div>
          </div>

          <div className="sa-card">
            <div className="sa-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Customer Dues List</h2>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  placeholder="Search customer..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 13, width: 240 }}
                />
                <button onClick={exportExcel} className="sa-btn" style={{ background: '#10b981', color: 'white' }}>Excel</button>
                <button onClick={exportPDF} className="sa-btn" style={{ background: '#ef4444', color: 'white' }}>PDF</button>
              </div>
            </div>
            <div className="sa-table-wrap">
              {loading ? <div className="sa-loading">Loading...</div> : filtered.length === 0 ? (
                <div className="sa-empty">No pending dues found</div>
              ) : (
                <table className="sa-table" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Mobile</th>
                      <th>PAN</th>
                      <th>Aadhar</th>
                      <th style={{ color: '#dc2626' }}>Total Debt</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => (
                      <React.Fragment key={c.id}>
                        <tr style={{ cursor: 'pointer', background: expandedId === c.id ? '#f8fafc' : 'transparent', transition: 'background 0.2s' }} onClick={() => toggleExpand(c.id)}>
                          <td style={{ fontSize: 14 }}><strong>{c.name || '—'}</strong></td>
                          <td style={{ fontSize: 13 }}>{c.phone || '—'}</td>
                          <td style={{ fontSize: 13, color: '#64748b' }}>{c.pan || '—'}</td>
                          <td style={{ fontSize: 13, color: '#64748b' }}>{c.aadhar || '—'}</td>
                          <td>
                            <span style={{ background: '#fee2e2', color: '#dc2626', fontWeight: 900, padding: '4px 10px', borderRadius: 8, fontSize: 14 }}>
                              ₹{fmt(c.balance)}
                            </span>
                          </td>
                          <td>
                            <button className="sa-btn" style={{ background: expandedId === c.id ? '#64748b' : '#3b82f6', color: 'white', padding: '6px 12px', fontSize: 12 }}>
                              {expandedId === c.id ? 'Hide Details' : 'View Transactions'}
                            </button>
                          </td>
                        </tr>
                        {expandedId === c.id && (
                          <tr>
                            <td colSpan="6" style={{ padding: 0, borderBottom: '1.5px solid #e2e8f0' }}>
                              <CustomerTransactions customerId={c.id} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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
