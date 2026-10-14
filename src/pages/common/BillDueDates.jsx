import React, { useState, useEffect, useMemo } from 'react'
import EmployeeNavbar from '../../components/employee/EmployeeNavbar'
import AdminSidebar from '../../components/admin/AdminSidebar'
import SuperAdminSidebar from '../../components/superadmin/Sidebar'
import { api } from '../../utils/api'
import { getTokenByRole, getUserByRole } from '../../utils/tokenUtils'
import {
  MdCalendarToday, MdCreditCard, MdPerson, MdSearch,
  MdFilterList, MdFileDownload, MdPhone, MdRefresh,
  MdCheckCircle, MdWarning, MdAccessTime, MdCorporateFare
} from 'react-icons/md'
import * as XLSX from 'xlsx'
import '../../pages/dashboard.css'
import '../superadmin/superadmin.css'
import './BillDueDates.css'

const fmt = n => {
  const num = parseFloat(n)
  return isNaN(num) ? '0' : num.toLocaleString('en-IN')
}

const fmtVal = n => {
  const v = parseFloat(n) || 0
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`
  return `₹${fmt(v)}`
}

export default function BillDueDates({ role = 'employee' }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState('all') // 'all', '3days', '7days', 'today', 'overdue', 'month'
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('')

  const token = getTokenByRole(role) || getTokenByRole('admin') || getTokenByRole('superadmin')
  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (quickFilter === '3days') params.append('days', '3')
      else if (quickFilter === '7days') params.append('days', '7')
      else if (customStart && customEnd) {
        params.append('start_date', customStart)
        params.append('end_date', customEnd)
      } else if (customStart) {
        params.append('start_date', customStart)
      } else if (customEnd) {
        params.append('end_date', customEnd)
      }

      if (selectedBranch) {
        params.append('branch', selectedBranch)
      }

      const res = await api(`/master/bill-due-dates?${params.toString()}`, { headers: authHeaders })
      setData(Array.isArray(res) ? res : [])
    } catch (err) {
      setError(err.message || 'Failed to fetch bill due dates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [quickFilter, customStart, customEnd, selectedBranch])

  // Get today's local date in YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])

  // Categorize and filter items
  const filteredList = useMemo(() => {
    return data.filter(item => {
      // Search filter
      const q = search.toLowerCase().trim()
      const matchSearch =
        !q ||
        item.cust_name?.toLowerCase().includes(q) ||
        item.customer_name?.toLowerCase().includes(q) ||
        item.cust_mobile?.includes(q) ||
        item.customer_phone?.includes(q) ||
        item.cust_pan?.toLowerCase().includes(q) ||
        item.card_bank?.toLowerCase().includes(q) ||
        item.card?.toLowerCase().includes(q) ||
        item.card_last4?.includes(q)

      if (!matchSearch) return false

      if (quickFilter === 'today') {
        const itemDate = item.bill_due_date ? String(item.bill_due_date).split('T')[0] : ''
        return itemDate === todayStr
      }
      if (quickFilter === 'overdue') {
        const itemDate = item.bill_due_date ? String(item.bill_due_date).split('T')[0] : ''
        return itemDate && itemDate < todayStr
      }
      if (quickFilter === 'month') {
        const itemDate = item.bill_due_date ? String(item.bill_due_date).split('T')[0] : ''
        if (!itemDate) return false
        const currentYearMonth = todayStr.substring(0, 7)
        return itemDate.startsWith(currentYearMonth)
      }

      return true
    })
  }, [data, search, quickFilter, todayStr])

  // Get distinct branches for admin / superadmin
  const branchList = useMemo(() => {
    const bSet = new Set()
    data.forEach(item => {
      if (item.employee_branch) bSet.add(item.employee_branch)
    })
    return Array.from(bSet)
  }, [data])

  // Metrics
  const metrics = useMemo(() => {
    let overdueCount = 0
    let due3DaysCount = 0
    let due7DaysCount = 0
    let totalBillSum = 0

    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const in3Days = new Date(now.getTime() + 3 * 86400000)
    const in7Days = new Date(now.getTime() + 7 * 86400000)

    data.forEach(d => {
      const billAmt = parseFloat(d.bill_amount || d.txn_amount || 0)
      totalBillSum += billAmt

      if (d.bill_due_date) {
        const dueDt = new Date(d.bill_due_date)
        dueDt.setHours(0, 0, 0, 0)
        if (dueDt < now) overdueCount++
        if (dueDt >= now && dueDt <= in3Days) due3DaysCount++
        if (dueDt >= now && dueDt <= in7Days) due7DaysCount++
      }
    })

    return {
      totalCount: data.length,
      overdueCount,
      due3DaysCount,
      due7DaysCount,
      totalBillSum,
    }
  }, [data])

  // Send WhatsApp Reminder
  const handleWhatsApp = (item) => {
    const mobile = item.cust_mobile || item.customer_phone || ''
    const cleanMobile = mobile.replace(/\D/g, '')
    if (!cleanMobile) {
      alert('No valid mobile number available for this customer.')
      return
    }

    const name = item.cust_name || item.customer_name || 'Customer'
    const cardInfo = item.card_bank
      ? `${item.card_bank}${item.card ? ` ${item.card}` : ''}${item.card_last4 ? ` (ending in ${item.card_last4})` : ''}`
      : (item.card || 'Credit Card')
    
    const formattedDue = item.bill_due_date
      ? new Date(item.bill_due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'Upcoming'
    
    const amountStr = parseFloat(item.bill_amount) > 0 ? `₹${fmt(item.bill_amount)}` : ''

    const message = `Dear ${name},

Hope you are doing well! 🌟

This is a gentle reminder from *1 Step Finance Care* regarding your upcoming credit card bill payment:

💳 *Card:* ${cardInfo}
📅 *Due Date:* ${formattedDue}${amountStr ? `\n💵 *Amount:* ${amountStr}` : ''}

To ensure hassle-free service, maintain your high CIBIL score, and avoid bank late fees or interest charges, please make sure your payment is completed on or before the due date.

If you have any questions or would like us to assist you with the payment, please feel free to reply to this message.

Thank you for choosing *1 Step Finance Care*!
Warm Regards,
Team 1 Step Finance Care`

    const url = `https://wa.me/91${cleanMobile.length === 10 ? cleanMobile : cleanMobile.replace(/^91/, '')}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  // Export to Excel
  const handleExportExcel = () => {
    const rows = filteredList.map(item => ({
      'Customer Name': item.cust_name || item.customer_name || '—',
      'Mobile Number': item.cust_mobile || item.customer_phone || '—',
      'PAN': item.cust_pan || '—',
      'Card Bank': item.card_bank || '—',
      'Card Type': item.card || '—',
      'Card Last 4 Digits': item.card_last4 ? `****${item.card_last4}` : '—',
      'Bill Platform': item.bill_platform || '—',
      'Bill Amount (₹)': parseFloat(item.bill_amount) || 0,
      'Bill Due Date': item.bill_due_date ? String(item.bill_due_date).split('T')[0] : '—',
      'Last Visit Date': item.last_visit ? new Date(item.last_visit).toLocaleDateString('en-IN') : '—',
      'Total Lifetime Volume (₹)': parseFloat(item.total_volume) || 0,
      'Total Transactions': item.total_txns || 0,
      'Employee': item.employee_name || '—',
      'Branch': item.employee_branch || '—',
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Bill Due Dates')
    XLSX.writeFile(wb, `Bill_Due_Dates_${todayStr}.xlsx`)
  }

  // Layout wrapper based on role
  const renderLayout = (content) => {
    if (role === 'superadmin') {
      return (
        <div className="sa-page">
          <SuperAdminSidebar />
          <div className="sa-content">
            <div className="sa-main" style={{ padding: '24px 32px' }}>
              {content}
            </div>
          </div>
        </div>
      )
    }
    if (role === 'admin') {
      return (
        <div className="dash-page">
          <AdminSidebar />
          <div className="dash-content">
            <div className="dash-main" style={{ padding: '24px 32px' }}>
              {content}
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="emp-page">
        <EmployeeNavbar />
        <div className="emp-page-content" style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px' }}>
          {content}
        </div>
      </div>
    )
  }

  return renderLayout(
    <div className="bill-due-container">
      {/* ── Page Header ── */}
      <div className="bill-due-header">
        <div>
          <h1 className="bill-due-title">
            <span>📅</span> Bill Due Dates Management
          </h1>
          <p className="bill-due-subtitle">
            Track upcoming credit card due dates, review customer lifetime volumes, and send instant WhatsApp reminders.
          </p>
        </div>
        <div className="bill-due-header-actions">
          <button className="dash-btn dash-btn-sm" onClick={fetchData} title="Refresh">
            <MdRefresh size={16} /> Refresh
          </button>
          <button className="dash-btn dash-btn-sm btn-export" onClick={handleExportExcel}>
            <MdFileDownload size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* ── KPI Stat Cards ── */}
      <div className="bill-kpi-grid">
        <div className="bill-kpi-card">
          <div className="bill-kpi-info">
            <span className="bill-kpi-label">Total Bills Scheduled</span>
            <span className="bill-kpi-value">{metrics.totalCount}</span>
          </div>
          <div className="bill-kpi-icon icon-blue">
            <MdCalendarToday size={24} />
          </div>
        </div>

        <div className="bill-kpi-card" onClick={() => setQuickFilter('3days')} style={{ cursor: 'pointer' }}>
          <div className="bill-kpi-info">
            <span className="bill-kpi-label">Due Next 3 Days</span>
            <span className="bill-kpi-value" style={{ color: '#ea580c' }}>{metrics.due3DaysCount}</span>
          </div>
          <div className="bill-kpi-icon icon-orange">
            <MdAccessTime size={24} />
          </div>
        </div>

        <div className="bill-kpi-card" onClick={() => setQuickFilter('7days')} style={{ cursor: 'pointer' }}>
          <div className="bill-kpi-info">
            <span className="bill-kpi-label">Due Next 7 Days</span>
            <span className="bill-kpi-value" style={{ color: '#0284c7' }}>{metrics.due7DaysCount}</span>
          </div>
          <div className="bill-kpi-icon icon-sky">
            <MdCalendarToday size={24} />
          </div>
        </div>

        <div className="bill-kpi-card" onClick={() => setQuickFilter('overdue')} style={{ cursor: 'pointer' }}>
          <div className="bill-kpi-info">
            <span className="bill-kpi-label">Overdue Bills</span>
            <span className="bill-kpi-value" style={{ color: '#dc2626' }}>{metrics.overdueCount}</span>
          </div>
          <div className="bill-kpi-icon icon-red">
            <MdWarning size={24} />
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="dash-card bill-filter-card">
        <div className="bill-filter-flex">
          {/* Quick Filter Buttons */}
          <div className="bill-quick-filters">
            {[
              { id: 'all', label: 'All Due Dates' },
              { id: '3days', label: '⚡ Next 3 Days' },
              { id: '7days', label: '🗓️ Next 7 Days' },
              { id: 'today', label: '📍 Due Today' },
              { id: 'month', label: '📆 This Month' },
              { id: 'overdue', label: '⚠️ Overdue' },
            ].map(f => (
              <button
                key={f.id}
                type="button"
                className={`quick-pill ${quickFilter === f.id ? 'active' : ''}`}
                onClick={() => {
                  setQuickFilter(f.id)
                  setCustomStart('')
                  setCustomEnd('')
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="bill-search-box">
            <MdSearch size={18} color="#64748b" />
            <input
              type="text"
              placeholder="Search by customer, phone, bank, card..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-btn" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>

        {/* Date Range & Branch Filters */}
        <div className="bill-secondary-filters">
          <div className="filter-group">
            <label>From Date:</label>
            <input
              type="date"
              value={customStart}
              onChange={e => {
                setCustomStart(e.target.value)
                setQuickFilter('custom')
              }}
            />
          </div>

          <div className="filter-group">
            <label>To Date:</label>
            <input
              type="date"
              value={customEnd}
              onChange={e => {
                setCustomEnd(e.target.value)
                setQuickFilter('custom')
              }}
            />
          </div>

          {role !== 'employee' && branchList.length > 0 && (
            <div className="filter-group">
              <label>Branch:</label>
              <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
                <option value="">All Branches</option>
                {branchList.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          )}

          {(customStart || customEnd || selectedBranch) && (
            <button
              className="dash-btn dash-btn-sm"
              style={{ background: '#f1f5f9', color: '#475569', alignSelf: 'flex-end', height: 38 }}
              onClick={() => {
                setCustomStart('')
                setCustomEnd('')
                setSelectedBranch('')
                setQuickFilter('all')
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="dash-card" style={{ marginTop: 20 }}>
        <div className="dash-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#0f172a' }}>
              📋 Customers & Due Dates
            </h2>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              Showing {filteredList.length} scheduled due date records
            </span>
          </div>
        </div>

        {error && (
          <div className="dash-alert dash-alert-error" style={{ margin: 16 }}>
            ❌ {error}
          </div>
        )}

        {loading ? (
          <div className="dash-loading" style={{ padding: 48 }}>
            Loading bill due dates...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bill-empty-state">
            <div className="empty-icon">📅</div>
            <h3>No bill due dates found</h3>
            <p>
              {search || quickFilter !== 'all' || customStart
                ? 'Try adjusting your search criteria or date filters.'
                : 'Transactions recorded under "Bill Pay + Withdrawal" with a bill due date will appear here.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table bill-table">
              <thead>
                <tr>
                  <th>Due Date</th>
                  <th>Customer Name & Phone</th>
                  <th>Bank & Card Details</th>
                  <th>Bill Amount</th>
                  <th>Last Visit / Txn Date</th>
                  <th>Total Volume</th>
                  {role !== 'employee' && <th>Branch / Added By</th>}
                  <th style={{ textAlign: 'center' }}>WhatsApp Reminder</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map(item => {
                  const dueDateRaw = item.bill_due_date ? String(item.bill_due_date).split('T')[0] : ''
                  const isOverdue = dueDateRaw && dueDateRaw < todayStr
                  const isToday = dueDateRaw === todayStr

                  const dueObj = dueDateRaw ? new Date(dueDateRaw) : null
                  const nowObj = new Date(todayStr)
                  const diffDays = dueObj ? Math.round((dueObj - nowObj) / (1000 * 60 * 60 * 24)) : null

                  let badgeLabel = ''
                  let badgeClass = ''
                  if (isOverdue) {
                    badgeLabel = `${Math.abs(diffDays)}d overdue`
                    badgeClass = 'badge-overdue'
                  } else if (isToday) {
                    badgeLabel = 'Due Today'
                    badgeClass = 'badge-today'
                  } else if (diffDays !== null && diffDays <= 3) {
                    badgeLabel = `In ${diffDays} day${diffDays > 1 ? 's' : ''}`
                    badgeClass = 'badge-warning'
                  } else if (diffDays !== null && diffDays <= 7) {
                    badgeLabel = `In ${diffDays} days`
                    badgeClass = 'badge-upcoming'
                  }

                  const custName = item.cust_name || item.customer_name || '—'
                  const custPhone = item.cust_mobile || item.customer_phone || '—'
                  const cardBank = item.card_bank || '—'
                  const cardType = item.card || '—'
                  const cardLast4 = item.card_last4 ? `****${item.card_last4}` : '—'
                  const billAmt = parseFloat(item.bill_amount) || 0
                  const totalVol = parseFloat(item.total_volume) || 0
                  const lastVisit = item.last_visit ? new Date(item.last_visit).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

                  return (
                    <tr key={item.txn_id}>
                      {/* Due Date & Urgency Badge */}
                      <td>
                        <div style={{ fontWeight: 800, fontSize: 14, color: isOverdue ? '#dc2626' : isToday ? '#ea580c' : '#0f172a' }}>
                          {dueDateRaw ? dueDateRaw.split('-').reverse().join('/') : '—'}
                        </div>
                        {badgeLabel && (
                          <span className={`due-badge ${badgeClass}`}>
                            {badgeLabel}
                          </span>
                        )}
                      </td>

                      {/* Customer Info */}
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>
                          {custName}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <MdPhone size={13} color="#94a3b8" />
                          <span>{custPhone}</span>
                          {item.cust_pan && (
                            <span style={{ marginLeft: 6, background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                              {item.cust_pan}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Card Details */}
                      <td>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MdCreditCard size={15} color="#2563eb" />
                          <span>{cardBank}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          <span>{cardType}</span>
                          {item.card_last4 && (
                            <span style={{ marginLeft: 6, fontWeight: 700, color: '#0f172a', background: '#e0e7ff', padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>
                              {cardLast4}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Bill Amount */}
                      <td>
                        <div style={{ fontWeight: 800, color: '#059669', fontSize: 14 }}>
                          ₹{fmt(billAmt)}
                        </div>
                        {item.bill_platform && (
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                            via {item.bill_platform}
                          </div>
                        )}
                      </td>

                      {/* Last Visit / Txn Date */}
                      <td>
                        <div style={{ fontWeight: 600, color: '#334155', fontSize: 13 }}>
                          {lastVisit}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                          {item.total_txns ? `${item.total_txns} total visits` : '—'}
                        </div>
                      </td>

                      {/* Total Volume */}
                      <td>
                        <div style={{ fontWeight: 800, color: '#0d1f3d', fontSize: 14 }}>
                          ₹{fmt(totalVol)}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                          Lifetime volume
                        </div>
                      </td>

                      {/* Branch & Employee */}
                      {role !== 'employee' && (
                        <td>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 12 }}>
                            {item.employee_branch || 'Main'}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            {item.employee_name || 'Staff'}
                          </div>
                        </td>
                      )}

                      {/* WhatsApp Action Button */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="whatsapp-notify-btn"
                          onClick={() => handleWhatsApp(item)}
                          title={`Send WhatsApp notification to ${custName}`}
                        >
                          <span style={{ fontSize: 16 }}>💬</span>
                          <span>Notify</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
