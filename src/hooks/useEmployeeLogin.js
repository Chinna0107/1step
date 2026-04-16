import { useState } from 'react'
import { api } from '../utils/api'

export function useEmployeeLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const verifyCredentials = async ({ email, password }) => {
    setLoading(true); setError(''); setSuccess('')
    try {
      const data = await api('/auth/employee/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      setSuccess('Credentials verified!')
      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const verifyMpin = async ({ email, mpin }) => {
    setLoading(true); setError(''); setSuccess('')
    try {
      const data = await api('/auth/employee/verify-mpin', {
        method: 'POST',
        body: JSON.stringify({ email, mpin }),
      })
      setSuccess('Login successful!')
      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { verifyCredentials, verifyMpin, loading, error, success, setError, setSuccess }
}
