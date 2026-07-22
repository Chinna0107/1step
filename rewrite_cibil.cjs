const fs = require('fs');
let code = fs.readFileSync('src/pages/employee/CibilRepairTransactions.jsx', 'utf8');

// 1. Change layout from grid to stacked
code = code.replace(
  /<div style=\{\{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24, alignItems: 'start' \}\}>/g,
  `<div style={{ maxWidth: 800, margin: '0 auto' }}>`
);

// 2. Remove the "RIGHT: Active Repairs History" div and replace it with a full-width table below the form
// The form div ends with `</form>\n          </div>\n`
const historyStart = `\n          {/* RIGHT: Active Repairs History */}`;
const historyEnd = `            </div>\n          </div>\n\n        </div>`;

const historyContent = `
        </div>

        {/* BOTTOM: Full width history table */}
        <div style={{ marginTop: 32 }}>
          <div className="dash-card">
            <div className="dash-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>{form.customer_id ? 'Customer Repairs' : 'All Branch Repairs'} ({history.length})</h2>
              <div style={{ display: 'flex', gap: 16 }}>
                <div onClick={() => setCustMode('active')} style={{ paddingBottom: 8, cursor: 'pointer', borderBottom: custMode !== 'closed' ? '2px solid #0d1f3d' : '2px solid transparent', color: custMode !== 'closed' ? '#0d1f3d' : '#9ca3af', fontWeight: custMode !== 'closed' ? 700 : 500 }}>
                  Active ({history.filter(h => h.is_active).length})
                </div>
                <div onClick={() => setCustMode('closed')} style={{ paddingBottom: 8, cursor: 'pointer', borderBottom: custMode === 'closed' ? '2px solid #0d1f3d' : '2px solid transparent', color: custMode === 'closed' ? '#0d1f3d' : '#9ca3af', fontWeight: custMode === 'closed' ? 700 : 500 }}>
                  Closed ({history.filter(h => !h.is_active).length})
                </div>
              </div>
            </div>
            
            <div className="dash-card-body" style={{ padding: 0, overflowX: 'auto' }}>
              {history.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No repairs found.</div>
              ) : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Service</th>
                      <th>Card Details</th>
                      <th>Tenure</th>
                      <th>Total Fee</th>
                      <th>Paid</th>
                      <th>Due</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.filter(h => custMode === 'closed' ? !h.is_active : h.is_active).map(h => {
                      const remain = getRemainingDays(h.created_at, h.tenure_days);
                      const isOverdue = remain === 0;
                      return (
                        <tr key={h.id} onClick={() => setViewRepair(h)} style={{ cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f0f2f8'}
                            onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <td style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                            <div>{new Date(h.created_at).toLocaleDateString('en-IN')}</div>
                            <div style={{ color: '#9ca3af' }}>{new Date(h.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td>
                            <strong>{h.customer_name || form.cust_name || '—'}</strong>
                            <div style={{ fontSize: 11, color: '#64748b' }}>{h.customer_phone || form.cust_mobile || '—'}</div>
                          </td>
                          <td><strong>{h.cibil_service}</strong></td>
                          <td style={{ fontSize: 12 }}>**** {h.card_last4 || 'N/A'}</td>
                          <td style={{ fontSize: 12 }}>{h.tenure_days} Days</td>
                          <td style={{ fontWeight: 700, color: '#0d1f3d' }}>₹{fmt(h.total_amount)}</td>
                          <td style={{ fontWeight: 700, color: '#059669' }}>₹{fmt(h.amount_collected)}</td>
                          <td style={{ fontWeight: 700, color: '#dc2626' }}>₹{fmt(h.total_amount - h.amount_collected)}</td>
                          <td>
                            {h.is_active ? (
                              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: isOverdue ? '#fee2e2' : '#e0e7ff', color: isOverdue ? '#dc2626' : '#4338ca' }}>
                                {isOverdue ? 'Overdue' : \`\${remain} Days Left\`}
                              </span>
                            ) : (
                              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: '#f3f4f6', color: '#6b7280' }}>Closed</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* View / Update Modal */}
        {viewRepair && (
          <div onClick={() => setViewRepair(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:800, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.2)' }}>
              
              <div style={{ background:'linear-gradient(135deg,#081427,#0d1f3d,#1a365d)', padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>Repair Details</div>
                  <div style={{ color:'#fff', fontWeight:900, fontSize:18, marginTop:2 }}>#{viewRepair.id} · {viewRepair.cibil_service}</div>
                </div>
                <button onClick={() => setViewRepair(null)} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', width:32, height:32, borderRadius:'50%', cursor:'pointer', fontSize:16 }}>✕</button>
              </div>

              <div style={{ overflowY:'auto', padding:24, flex: 1 }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  
                  {/* Left Column: Details */}
                  <div>
                    <h3 style={{ marginBottom: 12, color: '#0d1f3d' }}>Repair Information</h3>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      {[
                        { label:'Customer',       value: viewRepair.customer_name || form.cust_name || '—' },
                        { label:'Service',        value: viewRepair.cibil_service },
                        { label:'Card Last 4',    value: viewRepair.card_last4 || '—' },
                        { label:'Tenure',         value: viewRepair.tenure_days + ' Days' },
                        { label:'Total Fee',      value: \`₹\${fmt(viewRepair.total_amount)}\`, color:'#0d1f3d' },
                        { label:'Paid',           value: \`₹\${fmt(viewRepair.amount_collected)}\`, color:'#059669' },
                        { label:'Balance Due',    value: \`₹\${fmt(viewRepair.total_amount - viewRepair.amount_collected)}\`, color:'#dc2626' },
                        { label:'Status',         value: viewRepair.is_active ? 'Active' : 'Closed' }
                      ].map((f, i) => (
                        <div key={i} style={{ background:'#f8fafc', borderRadius:10, padding:'10px 14px' }}>
                          <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>{f.label}</div>
                          <div style={{ fontSize:14, fontWeight:700, color: f.color || '#081427', wordBreak:'break-all' }}>{f.value}</div>
                        </div>
                      ))}
                    </div>

                    <h3 style={{ marginTop: 24, marginBottom: 12, color: '#0d1f3d' }}>Make a Payment</h3>
                    <div style={{ background:'#f1f5f9', padding:16, borderRadius:12, border:'1px solid #e2e8f0' }}>
                      {parseFloat(viewRepair.total_amount) - parseFloat(viewRepair.amount_collected) <= 0 ? (
                        <div style={{ color: '#059669', fontWeight: 700, textAlign: 'center' }}>✅ Fully Paid</div>
                      ) : (
                        <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div className="dash-form-group">
                            <label>Amount (₹)</label>
                            <input type="number" required placeholder="Amount to pay" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} />
                          </div>
                          <div className="dash-form-group">
                            <label>Receive Mode</label>
                            <select required value={payForm.received_mode} onChange={e => setPayForm({...payForm, received_mode: e.target.value})}>
                              <option value="">Select Mode</option>
                              {receiveModes}
                            </select>
                          </div>
                          <button type="submit" disabled={uploading} className="dash-btn dash-btn-primary" style={{ width: '100%', padding: '10px' }}>
                            {uploading ? 'Processing...' : 'Submit Payment'}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Documents */}
                  <div>
                    <h3 style={{ marginBottom: 12, color: '#0d1f3d' }}>Documents</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      
                      {[
                        { key: 'initial_report', label: 'Initial Report', url: viewRepair.initial_report_url, readonly: true },
                        { key: 'noc', label: 'NOC Document', url: viewRepair.noc_url },
                        { key: 'middle_report', label: 'Middle Report', url: viewRepair.middle_report_url },
                        { key: 'final_report', label: 'Final Report', url: viewRepair.final_report_url }
                      ].map(doc => (
                        <div key={doc.key} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{doc.label}</div>
                            {doc.url ? (
                              <a href={doc.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>View File</a>
                            ) : (
                              <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Not uploaded</span>
                            )}
                          </div>
                          {!doc.readonly && (
                            <input type="file" accept="image/*,.pdf" onChange={e => setViewFiles({...viewFiles, [doc.key]: e.target.files[0]})} style={{ fontSize: 12, marginTop: 4, width: '100%' }} />
                          )}
                        </div>
                      ))}

                    </div>
                    
                    <button onClick={handleUpdateFiles} disabled={uploading || (!viewFiles.noc && !viewFiles.middle_report && !viewFiles.final_report)} 
                      className="dash-btn dash-btn-primary" style={{ width: '100%', marginTop: 16, padding: '10px' }}>
                      {uploading ? 'Uploading...' : 'Save Documents'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
`;

const startIndex = code.indexOf(historyStart);
const endIndex = code.indexOf(historyEnd) + historyEnd.length;

if (startIndex > -1 && endIndex > -1) {
  code = code.substring(0, startIndex) + historyContent + code.substring(endIndex);
}

fs.writeFileSync('src/pages/employee/CibilRepairTransactions.jsx', code);
console.log('Done');
