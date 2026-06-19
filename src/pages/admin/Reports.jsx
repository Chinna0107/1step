import React from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import ReportView from '../employee/ReportView'
import { useAdminReports } from '../../hooks/useFinance'
import '../../pages/dashboard.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })

export default function AdminReports() {
  const { employees, branches } = useAdminReports()

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <div>
            <h1>Reports & Downloads</h1>
            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Platform-wise and service-wise transaction breakdown with GST</p>
          </div>
        </div>
        <div className="dash-main">
          <ReportView
            authHeader={auth}
            showFinancials={true}
            branches={branches}
            employees={employees}
          />
        </div>
      </div>
    </div>
  )
}
