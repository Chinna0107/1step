import React, { useRef } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { useAttendance } from '../../hooks/useSuperAdmin'
import './superadmin.css'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const YEARS  = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i))

export default function AttendanceData() {
  const { attendance, loading, error, view, setView, date, setDate, month, setMonth, year, setYear } = useAttendance()
  const printRef = useRef()

  const present = attendance.filter(a => a.status === 'Present').length
  const absent  = attendance.filter(a => a.status === 'Absent').length
  const totalCoins = attendance.reduce((s, a) => s + (a.coins_earned || 0), 0)
  const totalMins  = attendance.reduce((s, a) => s + (a.minutes || 0), 0)

  const handlePrint = () => {
    const content = printRef.current.innerHTML
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>Attendance Report</title>
      <style>
        body { font-family: system-ui; padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #402070; color: white; padding: 10px; text-align: left; font-size: 12px; }
        td { padding: 10px; border-bottom: 1px solid #eee; font-size: 13px; }
        .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
        .present { background: #d1fae5; color: #059669; }
        .absent  { background: #fee2e2; color: #dc2626; }
        h2 { color: #402070; }
        .summary { display: flex; gap: 20px; margin-bottom: 16px; }
        .sum-box { background: #f5f3ff; padding: 12px 20px; border-radius: 8px; }
      </style></head><body>${content}</body></html>
    `)
    win.document.close()
    win.print()
  }

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="sa-topbar">
          <h1>Attendance</h1>
          <div className="sa-topbar-right">
            <button className="sa-btn sa-btn-primary" onClick={handlePrint} style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
              🖨️ Print
            </button>
          </div>
        </div>

        <div className="sa-main">
          {error && <div className="sa-alert sa-alert-error">❌ {error}</div>}

          {/* Filter bar */}
          <div className="sa-card" style={{ marginBottom: 20 }}>
            <div className="sa-card-body" style={{ padding: '16px 24px' }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 4, background: '#f0f2f8', borderRadius: 8, padding: 4 }}>
                  {['day', 'month', 'year'].map(v => (
                    <button key={v} onClick={() => setView(v)}
                      className="sa-btn sa-btn-sm"
                      style={{ background: view === v ? 'linear-gradient(135deg,var(--ms-purple),var(--ms-crimson))' : 'transparent',
                               color: view === v ? '#fff' : '#666', border: 'none' }}>
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>

                {view === 'day' && (
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(64,32,112,0.2)', fontFamily: 'inherit', fontSize: 14 }} />
                )}
                {view === 'month' && (
                  <>
                    <select value={month} onChange={e => setMonth(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(64,32,112,0.2)', fontFamily: 'inherit', fontSize: 14 }}>
                      {MONTHS.map((m, i) => <option key={m} value={String(i+1).padStart(2,'0')}>{m}</option>)}
                    </select>
                    <select value={year} onChange={e => setYear(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(64,32,112,0.2)', fontFamily: 'inherit', fontSize: 14 }}>
                      {YEARS.map(y => <option key={y}>{y}</option>)}
                    </select>
                  </>
                )}
                {view === 'year' && (
                  <select value={year} onChange={e => setYear(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(64,32,112,0.2)', fontFamily: 'inherit', fontSize: 14 }}>
                    {YEARS.map(y => <option key={y}>{y}</option>)}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="sa-stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 20 }}>
            <div className="sa-stat-card"><div className="sa-stat-label">Total Records</div><div className="sa-stat-value">{attendance.length}</div></div>
            <div className="sa-stat-card"><div className="sa-stat-label">Present</div><div className="sa-stat-value" style={{ color: '#059669' }}>{present}</div></div>
            <div className="sa-stat-card"><div className="sa-stat-label">Absent</div><div className="sa-stat-value" style={{ color: '#dc2626' }}>{absent}</div></div>
            <div className="sa-stat-card"><div className="sa-stat-label">Total Coins Earned</div><div className="sa-stat-value" style={{ color: '#b8860b' }}>🪙 {totalCoins}</div></div>
          </div>

          {/* Printable table */}
          <div className="sa-card" ref={printRef}>
            <div className="sa-card-header">
              <h2>
                {view === 'day'   && `Daily — ${new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { dateStyle: 'long' })}`}
                {view === 'month' && `Monthly — ${MONTHS[parseInt(month)-1]} ${year}`}
                {view === 'year'  && `Yearly — ${year}`}
              </h2>
              <span style={{ fontSize: 13, color: '#888' }}>Total: {totalMins} mins worked</span>
            </div>
            <div className="sa-table-wrap">
              {loading ? <div className="sa-loading">Loading...</div> : (
                <table className="sa-table">
                  <thead>
                    <tr>
                      {view !== 'day' && <th>Date</th>}
                      <th>Employee</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Minutes</th>
                      <th>Coins Earned</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.length ? attendance.map(a => (
                      <tr key={a.id}>
                        {view !== 'day' && <td>{new Date(a.date).toLocaleDateString('en-IN')}</td>}
                        <td><strong>{a.employee_name}</strong><br /><span style={{ fontSize: 12, color: '#888' }}>{a.email}</span></td>
                        <td>{a.check_in || '—'}</td>
                        <td>{a.check_out || '—'}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: (a.minutes || 0) > 500 ? '#059669' : '#374151' }}>
                            {a.minutes || 0} min
                          </span>
                        </td>
                        <td>
                          {(a.coins_earned || 0) > 0
                            ? <span style={{ fontWeight: 700, color: '#b8860b' }}>🪙 +{a.coins_earned}</span>
                            : <span style={{ color: '#9ca3af' }}>—</span>}
                        </td>
                        <td><span className={`sa-status ${a.status?.toLowerCase()}`}>{a.status}</span></td>
                      </tr>
                    )) : (
                      <tr><td colSpan={view !== 'day' ? 7 : 6} className="sa-empty">No attendance records found</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Coins rule note */}
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 20px', fontSize: 13, color: '#92400e', marginTop: 8 }}>
            🪙 <strong>Coins Rule:</strong> Employees earn <strong>5 MoneySpot coins per minute</strong> worked beyond 500 minutes in a day.
          </div>
        </div>
      </div>
    </div>
  )
}
