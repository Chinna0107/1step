import React from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useAdminConfig } from '../../hooks/useFinance'
import '../../pages/dashboard.css'

export default function AdminConfig() {
  const { master, loading } = useAdminConfig()

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
                {valueKey && <td style={{ color: '#402070', fontWeight: 700 }}>{item[valueKey]}%</td>}
                <td><span className={`dash-status ${item.is_active ? 'active' : 'inactive'}`}>{item.is_active ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
            {!items?.length && <tr><td colSpan={3} className="dash-empty">No records</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )

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
              <Section title="Platforms" icon="🏢" items={master?.platforms} valueKey="commission" valueLabel="Commission %" />
              <Section title="Banks" icon="🏦" items={master?.banks} />
              <Section title="Cards" icon="💳" items={master?.cards} valueKey="charge" valueLabel="Charge %" />
              <Section title="Categories" icon="🏷️" items={master?.categories} />
              <Section title="Service Types" icon="⚙️" items={master?.service_types} valueKey="commission" valueLabel="Commission %" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
