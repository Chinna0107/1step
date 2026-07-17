import React, { useRef, useState } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { useAttendance } from '../../hooks/useSuperAdmin'
import { SkeletonTable, SkeletonStats } from '../../components/superadmin/Skeleton'
import './superadmin.css'
import './Dashboard.css'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const YEARS  = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i))
const LATE_THRESHOLD = 9 * 60 + 15 // 09:15

const isLate = checkIn => {
  if (!checkIn) return false
  const [h, m] = checkIn.split(':').map(Number)
  return h * 60 + m > LATE_THRESHOLD
}

export default function AttendanceData() {
  const { attendance, loading, error, view, setView, date, setDate, month, setMonth, year, setYear } = useAttendance()
  const printRef   = useRef()
  const [empFilter, setEmpFilter] = useState('')

  const filtered = empFilter
    ? attendance.filter(a => a.employee_name?.toLowerCase().includes(empFilter.toLowerCase()))
    : attendance

  const present    = filtered.filter(a => a.status === 'Present').length
  const absent     = filtered.filter(a => a.status === 'Absent').length
  const late       = filtered.filter(a => isLate(a.check_in)).length
  const totalCoins = filtered.reduce((s, a) => s + (a.coins_earned || 0), 0)
  const totalMins  = filtered.reduce((s, a) => s + (a.minutes || 0), 0)

  // unique employee names for filter dropdown
  const empNames = [...new Set(attendance.map(a => a.employee_name).filter(Boolean))].sort()

  const periodLabel = () => {
    if (view === 'day')   return new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { dateStyle: 'long' })
    if (view === 'month') return `${MONTHS[parseInt(month)-1]} ${year}`
    return year
  }

  const handlePrint = () => {
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>Attendance — ${periodLabel()}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; padding: 24px; color: #1a1a2e; }
        h2  { color: #0d1f3d; margin-bottom: 4px; }
        p   { color: #888; font-size: 13px; margin: 0 0 16px; }
        .summary { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
        .sum-box { background: #f5f3ff; padding: 12px 20px; border-radius: 8px; min-width: 120px; }
        .sum-label { font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; }
        .sum-val   { font-size: 1.6rem; font-weight: 900; color: #0d1f3d; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #0d1f3d; color: #fff; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 10px 12px; border-bottom: 1px solid #f0f2f8; }
        tr:last-child td { border-bottom: none; }
        .present { background: #d1fae5; color: #059669; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
        .absent  { background: #fee2e2; color: #dc2626; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
        .late    { background: #fef3c7; color: #d97706; padding: 3px 8px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-left: 6px; }
      </style></head><body>
      <h2>Attendance Report — ${periodLabel()}</h2>
      <p>Generated on ${new Date().toLocaleString('en-IN')}</p>
      <div class="summary">
        <div class="sum-box"><div class="sum-label">Total</div><div class="sum-val">${filtered.length}</div></div>
        <div class="sum-box"><div class="sum-label">Present</div><div class="sum-val" style="color:#059669">${present}</div></div>
        <div class="sum-box"><div class="sum-label">Absent</div><div class="sum-val" style="color:#dc2626">${absent}</div></div>
        <div class="sum-box"><div class="sum-label">Late</div><div class="sum-val" style="color:#d97706">${late}</div></div>
        <div class="sum-box"><div class="sum-label">Total Mins</div><div class="sum-val">${totalMins}</div></div>
        <div class="sum-box"><div class="sum-label">Coins Earned</div><div class="sum-val" style="color:#b8860b">🪙${totalCoins}</div></div>
      </div>
      <table>
        <thead><tr>
          ${view !== 'day' ? '<th>Date</th>' : ''}
          <th>Employee</th><th>Check In</th><th>Check Out</th><th>Minutes</th><th>Coins</th><th>Status</th>
        </tr></thead>
        <tbody>
          ${filtered.map(a => `<tr>
            ${view !== 'day' ? `<td>${new Date(a.date).toLocaleDateString('en-IN')}</td>` : ''}
            <td><strong>${a.employee_name}</strong>${isLate(a.check_in) ? '<span class="late">⏰ Late</span>' : ''}</td>
            <td>${a.check_in || '—'}</td>
            <td>${a.check_out || '—'}</td>
            <td>${a.minutes || 0} min</td>
            <td>${(a.coins_earned || 0) > 0 ? `🪙 +${a.coins_earned}` : '—'}</td>
            <td><span class="${a.status?.toLowerCase()}">${a.status}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
      </body></html>
    `)
    win.document.close()
    win.print()
  }

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-topbar-title">Attendance</h1>
            <p className="dash-topbar-sub">Real-time employee attendance tracking</p>
          </div>
          <div className="dash-topbar-right">
            <button className="sa-btn sa-btn-primary" onClick={handlePrint}
              style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
              🖨️ Print Report
            </button>
          </div>
        </div>

        <div className="sa-main">
          {error && <div className="sa-alert sa-alert-error">❌ {error}</div>}

          {/* Filter bar */}
          <div className="sa-card" style={{ marginBottom: 20 }}>
            <div className="sa-card-body" style={{ padding: '16px 24px' }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>

                {/* View toggle */}
                <div style={{ display: 'flex', gap: 4, background: '#f0f2f8', borderRadius: 8, padding: 4 }}>
                  {['day','month','year'].map(v => (
                    <button key={v} onClick={() => setView(v)} className="sa-btn sa-btn-sm"
                      style={{ background: view === v ? 'linear-gradient(135deg,#0d1f3d,#1a365d)' : 'transparent',
                               color: view === v ? '#fff' : '#666', border: 'none' }}>
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>

                {view === 'day' && (
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(13,31,61,0.2)', fontFamily: 'inherit', fontSize: 14 }} />
                )}
                {view === 'month' && (
                  <>
                    <select value={month} onChange={e => setMonth(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(13,31,61,0.2)', fontFamily: 'inherit', fontSize: 14 }}>
                      {MONTHS.map((m, i) => <option key={m} value={String(i+1).padStart(2,'0')}>{m}</option>)}
                    </select>
                    <select value={year} onChange={e => setYear(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(13,31,61,0.2)', fontFamily: 'inherit', fontSize: 14 }}>
                      {YEARS.map(y => <option key={y}>{y}</option>)}
                    </select>
                  </>
                )}
                {view === 'year' && (
                  <select value={year} onChange={e => setYear(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(13,31,61,0.2)', fontFamily: 'inherit', fontSize: 14 }}>
                    {YEARS.map(y => <option key={y}>{y}</option>)}
                  </select>
                )}

                {/* Employee filter */}
                <select value={empFilter} onChange={e => setEmpFilter(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(13,31,61,0.2)', fontFamily: 'inherit', fontSize: 14 }}>
                  <option value="">All Employees</option>
                  {empNames.map(n => <option key={n} value={n}>{n}</option>)}
                </select>

                {empFilter && (
                  <button className="sa-btn sa-btn-sm" onClick={() => setEmpFilter('')}
                    style={{ background: '#fee2e2', color: '#dc2626', border: 'none' }}>✕ Clear</button>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="dash-stats-row" style={{ marginBottom: 20 }}>
            {loading ? <SkeletonStats count={5} /> : (
              <>
                {[
                  { label: 'Total Records', value: filtered.length,  color: '#0d1f3d' },
                  { label: 'Present',       value: present,          color: '#059669' },
                  { label: 'Absent',        value: absent,           color: '#dc2626' },
                  { label: 'Late Mark',     value: late,             color: '#d97706' },
                  { label: 'Coins Earned',  value: `🪙 ${totalCoins}`, color: '#b8860b' },
                ].map(s => (
                  <div key={s.label} className="dash-stat" style={{ '--c': s.color }}>
                    <div className="dash-stat-body">
                      <span className="dash-stat-label">{s.label}</span>
                      <span className="dash-stat-value" style={{ fontSize: '1.5rem' }}>{s.value}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Table */}
          <div className="sa-card" ref={printRef}>
            <div className="sa-card-header">
              <h2>
                {view === 'day'   && `Daily — ${periodLabel()}`}
                {view === 'month' && `Monthly — ${periodLabel()}`}
                {view === 'year'  && `Yearly — ${periodLabel()}`}
              </h2>
              <span style={{ fontSize: 13, color: '#888' }}>{totalMins} total mins worked</span>
            </div>
            <div className="sa-table-wrap">
              {loading ? <SkeletonTable rows={6} cols={view !== 'day' ? 7 : 6} /> : (
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
                    {filtered.length ? filtered.map(a => (
                      <tr key={a.id}>
                        {view !== 'day' && <td>{new Date(a.date).toLocaleDateString('en-IN')}</td>}
                        <td>
                          <strong>{a.employee_name}</strong>
                          {isLate(a.check_in) && (
                            <span style={{ marginLeft: 8, background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                              ⏰ Late
                            </span>
                          )}
                          <br />
                          <span style={{ fontSize: 12, color: '#888' }}>{a.email}</span>
                        </td>
                        <td style={{ color: isLate(a.check_in) ? '#d97706' : '#374151', fontWeight: isLate(a.check_in) ? 700 : 400 }}>
                          {a.check_in || '—'}
                        </td>
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

          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 20px', fontSize: 13, color: '#92400e', marginTop: 8 }}>
            🪙 <strong>Coins Rule:</strong> Employees earn <strong>5 coins/min</strong> for every minute worked beyond 500 minutes. &nbsp;|&nbsp;
            ⏰ <strong>Late Mark:</strong> Check-in after <strong>09:15 AM</strong> is marked late.
          </div>
        </div>
      </div>
    </div>
  )
}
