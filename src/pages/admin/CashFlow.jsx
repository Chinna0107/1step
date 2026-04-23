import React, { useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useCashFlow } from '../../hooks/useFinance'
import '../../pages/dashboard.css'

const fmt    = n => Number(parseFloat(n)||0).toLocaleString('en-IN')
const fmtV   = n => { const v = parseFloat(n)||0; if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }
const today      = new Date().toISOString().split('T')[0]
const monthStart = today.slice(0, 7) + '-01'

export default function CashFlow() {
  const [from, setFrom] = useState(monthStart)
  const [to, setTo]     = useState(today)
  const { data, loading, refetch } = useCashFlow(from, to)

  const inflow  = data?.inflow  ?? {}
  const outflow = data?.outflow ?? {}
  const profit  = parseFloat(data?.profit  ?? 0)
  const net     = parseFloat(data?.net     ?? 0)

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <div>
            <h1>💹 Cash Flow</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>
              Inflow = Customer pays (amount + charges) · Outflow = Platform gets (amount + platform fee) + Expenses
            </p>
          </div>
          <div className="dash-topbar-right" style={{ gap: 8 }}>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              style={{ padding: '7px 10px', border: '1.5px solid #e0e0f0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }} />
            <span style={{ color: '#9ca3af', fontSize: 13 }}>to</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              style={{ padding: '7px 10px', border: '1.5px solid #e0e0f0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }} />
            <button className="dash-btn dash-btn-primary dash-btn-sm" onClick={refetch}>Apply</button>
          </div>
        </div>

        <div className="dash-main">

          {/* Summary Banner */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
            {[
              { label: 'Total Inflow',    value: fmtV(inflow.total  ?? 0), color: '#059669', bg: '#d1fae5', icon: '📈', sub: 'Cash received from customers' },
              { label: 'Total Outflow',   value: fmtV(outflow.total ?? 0), color: '#dc2626', bg: '#fee2e2', icon: '📉', sub: 'Platform + Expenses paid' },
              { label: 'Net Cash Flow',   value: fmtV(net),                color: net >= 0 ? '#059669' : '#dc2626', bg: net >= 0 ? '#d1fae5' : '#fee2e2', icon: net >= 0 ? '🏆' : '⚠️', sub: 'Inflow − Outflow' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{loading ? '—' : s.value}</div>
                  <div style={{ fontSize: 11, color: s.color, opacity: 0.7, marginTop: 2 }}>{s.sub}</div>
                </div>
                <div style={{ fontSize: 32 }}>{s.icon}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Inflow Breakdown */}
            <div className="dash-card" style={{ marginBottom: 0 }}>
              <div className="dash-card-header" style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(5,150,105,0.04))' }}>
                <h2 style={{ color: '#059669' }}>📈 Inflow Breakdown</h2>
                <span style={{ fontSize: 15, fontWeight: 900, color: '#059669' }}>{loading ? '—' : fmtV(inflow.total ?? 0)}</span>
              </div>
              <div className="dash-card-body">
                {loading ? <div className="dash-loading">Loading...</div> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: '💵 Base Amount (from customers)',  val: inflow.customerPayments, color: '#059669',  note: 'Transaction amount' },
                      { label: '➕ Customer Charges Collected',    val: inflow.customerCharges,  color: '#d4af37',  note: `customer_rate% of amount` },
                      { label: '📥 Total Wallet Inflow',           val: inflow.walletInflow,     color: '#059669',  note: 'Amount + Customer Charges', bold: true },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, borderLeft: row.bold ? '3px solid #059669' : 'none' }}>
                        <div>
                          <div style={{ fontSize: 13, color: '#374151', fontWeight: row.bold ? 700 : 400 }}>{row.label}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>{row.note}</div>
                        </div>
                        <strong style={{ color: row.color, fontSize: row.bold ? 15 : 13 }}>₹{fmt(row.val ?? 0)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Outflow Breakdown */}
            <div className="dash-card" style={{ marginBottom: 0 }}>
              <div className="dash-card-header" style={{ background: 'linear-gradient(135deg,rgba(220,38,38,0.08),rgba(185,28,28,0.04))' }}>
                <h2 style={{ color: '#dc2626' }}>📉 Outflow Breakdown</h2>
                <span style={{ fontSize: 15, fontWeight: 900, color: '#dc2626' }}>{loading ? '—' : fmtV(outflow.total ?? 0)}</span>
              </div>
              <div className="dash-card-body">
                {loading ? <div className="dash-loading">Loading...</div> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: '💸 Base Amount (to platform)',     val: outflow.platformSettlement, color: '#dc2626', note: 'Transaction amount settled' },
                      { label: '➖ Platform Charges Paid',         val: outflow.platformCharges,    color: '#f59e0b', note: 'platform_rate% of amount' },
                      { label: '📤 Total Wallet Outflow',          val: outflow.walletOutflow,      color: '#dc2626', note: 'Amount + Platform Charges', bold: true },
                      { label: '🧾 Branch Expenses',               val: outflow.expenses,           color: '#b45309', note: 'Rent, salary, utilities etc' },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#fff5f5', borderRadius: 8, borderLeft: row.bold ? '3px solid #dc2626' : 'none' }}>
                        <div>
                          <div style={{ fontSize: 13, color: '#374151', fontWeight: row.bold ? 700 : 400 }}>{row.label}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>{row.note}</div>
                        </div>
                        <strong style={{ color: row.color, fontSize: row.bold ? 15 : 13 }}>₹{fmt(row.val ?? 0)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profit Formula */}
          {!loading && (
            <div style={{ marginTop: 16, background: 'linear-gradient(135deg,#1a0a2e,#402070)', borderRadius: 14, padding: '16px 24px', color: '#fff' }}>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Profit Calculation</div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', fontSize: 14, fontWeight: 700 }}>
                <span style={{ color: '#d4af37' }}>Customer Charges (₹{fmt(inflow.customerCharges??0)})</span>
                <span style={{ opacity: 0.5 }}>−</span>
                <span style={{ color: '#f87171' }}>Platform Charges (₹{fmt(outflow.platformCharges??0)})</span>
                <span style={{ opacity: 0.5 }}>=</span>
                <span style={{ color: '#34d399', fontSize: 18 }}>Gross Profit ₹{fmt(profit)}</span>
                <span style={{ opacity: 0.5 }}>−</span>
                <span style={{ color: '#f87171' }}>Expenses (₹{fmt(outflow.expenses??0)})</span>
                <span style={{ opacity: 0.5 }}>=</span>
                <span style={{ color: net >= 0 ? '#34d399' : '#f87171', fontSize: 20, fontWeight: 900 }}>Net ₹{fmt(net)}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
