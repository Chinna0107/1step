import { useState } from 'react'
import { api } from '../utils/api'

export function useSuperAdminAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const verifyCredentials = async ({ email, password }) => {
    setLoading(true); setError(''); setSuccess('')
    try {
      const data = await api('/auth/superadmin/login', {
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
      const data = await api('/auth/superadmin/verify-mpin', {
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

  const register = async ({ name, email, password, mpin, secretKey }) => {
    setLoading(true); setError(''); setSuccess('')
    try {
      const data = await api('/auth/superadmin/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, mpin, secretKey }),
      })
      setSuccess('Super Admin registered successfully!')
      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { verifyCredentials, verifyMpin, register, loading, error, success, setError, setSuccess }
}
