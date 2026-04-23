import React, { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import ReportView from '../employee/ReportView'
import '../../pages/dashboard.css'
import { useAdminReports } from '../../hooks/useFinance'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })

export default function AdminReports() {
  const { employees } = useAdminReports()

  return (
    <div className="dash-page">
      <AdminSidebar />
      <div className="dash-content">
        <div className="dash-topbar">
          <h1>Reports & Downloads</h1>
        </div>
        <div className="dash-main">
          <ReportView
            authHeader={auth}
            showFinancials={true}
            employees={employees}
          />
        </div>
      </div>
    </div>
  )
}
