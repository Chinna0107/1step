import { useState } from 'react'
import { api } from '../utils/api'
import { getTokenByRole } from '../utils/tokenUtils'

const authHeader = () => ({ Authorization: `Bearer ${getTokenByRole('admin') || localStorage.getItem('ms_token')}` })

export function useAddEmployee() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  const addEmployee = async (form) => {
    setLoading(true); setError(''); setSuccess('')
    try {
      const json = await api('/dashboard/users/add-employee', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body:    JSON.stringify(form),
      })
      if (!json) throw new Error('Failed to add employee')
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
