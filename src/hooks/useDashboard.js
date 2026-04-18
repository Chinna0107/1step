import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import { cacheGet, cacheSet } from '../utils/cache'

export function useDashboard(role) {
  const [data,    setData]    = useState(() => cacheGet(`dashboard_${role}`))
  const [loading, setLoading] = useState(!cacheGet(`dashboard_${role}`))
  const [error,   setError]   = useState('')

  const token = localStorage.getItem('ms_token')

  const fetch_ = useCallback(async (force = false) => {
    if (!token) { setError('Not authenticated'); setLoading(false); return }
    if (!force) {
      const cached = cacheGet(`dashboard_${role}`)
      if (cached) { setData(cached); setLoading(false); return }
    }
    setLoading(true); setError('')
    try {
      const json = await api(`/dashboard/${role}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      cacheSet(`dashboard_${role}`, json)
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [role, token])

  useEffect(() => { fetch_() }, [fetch_])

  return { data, loading, error, refetch: () => fetch_(true) }
}
