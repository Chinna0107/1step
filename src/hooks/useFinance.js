import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import { getTokenByRole } from '../utils/tokenUtils'
import { cacheGet, cacheSet, cacheClear, TTL } from '../utils/cache'

const authAdmin = () => ({ Authorization: `Bearer ${getTokenByRole('admin')}` })
const authSA    = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin')}` })

const today      = new Date().toISOString().split('T')[0]
const monthStart = today.slice(0, 7) + '-01'

// helper: stale-while-revalidate fetch
// - returns cached data instantly
// - fetches fresh in background silently
// - only shows loading=true when NO cache exists at all
function useSWR(cacheKey, fetcher, ttl = TTL.dashboard) {
  const [data, setData]           = useState(() => cacheGet(cacheKey))
  const [loading, setLoading]     = useState(!cacheGet(cacheKey))
  const [revalidating, setReval]  = useState(false)

  const run = useCallback((force = false) => {
    const cached = cacheGet(cacheKey)
    if (!force && cached) {
      setData(cached)
      setLoading(false)
      // background revalidate
      setReval(true)
      fetcher()
        .then(d => { cacheSet(cacheKey, d, ttl); setData(d) })
        .catch(() => {})
        .finally(() => setReval(false))
      return
    }
    if (!cached) setLoading(true)
    setReval(true)
    fetcher()
      .then(d => { cacheSet(cacheKey, d, ttl); setData(d); setLoading(false) })
      .catch(() => setLoading(false))
      .finally(() => setReval(false))
  }, [cacheKey, ttl]) // eslint-disable-line

  useEffect(() => { run() }, [run])

  return { data, loading, revalidating, refetch: () => run(true), setData }
}

// ── useFinanceSummary ─────────────────────────────────────────
export function useFinanceSummary() {
  const { data, loading, revalidating, refetch } = useSWR(
    'fin:summary',
    () => api('/finance/summary', { headers: authAdmin() }),
    TTL.dashboard
  )
  return { data, loading, revalidating, refetch }
}

// ── useFinanceData ────────────────────────────────────────────
export function useFinanceData(from = monthStart, to = today, branch = '') {
  const key = `fin:data:${from}:${to}:${branch}`
  const token = getTokenByRole('superadmin') || getTokenByRole('admin')
  const { data, loading, revalidating, refetch } = useSWR(
    key,
    () => {
      const p = new URLSearchParams({ from, to })
      if (branch) p.set('branch', branch)
      return api(`/dashboard/finance?${p}`, { headers: { Authorization: `Bearer ${token}` } })
    },
    TTL.dashboard
  )
  return {
    ledger:         data?.ledger         ?? [],
    expenses:       data?.expenses       ?? [],
    expSummary:     data?.expSummary     ?? [],
    serviceSummary: data?.serviceSummary ?? [],
    daily:          data?.daily          ?? [],
    totals:         data?.totals         ?? {},
    loading, revalidating, refetch,
  }
}

// ── useFinanceAlerts ──────────────────────────────────────────
export function useFinanceAlerts() {
  const { data, loading } = useSWR(
    'fin:alerts',
    () => api('/finance/alerts', { headers: authAdmin() }),
    TTL.dashboard
  )
  return { alerts: data ?? [], loading }
}

// ── useLedger ─────────────────────────────────────────────────
export function useLedger(from = today, to = today) {
  const { data, loading, refetch } = useSWR(
    `fin:ledger:${from}:${to}`,
    () => api(`/finance/ledger?from=${from}&to=${to}`, { headers: authAdmin() }),
    TTL.dashboard
  )
  return { rows: data ?? [], loading, refetch }
}

// ── useCashFlow ───────────────────────────────────────────────
export function useCashFlow(from = monthStart, to = today) {
  const { data, loading, refetch } = useSWR(
    `fin:cashflow:${from}:${to}`,
    () => api(`/finance/cashflow?from=${from}&to=${to}`, { headers: authAdmin() }),
    TTL.dashboard
  )
  return { data, loading, refetch }
}

// ── useWallets ────────────────────────────────────────────────
export function useWallets() {
  const { data, loading, refetch, setData } = useSWR(
    'fin:wallets',
    () => api('/finance/wallets', { headers: authAdmin() }),
    TTL.list
  )
  const [msg, setMsg]   = useState('')
  const [error, setError] = useState('')

  const bust = () => { cacheClear('fin:wallets'); refetch() }

  const createWallet = async (name) => {
    try { await api('/finance/wallets', { method: 'POST', headers: authAdmin(), body: JSON.stringify({ name }) }); setMsg('Wallet created'); bust() }
    catch (e) { setError(e.message) }
  }
  const addMoney = async (id, amount, remarks) => {
    try { await api(`/finance/wallets/${id}/add`, { method: 'POST', headers: authAdmin(), body: JSON.stringify({ amount, remarks }) }); setMsg('Money added'); bust() }
    catch (e) { setError(e.message) }
  }
  const deductMoney = async (id, amount, remarks) => {
    try { await api(`/finance/wallets/${id}/deduct`, { method: 'POST', headers: authAdmin(), body: JSON.stringify({ amount, remarks }) }); setMsg('Money deducted'); bust() }
    catch (e) { setError(e.message) }
  }
  const transfer = async (from_id, to_id, amount, remarks) => {
    try { await api('/finance/wallets/transfer', { method: 'POST', headers: authAdmin(), body: JSON.stringify({ from_id, to_id, amount, remarks }) }); setMsg('Transfer done'); bust() }
    catch (e) { setError(e.message) }
  }

  return { wallets: data ?? [], loading, msg, error, createWallet, addMoney, deductMoney, transfer, refetch: bust }
}

