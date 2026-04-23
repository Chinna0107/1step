import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import { getTokenByRole } from '../utils/tokenUtils'
import { cacheGet, cacheSet, cacheClear, TTL } from '../utils/cache'

// helper: stale-while-revalidate — shows cached data instantly, fetches fresh in background
function useSWR(cacheKey, fetcher, ttl = TTL.dashboard) {
  const [data, setData]          = useState(() => cacheGet(cacheKey))
  const [loading, setLoading]    = useState(!cacheGet(cacheKey))
  const [revalidating, setReval] = useState(false)

  const run = useCallback((force = false) => {
    const cached = cacheGet(cacheKey)
    if (!force && cached) {
      setData(cached); setLoading(false)
      setReval(true)
      fetcher()
        .then(d => { cacheSet(cacheKey, d, ttl); setData(d) })
        .catch(() => {})
        .finally(() => setReval(false))
      return
    }
    if (!cached) setLoading(true)
    setReval(true)
    fetcher()
      .then(d => { cacheSet(cacheKey, d, ttl); setData(d); setLoading(false) })
      .catch(() => setLoading(false))
      .finally(() => setReval(false))
  }, [cacheKey, ttl]) // eslint-disable-line

  useEffect(() => { run() }, [run])
  return { data, loading, revalidating, refetch: (force = true) => run(force), setData }
}

const authHeaders = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin')}` })

const NOW_DATE  = new Date().toISOString().split('T')[0]
const NOW_MONTH = String(new Date().getMonth() + 1).padStart(2, '0')
const NOW_YEAR  = String(new Date().getFullYear())

export function useSuperAdminDashboard() {
  const { data, loading, revalidating } = useSWR(
    'sa:dashboard',
    () => api('/dashboard/superadmin', { headers: authHeaders() }),
    TTL.dashboard
  )
  return { data, loading, revalidating }
}

export function useDashboardStats() {
  const { data: stats, loading, revalidating, refetch } = useSWR(
    'sa:stats',
    () => api('/dashboard/superadmin/stats', { headers: authHeaders() }),
    TTL.dashboard
  )
  return { stats, loading, revalidating, refetch }
}

export function useBranches() {
  const { data, loading } = useSWR(
    'sa:branches',
    () => api('/dashboard/branches', { headers: authHeaders() }),
    TTL.list
  )
  return { branches: data ?? [], loading }
}

