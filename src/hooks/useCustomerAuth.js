import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'

const KEY = 'customer_auth'

// ── Module-level cache (survives re-renders & page navigation) ──
const cache = {
  profile: null,
  txns: null,
  profileTs: 0,
  txnsTs: 0,
  TTL: 5 * 60 * 1000, // 5 minutes
}

const isFresh = (ts) => Date.now() - ts < cache.TTL

export function getCustomerToken() {
  try { return JSON.parse(localStorage.getItem(KEY))?.token || null } catch { return null }
}
export function getCustomerUser() {
  try { return JSON.parse(localStorage.getItem(KEY))?.customer || null } catch { return null }
}

const authHeader = () => ({ Authorization: `Bearer ${getCustomerToken()}` })

// ── Login / Logout ────────────────────────────────────────────
export function useCustomerLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const login = async ({ pan, phone }) => {
    setLoading(true); setError('')
    try {
      const data = await api('/customer/login', { method: 'POST', body: JSON.stringify({ pan, phone }) })
      localStorage.setItem(KEY, JSON.stringify({ ...data, timestamp: new Date().toISOString() }))
      // clear cache on new login
      cache.profile = null; cache.txns = null
      cache.profileTs = 0;  cache.txnsTs = 0
      return data
    } catch (e) { setError(e.message); return null }
    finally { setLoading(false) }
  }

  const logout = async () => {
    try { await api('/customer/logout', { method: 'POST', headers: authHeader() }) } catch {}
    localStorage.clear()
    cache.profile = null; cache.txns = null
    cache.profileTs = 0;  cache.txnsTs = 0
  }

  return { login, logout, loading, error, setError }
}

// ── Profile — cached, no repeat hits ─────────────────────────
export function useCustomerProfile() {
  const [profile, setProfile] = useState(cache.profile)   // instant if cached
  const [loading, setLoading] = useState(!isFresh(cache.profileTs))
  const [error, setError]     = useState('')

  useEffect(() => {
    if (isFresh(cache.profileTs)) { setProfile(cache.profile); setLoading(false); return }
    setLoading(true)
    api('/customer/profile', { headers: authHeader() })
      .then(d => {
        cache.profile = d
        cache.profileTs = Date.now()
        setProfile(d); setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  return { profile, loading, error }
}

// ── Coins ────────────────────────────────────────────────────
export function useCustomerCoins() {
  const [coins, setCoins]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [redeeming, setRedeeming]   = useState(false)
  const [msg, setMsg]               = useState('')
  const [error, setError]           = useState('')

  const refetch = useCallback(() => {
    setLoading(true)
    api('/customer/coins', { headers: authHeader() })
      .then(d => { setCoins(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const redeem = async (amount) => {
    setRedeeming(true); setMsg(''); setError('')
    try {
      const r = await api('/customer/coins/redeem', { method: 'POST', headers: authHeader(), body: JSON.stringify({ amount }) })
      setMsg(r.message)
      setCoins(prev => ({ ...prev, coins: r.remaining, coins_redeemed: (prev?.coins_redeemed || 0) + r.coinsUsed }))
    } catch (e) { setError(e.message) }
    setRedeeming(false)
  }

  return { coins, loading, redeeming, msg, error, redeem, refetch, setMsg, setError }
}
export function useCustomerTransactions() {
  const [txns, setTxns]       = useState(cache.txns || [])
  const [loading, setLoading] = useState(!isFresh(cache.txnsTs))
  const [error, setError]     = useState('')

  const refetch = useCallback((force = false) => {
    if (!force && isFresh(cache.txnsTs)) { setTxns(cache.txns); setLoading(false); return }
    setLoading(true)
    api('/customer/transactions', { headers: authHeader() })
      .then(d => {
        cache.txns = d
        cache.txnsTs = Date.now()
        setTxns(d); setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => { refetch() }, [refetch])

  return { txns, loading, error, refetch }
}
