import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import { getTokenByRole } from '../utils/tokenUtils'

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
  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  const refetch = useCallback(() => {
    setLoading(true)
    api('/customers/my', { headers: empHeaders() })
      .then(d => { setCustomers(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => { refetch() }, [refetch])

  return { customers, loading, error, refetch }
}

// Admin: pending requests
export function useCustomerRequests() {
  const [pending, setPending]   = useState([])
  const [all, setAll]           = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [msg, setMsg]           = useState('')

  const refetch = useCallback(() => {
    setLoading(true)
    Promise.all([
      api('/customers/pending', { headers: adminHeaders() }),
      api('/customers/all',     { headers: adminHeaders() }),
    ])
      .then(([p, a]) => { setPending(p); setAll(a); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const approve = async (id) => {
    setMsg(''); setError('')
    try {
      const r = await api(`/customers/${id}/approve`, { method: 'PATCH', headers: adminHeaders() })
      setMsg(r.message); refetch()
    } catch (e) { setError(e.message) }
  }

  const reject = async (id) => {
    setMsg(''); setError('')
    try {
      const r = await api(`/customers/${id}/reject`, { method: 'PATCH', headers: adminHeaders() })
      setMsg(r.message); refetch()
    } catch (e) { setError(e.message) }
  }

  return { pending, all, loading, error, msg, approve, reject }
}
