import React, { useEffect, useState, useCallback } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import '../../pages/dashboard.css'
import { useProfit } from '../../hooks/useFinance'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })
const fmt  = n => `₹${Number(n || 0).toLocaleString('en-IN')}`

export default function Profit() {
  const { data, loading } = useProfit()

  const refetch = useCallback(() => {
    setLoading(true)
    api('/finance/profit', { headers: auth() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const cards = [
    { label: 'Today Profit',    val: data?.todayProfit,   color: '#d4af37', icon: '💸', sub: 'Inflow – Outflow – Expenses' },
    { label: 'Monthly Profit',  val: data?.monthProfit,   color: '#059669', icon: '📈', sub: 'This month so far' },
    { label: 'Today Inflow',    val: data?.todayInflow,   color: '#2563eb', icon: '📥', sub: 'Transactions today' },
    { label: 'Monthly Inflow',  val: data?.monthInflow,   color: '#7c3aed', icon: '📊', sub: 'Transactions this month' },
    { label: 'Today Expenses',  val: data?.todayExpenses, color: '#dc2626', icon: '📉', sub: 'Expenses today' },
    { label: 'Month Expenses',  val: data?.monthExpenses, color: '#b45309', icon: '🧾', sub: 'Expenses this month' },
  ]

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <h1>💸 Profit</h1>
          <div className="dash-topbar-right">
            <button className="dash-btn dash-btn-primary" onClick={refetch} style={{ padding: '7px 14px' }}>↻ Refresh</button>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>Auto-calculated · No manual entry</span>
          </div>
        </div>
        <div className="dash-main">

          {/* Formula Banner */}
          <div style={{
            background: 'linear-gradient(135deg,#402070,#c02040)',
            borderRadius: 14, padding: '16px 24px', marginBottom: 20,
            color: '#fff', display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 4px 20px rgba(64,32,112,0.25)'
          }}>
            <span style={{ fontSize: 24 }}>📐</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 }}>Formula</div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Profit = Inflow – Outflow – Expenses</div>
            </div>
          </div>

          <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
            {cards.map(c => (
              <div key={c.label} className="dash-stat" style={{ borderLeftColor: c.color }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{c.icon}</div>
                <div className="dash-stat-label">{c.label}</div>
                <div className="dash-stat-value" style={{ color: c.color, fontSize: '1.5rem' }}>
                  {loading ? '—' : fmt(c.val ?? 0)}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{c.sub}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
