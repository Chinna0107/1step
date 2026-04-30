import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../utils/api'
import config from '../config'

export function useNotifications(role) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)
  const esRef                             = useRef(null)

  const token = () => {
    const auth = localStorage.getItem(`${role}_auth`)
    return auth ? JSON.parse(auth).token : null
  }

  const headers = () => ({ Authorization: `Bearer ${token()}` })

  // Fetch all notifications
  const fetchAll = useCallback(async () => {
    try {
      const data = await api('/notifications', { headers: headers() })
      setNotifications(Array.isArray(data) ? data : [])
    } catch (_) {}
    setLoading(false)
  }, [role])

  // SSE subscription
  useEffect(() => {
    const t = token()
    if (!t) return

    fetchAll()

    const es = new EventSource(`${config.API_URL}/notifications/subscribe?token=${t}`)
    esRef.current = es

    es.onmessage = (e) => {
      try {
        const notif = JSON.parse(e.data)
        setNotifications(prev => [{ ...notif, is_read: false }, ...prev])
      } catch (_) {}
    }

    es.onerror = () => {
      es.close()
      // Reconnect after 5s
      setTimeout(() => {
        if (esRef.current === es) fetchAll()
      }, 5000)
    }

    return () => { es.close(); esRef.current = null }
  }, [role])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markRead = async (id) => {
    try {
      await api(`/notifications/${id}/read`, { method: 'PATCH', headers: headers() })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (_) {}
  }

  const markAllRead = async () => {
    try {
      await api('/notifications/read-all', { method: 'PATCH', headers: headers() })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (_) {}
  }

  return { notifications, loading, unreadCount, markRead, markAllRead }
}
