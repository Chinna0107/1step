import { useState, useEffect, useCallback } from 'react'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function useDashboard(role) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const token = localStorage.getItem('ms_token')

  const fetch_ = useCallback(async () => {
    if (!token) { setError('Not authenticated'); setLoading(false); return }
    setLoading(true); setError('')
    try {
      const res  = await fetch(`${BASE}/dashboard/${role}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load dashboard')
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
