import React, { useEffect, useState, useCallback } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import '../../pages/dashboard.css'
import { useDailyClosing } from '../../hooks/useFinance'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })
const fmt  = n => `₹${Number(n || 0).toLocaleString('en-IN')}`

export default function DailyClosing() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [closing, setClosing] = useState(false)
  const [msg, setMsg]         = useState('')
  const [err, setErr]         = useState('')
  const [preview, setPreview] = useState(null)

  const refetch = useCallback(() => {
    setLoading(true)
    Promise.all([
      api('/finance/closing', { headers: auth() }),
      api('/finance/summary', { headers: auth() }),
    ]).then(([hist, sum]) => {
      setHistory(hist)
      // Build today's preview from summary
      const last = hist[0]
      setPreview({
        opening: last?.closing_balance ?? 0,
        inflow:  sum.todayInflow  ?? 0,
        outflow: sum.todayOutflow ?? 0,
        closing: (last?.closing_balance ?? 0) + (sum.todayInflow ?? 0) - (sum.todayOutflow ?? 0),
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const today = new Date().toISOString().split('T')[0]
  const alreadyClosed = history.some(h => h.date?.slice(0, 10) === today)

  const handleClose = async () => {
    if (!window.confirm('Close today\'s books? This cannot be undone.')) return
    setClosing(true); setMsg(''); setErr('')
    try {
      const r = await api('/finance/closing', { method: 'POST', headers: auth() })
      setMsg(r.message || 'Day closed successfully')
      refetch()
    } catch (e) { setErr(e.message) }
    setClosing(false)
  }

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <h1>📅 Daily Closing</h1>
          <div className="dash-topbar-right">
            <span style={{ fontSize: 13, color: '#9ca3af' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </div>
        <div className="dash-main">

          {msg && <div className="dash-alert dash-alert-success">✅ {msg}</div>}
          {err && <div className="dash-alert dash-alert-error">❌ {err}</div>}

          {/* Today's Closing Preview */}
          {!loading && preview && (
            <div className="dash-card" style={{ marginBottom: 20 }}>
              <div className="dash-card-header">
                <h2>📊 Today's Summary</h2>
                {alreadyClosed && <span style={{ background: '#d1fae5', color: '#059669', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>✅ Closed</span>}
              </div>
              <div className="dash-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 20 }}>
                  {[
                    { label: 'Opening Balance', val: preview.opening, color: '#402070' },
                    { label: '+ Inflow',         val: preview.inflow,  color: '#059669' },
                    { label: '– Outflow',        val: preview.outflow, color: '#dc2626' },
                    { label: '= Closing Balance',val: preview.closing, color: '#d4af37', big: true },
                  ].map(item => (
                    <div key={item.label} style={{
                      padding: '14px 16px', borderRadius: 10,
                      background: item.big ? 'linear-gradient(135deg,#fef9e7,#fef3c7)' : '#f8fafc',
                      border: item.big ? '2px solid #d4af37' : '1px solid #f0f2f8',
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6 }}>{item.label}</div>
                      <div style={{ fontSize: item.big ? 22 : 18, fontWeight: 900, color: item.color }}>{fmt(item.val)}</div>
                    </div>
                  ))}
                </div>

                {!alreadyClosed && (
                  <button className="dash-btn dash-btn-primary" style={{ width: '100%', padding: '14px', fontSize: 15, justifyContent: 'center' }}
                    onClick={handleClose} disabled={closing}>
                    {closing ? 'Closing...' : '🔒 Close Day'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* History */}
          <div className="dash-card">
            <div className="dash-card-header"><h2>📋 Closing History</h2></div>
            <div className="dash-table-wrap">
              {loading ? <div className="dash-loading">Loading...</div> : (
                <table className="dash-table">
                  <thead>
                    <tr><th>Date</th><th>Opening</th><th>Inflow</th><th>Outflow</th><th>Closing</th></tr>
                  </thead>
                  <tbody>
                    {history.map(h => (
                      <tr key={h.id}>
                        <td style={{ fontWeight: 600 }}>{new Date(h.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                        <td style={{ color: '#402070', fontWeight: 700 }}>{fmt(h.opening_balance)}</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>+{fmt(h.total_inflow ?? h.inflow)}</td>
                        <td style={{ color: '#dc2626', fontWeight: 700 }}>-{fmt(h.total_outflow ?? h.outflow)}</td>
                        <td style={{ color: '#d4af37', fontWeight: 900, fontSize: 15 }}>{fmt(h.closing_balance)}</td>
                      </tr>
                    ))}
                    {!history.length && <tr><td colSpan={5} className="dash-empty">No closing records yet</td></tr>}
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
