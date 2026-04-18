import { useState } from 'react'
import { useCustomerProfile } from '../../hooks/useCustomerAuth'
import CustomerSidebar from '../../components/customer/CustomerSidebar'
import { SkeletonCard, SkeletonLine } from '../../components/customer/Skeleton'
import '../../components/customer/CustomerSidebar.css'

export default function CustomerKYC() {
  const { profile, loading } = useCustomerProfile()
  const [lightbox, setLightbox] = useState(null)

  return (
    <div className="cust-page">
      <CustomerSidebar />
      <div className="cust-content">
        <div className="cust-topbar">
          <h1>🪪 KYC & Profile</h1>
          <p>Your identity documents and account details</p>
        </div>

        {loading ? (
          <>
            <SkeletonCard rows={8} />
            <div className="cust-card">
              <div className="cust-card-header" style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <SkeletonLine width="30%" height={14} />
              </div>
              <div className="cust-card-body" style={{ padding: 20, display: 'flex', gap: 16 }}>
                <SkeletonLine width={280} height={160} radius={8} />
                <SkeletonLine width={280} height={160} radius={8} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="cust-card">
              <div className="cust-card-header"><h2>Personal Information</h2></div>
              <div className="cust-card-body">
                <div className="cust-info-row"><span className="cust-info-label">Full Name</span><span className="cust-info-value">{profile?.name}</span></div>
                <div className="cust-info-row"><span className="cust-info-label">Email</span><span className="cust-info-value">{profile?.email || '—'}</span></div>
                <div className="cust-info-row"><span className="cust-info-label">Mobile</span><span className="cust-info-value">{profile?.phone}</span></div>
                <div className="cust-info-row"><span className="cust-info-label">PAN Number</span><span className="cust-info-value">{profile?.pan}</span></div>
                <div className="cust-info-row"><span className="cust-info-label">Aadhar Number</span><span className="cust-info-value">{profile?.aadhar}</span></div>
                <div className="cust-info-row"><span className="cust-info-label">Account Number</span><span className="cust-info-value">{profile?.acc_number}</span></div>
                <div className="cust-info-row"><span className="cust-info-label">Branch</span><span className="cust-info-value">{profile?.branch || '—'}</span></div>
                <div className="cust-info-row"><span className="cust-info-label">KYC Status</span><span className="cust-info-value"><span className="cust-badge cust-badge-success">✅ Approved</span></span></div>
                <div className="cust-info-row"><span className="cust-info-label">Member Since</span><span className="cust-info-value">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN') : '—'}</span></div>
              </div>
            </div>

            <div className="cust-card">
              <div className="cust-card-header"><h2>KYC Documents</h2></div>
              <div className="cust-card-body">
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {[{ key: 'aadhar_img_url', label: '🪪 Aadhar Card' }, { key: 'pan_img_url', label: '🪪 PAN Card' }].map(doc => (
                    <div key={doc.key} className="kyc-doc-box">
                      <div className="kyc-doc-label">{doc.label}</div>
                      {profile?.[doc.key]
                        ? <img src={profile[doc.key]} alt={doc.label} className="kyc-doc-img" onClick={() => setLightbox({ url: profile[doc.key], label: doc.label })} />
                        : <div className="kyc-doc-empty">Not uploaded</div>}
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 14 }}>To update your documents, contact your branch or WhatsApp us.</p>
              </div>
            </div>
          </>
        )}

        {lightbox && (
          <div className="kyc-lightbox" onClick={() => setLightbox(null)}>
            <div className="kyc-lightbox-box" onClick={e => e.stopPropagation()}>
              <div className="kyc-lightbox-header">
                <span>{lightbox.label}</span>
                <button onClick={() => setLightbox(null)}>✕</button>
              </div>
              <img src={lightbox.url} alt={lightbox.label} style={{ width: '100%', maxHeight: '65vh', objectFit: 'contain', background: '#f1f5f9' }} />
            </div>
          </div>
        )}
      </div>

      <style>{`
        .kyc-doc-box { flex: 1; min-width: 200px; }
        .kyc-doc-label { font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.4px; }
        .kyc-doc-img { width: 100%; max-width: 280px; height: 160px; object-fit: cover; border-radius: 8px; border: 1.5px solid rgba(64,32,112,0.2); cursor: pointer; transition: transform 0.2s; }
        .kyc-doc-img:hover { transform: scale(1.02); }
        .kyc-doc-empty { width: 280px; height: 160px; background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 13px; }
        .kyc-lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .kyc-lightbox-box { background: #fff; border-radius: 12px; overflow: hidden; max-width: 600px; width: 100%; }
        .kyc-lightbox-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 18px; background: linear-gradient(135deg, #402070, #c02040); color: #fff; font-size: 13px; font-weight: 700; }
        .kyc-lightbox-header button { background: rgba(255,255,255,0.2); border: none; color: #fff; width: 26px; height: 26px; border-radius: 50%; cursor: pointer; font-size: 13px; }
      `}</style>
    </div>
  )
}
