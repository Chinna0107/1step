// TTLs in ms
const TTL = {
  dashboard: 5 * 60 * 1000,   // 5 min — dashboard stats
  list:      15 * 60 * 1000,  // 15 min — admins, employees, branches, customers
  master:    30 * 60 * 1000,  // 30 min — platforms, banks, cards (rarely changes)
}

export function cacheGet(key) {
  try {
    const raw = localStorage.getItem(`_cache_${key}`)
    if (!raw) return null
    const { data, ts, ttl } = JSON.parse(raw)
    if (Date.now() - ts > ttl) { localStorage.removeItem(`_cache_${key}`); return null }
    return data
  } catch { return null }
}

export function cacheSet(key, data, ttl = TTL.dashboard) {
  try { localStorage.setItem(`_cache_${key}`, JSON.stringify({ data, ts: Date.now(), ttl })) } catch {}
}

export function cacheClear(key) {
  localStorage.removeItem(`_cache_${key}`)
}

export { TTL }
