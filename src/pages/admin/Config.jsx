import React, { useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useAdminConfig } from '../../hooks/useFinance'
import '../../pages/dashboard.css'

const SERVICE_ICONS = {
  'Card Withdrawal':       '💳',
  'Bill Pay + Withdrawal': '📄',
  'Money Transfer (DMT)':  '💸',
  'AEPS':                  '🏧',
  'Only Bill Payment':     '🧾',
}

const SERVICES = Object.keys(SERVICE_ICONS)

export default function AdminConfig() {
  const { master, charges, loading } = useAdminConfig()
  const [activeTab, setActiveTab] = useState('charges')
  const [activeSvc, setActiveSvc] = useState(SERVICES[0])

  const Section = ({ title, icon, items, valueKey, valueLabel }) => (
    <div className="dash-card">
      <div className="dash-card-header"><h2>{icon} {title}</h2><span className="dash-badge" style={{ fontSize: 11 }}>Read Only</span></div>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead><tr><th>Name</th>{valueKey && <th>{valueLabel}</th>}<th>Status</th></tr></thead>
          <tbody>
            {items?.map(item => (
              <tr key={item.id}>
                <td><strong>{item.name}</strong></td>
                {valueKey && <td style={{ color: '#0d1f3d', fontWeight: 700 }}>{item[valueKey]}%</td>}
                <td><span className={`dash-status ${item.is_active ? 'active' : 'inactive'}`}>{item.is_active ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
            {!items?.length && <tr><td colSpan={3} className="dash-empty">No records</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )

  const ChargesTable = ({ rows, hasCard }) => (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            <th>Branch</th>
            <th>Platform</th>
            {hasCard && <th>Card Type</th>}
            <th>Customer Rate %</th>
            <th>Platform Rate %</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows?.map(r => (
            <tr key={r.id}>
              <td>{r.branch}</td>
              <td><strong>{r.platform}</strong></td>
              {hasCard && <td>{r.card_type || '—'}</td>}
              <td style={{ color: '#16a34a', fontWeight: 700 }}>{r.customer_rate}%</td>
              <td style={{ color: '#dc2626', fontWeight: 700 }}>{r.platform_rate}%</td>
              <td><span className={`dash-status ${r.is_active ? 'active' : 'inactive'}`}>{r.is_active ? 'Active' : 'Inactive'}</span></td>
            </tr>
          ))}
          {!rows?.length && <tr><td colSpan={hasCard ? 6 : 5} className="dash-empty">No charges configured</td></tr>}
        </tbody>
      </table>
    </div>
  )

  const hasCard = activeSvc === 'Card Withdrawal' || activeSvc === 'Bill Pay + Withdrawal'

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <h1>Configuration</h1>
          <div className="dash-topbar-right">
            <span className="dash-badge" style={{ background: '#fef3c7', color: '#d97706' }}>⚙️ Controlled by Super Admin</span>
          </div>
        </div>
        <div className="dash-main">
          {loading ? <div className="dash-loading">Loading...</div> : (
            <>
              {/* Tab switcher */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {['charges', 'master'].map(t => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={`dash-btn${activeTab === t ? '' : '-outline'}`}
                    style={{ textTransform: 'capitalize' }}>
                    {t === 'charges' ? '💰 Service Charges' : '⚙️ Master Data'}
                  </button>
                ))}
              </div>

              {activeTab === 'charges' && (
                <div className="dash-card">
                  <div className="dash-card-header"><h2>💰 Service Charges</h2></div>
                  {/* Service tabs */}
                  <div style={{ display: 'flex', gap: 6, padding: '0 16px 12px', flexWrap: 'wrap' }}>
                    {SERVICES.map(svc => (
                      <button key={svc} onClick={() => setActiveSvc(svc)}
                        style={{
                          padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13,
                          background: activeSvc === svc ? '#0d1f3d' : '#f3f4f6',
                          color: activeSvc === svc ? '#fff' : '#374151', fontWeight: activeSvc === svc ? 700 : 400,
                        }}>
                        {SERVICE_ICONS[svc]} {svc}
                      </button>
                    ))}
                  </div>
                  <ChargesTable rows={charges?.[activeSvc]} hasCard={hasCard} />
                </div>
              )}

              {activeTab === 'master' && (
                <>
                  <Section title="Platforms"     icon="🏢" items={master?.platforms} />
                  <Section title="Banks"          icon="🏦" items={master?.banks} />
                  <Section title="Cards"          icon="💳" items={master?.cards} valueKey="charge" valueLabel="Charge %" />
                  <Section title="Categories"     icon="🏷️" items={master?.categories} />
                  <Section title="Service Types"  icon="⚙️" items={master?.service_types} />
                  <Section title="Payment Modes"  icon="💳" items={master?.payment_modes} />
                  <Section title="Receive Modes"  icon="📥" items={master?.receive_modes} />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