export function useAdmins() {
  const CACHE_KEY = 'admins'
  const [error, setError] = useState('')
  const [msg, setMsg]     = useState('')

  const { data: adminsData, loading, refetch: swrRefetch } = useSWR(
    CACHE_KEY,
    () => api('/dashboard/admins', { headers: authHeaders() }),
    TTL.list
  )
  const admins = adminsData ?? []
  const refetch = (force = true) => { cacheClear(CACHE_KEY); swrRefetch(force) }

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
  const [error, setError] = useState('')
  const [msg, setMsg]     = useState('')

  const { data: empData, loading, refetch: swrRefetch } = useSWR(
    CACHE_KEY,
    () => api('/dashboard/employees', { headers: authHeaders() }),
    TTL.list
  )
  const employees = empData ?? []
  const refetch = (force = true) => { cacheClear(CACHE_KEY); swrRefetch(force) }

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

// ── useBranchStats ────────────────────────────────────────────
export function useBranchStats() {
  const CACHE_KEY = 'sa:branch_stats'
  const [data, setData]       = useState(() => cacheGet(CACHE_KEY))
  const [loading, setLoading] = useState(!cacheGet(CACHE_KEY))
  const [error, setError]     = useState('')

  const refetch = useCallback((force = false) => {
    if (!force) {
      const cached = cacheGet(CACHE_KEY)
      if (cached) { setData(cached); setLoading(false); return }
    }
    setLoading(true)
    api('/dashboard/branches/stats', { headers: authHeaders() })
      .then(d => { cacheSet(CACHE_KEY, d, TTL.dashboard); setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const addBranch = async (form) => {
    try {
      await api('/dashboard/branches', { method: 'POST', headers: authHeaders(), body: JSON.stringify(form) })
      cacheClear(CACHE_KEY); cacheClear('branches'); refetch(true); return true
    } catch (e) { setError(e.message); return false }
  }

  const toggleBranch = async (id) => {
    try {
      await api(`/dashboard/branches/${id}/toggle`, { method: 'PATCH', headers: authHeaders() })
      cacheClear(CACHE_KEY); cacheClear('branches'); refetch(true)
    } catch (e) { setError(e.message) }
  }

  return { data, loading, error, refetch, addBranch, toggleBranch }
}

// ── useInsights ───────────────────────────────────────────────
export function useInsights(period = 'today') {
  const CACHE_KEY = `sa:insights:${period}`
  // initialise from cache so UI renders instantly with stale data
  const [data, setData]         = useState(() => cacheGet(CACHE_KEY))
  const [revalidating, setReval] = useState(false)  // background fetch indicator
  const [error, setError]       = useState('')

  // loading = true only when there is NO cached data at all
  const loading = !data

  const refetch = useCallback((force = false) => {
    const cached = cacheGet(CACHE_KEY)
    if (!force && cached) {
      setData(cached)
      // still revalidate in background silently
      setReval(true)
      api(`/dashboard/insights?period=${period}`, { headers: authHeaders() })
        .then(d => { cacheSet(CACHE_KEY, d, TTL.dashboard); setData(d) })
        .catch(() => {})
        .finally(() => setReval(false))
      return
    }
    setReval(true)
    api(`/dashboard/insights?period=${period}`, { headers: authHeaders() })
      .then(d => { cacheSet(CACHE_KEY, d, TTL.dashboard); setData(d) })
      .catch(e => setError(e.message))
      .finally(() => setReval(false))
  }, [period, CACHE_KEY])

  useEffect(() => { refetch() }, [refetch])

  return { data, loading, revalidating, error, refetch }
}

// ── useTracking ───────────────────────────────────────────────
export function useTracking() {
  const CACHE_KEY = 'sa:tracking'
  const [data, setData]       = useState(() => cacheGet(CACHE_KEY))
  const [loading, setLoading] = useState(!cacheGet(CACHE_KEY))
  const [error, setError]     = useState('')

  const refetch = useCallback((force = false) => {
    if (!force) {
      const cached = cacheGet(CACHE_KEY)
      if (cached) { setData(cached); setLoading(false); return }
    }
    setLoading(true)
    api('/dashboard/tracking', { headers: authHeaders() })
      .then(d => { cacheSet(CACHE_KEY, d, TTL.dashboard); setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => { refetch() }, [refetch])

  return { data, loading, error, refetch }
}

// ── useSuperAdminSecurity ─────────────────────────────────────
export function useSuperAdminSecurity() {
  const CACHE_KEY = 'sa:security_users'
  const [users, setUsers]     = useState(() => cacheGet(CACHE_KEY) || [])
  const [loading, setLoading] = useState(!cacheGet(CACHE_KEY))
  const [error, setError]     = useState('')
  const [msg, setMsg]         = useState('')

  const refetch = useCallback((force = false) => {
    if (!force) {
      const cached = cacheGet(CACHE_KEY)
      if (cached) { setUsers(cached); setLoading(false); return }
    }
    setLoading(true)
    api('/dashboard/security/users', { headers: authHeaders() })
      .then(d => { cacheSet(CACHE_KEY, d, TTL.list); setUsers(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const toggle = async (id) => {
    try {
      await api(`/dashboard/users/${id}/toggle`, { method: 'PATCH', headers: authHeaders() })
      setMsg('Updated'); cacheClear(CACHE_KEY); refetch(true)
    } catch (e) { setError(e.message) }
  }

  return { users, loading, error, msg, toggle, refetch }
}

// ── useSuperAdminFinance ──────────────────────────────────────
export function useSuperAdminFinance(from, to, branch = '') {
  const CACHE_KEY = `sa:finance:${from}:${to}:${branch}`
  const [data, setData]       = useState(() => cacheGet(CACHE_KEY))
  const [loading, setLoading] = useState(!cacheGet(CACHE_KEY))
  const [error, setError]     = useState('')

  const refetch = useCallback((force = false) => {
    if (!force) {
      const cached = cacheGet(CACHE_KEY)
      if (cached) { setData(cached); setLoading(false); return }
    }
    setLoading(true)
    const p = new URLSearchParams({ from, to })
    if (branch) p.set('branch', branch)
    api(`/dashboard/finance?${p}`, { headers: authHeaders() })
      .then(d => { cacheSet(CACHE_KEY, d, TTL.dashboard); setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [from, to, branch])

  useEffect(() => { refetch() }, [refetch])

  const addExpense = async (form) => {
    try {
      await api('/dashboard/expenses', { method: 'POST', headers: authHeaders(), body: JSON.stringify(form) })
      cacheClear(CACHE_KEY); refetch(true); return true
    } catch (e) { setError(e.message); return false }
  }

  return {
    ledger:         data?.ledger         ?? [],
    expenses:       data?.expenses       ?? [],
    expSummary:     data?.expSummary     ?? [],
    serviceSummary: data?.serviceSummary ?? [],
    daily:          data?.daily          ?? [],
    totals:         data?.totals         ?? {},
    loading, error, refetch, addExpense,
  }
}

// ── useSuperAdminReports ──────────────────────────────────────
export function useSuperAdminReports() {
  const CACHE_KEY_B = 'sa:report_branches'
  const CACHE_KEY_E = 'sa:report_employees'
  const [branches, setBranches]   = useState(() => cacheGet(CACHE_KEY_B) || [])
  const [employees, setEmployees] = useState(() => cacheGet(CACHE_KEY_E) || [])
  const [loading, setLoading]     = useState(!cacheGet(CACHE_KEY_B))

  useEffect(() => {
    const cb = cacheGet(CACHE_KEY_B)
    const ce = cacheGet(CACHE_KEY_E)
    if (cb && ce) { setBranches(cb); setEmployees(ce); setLoading(false); return }
    setLoading(true)
    Promise.all([
      api('/dashboard/branches',  { headers: authHeaders() }),
      api('/dashboard/employees', { headers: authHeaders() }),
    ]).then(([b, e]) => {
      cacheSet(CACHE_KEY_B, b, TTL.list)
      cacheSet(CACHE_KEY_E, e, TTL.list)
      setBranches(b); setEmployees(e); setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return { branches, employees, loading }
}

// ── useChargesConfig ──────────────────────────────────────────
export function useChargesConfig() {
  const CACHE_KEY_ALL = 'sa:charges_all'
  const CACHE_KEY_BR  = 'sa:charges_branches'
  const [master, setMaster]     = useState(() => cacheGet(CACHE_KEY_ALL))
  const [branches, setBranches] = useState(() => cacheGet(CACHE_KEY_BR) || [])
  const [charges, setCharges]   = useState([])
  const [loading, setLoading]   = useState(!cacheGet(CACHE_KEY_ALL))
  const [error, setError]       = useState('')

  const loadMaster = useCallback((force = false) => {
    if (!force) {
      const cm = cacheGet(CACHE_KEY_ALL)
      const cb = cacheGet(CACHE_KEY_BR)
      if (cm && cb) { setMaster(cm); setBranches(cb); setLoading(false); return }
    }
    setLoading(true)
    Promise.all([
      api('/master/all',      { headers: authHeaders() }),
      api('/master/branches', { headers: authHeaders() }),
    ]).then(([m, b]) => {
      cacheSet(CACHE_KEY_ALL, m, TTL.master)
      cacheSet(CACHE_KEY_BR,  b, TTL.master)
      setMaster(m); setBranches(b); setLoading(false)
    }).catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => { loadMaster() }, [loadMaster])

  const loadCharges = useCallback((serviceType) => {
    const key = `sa:charges:${serviceType}`
    const cached = cacheGet(key)
    if (cached) { setCharges(cached); return }
    api(`/master/charges?service_type=${encodeURIComponent(serviceType)}`, { headers: authHeaders() })
      .then(d => { cacheSet(key, d, TTL.master); setCharges(d) })
      .catch(e => setError(e.message))
  }, [])

  const saveCharges = async (ops) => {
    try {
      await Promise.all(ops)
      // bust all charges caches
      Object.keys(localStorage).filter(k => k.startsWith('sa:charges:')).forEach(k => cacheClear(k))
      return true
    } catch (e) { setError(e.message); return false }
  }

  return { master, branches, charges, loading, error, loadMaster, loadCharges, saveCharges }
}
