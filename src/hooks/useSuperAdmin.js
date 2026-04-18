import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import { getTokenByRole } from '../utils/tokenUtils'
import { cacheGet, cacheSet, cacheClear, TTL } from '../utils/cache'

const authHeaders = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin')}` })

const NOW_DATE  = new Date().toISOString().split('T')[0]
const NOW_MONTH = String(new Date().getMonth() + 1).padStart(2, '0')
const NOW_YEAR  = String(new Date().getFullYear())

export function useSuperAdminDashboard() {
  const CACHE_KEY = 'superadmin_dashboard'
  const [data, setData]       = useState(() => cacheGet(CACHE_KEY))
  const [loading, setLoading] = useState(!cacheGet(CACHE_KEY))
  const [error, setError]     = useState('')

  useEffect(() => {
    const cached = cacheGet(CACHE_KEY)
    if (cached) { setData(cached); setLoading(false); return }
    api('/dashboard/superadmin', { headers: authHeaders() })
      .then(d => { cacheSet(CACHE_KEY, d); setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  return { data, loading, error }
}

export function useDashboardStats() {
  const CACHE_KEY = 'superadmin_stats'
  const [stats, setStats]     = useState(() => cacheGet(CACHE_KEY))
  const [loading, setLoading] = useState(!cacheGet(CACHE_KEY))
  const [error, setError]     = useState('')

  const refetch = useCallback((force = false) => {
    if (!force) {
      const cached = cacheGet(CACHE_KEY)
      if (cached) { setStats(cached); setLoading(false); return }
    }
    setLoading(true)
    api('/dashboard/superadmin/stats', { headers: authHeaders() })
      .then(d => { cacheSet(CACHE_KEY, d); setStats(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => { refetch() }, [refetch])

  return { stats, loading, error, refetch }
}

export function useBranches() {
  const CACHE_KEY = 'branches'
  const [branches, setBranches] = useState(() => cacheGet(CACHE_KEY) || [])
  const [loading, setLoading]   = useState(!cacheGet(CACHE_KEY))

  useEffect(() => {
    const cached = cacheGet(CACHE_KEY)
    if (cached) { setBranches(cached); setLoading(false); return }
    api('/dashboard/branches', { headers: authHeaders() })
      .then(d => { cacheSet(CACHE_KEY, d, TTL.list); setBranches(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return { branches, loading }
}

export function useAdmins() {
  const CACHE_KEY = 'admins'
  const [admins, setAdmins]   = useState(() => cacheGet(CACHE_KEY) || [])
  const [loading, setLoading] = useState(!cacheGet(CACHE_KEY))
  const [error, setError]     = useState('')
  const [msg, setMsg]         = useState('')

  const refetch = useCallback((force = false) => {
    if (!force) {
      const cached = cacheGet(CACHE_KEY)
      if (cached) { setAdmins(cached); setLoading(false); return }
    }
    setLoading(true)
    api('/dashboard/admins', { headers: authHeaders() })
      .then(d => { cacheSet(CACHE_KEY, d, TTL.list); setAdmins(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const addAdmin = async (form) => {
    setMsg(''); setError('')
    try {
      const r = await api('/dashboard/admins/add', {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(form),
      })
      setMsg(r.message); cacheClear('admins'); refetch(true); return true
    } catch (e) { setError(e.message); return false }
  }

  const toggleStatus = async (id) => {
    try { await api(`/dashboard/users/${id}/toggle`, { method: 'PATCH', headers: authHeaders() }); cacheClear('admins'); refetch(true) }
    catch (e) { setError(e.message) }
  }

  const deleteUser = async (id) => {
    try { await api(`/dashboard/users/${id}`, { method: 'DELETE', headers: authHeaders() }); cacheClear('admins'); refetch(true) }
    catch (e) { setError(e.message) }
  }

  return { admins, loading, error, msg, addAdmin, toggleStatus, deleteUser }
}

export function useEmployees() {
  const CACHE_KEY = 'employees'
  const [employees, setEmployees] = useState(() => cacheGet(CACHE_KEY) || [])
  const [loading, setLoading]     = useState(!cacheGet(CACHE_KEY))
  const [error, setError]         = useState('')
  const [msg, setMsg]             = useState('')

  const refetch = useCallback((force = false) => {
    if (!force) {
      const cached = cacheGet(CACHE_KEY)
      if (cached) { setEmployees(cached); setLoading(false); return }
    }
    setLoading(true)
    api('/dashboard/employees', { headers: authHeaders() })
      .then(d => { cacheSet(CACHE_KEY, d, TTL.list); setEmployees(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const addEmployee = async (form) => {
    setMsg(''); setError('')
    try {
      const r = await api('/dashboard/employees/add', {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(form),
      })
      setMsg(r.message); cacheClear('employees'); refetch(true); return true
    } catch (e) { setError(e.message); return false }
  }

  const toggleStatus = async (id) => {
    try { await api(`/dashboard/users/${id}/toggle`, { method: 'PATCH', headers: authHeaders() }); cacheClear('employees'); refetch(true) }
    catch (e) { setError(e.message) }
  }

  const deleteUser = async (id) => {
    try { await api(`/dashboard/users/${id}`, { method: 'DELETE', headers: authHeaders() }); cacheClear('employees'); refetch(true) }
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
  const CACHE_KEY = `master_${table}`
  const [rows, setRows]       = useState(() => cacheGet(CACHE_KEY) || [])
  const [loading, setLoading] = useState(!cacheGet(CACHE_KEY))
  const [error, setError]     = useState('')
  const [msg, setMsg]         = useState('')

  const refetch = useCallback((force = false) => {
    if (!force) {
      const cached = cacheGet(CACHE_KEY)
      if (cached) { setRows(cached); setLoading(false); return }
    }
    setLoading(true)
    api(`/master/${table}`, { headers: authHeaders() })
      .then(d => { cacheSet(CACHE_KEY, d, TTL.master); setRows(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [table])

  useEffect(() => { refetch() }, [refetch])

  const add = async (body) => {
    setMsg(''); setError('')
    try {
      await api(`/master/${table}`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) })
      setMsg('Added successfully'); cacheClear(CACHE_KEY); refetch(true); return true
    } catch (e) { setError(e.message); return false }
  }

  const toggle = async (id) => {
    try { await api(`/master/${table}/${id}/toggle`, { method: 'PATCH', headers: authHeaders() }); cacheClear(CACHE_KEY); refetch(true) }
    catch (e) { setError(e.message) }
  }

  const remove = async (id) => {
    try { await api(`/master/${table}/${id}`, { method: 'DELETE', headers: authHeaders() }); cacheClear(CACHE_KEY); refetch(true) }
    catch (e) { setError(e.message) }
  }

  return { rows, loading, error, msg, add, toggle, remove, refetch }
}
