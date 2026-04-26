import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import { cacheGet, cacheSet } from '../utils/cache'
import { getTokenByRole } from '../utils/tokenUtils'

export function useDashboard(role) {
  const [data,    setData]    = useState(() => cacheGet(`dashboard_${role}`))
  const [loading, setLoading] = useState(!cacheGet(`dashboard_${role}`))
  const [error,   setError]   = useState('')

  const fetch_ = useCallback(async (force = false) => {
    const token = getTokenByRole(role) || getTokenByRole('admin') || getTokenByRole('superadmin')
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
  }, [role])

  useEffect(() => { fetch_() }, [fetch_])

  return { data, loading, error, refetch: () => fetch_(true) }
}
