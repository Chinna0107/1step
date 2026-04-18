import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import './superadmin.css'
import './Dashboard.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin')}` })

function useMaster(table) {
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')
  const [msg, setMsg]       = useState('')

  const refetch = useCallback(() => {
    setLoading(true)
    api(`/master/${table}`, { headers: auth() })
      .then(d => { setItems(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [table])

  useEffect(() => { refetch() }, [refetch])

  const add = async (form) => {
    setMsg(''); setError('')
    try {
      await api(`/master/${table}`, { method: 'POST', headers: auth(), body: JSON.stringify(form) })
      setMsg('Added successfully'); refetch(); return true
    } catch (e) { setError(e.message); return false }
  }

  const toggle = async (id) => {
    try { await api(`/master/${table}/${id}/toggle`, { method: 'PATCH', headers: auth() }); refetch() }
    catch (e) { setError(e.message) }
  }

  const remove = async (id) => {
    try { await api(`/master/${table}/${id}`, { method: 'DELETE', headers: auth() }); refetch() }
    catch (e) { setError(e.message) }
  }

  return { items, loading, error, msg, add, toggle, remove, setMsg, setError }
}

function MasterTable({ title, icon, table, fields, addLabel }) {
  const { items, loading, error, msg, add, toggle, remove, setMsg, setError } = useMaster(table)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({})
  const [saving, setSaving]     = useState(false)

  const handleAdd = async e => {
    e.preventDefault()
    setSaving(true)
    const ok = await add(form)
    if (ok) { setForm({}); setShowForm(false) }
    setSaving(false)
  }

  return (
    <div className="sa-card">
      <div className="sa-card-header">
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h2>{title} ({items.length})</h2>
        <button className="sa-btn sa-btn-primary sa-btn-sm" onClick={() => { setShowForm(v => !v); setMsg(''); setError('') }}>
          {showForm ? '✕' : '+ Add'}
        </button>
      </div>

      {(msg || error) && (
        <div style={{ padding: '8px 20px' }}>
          {msg   && <div className="sa-alert sa-alert-success">✅ {msg}</div>}
          {error && <div className="sa-alert sa-alert-error">❌ {error}</div>}
        </div>
      )}

      {showForm && (
        <div className="sa-card-body" style={{ borderBottom: '1px solid #f0f2f8' }}>
          <form onSubmit={handleAdd}>
            <div className="sa-form-grid">
              {fields.map(f => (
                <div key={f.key} className="sa-form-group">
                  <label>{f.label} {f.required && '*'}</label>
                  <input required={f.required} type={f.type || 'text'} placeholder={f.placeholder}
                    value={form[f.key] || ''}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <button type="submit" className="sa-btn sa-btn-primary" disabled={saving}>
              {saving ? 'Saving...' : `✅ ${addLabel}`}
            </button>
          </form>
        </div>
      )}

      <div className="sa-table-wrap">
        {loading ? <div className="sa-loading">Loading...</div> : (
          <table className="sa-table">
            <thead>
              <tr>
                <th>Name</th>
                {fields.filter(f => f.key !== 'name').map(f => <th key={f.key}>{f.label}</th>)}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? items.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong></td>
                  {fields.filter(f => f.key !== 'name').map(f => (
                    <td key={f.key} style={{ fontWeight: 600, color: '#402070' }}>
                      {item[f.key] != null ? `${item[f.key]}%` : '—'}
                    </td>
                  ))}
                  <td>
                    <span className={`sa-status ${item.is_active ? 'active' : 'inactive'}`}>
                      {item.is_active ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className="sa-btn sa-btn-warning sa-btn-sm" onClick={() => toggle(item.id)}>
                      {item.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button className="sa-btn sa-btn-danger sa-btn-sm" onClick={() => remove(item.id)}>Delete</button>
                  </td>
                </tr>
              )) : <tr><td colSpan={fields.length + 2} className="sa-empty">No records found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default function MasterConfig() {
  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-topbar-title">Master Configuration</h1>
            <p className="dash-topbar-sub">Core control engine — platforms, banks, cards, categories & services</p>
          </div>
        </div>

        <div className="dash-main">

          <div className="dash-section-label">🔹 Platform Master</div>
          <MasterTable title="Platforms" icon="🏢" table="platforms"
            fields={[
              { key: 'name', label: 'Platform Name', required: true, placeholder: 'e.g. Bankit' },
              { key: 'commission', label: 'Commission %', type: 'number', placeholder: '1.2' },
            ]} addLabel="Add Platform" />

          <div className="dash-section-label">🔹 Bank Master</div>
          <MasterTable title="Banks" icon="🏦" table="banks"
            fields={[{ key: 'name', label: 'Bank Name', required: true, placeholder: 'e.g. SBI' }]}
            addLabel="Add Bank" />

          <div className="dash-section-label">🔹 Card Master</div>
          <MasterTable title="Cards" icon="💳" table="cards"
            fields={[
              { key: 'name', label: 'Card Type', required: true, placeholder: 'e.g. Visa' },
              { key: 'charge', label: 'Charge %', type: 'number', placeholder: '1.5' },
            ]} addLabel="Add Card" />

          <div className="dash-section-label">🔹 Category Master</div>
          <MasterTable title="Categories" icon="🏷️" table="categories"
            fields={[{ key: 'name', label: 'Category Name', required: true, placeholder: 'e.g. Travel' }]}
            addLabel="Add Category" />

          <div className="dash-section-label">🔹 Service Type Master</div>
          <MasterTable title="Service Types" icon="⚙️" table="service_types"
            fields={[
              { key: 'name', label: 'Service Name', required: true, placeholder: 'e.g. Card Withdrawal' },
              { key: 'commission', label: 'Commission %', type: 'number', placeholder: '1.0' },
            ]} addLabel="Add Service" />

        </div>
      </div>
    </div>
  )
}
