import { useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  FaBolt, FaCreditCard, FaExchangeAlt, FaFingerprint,
  FaMoneyBillWave, FaBuilding, FaShieldAlt, FaUniversity,
  FaChartBar, FaIdCard, FaLock, FaClock, FaGem,
  FaBullseye, FaStar, FaCheckCircle, FaArrowRight,
  FaClipboardList, FaSearch
} from 'react-icons/fa'
import './ProductDetails.css'

gsap.registerPlugin(ScrollTrigger)

const BENEFIT_ICONS = [FaBolt, FaLock, FaClock, FaGem, FaChartBar, FaBullseye, FaStar, FaShieldAlt]

const products = [
  {
    slug: 'spot-cash',
    Icon: FaBolt,
    title: 'Spot Cash on Credit Card',
    tagline: 'Convert your credit limit into instant cash',
    desc: 'Unlock the power of your credit card. Get instant cash transferred directly to your bank account within minutes using your existing credit limit.',
    features: ['Instant Bank Transfer', 'Cash in Minutes', 'All Cards Accepted', 'POS Machine Available'],
    categories: ['Travel', 'Grocery', 'Furniture', 'Insurance'],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/copy_8_khzlf7.png',
    gradient: 'linear-gradient(135deg,#060d1a,#1a365d 60%,#2b4a8a)',
    accent: '#2b77e6',
    detailedDesc: 'Our Spot Cash on Credit Card service revolutionizes how you access your credit limit. Instead of traditional cash advances with high fees, we provide instant cash transfers directly to your bank account. Perfect for emergency funds, business expenses, or any situation where you need immediate access to cash.',
    benefits: ['No hidden fees or charges', 'Direct bank transfer within 2 minutes', 'Accepted by all major credit card providers', 'Available 24/7 through our POS network', 'Secure SSL encryption for all transactions', 'No impact on your credit score'],
    howItWorks: ['Apply online or visit our nearest center', 'Present your valid credit card', 'Choose the amount you need (up to your available limit)', 'Complete biometric verification', 'Receive instant transfer to your bank account'],
    requirements: ['Valid credit card with available limit', 'Government-issued ID proof', 'Active bank account for transfer', 'Minimum age of 21 years'],
  },
  {
    slug: 'bill-payment',
    Icon: FaCreditCard,
    title: 'Credit Card Bill Payment',
    tagline: "Don't miss your due date!",
    desc: 'Pay any credit card bill instantly — any amount, any bank, zero hassle. Avoid late fees and protect your CIBIL score with on-time payments.',
    features: ['Instant Bill Clearance', 'Any Amount – No Limits', 'Avoid Late Fees & Interest', 'Cashback / Reward Points'],
    badge: '100% Secure | Trusted | Transparent',
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/copy_8_khzlf7.png',
    gradient: 'linear-gradient(135deg,#060d1a,#065f46 60%,#0d7a58)',
    accent: '#10b981',
    detailedDesc: 'Never miss a credit card payment deadline again. Our instant bill payment service ensures your credit card bills are paid on time, every time. We support payments to all major banks and credit card providers across India, with instant confirmation and receipt generation.',
    benefits: ['Pay any amount instantly', 'Support for all banks and card issuers', 'Instant payment confirmation', 'Avoid late payment fees and charges', 'Protect your CIBIL credit score', 'Digital receipt for all transactions'],
    howItWorks: ['Select the bill payment option', 'Enter your credit card details', 'Choose payment amount and method', 'Complete secure payment', 'Receive instant confirmation and receipt'],
    requirements: ['Credit card statement or bill details', 'Valid payment method (UPI, Net Banking, Card)', 'Active internet connection', 'Registered mobile number'],
  },
  {
    slug: 'dmt',
    Icon: FaExchangeAlt,
    title: 'Instant Money Transfer (DMT)',
    tagline: 'Send money to any bank in seconds',
    desc: 'Transfer money 24×7 to any bank account across India using IMPS. Fast, reliable, and available round the clock with the lowest charges.',
    features: ['24×7 Service', 'Instant IMPS Transfer', 'All Banks Supported', 'Low Charges'],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986807/Cash_Deposit_iqi1gr.png',
    gradient: 'linear-gradient(135deg,#060d1a,#3b1a7a 60%,#5b21b6)',
    accent: '#8b5cf6',
    detailedDesc: 'Send money instantly to any bank account in India with our Domestic Money Transfer service. Using the latest IMPS technology, we ensure your money reaches the recipient within seconds, 24 hours a day, 7 days a week.',
    benefits: ['Instant transfers within seconds', 'Available 24/7 including holidays', 'Lowest transaction charges in the market', 'Support for all banks in India', 'Secure and encrypted transactions', 'Real-time tracking and confirmation'],
    howItWorks: ['Register sender and beneficiary details', 'Enter transfer amount and purpose', 'Verify beneficiary account details', 'Complete secure payment', 'Receive instant transfer confirmation'],
    requirements: ['Valid sender KYC documents', 'Beneficiary bank account details', 'Active mobile number for OTP', 'Valid payment method'],
  },
  {
    slug: 'aadhaar-withdrawal',
    Icon: FaFingerprint,
    title: 'Aadhaar Cash Withdrawal',
    tagline: 'Withdraw cash with just your Aadhaar',
    desc: 'No ATM card? No problem. Withdraw cash from your bank account using your Aadhaar number and biometric fingerprint — available at our nearest point.',
    features: ['No ATM Card Needed', 'Biometric Authentication', 'Instant Disbursement', 'Available Nearby'],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_22_dxp4lv.png',
    gradient: 'linear-gradient(135deg,#060d1a,#7a3200 60%,#92400e)',
    accent: '#f59e0b',
    detailedDesc: 'Access your bank account without an ATM card using just your Aadhaar number and biometric authentication. This service is perfect for those who have lost their cards or prefer not to carry them.',
    benefits: ['No ATM card required', 'Biometric fingerprint authentication', 'Instant cash disbursement', 'Available at all our centers', 'Secure Aadhaar-based verification', 'No additional charges for card-less withdrawal'],
    howItWorks: ['Visit nearest MoneySpot center', 'Provide Aadhaar number', 'Biometric fingerprint verification', 'Enter withdrawal amount', 'Receive cash instantly'],
    requirements: ['Valid Aadhaar card', 'Biometric fingerprint registered with Aadhaar', 'Active bank account linked to Aadhaar', 'Sufficient account balance'],
  },
  {
    slug: 'personal-loans',
    Icon: FaMoneyBillWave,
    title: 'Personal Loans',
    tagline: 'Quick disbursal with minimal docs',
    desc: 'Get personal loans with fast approval and minimal documentation. Competitive interest rates tailored to your profile.',
    features: ['Fast Approval', 'Minimal Documentation', 'Competitive Rates', 'Flexible Tenure'],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/Layer_20_dpj7hw.png',
    gradient: 'linear-gradient(135deg,#060d1a,#3b1a7a 60%,#5b21b6)',
    accent: '#7c3aed',
    detailedDesc: 'Get the funds you need quickly with our personal loan service. We offer competitive interest rates, minimal documentation requirements, and fast approval processes to ensure you get your money when you need it most.',
    benefits: ['Quick approval within 24 hours', 'Minimal documentation required', 'Competitive interest rates', 'Flexible repayment tenure', 'No collateral required', 'Transparent processing fees'],
    howItWorks: ['Submit your loan application online', 'Upload required documents', 'Get instant eligibility check', 'Receive approval notification', 'Funds disbursed to your account'],
    requirements: ['Valid government ID', 'Income proof (salary slips / ITR)', 'Bank statements (3 months)', 'Minimum age 21 years', 'Minimum monthly income ₹15,000'],
  },
  {
    slug: 'business-loans',
    Icon: FaBuilding,
    title: 'Business Loans',
    tagline: 'Fuel your business growth',
    desc: 'Tailored business loan solutions to help you scale, expand, and achieve your entrepreneurial goals with ease.',
    features: ['High Loan Amounts', 'Flexible Repayment', 'Quick Processing', 'All Business Types'],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986810/Layer_21_rfhylr.png',
    gradient: 'linear-gradient(135deg,#060d1a,#7a3200 60%,#92400e)',
    accent: '#d97706',
    detailedDesc: 'Power your business ambitions with our tailored business loan solutions. Whether you need working capital, equipment financing, or expansion funds, we have the right product for your business needs.',
    benefits: ['High loan amounts up to ₹50 Lakhs', 'Flexible repayment options', 'Quick processing and disbursal', 'Suitable for all business types', 'Minimal collateral requirements', 'Dedicated relationship manager'],
    howItWorks: ['Submit business loan application', 'Provide business documents', 'Business assessment and verification', 'Loan approval and offer letter', 'Funds disbursed to business account'],
    requirements: ['Business registration documents', 'GST registration certificate', 'Business bank statements (6 months)', 'ITR for last 2 years', 'Minimum 2 years business vintage'],
  },
  {
    slug: 'insurance',
    Icon: FaShieldAlt,
    title: 'Insurance Services',
    tagline: 'Protect what matters most',
    desc: 'Life, health, and vehicle insurance from top providers at the best rates. Comprehensive coverage for you and your family.',
    features: ['Life Insurance', 'Health Insurance', 'Vehicle Insurance', 'Best Rates'],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_23_ebzlts.png',
    gradient: 'linear-gradient(135deg,#060d1a,#065f46 60%,#0d7a58)',
    accent: '#10b981',
    detailedDesc: 'Protect yourself and your loved ones with our comprehensive insurance services. We partner with top insurance providers to offer you the best coverage at competitive premiums.',
    benefits: ['Comprehensive coverage options', 'Best premium rates in market', 'Quick claim settlement', 'Expert advisory service', 'Paperless policy issuance', 'Renewal reminders and support'],
    howItWorks: ['Discuss your insurance needs', 'Compare plans from top providers', 'Choose the best plan for you', 'Complete KYC and payment', 'Receive policy documents instantly'],
    requirements: ['Valid government ID', 'Age proof', 'Medical reports (if applicable)', 'Vehicle RC (for vehicle insurance)', 'Nominee details'],
  },
  {
    slug: 'cash-deposit',
    Icon: FaUniversity,
    title: 'Cash Deposit',
    tagline: 'Quick & secure cash deposits',
    desc: 'Quick and secure cash deposit services to any bank account across India with instant confirmation.',
    features: ['Instant Deposit', 'All Banks Supported', 'Secure Process', 'Low Charges'],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986807/Cash_Deposit_iqi1gr.png',
    gradient: 'linear-gradient(135deg,#060d1a,#1a365d 60%,#2b4a8a)',
    accent: '#2b77e6',
    detailedDesc: 'Deposit cash to any bank account across India quickly and securely. Our cash deposit service ensures your money reaches the destination account instantly with full transaction confirmation.',
    benefits: ['Instant deposit confirmation', 'Support for all banks', 'Secure and encrypted process', 'Low transaction charges', 'Real-time tracking', 'Digital receipt provided'],
    howItWorks: ['Visit our nearest center', 'Provide beneficiary account details', 'Hand over cash amount', 'Complete verification', 'Receive instant deposit confirmation'],
    requirements: ['Beneficiary account number and IFSC', 'Valid ID proof', 'Cash amount to deposit', 'Mobile number for OTP'],
  },
  {
    slug: 'cibil-score',
    Icon: FaChartBar,
    title: 'CIBIL Score Check & Repair',
    tagline: 'Know & improve your credit score',
    desc: 'Know your credit score and get expert guidance to improve it for better loan eligibility and financial health.',
    features: ['Instant Score Check', 'Expert Guidance', 'Score Improvement', 'Free Consultation'],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986813/Layer_26_nxw11o.png',
    gradient: 'linear-gradient(135deg,#060d1a,#7a0a2a 60%,#9b1239)',
    accent: '#f43f5e',
    detailedDesc: 'Your CIBIL score is the key to your financial future. Our experts help you understand your credit report, identify issues, and provide a personalized action plan to improve your score.',
    benefits: ['Instant CIBIL score access', 'Detailed credit report analysis', 'Personalized improvement plan', 'Expert financial counseling', 'Dispute resolution assistance', 'Regular score monitoring'],
    howItWorks: ['Submit your details for score check', 'Receive detailed credit report', 'Expert analysis of your score', 'Get personalized improvement plan', 'Follow up and track progress'],
    requirements: ['Valid Aadhaar or PAN card', 'Registered mobile number', 'Basic personal details', 'Consent for credit check'],
  },
  {
    slug: 'new-credit-card',
    Icon: FaCreditCard,
    title: 'New Credit Cards',
    tagline: 'Best cards for your profile',
    desc: 'Apply for the best credit cards matching your spending profile and get instant approval from top banks.',
    features: ['All Major Banks', 'Instant Approval', 'Best Rewards', 'Zero Annual Fee Options'],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/copy_8_khzlf7.png',
    gradient: 'linear-gradient(135deg,#060d1a,#1a365d 60%,#2b4a8a)',
    accent: '#2b77e6',
    detailedDesc: 'Find the perfect credit card for your lifestyle. We analyze your spending patterns and financial profile to recommend the best credit cards with maximum rewards, cashback, and benefits.',
    benefits: ['Personalized card recommendations', 'Instant online approval', 'Best rewards and cashback', 'Zero annual fee options available', 'Lifetime free cards', 'Welcome bonus offers'],
    howItWorks: ['Share your spending profile', 'Get personalized card recommendations', 'Choose your preferred card', 'Complete online application', 'Receive card within 7 working days'],
    requirements: ['Valid PAN card', 'Aadhaar card', 'Income proof', 'Minimum age 21 years', 'Good CIBIL score (700+)'],
  },
  {
    slug: 'bank-account',
    Icon: FaIdCard,
    title: 'Bank Account Opening',
    tagline: 'Zero-hassle account setup',
    desc: 'Open a savings or current account with leading banks hassle-free with minimal documentation and doorstep service.',
    features: ['Zero Balance Options', 'All Major Banks', 'Quick Processing', 'Doorstep Service'],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_25_z5scod.png',
    gradient: 'linear-gradient(135deg,#060d1a,#065f46 60%,#0d7a58)',
    accent: '#10b981',
    detailedDesc: 'Open a bank account with leading banks without the hassle of visiting a branch. Our doorstep service ensures your account is opened quickly with minimal documentation.',
    benefits: ['Doorstep account opening', 'Zero balance account options', 'All major banks available', 'Quick processing within 24 hours', 'Digital KYC process', 'Instant debit card issuance'],
    howItWorks: ['Choose your preferred bank', 'Submit documents online or at center', 'Complete video KYC', 'Account activation within 24 hours', 'Receive welcome kit and debit card'],
    requirements: ['Valid Aadhaar card', 'PAN card', 'Passport size photograph', 'Mobile number linked to Aadhaar', 'Initial deposit (if applicable)'],
  },
]

