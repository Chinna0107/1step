import React, { useRef, useState } from 'react'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'

export default function DocUpload({ label, url, onChange, endpoint, role = 'admin' }) {
  const inputRef = useRef()
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setErr('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const token = getTokenByRole(role)
      const r = await api(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      onChange(r.url)
    } catch (e) {
      setErr('Upload failed: ' + e.message)
    }
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>{label}</label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={handleFile} />
        <button
          type="button"
          onClick={() => inputRef.current.click()}
          disabled={uploading}
          style={{
            padding: '6px 12px',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            color: '#0f172a'
          }}
        >
          {uploading ? 'Uploading...' : url ? 'Change File' : 'Upload File'}
        </button>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
            View Current
          </a>
        )}
      </div>
      {err && <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px' }}>{err}</div>}
    </div>
  )
}
