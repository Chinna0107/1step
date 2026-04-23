import React from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useProfit } from '../../hooks/useFinance'
import '../../pages/dashboard.css'
import './Profit.css'

const fmt  = n => Number(parseFloat(n)||0).toLocaleString('en-IN')
const fmtV = n => { const v = parseFloat(n)||0; if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${fmt(v)}` }

export default function Profit() {
  const { data, loading, refetch } = useProfit()

  const todayGross   = parseFloat(data?.todayInflow   ?? 0)
  const todayNet     = parseFloat(data?.todayProfit   ?? 0)
  const monthGross   = parseFloat(data?.monthInflow   ?? 0)
  const monthNet     = parseFloat(data?.monthProfit   ?? 0)
  const todayExp     = parseFloat(data?.todayExpenses ?? 0)
  const monthExp     = parseFloat(data?.monthExpenses ?? 0)

  const color = v => v >= 0 ? '#059669' : '#dc2626'
  const bg    = v => v >= 0 ? '#d1fae5' : '#fee2e2'
  const icon  = v => v >= 0 ? '📈' : '📉'

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <div>
            <h1>💸 Profit & Loss</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>
              Gross = Customer Charges − Platform Charges &nbsp;·&nbsp; Net = Gross − Expenses
            </p>
          </div>
          <button className="dash-btn dash-btn-primary" onClick={refetch} style={{ padding: '7px 16px' }}>↻ Refresh</button>
        </div>

        <div className="dash-main">

          {/* Formula Banner */}
          <div className="profit-formula-banner">
            <div className="profit-formula-item">
              <span className="profit-formula-icon">💰</span>
              <div>
                <div className="profit-formula-label">Customer Charges</div>
                <div className="profit-formula-desc">customer_rate% × amount</div>
              </div>
            </div>
            <div className="profit-formula-op">−</div>
            <div className="profit-formula-item">
              <span className="profit-formula-icon">🏢</span>
              <div>
                <div className="profit-formula-label">Platform Charges</div>
                <div className="profit-formula-desc">platform_rate% × amount</div>
              </div>
            </div>
            <div className="profit-formula-op">=</div>
            <div className="profit-formula-item profit-formula-result">
              <span className="profit-formula-icon">✨</span>
              <div>
                <div className="profit-formula-label">Gross Profit</div>
                <div className="profit-formula-desc">Added to wallet balance</div>
              </div>
            </div>
            <div className="profit-formula-op">−</div>
            <div className="profit-formula-item">
              <span className="profit-formula-icon">🧾</span>
              <div>
                <div className="profit-formula-label">Expenses</div>
                <div className="profit-formula-desc">Rent, salary, etc.</div>
              </div>
            </div>
            <div className="profit-formula-op">=</div>
            <div className="profit-formula-item profit-formula-result">
              <span className="profit-formula-icon">🏆</span>
              <div>
                <div className="profit-formula-label">Net Profit</div>
                <div className="profit-formula-desc">Final take-home</div>
              </div>
            </div>
          </div>

          {/* Today vs Month — 2 column layout */}
          <div className="profit-grid">

            {/* TODAY */}
            <div className="profit-section">
              <div className="profit-section-title">📅 Today</div>
              <div className="profit-cards">

                <div className="profit-card" style={{ borderColor: '#d4af37', background: 'linear-gradient(135deg,#fffbeb,#fef3c7)' }}>
                  <div className="profit-card-icon">💸</div>
                  <div className="profit-card-label">Gross Profit</div>
                  <div className="profit-card-value" style={{ color: '#d97706' }}>
                    {loading ? '—' : fmtV(todayGross)}
                  </div>
                  <div className="profit-card-sub">Customer charges − Platform charges</div>
                </div>

                <div className="profit-card" style={{ borderColor: color(todayNet), background: bg(todayNet) }}>
                  <div className="profit-card-icon">{icon(todayNet)}</div>
                  <div className="profit-card-label">Net Profit</div>
                  <div className="profit-card-value" style={{ color: color(todayNet), fontSize: '2rem' }}>
                    {loading ? '—' : fmtV(todayNet)}
                  </div>
                  <div className="profit-card-sub">Gross − Expenses</div>
                </div>

                <div className="profit-card" style={{ borderColor: '#dc2626', background: '#fff5f5' }}>
                  <div className="profit-card-icon">📉</div>
                  <div className="profit-card-label">Expenses</div>
                  <div className="profit-card-value" style={{ color: '#dc2626' }}>
                    {loading ? '—' : fmtV(todayExp)}
                  </div>
                  <div className="profit-card-sub">Branch expenses today</div>
                </div>

              </div>

              {/* Today breakdown bar */}
              {!loading && todayGross > 0 && (
                <div className="profit-breakdown">
                  <div className="profit-breakdown-title">Today's Breakdown</div>
                  <div className="profit-breakdown-bar">
                    <div style={{ width: `${Math.min(100, (todayNet / todayGross) * 100)}%`, background: color(todayNet), height: '100%', borderRadius: 6, transition: 'width 0.8s ease' }} />
                  </div>
                  <div className="profit-breakdown-labels">
                    <span style={{ color: color(todayNet) }}>Net: {fmtV(todayNet)}</span>
                    <span style={{ color: '#dc2626' }}>Exp: {fmtV(todayExp)}</span>
                    <span style={{ color: '#d97706' }}>Gross: {fmtV(todayGross)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* THIS MONTH */}
            <div className="profit-section">
              <div className="profit-section-title">📆 This Month</div>
              <div className="profit-cards">

                <div className="profit-card" style={{ borderColor: '#7c3aed', background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)' }}>
                  <div className="profit-card-icon">📊</div>
                  <div className="profit-card-label">Gross Profit</div>
                  <div className="profit-card-value" style={{ color: '#7c3aed' }}>
                    {loading ? '—' : fmtV(monthGross)}
                  </div>
                  <div className="profit-card-sub">Month customer charges earned</div>
                </div>

                <div className="profit-card" style={{ borderColor: color(monthNet), background: bg(monthNet) }}>
                  <div className="profit-card-icon">{icon(monthNet)}</div>
                  <div className="profit-card-label">Net Profit</div>
                  <div className="profit-card-value" style={{ color: color(monthNet), fontSize: '2rem' }}>
                    {loading ? '—' : fmtV(monthNet)}
                  </div>
                  <div className="profit-card-sub">Month gross − Month expenses</div>
                </div>

                <div className="profit-card" style={{ borderColor: '#b45309', background: '#fffbeb' }}>
                  <div className="profit-card-icon">🧾</div>
                  <div className="profit-card-label">Expenses</div>
                  <div className="profit-card-value" style={{ color: '#b45309' }}>
                    {loading ? '—' : fmtV(monthExp)}
                  </div>
                  <div className="profit-card-sub">Branch expenses this month</div>
                </div>

              </div>

              {/* Month breakdown bar */}
              {!loading && monthGross > 0 && (
                <div className="profit-breakdown">
                  <div className="profit-breakdown-title">Month Breakdown</div>
                  <div className="profit-breakdown-bar">
                    <div style={{ width: `${Math.min(100, (monthNet / monthGross) * 100)}%`, background: color(monthNet), height: '100%', borderRadius: 6, transition: 'width 0.8s ease' }} />
                  </div>
                  <div className="profit-breakdown-labels">
                    <span style={{ color: color(monthNet) }}>Net: {fmtV(monthNet)}</span>
                    <span style={{ color: '#b45309' }}>Exp: {fmtV(monthExp)}</span>
                    <span style={{ color: '#7c3aed' }}>Gross: {fmtV(monthGross)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
