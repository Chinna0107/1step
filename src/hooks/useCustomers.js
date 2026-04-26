import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import { getTokenByRole } from '../utils/tokenUtils'
import { cacheGet, cacheSet, cacheClear, TTL } from '../utils/cache'

const empHeaders = () => ({ Authorization: `Bearer ${getTokenByRole('employee') || getTokenByRole('admin')}` })
const adminHeaders = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })

// Employee: submit customer request
export function useAddCustomer() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const submitCustomer = async (form) => {
    setLoading(true); setError(''); setSuccess('')
    try {
      const r = await api('/customers/request', {
        method: 'POST',
        headers: empHeaders(),
        body: JSON.stringify(form),
      })
      setSuccess(r.message)
      return true
    } catch (e) { setError(e.message); return false }
    finally { setLoading(false) }
  }

  return { submitCustomer, loading, error, success }
}

// Employee: view their submitted customers
export function useMyCustomers() {
  const CACHE_KEY = 'my_customers'
  const [customers, setCustomers] = useState(() => cacheGet(CACHE_KEY) || [])
  const [loading, setLoading]     = useState(!cacheGet(CACHE_KEY))
  const [error, setError]         = useState('')

  const refetch = useCallback((force = false) => {
    if (!force) {
      const cached = cacheGet(CACHE_KEY)
      if (cached) { setCustomers(cached); setLoading(false); return }
    }
    setLoading(true)
    api('/customers/my', { headers: empHeaders() })
      .then(d => { cacheSet(CACHE_KEY, d, TTL.list); setCustomers(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => { refetch() }, [refetch])

  return { customers, loading, error, refetch }
}

// Admin: pending requests
export function useCustomerRequests() {
  const CACHE_KEY = 'customer_requests'
  const [pending, setPending]   = useState(() => cacheGet(CACHE_KEY)?.pending || [])
  const [all, setAll]           = useState(() => cacheGet(CACHE_KEY)?.all || [])
  const [loading, setLoading]   = useState(!cacheGet(CACHE_KEY))
  const [error, setError]       = useState('')
  const [msg, setMsg]           = useState('')

  const refetch = useCallback((force = false) => {
    if (!force) {
      const cached = cacheGet(CACHE_KEY)
      if (cached) { setPending(cached.pending); setAll(cached.all); setLoading(false); return }
    }
    setLoading(true)
    Promise.all([
      api('/customers/pending', { headers: adminHeaders() }),
      api('/customers/all',     { headers: adminHeaders() }),
    ])
      .then(([p, a]) => { cacheSet(CACHE_KEY, { pending: p, all: a }, 30 * 1000); setPending(p); setAll(a); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const approve = async (id) => {
    setMsg(''); setError('')
    try {
      const r = await api(`/customers/${id}/approve`, { method: 'PATCH', headers: adminHeaders() })
      setMsg(r.message); cacheClear('customer_requests'); refetch(true)
    } catch (e) { setError(e.message) }
  }

  const reject = async (id) => {
    setMsg(''); setError('')
    try {
      const r = await api(`/customers/${id}/reject`, { method: 'PATCH', headers: adminHeaders() })
      setMsg(r.message); cacheClear('customer_requests'); refetch(true)
    } catch (e) { setError(e.message) }
  }

  return { pending, all, loading, error, msg, approve, reject }
}
