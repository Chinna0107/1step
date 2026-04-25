import React from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useDailyClosing, useFinanceSummary, useWallets } from '../../hooks/useFinance'
import '../../pages/dashboard.css'

const fmt = n => `₹${Number(parseFloat(n)||0).toLocaleString('en-IN')}`

export default function DailyClosing() {
  const { closings, loading, msg, error, closeDay, refetch } = useDailyClosing()
  const { data: summary }  = useFinanceSummary()
  const { wallets, loading: wl } = useWallets()

  const todayStr      = new Date().toISOString().split('T')[0]
  const alreadyClosed = closings.some(h => h.date?.slice(0, 10) === todayStr)
  const last          = closings[0]

  // actual wallet total = real closing balance
  const walletTotal = wallets.reduce((s, w) => s + parseFloat(w.balance || 0), 0)

  const preview = {
    opening: parseFloat(last?.closing_balance ?? 0),
    inflow:  parseFloat(summary?.todayInflow  ?? 0),
    outflow: parseFloat(summary?.todayOutflow ?? 0),
    closing: walletTotal,   // real wallet total, not a formula
  }

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <div>
            <h1>📅 Daily Closing</h1>
            <p style={{ margin:0, fontSize:13, color:'#9ca3af' }}>
              {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
            </p>
          </div>
          <button className="dash-btn" onClick={refetch} style={{ background:'#f0f2f8', color:'#402070', border:'none' }}>↻ Refresh</button>
        </div>
        <div className="dash-main">

          {msg   && <div className="dash-alert dash-alert-success" style={{ marginBottom:12 }}>✅ {msg}</div>}
          {error && <div className="dash-alert dash-alert-error"   style={{ marginBottom:12 }}>❌ {error}</div>}

          {/* Today's Preview */}
          {!loading && (
            <div className="dash-card" style={{ marginBottom:20 }}>
              <div className="dash-card-header">
                <h2>📊 Today's Summary</h2>
                {alreadyClosed
                  ? <span style={{ background:'#d1fae5', color:'#059669', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>✅ Closed</span>
                  : <span style={{ background:'#fef3c7', color:'#d97706', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>⏳ Open</span>
                }
              </div>
              <div className="dash-card-body">
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:20 }}>
                  {[
                    { label:'Opening Balance',  val:preview.opening,  color:'#402070', icon:'🏦' },
                    { label:'+ Today Inflow',   val:preview.inflow,   color:'#059669', icon:'📈' },
                    { label:'− Today Outflow',  val:preview.outflow,  color:'#dc2626', icon:'📉' },
                    { label:'Wallet Balance',   val:preview.closing,  color:'#d4af37', icon:'💰', big:true },
                  ].map(item => (
                    <div key={item.label} style={{
                      padding:'14px 16px', borderRadius:10,
                      background: item.big ? 'linear-gradient(135deg,#fef9e7,#fef3c7)' : '#f8fafc',
                      border: item.big ? '2px solid #d4af37' : '1px solid #f0f2f8',
                    }}>
                      <div style={{ fontSize:18, marginBottom:4 }}>{item.icon}</div>
                      <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', marginBottom:4 }}>{item.label}</div>
                      <div style={{ fontSize: item.big ? 22 : 18, fontWeight:900, color:item.color }}>{wl ? '—' : fmt(item.val)}</div>
                    </div>
                  ))}
                </div>

                {/* Wallet breakdown */}
                {!wl && wallets.length > 0 && (
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16 }}>
                    {wallets.map(w => (
                      <div key={w.id} style={{ background:'#f0f2f8', borderRadius:8, padding:'8px 14px', fontSize:13 }}>
                        <span style={{ color:'#64748b' }}>{w.name}: </span>
                        <strong style={{ color:'#402070' }}>₹{Number(parseFloat(w.balance)||0).toLocaleString('en-IN')}</strong>
                      </div>
                    ))}
                  </div>
                )}

                {!alreadyClosed && (
                  <button className="dash-btn dash-btn-primary" style={{ width:'100%', padding:14, fontSize:15, justifyContent:'center' }}
                    onClick={closeDay}>
                    🔒 Close Today's Books
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
                    <tr><th>Date</th><th>Opening</th><th>Inflow</th><th>Outflow</th><th>Closing Balance</th></tr>
                  </thead>
                  <tbody>
                    {closings.map(h => (
                      <tr key={h.id}>
                        <td style={{ fontWeight:600 }}>{new Date(h.date).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' })}</td>
                        <td style={{ color:'#402070', fontWeight:700 }}>{fmt(h.opening_balance)}</td>
                        <td style={{ color:'#059669', fontWeight:700 }}>+{fmt(h.total_inflow ?? 0)}</td>
                        <td style={{ color:'#dc2626', fontWeight:700 }}>-{fmt(h.total_outflow ?? 0)}</td>
                        <td style={{ color:'#d4af37', fontWeight:900, fontSize:15 }}>{fmt(h.closing_balance)}</td>
                      </tr>
                    ))}
                    {!closings.length && <tr><td colSpan={5} className="dash-empty">No closing records yet</td></tr>}
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