// ── useSettlements ────────────────────────────────────────────
export function useSettlements(status = '') {
  const { data, loading, refetch } = useSWR(
    `fin:settlements:${status}`,
    () => api(`/finance/settlements${status ? `?status=${status}` : ''}`, { headers: authAdmin() }),
    TTL.list
  )
  const [msg, setMsg]     = useState('')
  const [error, setError] = useState('')

  const bust = () => { cacheClear(`fin:settlements:${status}`); refetch() }

  const create = async (form) => {
    try { await api('/finance/settlements', { method: 'POST', headers: authAdmin(), body: JSON.stringify(form) }); setMsg('Settlement added'); bust() }
    catch (e) { setError(e.message) }
  }
  const receive = async (id) => {
    try { await api(`/finance/settlements/${id}/receive`, { method: 'PATCH', headers: authAdmin() }); setMsg('Marked as received'); bust() }
    catch (e) { setError(e.message) }
  }

  return { settlements: data ?? [], loading, msg, error, create, receive, refetch: bust }
}

// ── useDailyClosing ───────────────────────────────────────────
export function useDailyClosing() {
  const { data: closings, loading: l1, refetch: r1 } = useSWR(
    'fin:closing',
    () => api('/finance/closing', { headers: authAdmin() }),
    TTL.list
  )
  const { data: summary, loading: l2 } = useSWR(
    'fin:summary',
    () => api('/finance/summary', { headers: authAdmin() }),
    TTL.dashboard
  )
  const [msg, setMsg]     = useState('')
  const [error, setError] = useState('')

  const closeDay = async () => {
    try {
      const r = await api('/finance/closing', { method: 'POST', headers: authAdmin() })
      setMsg(r.message); cacheClear('fin:closing'); r1()
    } catch (e) { setError(e.message) }
  }

  return { closings: closings ?? [], summary, loading: l1 || l2, msg, error, closeDay, refetch: r1 }
}

// ── useProfit ─────────────────────────────────────────────────
export function useProfit() {
  const { data, loading } = useSWR(
    'fin:profit',
    () => api('/finance/profit', { headers: authAdmin() }),
    TTL.dashboard
  )
  return { data, loading }
}

// ── useAdminStats ─────────────────────────────────────────────
export function useAdminStats() {
  const { data, loading, refetch } = useSWR(
    'admin:stats',
    () => api('/dashboard/admin/stats', { headers: authAdmin() }),
    TTL.dashboard
  )
  return { data, loading, refetch }
}

// ── useAdminSecurity ──────────────────────────────────────────
export function useAdminSecurity() {
  const { data, loading, refetch } = useSWR(
    'admin:security',
    () => api('/dashboard/security/users', { headers: authAdmin() }),
    TTL.list
  )
  const [msg, setMsg] = useState('')

  const toggle = async (id) => {
    try { await api(`/dashboard/users/${id}/toggle`, { method: 'PATCH', headers: authAdmin() }); setMsg('Updated'); cacheClear('admin:security'); refetch() }
    catch (e) { setMsg(e.message) }
  }

  return { users: data ?? [], loading, msg, toggle, refetch }
}

// ── useAdminReports ───────────────────────────────────────────
export function useAdminReports() {
  const { data } = useSWR(
    'admin:employees',
    () => api('/dashboard/employees', { headers: authAdmin() }),
    TTL.list
  )
  return { employees: data ?? [] }
}

// ── useAdminAttendance ────────────────────────────────────────
export function useAdminAttendance(date = today) {
  const { data, loading, refetch } = useSWR(
    `admin:attendance:${date}`,
    () => api(`/dashboard/attendance?view=day&date=${date}`, { headers: authAdmin() }),
    TTL.dashboard
  )
  return { rows: data ?? [], loading, refetch }
}

// ── useAdminExpenses ──────────────────────────────────────────
export function useAdminExpenses() {
  const { data, loading, refetch } = useSWR(
    'admin:expenses',
    () => api('/dashboard/finance', { headers: authAdmin() }),
    TTL.dashboard
  )
  const [msg, setMsg]     = useState('')
  const [error, setError] = useState('')

  const addExpense = async (payload) => {
    try {
      await api('/dashboard/expenses', { method: 'POST', headers: authAdmin(), body: JSON.stringify(payload) })
      setMsg('✅ Expense added'); cacheClear('admin:expenses'); refetch()
    } catch (e) { setError(e.message) }
  }

  return {
    expenses:   data?.expenses   ?? [],
    expSummary: data?.expSummary ?? [],
    totals:     data?.totals     ?? {},
    loading, msg, error, addExpense, refetch,
  }
}
