import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import { getTokenByRole } from '../utils/tokenUtils'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('employee') || getTokenByRole('admin')}` })

const SERVICE_TABLES = [
  { service: 'Card Withdrawal',       hasCard: true  },
  { service: 'Bill Pay + Withdrawal', hasCard: true  },
  { service: 'Money Transfer (DMT)',  hasCard: false },
  { service: 'AEPS',                  hasCard: false },
  { service: 'Only Bill Payment',     hasCard: false },
]

export function useCharges() {
  const [chargesMap, setChargesMap] = useState({})
  const [loading, setLoading]       = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch all 5 service charge tables in parallel
      const results = await Promise.all(
        SERVICE_TABLES.map(s =>
          api(`/master/charges?service_type=${encodeURIComponent(s.service)}`, { headers: auth() })
            .then(rows => ({ service: s.service, hasCard: s.hasCard, rows }))
            .catch(() => ({ service: s.service, hasCard: s.hasCard, rows: [] }))
        )
      )

      // Get fresh branch from backend via /master/all (which uses req.user.branch from DB)
      const me = await api('/auth/me', { headers: auth() }).catch(() => null)
      const userBranch = me?.branch || ''

      const map = {}
      for (const { service, hasCard, rows } of results) {
        map[service] = {}
        for (const row of rows) {
          if (userBranch && row.branch !== userBranch) continue
          const key = hasCard ? `${row.platform}|${row.card_type}` : row.platform
          map[service][key] = {
            customer_rate: parseFloat(row.customer_rate) || 0,
            platform_rate: parseFloat(row.platform_rate) || 0,
          }
        }
      }
      setChargesMap(map)
    } catch (_) {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const lookup = useCallback((service_type, platform, card_type) => {
    const svcMap = chargesMap[service_type]
    if (!svcMap) return { customer_rate: 0, platform_rate: 0 }
    const hasCard = SERVICE_TABLES.find(s => s.service === service_type)?.hasCard
    const key = hasCard ? `${platform}|${card_type}` : platform
    return svcMap[key] || { customer_rate: 0, platform_rate: 0 }
  }, [chargesMap])

  return { lookup, loading, refetch: fetchAll }
}
