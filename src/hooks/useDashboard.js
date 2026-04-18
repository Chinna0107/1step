import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'

export function useDashboard(role) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const token = localStorage.getItem('ms_token')

  const fetch_ = useCallback(async () => {
    if (!token) { setError('Not authenticated'); setLoading(false); return }
    setLoading(true); setError('')
    try {
      const json = await api(`/dashboard/${role}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [role, token])

  useEffect(() => { fetch_() }, [fetch_])

  return { data, loading, error, refetch: fetch_ }
}
