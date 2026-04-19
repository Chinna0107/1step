import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { getTokenByRole } from '../../utils/tokenUtils'
import { api } from '../../utils/api'
import ReportView from '../employee/ReportView'
import './superadmin.css'
import './Dashboard.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin')}` })

export default function Reports() {
  const [branches, setBranches]   = useState([])
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    api('/dashboard/branches', { headers: auth() })
      .then(d => setBranches(d.map(b => b.name)))
      .catch(() => {})
    api('/dashboard/employees', { headers: auth() })
      .then(d => setEmployees(d))
      .catch(() => {})
  }, [])

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
