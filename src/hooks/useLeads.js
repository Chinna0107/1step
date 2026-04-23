import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import { getTokenByRole } from '../utils/tokenUtils'

const getToken = () =>
  getTokenByRole('superadmin') || getTokenByRole('admin') || getTokenByRole('employee') ||
  localStorage.getItem('ms_token')

const auth = () => ({ Authorization: `Bearer ${getToken()}` })

// ── useLeads ──────────────────────────────────────────────────
export function useLeads(filterStatus = '', filterType = '') {
  const [leads, setLeads]     = useState([])
  const [stats, setStats]     = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const p = new URLSearchParams()
    if (filterStatus) p.set('status', filterStatus)
    if (filterType)   p.set('lead_type', filterType)
    Promise.all([
      api(`/leads?${p}`, { headers: auth() }),
      api('/leads/stats', { headers: auth() }),
    ]).then(([l, s]) => { setLeads(l); setStats(s); setLoading(false); setError('') })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [filterStatus, filterType])

  useEffect(() => { load() }, [load])

  const createLead = async (form) => {
    try {
      const r = await api('/leads', { method: 'POST', headers: auth(), body: JSON.stringify(form) })
      load()
      return r
    } catch (e) { throw e }
  }

  const updateStatus = async (id, status) => {
    try {
      await api(`/leads/${id}`, { method: 'PATCH', headers: auth(), body: JSON.stringify({ status }) })
      setLeads(l => l.map(x => x.id === id ? { ...x, status } : x))
    } catch (e) { throw e }
  }

  return { leads, stats, loading, error, load, createLead, updateStatus }
}

// ── useSuperAdminCustomers ────────────────────────────────────
export function useSuperAdminCustomers(branch = '', status = '', search = '') {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const authSA = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin')}` })

  const load = useCallback(() => {
    setLoading(true)
    const p = new URLSearchParams()
    if (branch) p.set('branch', branch)
    if (status) p.set('status', status)
    if (search) p.set('search', search)
    api(`/customers/superadmin/all?${p}`, { headers: authSA() })
      .then(d => { setData(d); setLoading(false); setError('') })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [branch, status, search])

  useEffect(() => { load() }, [load])

  return {
    customers:   data?.customers   ?? [],
    stats:       data?.stats       ?? {},
    branchStats: data?.branchStats ?? [],
    loading,
    error,
    load,
  }
}
