import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '../../components/superadmin/Sidebar'
import { useMasterTable, useChargesConfig } from '../../hooks/useSuperAdmin'
import { api } from '../../utils/api'
import { getTokenByRole } from '../../utils/tokenUtils'
import './superadmin.css'
import './Dashboard.css'

const auth = () => ({ Authorization: `Bearer ${getTokenByRole('superadmin')}` })

const SERVICES = [
  { label: 'Card Withdrawal',       value: 'Card Withdrawal',       hasCard: true  },
  { label: 'Bill Pay + Withdrawal', value: 'Bill Pay + Withdrawal', hasCard: true  },
  { label: 'Money Transfer (DMT)',  value: 'Money Transfer (DMT)',  hasCard: false },
  { label: 'AEPS',                  value: 'AEPS',                  hasCard: false },
  { label: 'Only Bill Payment',     value: 'Only Bill Payment',     hasCard: false },
]

// ── Master table hook ─────────────────────────────────────────
function useMaster(table) {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [msg, setMsg]         = useState('')

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
      setMsg('Added'); refetch(); return true
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

// ── Reusable master table component ──────────────────────────
function MasterTable({ title, icon, table, placeholder }) {
  const { items, loading, error, msg, add, toggle, remove, setMsg, setError } = useMaster(table)
  const [showForm, setShowForm] = useState(false)
  const [name, setName]         = useState('')
  const [saving, setSaving]     = useState(false)

  const handleAdd = async e => {
    e.preventDefault(); setSaving(true)
    const ok = await add({ name })
    if (ok) { setName(''); setShowForm(false) }
    setSaving(false)
  }

  return (
    <div className="sa-card" style={{ marginBottom: 16 }}>
      <div className="sa-card-header">
        <span style={{ fontSize: 16 }}>{icon}</span>
        <h2 style={{ fontSize: 15 }}>{title} ({items.length})</h2>
        <button className="sa-btn sa-btn-primary sa-btn-sm" onClick={() => { setShowForm(v => !v); setMsg(''); setError('') }}>
          {showForm ? '✕' : '+ Add'}
        </button>
      </div>

      {(msg || error) && (
        <div style={{ padding: '6px 16px' }}>
          {msg   && <div className="sa-alert sa-alert-success">✅ {msg}</div>}
          {error && <div className="sa-alert sa-alert-error">❌ {error}</div>}
        </div>
      )}

      {showForm && (
        <div className="sa-card-body" style={{ borderBottom: '1px solid #f0f2f8', padding: '12px 16px' }}>
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8 }}>
            <input required placeholder={placeholder} value={name} onChange={e => setName(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 14 }} />
            <button type="submit" className="sa-btn sa-btn-primary" disabled={saving}>
              {saving ? '...' : 'Add'}
            </button>
          </form>
        </div>
      )}

      <div className="sa-table-wrap">
        {loading ? <div className="sa-loading">Loading...</div> : (
          <table className="sa-table">
            <thead><tr><th>Name</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {items.length ? items.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong></td>
                  <td><span className={`sa-status ${item.is_active ? 'active' : 'inactive'}`}>{item.is_active ? '✅ Active' : '❌ Inactive'}</span></td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className="sa-btn sa-btn-warning sa-btn-sm" onClick={() => toggle(item.id)}>{item.is_active ? 'Disable' : 'Enable'}</button>
                    <button className="sa-btn sa-btn-danger sa-btn-sm" onClick={() => remove(item.id)}>Delete</button>
                  </td>
                </tr>
              )) : <tr><td colSpan={3} className="sa-empty">No records</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── Charges section per service ───────────────────────────────
function ServiceCharges({ service, branches, platforms, cards }) {
  const [charges, setCharges]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [editingRow, setEditingRow]   = useState(null)  // card name or 'flat'
  const [rowDraft, setRowDraft]       = useState({})
  const [saving, setSaving]           = useState(false)
  const [msg, setMsg]                 = useState('')
  const [error, setError]             = useState('')

  const fetchCharges = useCallback(() => {
    setLoading(true)
    api(`/master/charges?service_type=${encodeURIComponent(service.value)}`, { headers: auth() })
      .then(d => { setCharges(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [service.value])

  useEffect(() => { fetchCharges() }, [fetchCharges])

  const getCharge = (branch, cardType) =>
    charges.find(c =>
      c.branch === branch &&
      c.platform === selectedPlatform &&
      (service.hasCard ? c.card_type === cardType : true)
    )

  const getPlatformRate = (cardType) => {
    const row = charges.find(c =>
      c.platform === selectedPlatform &&
      (service.hasCard ? c.card_type === cardType : true)
    )
    return row?.platform_rate ?? ''
  }

  const getCustomerRate = (branch, cardType) =>
    getCharge(branch, cardType)?.customer_rate ?? ''

  const startEdit = (rowKey) => {
    const draft = { platform_rate: getPlatformRate(rowKey === 'flat' ? null : rowKey) }
    branches.forEach(b => { draft[b.name] = getCustomerRate(b.name, rowKey === 'flat' ? null : rowKey) })
    setRowDraft(draft)
    setEditingRow(rowKey)
    setMsg(''); setError('')
  }

  const saveRow = async (rowKey) => {
    setSaving(true); setMsg(''); setError('')
    const cardType = rowKey === 'flat' ? null : rowKey
    try {
      const ops = []

      // platform_rate — update all branches at once
      ops.push(api('/master/charges/platform-rate', {
        method: 'PATCH', headers: auth(),
        body: JSON.stringify({
          service_type: service.value,
          platform: selectedPlatform,
          card_type: cardType,
          platform_rate: parseFloat(rowDraft.platform_rate) || 0,
        }),
      }))

      // customer_rate — per branch via upsert
      for (const b of branches) {
        ops.push(api('/master/charges', {
          method: 'POST', headers: auth(),
          body: JSON.stringify({
            service_type:  service.value,
            branch:        b.name,
            platform:      selectedPlatform,
            card_type:     cardType,
            customer_rate: parseFloat(rowDraft[b.name]) || 0,
            platform_rate: parseFloat(rowDraft.platform_rate) || 0,
          }),
        }))
      }

      await Promise.all(ops)
      setMsg('Saved!')
      setEditingRow(null); setRowDraft({})
      fetchCharges()
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  const rows = service.hasCard ? cards : [{ id: 'flat', name: 'flat' }]
  const platformsWithRates = [...new Set(charges.map(c => c.platform))]

  return (
    <div style={{ marginBottom: 8 }}>
      {(msg || error) && (
        <div style={{ marginBottom: 8 }}>
          {msg   && <div className="sa-alert sa-alert-success">✅ {msg}</div>}
          {error && <div className="sa-alert sa-alert-error">❌ {error}</div>}
        </div>
      )}

      {/* Platform selector */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <select value={selectedPlatform} onChange={e => { setSelectedPlatform(e.target.value); setEditingRow(null) }}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 14, minWidth: 180 }}>
          <option value="">Select Platform</option>
          {platforms.map(p => (
            <option key={p.id} value={p.name}>
              {p.name}{platformsWithRates.includes(p.name) ? '' : ' (new)'}
            </option>
          ))}
        </select>
        {selectedPlatform && (
          <span style={{ fontSize: 12, color: '#888' }}>
            Platform % is shared · Customer % is per branch
          </span>
        )}
      </div>

      {/* Charges matrix */}
      {selectedPlatform && (
        loading ? <div className="sa-loading">Loading...</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e9ecef', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={th}>{service.hasCard ? 'Card Type' : 'Rate'}</th>
                  <th style={{ ...th, color: '#007bff', textAlign: 'center', borderLeft: '2px solid #dee2e6' }}>
                    Platform %<br /><span style={{ fontSize: 11, fontWeight: 400, color: '#888' }}>all branches</span>
                  </th>
                  {branches.map(b => (
                    <th key={b.id} style={{ ...th, color: '#28a745', textAlign: 'center', borderLeft: '2px solid #dee2e6' }}>
                      {b.name}<br /><span style={{ fontSize: 11, fontWeight: 400, color: '#888' }}>Customer %</span>
                    </th>
                  ))}
                  <th style={{ ...th, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const rowKey    = service.hasCard ? row.name : 'flat'
                  const isEditing = editingRow === rowKey
                  const platRate  = getPlatformRate(service.hasCard ? row.name : null)
                  return (
                    <tr key={row.id} style={{ borderBottom: '1px solid #f0f2f8', background: isEditing ? '#fffbf0' : 'white' }}>
                      <td style={{ ...td, fontWeight: 700, color: '#402070' }}>
                        {service.hasCard ? row.name : 'Flat Rate'}
                      </td>

                      {/* Platform rate */}
                      <td style={{ ...td, borderLeft: '2px solid #f0f2f8', textAlign: 'center' }}>
                        {isEditing ? (
                          <input type="number" step="0.01" min="0" autoFocus
                            value={rowDraft.platform_rate ?? ''}
                            onChange={e => setRowDraft(d => ({ ...d, platform_rate: e.target.value }))}
                            style={inp('#007bff')} />
                        ) : (
                          <span style={badge('#007bff')}>{platRate !== '' ? `${platRate}%` : <span style={{ color: '#ccc' }}>—</span>}</span>
                        )}
                      </td>

                      {/* Customer rate per branch */}
                      {branches.map(b => {
                        const custRate = getCustomerRate(b.name, service.hasCard ? row.name : null)
                        return (
                          <td key={b.id} style={{ ...td, borderLeft: '2px solid #f0f2f8', textAlign: 'center' }}>
                            {isEditing ? (
                              <input type="number" step="0.01" min="0"
                                value={rowDraft[b.name] ?? ''}
                                onChange={e => setRowDraft(d => ({ ...d, [b.name]: e.target.value }))}
                                style={inp('#28a745')} />
                            ) : (
                              <span style={badge('#28a745')}>{custRate !== '' ? `${custRate}%` : <span style={{ color: '#ccc' }}>—</span>}</span>
                            )}
                          </td>
                        )
                      })}

                      {/* Action */}
                      <td style={{ ...td, textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button className="sa-btn sa-btn-primary sa-btn-sm" onClick={() => saveRow(rowKey)} disabled={saving}>
                              {saving ? '...' : '💾 Save'}
                            </button>
                            <button className="sa-btn sa-btn-sm" onClick={() => { setEditingRow(null); setRowDraft({}) }}
                              style={{ background: '#f0f2f8', color: '#666' }}>Cancel</button>
                          </div>
                        ) : (
                          <button className="sa-btn sa-btn-warning sa-btn-sm"
                            onClick={() => startEdit(rowKey)} disabled={!!editingRow}>
                            ✏️ Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function Configuration() {
  const [activeTab, setActiveTab]         = useState('masters')
  const [activeService, setActiveService] = useState(SERVICES[0].value)
  const { master, branches: configBranches } = useChargesConfig()

  const masterData = {
    branches:  (configBranches || []).filter(b => b.is_active),
    platforms: master?.platforms || [],
    cards:     master?.cards     || [],
  }

  const currentService = SERVICES.find(s => s.value === activeService)

  return (
    <div className="sa-page">
      <Sidebar />
      <div className="sa-content">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-topbar-title">Configuration</h1>
            <p className="dash-topbar-sub">Manage master data and service charges in one place</p>
          </div>
        </div>

        <div className="dash-main">
          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[{ key: 'masters', label: '⚙️ Master Data' }, { key: 'charges', label: '💰 Charges' }].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`sa-btn ${activeTab === t.key ? 'sa-btn-primary' : ''}`}
                style={{ padding: '10px 24px', fontSize: 14, background: activeTab === t.key ? undefined : '#f0f2f8', color: activeTab === t.key ? undefined : '#555' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Masters Tab ── */}
          {activeTab === 'masters' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
              <MasterTable title="Platforms"     icon="🏢" table="platforms"     placeholder="e.g. Bankit" />
              <MasterTable title="Banks"         icon="🏦" table="banks"         placeholder="e.g. SBI" />
              <MasterTable title="Cards"         icon="💳" table="cards"         placeholder="e.g. Visa" />
              <MasterTable title="Categories"    icon="🏷️" table="categories"    placeholder="e.g. Travel" />
              <MasterTable title="Service Types" icon="⚙️" table="service_types" placeholder="e.g. Card Withdrawal" />
              <MasterTable title="Payment Modes" icon="💰" table="payment_modes" placeholder="e.g. UPI" />
              <MasterTable title="Receive Modes" icon="📥" table="receive_modes" placeholder="e.g. Bank Transfer" />
            </div>
          )}

          {/* ── Charges Tab ── */}
          {activeTab === 'charges' && (
            <div className="sa-card">
              <div className="sa-card-header">
                <span style={{ fontSize: 18 }}>💰</span>
                <h2>Charges by Service</h2>
              </div>

              {/* Service tabs */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f2f8', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {SERVICES.map(s => (
                  <button key={s.value} onClick={() => setActiveService(s.value)}
                    style={{
                      padding: '6px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: 'none',
                      background: activeService === s.value ? '#402070' : '#f0f2f8',
                      color: activeService === s.value ? '#fff' : '#555',
                      fontWeight: activeService === s.value ? 700 : 400,
                    }}>
                    {s.label}
                  </button>
                ))}
              </div>

              <div style={{ padding: 20 }}>
                {currentService && (
                  <ServiceCharges
                    key={activeService}
                    service={currentService}
                    branches={masterData.branches}
                    platforms={masterData.platforms}
                    cards={masterData.cards}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const th = { padding: '10px 14px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }
const td = { padding: '10px 14px' }
const badge = (color) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 12, background: `${color}11`, color, fontWeight: 700, fontSize: 13 })
const inp = (color) => ({ width: 70, padding: '5px 8px', textAlign: 'center', border: `1.5px solid ${color}`, borderRadius: 6, fontSize: 13, color, fontWeight: 600, outline: 'none', background: `${color}08` })
