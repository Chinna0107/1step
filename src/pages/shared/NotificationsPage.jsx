import React, { useState } from 'react'
import { useNotifications } from '../../hooks/useNotifications'
import './NotificationsPage.css'

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60)     return `${diff}s ago`
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const TARGET_COLOR = { all: '#402070', admin: '#059669', employee: '#d97706' }
const TARGET_LABEL = { all: 'All Staff', admin: 'Admins', employee: 'Employees' }

export default function NotificationsPage({ role, Sidebar, layout = 'sidebar' }) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(role)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter]     = useState('all')

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read
    if (filter === 'read')   return n.is_read
    return true
  })

  const handleOpen = (n) => {
    setSelected(n)
    if (!n.is_read) markRead(n.id)
  }

  const inner = (
    <div className="np-inner">
      {/* Topbar */}
      <div className="np-topbar">
        <div>
          <h1 className="np-title">🔔 Notifications</h1>
          <p className="np-sub">{notifications.length} total · {unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button className="np-mark-all" onClick={markAllRead}>✓ Mark all read</button>
        )}
      </div>

      <div className="np-body">
        {/* Left list */}
        <div className="np-list-col">
          <div className="np-filters">
            {[['all','All'], ['unread','Unread'], ['read','Read']].map(([val, label]) => (
              <button key={val} className={`np-filter-btn ${filter === val ? 'active' : ''}`}
                onClick={() => setFilter(val)}>
                {label}
                {val === 'unread' && unreadCount > 0 && (
                  <span className="np-filter-badge">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>

          <div className="np-list">
            {filtered.length === 0 ? (
              <div className="np-empty">
                <div className="np-empty-icon">🔔</div>
                <div>No {filter !== 'all' ? filter : ''} notifications</div>
              </div>
            ) : filtered.map(n => (
              <div key={n.id}
                className={`np-item ${!n.is_read ? 'unread' : ''} ${selected?.id === n.id ? 'active' : ''}`}
                onClick={() => handleOpen(n)}>
                <div className="np-item-avatar">
                  {n.image_url
                    ? <img src={n.image_url} alt="" onError={e => { e.currentTarget.style.display = 'none' }} />
                    : <span>🔔</span>}
                  {!n.is_read && <div className="np-item-dot" />}
                </div>
                <div className="np-item-body">
                  <div className="np-item-title">{n.title}</div>
                  <div className="np-item-msg">{n.message}</div>
                  <div className="np-item-meta">
                    <span className="np-item-time">{timeAgo(n.created_at)}</span>
                    {n.target && (
                      <span className="np-item-target"
                        style={{ background: TARGET_COLOR[n.target] + '18', color: TARGET_COLOR[n.target] }}>
                        {TARGET_LABEL[n.target] || n.target}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right detail */}
        <div className="np-detail-col">
          {selected ? (
            <div className="np-detail">
              {selected.image_url && (
                <div className="np-detail-img-wrap">
                  <img src={selected.image_url} alt={selected.title}
                    onError={e => { e.currentTarget.parentElement.style.display = 'none' }} />
                </div>
              )}
              <div className="np-detail-body">
                {selected.target && (
                  <span className="np-detail-target"
                    style={{ background: TARGET_COLOR[selected.target] + '18', color: TARGET_COLOR[selected.target] }}>
                    {TARGET_LABEL[selected.target] || selected.target}
                  </span>
                )}
                <h2 className="np-detail-title">{selected.title}</h2>
                <div className="np-detail-meta">
                  <span>🕐 {new Date(selected.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  {selected.sent_by && <span>👤 {selected.sent_by}</span>}
                </div>
                <div className="np-detail-divider" />
                <p className="np-detail-message">{selected.message}</p>
              </div>
            </div>
          ) : (
            <div className="np-detail-empty">
              <div className="np-detail-empty-icon">🔔</div>
              <div className="np-detail-empty-text">Select a notification to view details</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Employee uses top navbar — wrap in emp-page structure
  if (layout === 'top') {
    return (
      <div className="emp-page">
        <Sidebar />
        <div className="emp-page-content" style={{ padding: 0, maxWidth: '100%' }}>
          {inner}
        </div>
      </div>
    )
  }

  // Admin uses sidebar — wrap in dash-page structure
  return (
    <div className="dash-page">
      <Sidebar />
      <div className="dash-content" style={{ padding: 0, overflow: 'hidden' }}>
        {inner}
      </div>
    </div>
  )
}
