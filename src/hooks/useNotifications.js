import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../utils/api'
import config from '../config'

// Single shared AudioContext
let sharedCtx = null

export const unlockAudio = () => {
  try {
    if (!sharedCtx) sharedCtx = new (window.AudioContext || window.webkitAudioContext)()
    if (sharedCtx.state === 'suspended') sharedCtx.resume()
  } catch (_) {}
}

const playSOSSound = () => {
  try {
    unlockAudio()
    const ctx = sharedCtx
    if (!ctx) return

    // Police siren: two-tone wail (hi-lo alternating like real police siren)
    const sirenDuration = 3.0  // total seconds
    const cycleDuration = 0.5  // each hi-lo cycle
    const cycles = Math.floor(sirenDuration / cycleDuration)

    for (let i = 0; i < cycles; i++) {
      const start = i * cycleDuration

      // High tone
      const oscHi  = ctx.createOscillator()
      const gainHi = ctx.createGain()
      oscHi.connect(gainHi)
      gainHi.connect(ctx.destination)
      oscHi.type = 'sawtooth'
      oscHi.frequency.setValueAtTime(1200, ctx.currentTime + start)
      oscHi.frequency.linearRampToValueAtTime(960, ctx.currentTime + start + cycleDuration / 2)
      gainHi.gain.setValueAtTime(0.9, ctx.currentTime + start)
      gainHi.gain.setValueAtTime(0.9, ctx.currentTime + start + cycleDuration / 2 - 0.01)
      gainHi.gain.linearRampToValueAtTime(0, ctx.currentTime + start + cycleDuration / 2)
      oscHi.start(ctx.currentTime + start)
      oscHi.stop(ctx.currentTime + start + cycleDuration / 2)

      // Low tone
      const oscLo  = ctx.createOscillator()
      const gainLo = ctx.createGain()
      oscLo.connect(gainLo)
      gainLo.connect(ctx.destination)
      oscLo.type = 'sawtooth'
      oscLo.frequency.setValueAtTime(960, ctx.currentTime + start + cycleDuration / 2)
      oscLo.frequency.linearRampToValueAtTime(1200, ctx.currentTime + start + cycleDuration)
      gainLo.gain.setValueAtTime(0.9, ctx.currentTime + start + cycleDuration / 2)
      gainLo.gain.setValueAtTime(0.9, ctx.currentTime + start + cycleDuration - 0.01)
      gainLo.gain.linearRampToValueAtTime(0, ctx.currentTime + start + cycleDuration)
      oscLo.start(ctx.currentTime + start + cycleDuration / 2)
      oscLo.stop(ctx.currentTime + start + cycleDuration)
    }
  } catch (e) { console.warn('Siren sound error:', e.message) }
}

export function useNotifications(role) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)
  const esRef                             = useRef(null)

  const token = () => {
    const auth = localStorage.getItem(`${role}_auth`)
    return auth ? JSON.parse(auth).token : null
  }

  const headers = () => ({ Authorization: `Bearer ${token()}` })

  const fetchAll = useCallback(async () => {
    try {
      const data = await api('/notifications', { headers: headers() })
      setNotifications(Array.isArray(data) ? data : [])
    } catch (_) {}
    setLoading(false)
  }, [role])

  useEffect(() => {
    const t = token()
    if (!t) return

    fetchAll()

    const apiUrl = config.API_URL || 'http://localhost:3000'
    const es = new EventSource(`${apiUrl}/notifications/subscribe?token=${t}`)
    esRef.current = es

    es.onmessage = (e) => {
      try {
        const notif = JSON.parse(e.data)
        setNotifications(prev => [{ ...notif, is_read: false }, ...prev])
        if (role !== 'superadmin') playSOSSound()
      } catch (err) { console.error('SSE parse error:', err) }
    }

    es.onerror = () => {
      es.close()
      setTimeout(() => { if (esRef.current === es) fetchAll() }, 5000)
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
