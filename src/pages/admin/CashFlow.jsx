import React, { useEffect, useState, useCallback } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import '../../pages/dashboard.css'
import { useCashFlow } from '../../hooks/useFinance'

const auth  = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })
const fmt   = n => `₹${Number(n || 0).toLocaleString('en-IN')}`
const today = () => new Date().toISOString().split('T')[0]
const monthStart = () => today().slice(0, 7) + '-01'

export default function CashFlow() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [from, setFrom]       = useState(monthStart())
  const [to, setTo]           = useState(today())

  const refetch = useCallback(() => {
    setLoading(true)
    api(`/finance/cashflow?from=${from}&to=${to}`, { headers: auth() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [from, to])

  useEffect(() => { refetch() }, [refetch])

  const inflow  = data?.inflow  ?? {}
  const outflow = data?.outflow ?? {}
  const net     = data?.net     ?? 0

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <h1>💹 Cash Flow</h1>
          <div className="dash-topbar-right" style={{ gap: 8 }}>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              style={{ padding: '7px 10px', border: '1.5px solid #e0e0f0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }} />
            <span style={{ color: '#9ca3af', fontSize: 13 }}>to</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              style={{ padding: '7px 10px', border: '1.5px solid #e0e0f0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }} />
            <button className="dash-btn dash-btn-primary dash-btn-sm" onClick={refetch}>Filter</button>
          </div>
        </div>
        <div className="dash-main">

          {/* Net Balance Banner */}
          <div style={{
            background: net >= 0 ? 'linear-gradient(135deg,#d1fae5,#a7f3d0)' : 'linear-gradient(135deg,#fee2e2,#fca5a5)',
            borderRadius: 14, padding: '20px 28px', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: net >= 0 ? '#059669' : '#dc2626', textTransform: 'uppercase', letterSpacing: 1 }}>Net Balance</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: net >= 0 ? '#059669' : '#dc2626' }}>{fmt(net)}</div>
            </div>
            <div style={{ fontSize: 40 }}>{net >= 0 ? '📈' : '📉'}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Inflow */}
            <div className="dash-card" style={{ marginBottom: 0 }}>
              <div className="dash-card-header" style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(5,150,105,0.04))' }}>
                <h2 style={{ color: '#059669' }}>📈 Inflow</h2>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#059669' }}>{loading ? '—' : fmt(inflow.total ?? 0)}</span>
              </div>
              <div className="dash-card-body">
                {loading ? <div className="dash-loading" style={{ padding: 20 }}>Loading...</div> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { label: 'Customer Payments', val: inflow.customerPayments },
                      { label: 'Charges Earned',    val: inflow.chargesEarned },
                      { label: 'Commission',         val: inflow.commission },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f0fdf4', borderRadius: 8 }}>
                        <span style={{ fontSize: 13, color: '#374151' }}>{row.label}</span>
                        <strong style={{ color: '#059669' }}>{fmt(row.val ?? 0)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Outflow */}
            <div className="dash-card" style={{ marginBottom: 0 }}>
              <div className="dash-card-header" style={{ background: 'linear-gradient(135deg,rgba(220,38,38,0.08),rgba(185,28,28,0.04))' }}>
                <h2 style={{ color: '#dc2626' }}>📉 Outflow</h2>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#dc2626' }}>{loading ? '—' : fmt(outflow.total ?? 0)}</span>
              </div>
              <div className="dash-card-body">
                {loading ? <div className="dash-loading" style={{ padding: 20 }}>Loading...</div> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { label: 'Customer Transfer', val: outflow.customerTransfer },
                      { label: 'Wallet Load',        val: outflow.walletLoad },
                      { label: 'Expenses',           val: outflow.expenses },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#fff5f5', borderRadius: 8 }}>
                        <span style={{ fontSize: 13, color: '#374151' }}>{row.label}</span>
                        <strong style={{ color: '#dc2626' }}>{fmt(row.val ?? 0)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
