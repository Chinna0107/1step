import { useState } from 'react'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function useAddEmployee() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  const addEmployee = async (form) => {
    setLoading(true); setError(''); setSuccess('')
    const token = localStorage.getItem('ms_token')
    try {
      const res  = await fetch(`${BASE}/dashboard/users/add-employee`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to add employee')
      setSuccess(json.message)
      return json.user
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { addEmployee, loading, error, success, setError, setSuccess }
}
