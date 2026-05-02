import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdNotifications } from 'react-icons/md'
import { useNotifications, unlockAudio } from '../hooks/useNotifications'

export default function NotificationBell({ role }) {
  const { unreadCount } = useNotifications(role)
  const navigate        = useNavigate()

  // Unlock AudioContext on ANY user interaction — click, keydown, touchstart
  useEffect(() => {
    const unlock = () => unlockAudio()
    document.addEventListener('click',      unlock, { once: false })
    document.addEventListener('keydown',    unlock, { once: false })
    document.addEventListener('touchstart', unlock, { once: false })
    return () => {
      document.removeEventListener('click',      unlock)
      document.removeEventListener('keydown',    unlock)
      document.removeEventListener('touchstart', unlock)
    }
  }, [])

  const path = role === 'admin' ? '/admin/notifications' : '/employee/notifications'

  return (
    <button
      onClick={() => { unlockAudio(); navigate(path) }}
      style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.1)',
        border: 'none',
        color: '#fff',
        width: 36,
        height: 36,
        borderRadius: 8,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
    >
      <MdNotifications size={20} />
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute',
          top: 4, right: 4,
          background: '#c02040',
          color: '#fff',
          fontSize: 9,
          fontWeight: 900,
          width: 16,
          height: 16,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          pointerEvents: 'none',
        }}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}
