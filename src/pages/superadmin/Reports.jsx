import React from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { useSuperAdminReports } from '../../hooks/useSuperAdmin'
import { api } from '../../utils/api'
import ReportView from '../employee/ReportView'
import './superadmin.css'
import './Dashboard.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin')}` })

export default function Reports() {
  const { branches: branchObjs, employees } = useSuperAdminReports()
  const branches = branchObjs.map(b => b.name)

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-topbar-title">Reports & Downloads</h1>
            <p className="dash-topbar-sub">Platform-wise and service-wise transaction breakdown</p>
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
