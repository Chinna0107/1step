import { useState, useEffect } from 'react'
import { getCustomerUser, getCustomerToken } from '../../hooks/useCustomerAuth'
import { api } from '../../utils/api'
import CustomerSidebar from '../../components/customer/CustomerSidebar'
import { SkeletonTable } from '../../components/customer/Skeleton'
import PDFViewer from '../../components/common/PDFViewer'
import { MdClose, MdFileDownload, MdOutlineDescription } from 'react-icons/md'
import '../../components/customer/CustomerSidebar.css'

const fmt = n => Number(parseFloat(n) || 0).toLocaleString('en-IN')

export default function CustomerCibilRepair() {
  const [repairs, setRepairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewDoc, setViewDoc] = useState(null) // { title, url, type }

  const auth = { Authorization: `Bearer ${getCustomerToken()}` }

  useEffect(() => {
    fetchRepairs()
  }, [])

  const fetchRepairs = async () => {
    try {
      const data = await api('/cibil-repairs/mine', { headers: auth })
      setRepairs(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openDocument = (url, title) => {
    if (!url) return
    const isImage = url.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/) != null
    setViewDoc({ url, title, isImage })
  }

  const handleImageDownload = async (e, url, title) => {
    e.preventDefault();
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      
      let ext = '.png';
      try {
        const urlParts = url.split('?')[0].split('.');
        if (urlParts.length > 1) {
          ext = '.' + urlParts.pop().toLowerCase();
        }
      } catch (e) {}
      
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed, opening in new tab instead', err);
      window.open(url, '_blank');
    }
  }

  return (
    <div className="cust-page">
      <CustomerSidebar />
      <div className="cust-content animate-fade-in">
        <div className="cust-topbar">
          <h1>CIBIL Repairs</h1>
          <p>Track your credit repair progress and view uploaded documents</p>
        </div>

        <div style={{ marginTop: 24 }}>
          {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}

          {loading ? <SkeletonTable /> : repairs.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📈</div>
              <h3 style={{ color: '#0f172a', marginBottom: 8 }}>No CIBIL Repairs Found</h3>
              <p style={{ color: '#64748b' }}>You don't have any active CIBIL repair services at the moment.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '20px' }}>
              {repairs.map(repair => (
                <div key={repair.id} style={{ 
                  background: '#fff', 
                  borderRadius: 16, 
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  border: '1px solid #f1f5f9',
                  transition: 'transform 0.2s',
                }} className="hover-lift">
                  
                  <div style={{ 
                    padding: '20px', 
                    background: 'linear-gradient(135deg, #081427 0%, #1a365d 100%)',
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                        Service ID: #{repair.id}
                      </div>
                      <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{repair.cibil_service}</h3>
                    </div>
                    <span style={{ 
                      background: repair.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                      border: repair.status === 'Active' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255,255,255,0.2)',
                      color: repair.status === 'Active' ? '#4ade80' : '#fff',
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {repair.status}
                    </span>
                  </div>

                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: 20 }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Total Fee</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>₹{fmt(repair.total_amount)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Paid</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>₹{fmt(repair.amount_collected)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Balance Due</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#ef4444' }}>₹{fmt(repair.balance_due)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Tenure</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{repair.tenure_days}</div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                      <h4 style={{ fontSize: 13, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MdOutlineDescription size={16} color="#3b82f6" /> Uploaded Documents
                      </h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <DocButtonList label="Initial Report" urls={repair.initial_report_url} onOpen={openDocument} />
                        <DocButtonList label="NOC Document" urls={repair.noc_url} onOpen={openDocument} />
                        <DocButtonList label="Middle Report" urls={repair.middle_report_url} onOpen={openDocument} />
                        <DocButtonList label="Final Report" urls={repair.final_report_url} onOpen={openDocument} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewDoc && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            width: '100%', maxWidth: '1000px',
            height: '90vh',
            borderRadius: 16,
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#f8fafc'
            }}>
              <h3 style={{ margin: 0, fontSize: 18, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <MdOutlineDescription color="#3b82f6" /> {viewDoc.title}
              </h3>
              <button 
                onClick={() => setViewDoc(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 8, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <MdClose size={24} color="#64748b" />
              </button>
            </div>
            
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative', backgroundColor: viewDoc.isImage ? '#f1f5f9' : '#fff' }}>
              {viewDoc.isImage ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                  <img 
                    src={viewDoc.url} 
                    alt={viewDoc.title} 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} 
                  />
                  <button 
                    onClick={(e) => handleImageDownload(e, viewDoc.url, viewDoc.title)}
                    style={{
                      position: 'absolute', bottom: 24, right: 24,
                      background: '#0f172a', color: '#fff', padding: '10px 20px', borderRadius: 8,
                      border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: 14, fontWeight: 600
                    }}
                  >
                    <MdFileDownload size={18} /> Download Image
                  </button>
                </div>
              ) : (
                <PDFViewer title={viewDoc.title} fileUrl={viewDoc.url} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const DocButton = ({ label, url, onClick }) => {
  if (!url) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
        <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 600, textTransform: 'uppercase' }}>Not Uploaded</span>
      </div>
    )
  }

  return (
    <button 
      onClick={onClick}
      style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '10px 14px', background: '#f1f5f9', borderRadius: 8, 
        border: '1px solid #e2e8f0', cursor: 'pointer', width: '100%', textAlign: 'left',
        transition: 'all 0.2s'
      }}
      onMouseOver={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.borderColor = '#cbd5e1' }}
      onMouseOut={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#e2e8f0' }}
    >
      <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
        View
      </span>
    </button>
  )
}

const DocButtonList = ({ label, urls, onOpen }) => {
  if (!urls || (Array.isArray(urls) && urls.length === 0)) {
    return <DocButton label={label} url={null} />;
  }
  const urlList = Array.isArray(urls) ? urls : [urls];
  return (
    <>
      {urlList.map((url, idx) => {
        const itemLabel = urlList.length > 1 ? `${label} ${idx + 1}` : label;
        return <DocButton key={idx} label={itemLabel} url={url} onClick={() => onOpen(url, itemLabel)} />
      })}
    </>
  )
}
