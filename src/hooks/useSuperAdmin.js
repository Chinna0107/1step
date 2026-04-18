import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import { getTokenByRole } from '../utils/tokenUtils'

const authHeaders = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin')}` })

const NOW_DATE  = new Date().toISOString().split('T')[0]
const NOW_MONTH = String(new Date().getMonth() + 1).padStart(2, '0')
const NOW_YEAR  = String(new Date().getFullYear())

export function useSuperAdminDashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api('/dashboard/superadmin', { headers: authHeaders() })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  return { data, loading, error }
}

export function useDashboardStats() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const refetch = useCallback(() => {
    setLoading(true)
    api('/dashboard/superadmin/stats', { headers: authHeaders() })
      .then(d => { setStats(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => { refetch() }, [refetch])

  return { stats, loading, error, refetch }
}

export function useBranches() {
  const [branches, setBranches] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api('/dashboard/branches', { headers: authHeaders() })
      .then(d => { setBranches(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return { branches, loading }
}

export function useAdmins() {
  const [admins, setAdmins]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [msg, setMsg]         = useState('')

  const refetch = useCallback(() => {
    setLoading(true)
    api('/dashboard/admins', { headers: authHeaders() })
      .then(d => { setAdmins(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const addAdmin = async (form) => {
    setMsg(''); setError('')
    try {
      const r = await api('/dashboard/admins/add', {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(form),
      })
      setMsg(r.message); refetch(); return true
    } catch (e) { setError(e.message); return false }
  }

  const toggleStatus = async (id) => {
    try { await api(`/dashboard/users/${id}/toggle`, { method: 'PATCH', headers: authHeaders() }); refetch() }
    catch (e) { setError(e.message) }
  }

  const deleteUser = async (id) => {
    try { await api(`/dashboard/users/${id}`, { method: 'DELETE', headers: authHeaders() }); refetch() }
    catch (e) { setError(e.message) }
  }

  return { admins, loading, error, msg, addAdmin, toggleStatus, deleteUser }
}

export function useEmployees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [msg, setMsg]             = useState('')

  const refetch = useCallback(() => {
    setLoading(true)
    api('/dashboard/employees', { headers: authHeaders() })
      .then(d => { setEmployees(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const addEmployee = async (form) => {
    setMsg(''); setError('')
    try {
      const r = await api('/dashboard/employees/add', {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(form),
      })
      setMsg(r.message); refetch(); return true
    } catch (e) { setError(e.message); return false }
  }

  const toggleStatus = async (id) => {
    try { await api(`/dashboard/users/${id}/toggle`, { method: 'PATCH', headers: authHeaders() }); refetch() }
    catch (e) { setError(e.message) }
  }

  const deleteUser = async (id) => {
    try { await api(`/dashboard/users/${id}`, { method: 'DELETE', headers: authHeaders() }); refetch() }
    catch (e) { setError(e.message) }
  }

  return { employees, loading, error, msg, addEmployee, toggleStatus, deleteUser }
}

export function useAttendance() {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [view, setView]             = useState('day')
  const [date, setDate]             = useState(NOW_DATE)
  const [month, setMonth]           = useState(NOW_MONTH)
  const [year, setYear]             = useState(NOW_YEAR)

  useEffect(() => {
    setLoading(true)
    setError('')
    let params = `view=${view}`
    if (view === 'day')   params += `&date=${date}`
    if (view === 'month') params += `&month=${month}&year=${year}`
    if (view === 'year')  params += `&year=${year}`

    api(`/dashboard/attendance?${params}`, { headers: authHeaders() })
      .then(d => { setAttendance(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [view, date, month, year])

  return { attendance, loading, error, view, setView, date, setDate, month, setMonth, year, setYear }
}

export function useMasterTable(table) {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [msg, setMsg]         = useState('')

  const refetch = useCallback(() => {
    setLoading(true)
    api(`/master/${table}`, { headers: authHeaders() })
      .then(d => { setRows(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [table])

  useEffect(() => { refetch() }, [refetch])

  const add = async (body) => {
    setMsg(''); setError('')
    try {
      await api(`/master/${table}`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) })
      setMsg('Added successfully'); refetch(); return true
    } catch (e) { setError(e.message); return false }
  }

  const toggle = async (id) => {
    try { await api(`/master/${table}/${id}/toggle`, { method: 'PATCH', headers: authHeaders() }); refetch() }
    catch (e) { setError(e.message) }
  }

  const remove = async (id) => {
    try { await api(`/master/${table}/${id}`, { method: 'DELETE', headers: authHeaders() }); refetch() }
    catch (e) { setError(e.message) }
  }

  return { rows, loading, error, msg, add, toggle, remove, refetch }
}
