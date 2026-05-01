import React, { useState, useRef, useEffect } from 'react'
import { MdNotifications, MdClose } from 'react-icons/md'
import { useNotifications, unlockAudio } from '../hooks/useNotifications'

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(date).toLocaleDateString('en-IN')
}

export default function NotificationBell({ role }) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(role)
  const [open, setOpen] = useState(false)
  const ref             = useRef(null)

  // Unlock the shared AudioContext on first user interaction
  useEffect(() => {
    const handler = () => { unlockAudio(); document.removeEventListener('click', handler) }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ position: 'relative', background: open ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MdNotifications size={20} />
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: 4, right: 4, background: '#c02040', color: '#fff', fontSize: 9, fontWeight: 900, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 44, right: 0, width: 340, background: '#fff', borderRadius: 14, boxShadow: '0 8px 40px rgba(0,0,0,0.18)', zIndex: 9999, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'linear-gradient(135deg,#1a0a2e,#402070)' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>🔔 Notifications</div>
              {unreadCount > 0 && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{unreadCount} unread</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <MdClose size={16} />
              </button>
            </div>
          </div>

          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No notifications yet</div>
            ) : notifications.map(n => (
              <div key={n.id} onClick={() => !n.is_read && markRead(n.id)}
                style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid #f1f5f9', cursor: n.is_read ? 'default' : 'pointer', background: n.is_read ? '#fff' : '#f5f3ff' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: n.is_read ? '#f1f5f9' : '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  🔔
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ fontWeight: n.is_read ? 600 : 800, fontSize: 13, color: '#1a0a2e' }}>{n.title}</span>
                    {!n.is_read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#c02040', flexShrink: 0, marginTop: 4 }} />}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{timeAgo(n.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