const stats = [
  { value: '2 Min', label: 'Processing Time' },
  { value: '10K+', label: 'Happy Customers' },
  { value: '100%', label: 'Secure & Trusted' },
  { value: '24/7', label: 'Support Available' },
]

export default function ProductDetails() {
  const { slug } = useParams()
  const product = products.find(p => p.slug === slug)
  const heroRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    if (!product) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.product-hero-badge', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' })
      gsap.fromTo('.product-hero-title', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.15, ease: 'power4.out' })
      gsap.fromTo('.product-hero-tagline', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: 'power3.out' })
      gsap.fromTo('.product-hero-desc', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.45, ease: 'power3.out' })
      gsap.fromTo('.product-hero-actions', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.6, ease: 'power3.out' })
      gsap.fromTo('.product-hero-image-wrap', { opacity: 0, scale: 1.06, x: 50 }, { opacity: 1, scale: 1, x: 0, duration: 1.1, delay: 0.2, ease: 'power3.out' })
      gsap.fromTo('.stat-item', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.8, ease: 'power2.out' })
      gsap.fromTo('.content-section', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.15,
        scrollTrigger: { trigger: contentRef.current, start: 'top 80%' }
      })
      gsap.to('.pd-particle', {
        y: 'random(-40,40)', x: 'random(-25,25)',
        duration: 'random(3,6)', repeat: -1, yoyo: true,
        ease: 'sine.inOut', stagger: { each: 0.4, from: 'random' },
      })
    }, heroRef)
    return () => ctx.revert()
  }, [product])

  if (!product) {
    return (
      <div className="product-not-found">
        <div className="not-found-icon"><FaSearch size={48} /></div>
        <h1>Product Not Found</h1>
        <p>The service you're looking for doesn't exist or may have moved.</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    )
  }

  return (
    <div className="product-details" ref={heroRef}>

      {/* ── Hero ── */}
      <section className="product-hero" style={{ background: product.gradient }}>
        <div className="pd-particles">
          {[...Array(18)].map((_, i) => (
            <div key={i} className="pd-particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${80 + Math.random() * 120}px`,
              height: `${80 + Math.random() * 120}px`,
              opacity: 0.04 + Math.random() * 0.06,
            }} />
          ))}
        </div>

        <div className="product-hero-inner">
          <div className="product-hero-content">
            <div className="product-hero-badge">
              <product.Icon size={13} /> {product.title}
            </div>
            <h1 className="product-hero-title">{product.title}</h1>
            <p className="product-hero-tagline">{product.tagline}</p>
            <p className="product-hero-desc">{product.detailedDesc}</p>
            <div className="product-hero-actions">
              <Link to="/contact" className="btn-primary">Get Started <FaArrowRight size={13} /></Link>
              <Link to="/what-we-do" className="btn-outline">All Services</Link>
            </div>
          </div>

          <div className="product-hero-visual">
            <div className="product-hero-image-wrap">
              <img src={product.img} alt={product.title} />
              <div className="product-hero-img-glow" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="product-stats-bar">
        <div className="stats-inner">
          {stats.map((s, i) => (
            <div key={i} className="stat-row">
              <div className="stat-item">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
              {i < stats.length - 1 && <div className="stat-divider" />}
            </div>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="product-content" ref={contentRef}>

        {/* Overview */}
        <section className="content-section overview-section">
          <div className="section-header">
            <div className="section-pill">Overview</div>
            <h2>Service Overview</h2>
            <p>Everything you need to know about this service</p>
          </div>
          <div className="overview-grid">
            <div className="overview-text">
              <h3>{product.tagline}</h3>
              <p>{product.desc}</p>
              {product.badge && (
                <div className="product-badge">
                  <FaShieldAlt size={13} /> {product.badge}
                </div>
              )}
            </div>
            <div className="overview-features">
              <h4>Key Features</h4>
              <ul>
                {product.features.map((f, i) => (
                  <li key={i}>
                    <span className="check"><FaCheckCircle size={11} /></span>{f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="content-section benefits-section">
          <div className="section-header">
            <div className="section-pill">Benefits</div>
            <h2>Why Choose This Service</h2>
            <p>Key advantages that set us apart</p>
          </div>
          <div className="benefits-grid">
            {product.benefits.map((b, i) => {
              const BIcon = BENEFIT_ICONS[i % BENEFIT_ICONS.length]
              return (
                <div key={i} className="benefit-card">
                  <span className="benefit-icon"><BIcon size={20} /></span>
                  <p>{b}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* How It Works */}
        <section className="content-section how-it-works-section">
          <div className="section-header">
            <div className="section-pill">Process</div>
            <h2>How It Works</h2>
            <p>Simple steps to get started</p>
          </div>
          <div className="steps-container">
            {product.howItWorks.map((step, i) => (
              <div key={i} className="step-card">
                <div className="step-number">{i + 1}</div>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Requirements */}
        <section className="content-section requirements-section">
          <div className="section-header">
            <div className="section-pill">Requirements</div>
            <h2>What You Need</h2>
            <p>Documents and eligibility criteria</p>
          </div>
          <div className="requirements-list">
            {product.requirements.map((r, i) => (
              <div key={i} className="requirement-item">
                <span className="req-icon"><FaClipboardList size={16} /></span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        {product.categories && (
          <section className="content-section categories-section">
            <div className="section-header">
              <div className="section-pill">Use Cases</div>
              <h2>Perfect For</h2>
              <p>Common use cases for this service</p>
            </div>
            <div className="categories-showcase">
              {product.categories.map((c, i) => (
                <span key={i} className="category-tag">{c}</span>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="content-section pd-cta-section">
          <div className="pd-cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Contact us today and experience the convenience of our services</p>
            <div className="cta-actions">
              <Link to="/contact" className="btn-primary">Contact Us Now</Link>
              <Link to="/what-we-do" className="btn-outline">View All Services</Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
