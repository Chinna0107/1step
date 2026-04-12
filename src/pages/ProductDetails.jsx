import { useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  FaBolt, FaCreditCard, FaExchangeAlt, FaFingerprint,
  FaMoneyBillWave, FaBuilding, FaShieldAlt, FaUniversity,
  FaChartBar, FaIdCard, FaLock, FaClock, FaGem,
  FaBullseye, FaStar, FaCheckCircle, FaArrowRight,
  FaClipboardList, FaSearch, FaMapMarkerAlt, FaChartLine,
  FaWhatsapp, FaPhone
} from 'react-icons/fa'
import './ProductDetails.css'

gsap.registerPlugin(ScrollTrigger)

const BENEFIT_ICONS = [FaBolt, FaLock, FaClock, FaGem, FaChartBar, FaBullseye, FaStar, FaShieldAlt]

const products = [
  {
    slug: 'spot-cash',
    Icon: FaBolt,
    title: 'Spot Cash on Credit Card',
    tagline: 'Instant Credit Card to Cash / Bank Account Transfer',
    desc: 'Get funds in minutes — safe, secure & verified process. No utility, no education, no rentals. 100% pure non-utility transactions with bank hidden charges reversal support.',
    features: [
      { Icon: FaBolt,         label: 'Instant Bank Transfer' },
      { Icon: FaShieldAlt,    label: 'No Hidden Charges' },
      { Icon: FaStar,         label: 'Cashback / Reward Points' },
      { Icon: FaLock,         label: '100% Safe & Secure' },
    ],
    categories: ['Travel', 'Grocery', 'Furniture', 'Insurance'],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/copy_8_khzlf7.png',
    gradient: 'linear-gradient(135deg,#060d1a,#1a365d 60%,#2b4a8a)',
    accent: '#2b77e6',
    detailedDesc: 'MoneySpot provides Instant Credit Card to Cash / Bank Account Transfer — get funds in minutes through a safe, secure & verified process. We process 100% pure non-utility transactions under categories like Travel, Grocery, Furniture & Insurance. No hidden charges, no third-party transfers, same card holder account transfer only. We also offer Bank Hidden Charges Reversal Support. Fast • Transparent • Professional.',
    benefits: [
      'No Hidden Charges — full transparency',
      'Cashback / Reward Points on transactions',
      '100% Safe & Secure process',
      '100% Pure Non-Utility Transactions',
      'Bank Hidden Charges Reversal Support',
      'KYC Verified & Fraud Prevention System',
      'Same Card Holder Account Transfer Only',
      'Instant Processing — funds in minutes',
    ],
    howItWorks: [
      'Visit our branch or contact us',
      'Submit KYC documents',
      'Confirm transaction amount and bank account details',
      'OTP verification',
      'Get funds instantly in your account',
    ],
    requirements: [
      'Valid credit card with available limit',
      'Government-issued ID (Aadhaar / PAN)',
      'Active bank account (same card holder)',
      'Mobile number for OTP verification',
    ],
    trustPoints: [
      'KYC Mandatory for All Transactions',
      'Same Card Holder Account Transfer Only',
      'No Third-Party Transfers',
      'Full Transparency',
      'Fraud Prevention System',
    ],
  },
  {
    slug: 'bill-payment',
    Icon: FaCreditCard,
    title: 'Credit Card Bill Payment',
    tagline: 'We Clear Your Credit Card Bills Instantly',
    desc: 'No Cash? No Problem. Never miss your due date — protect your CIBIL score & avoid financial losses. Any amount, any bank, zero hassle.',
    features: [
      { Icon: FaBolt,          label: 'Instant Bill Payment' },
      { Icon: FaMoneyBillWave, label: 'Any Amount – No Limits' },
      { Icon: FaShieldAlt,     label: 'No Hidden Charges' },
      { Icon: FaStar,          label: 'Cashback / Reward Points' },
    ],
    badge: '100% Secure | Trusted | Transparent',
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/copy_8_khzlf7.png',
    gradient: 'linear-gradient(135deg,#060d1a,#065f46 60%,#0d7a58)',
    accent: '#10b981',
    detailedDesc: 'MoneySpot clears your credit card bills instantly — any amount, any bank, zero hassle. Never miss your due date again. Protect your CIBIL score and avoid late payment penalties. We offer 100% pure non-utility transactions with bank hidden charges reversal support. Fast • Transparent • Trusted by Customers. Your Bill. Our Responsibility.',
    benefits: [
      'Instant Bill Payment — any amount',
      'Any bank, any credit card supported',
      'No Hidden Charges guarantee',
      'Cashback / Reward Points',
      '100% Safe & Secure',
      '100% Pure Non-Utility Transactions',
      'Bank Hidden Charges Reversal Support',
      'Protect your CIBIL score',
    ],
    howItWorks: [
      'Contact us or visit our nearest branch',
      'Share your credit card bill details',
      'Confirm payment amount',
      'Secure payment processed instantly',
      'Receive confirmation & digital receipt',
    ],
    requirements: [
      'Credit card statement or bill details',
      'Valid payment method (UPI / Net Banking / Card)',
      'Registered mobile number',
      'Active internet connection',
    ],
  },
  {
    slug: 'dmt',
    Icon: FaExchangeAlt,
    title: 'Instant Money Transfer (DMT)',
    tagline: 'Send Money Anywhere in India in Seconds',
    desc: 'No waiting in bank queues. No delays. Instant bank transfer via IMPS — fast, secure & reliable. Available 24×7.',
    features: [
      { Icon: FaClock,         label: '24×7 Service' },
      { Icon: FaBolt,          label: 'Instant IMPS Transfer' },
      { Icon: FaUniversity,    label: 'All Banks Supported' },
      { Icon: FaMoneyBillWave, label: 'Low Charges' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986807/Cash_Deposit_iqi1gr.png',
    gradient: 'linear-gradient(135deg,#060d1a,#3b1a7a 60%,#5b21b6)',
    accent: '#8b5cf6',
    detailedDesc: 'Send money anywhere in India in seconds with MoneySpot DMT service. No waiting in bank queues, no delays — instant bank transfer via IMPS. Available 24×7 including holidays. Fast • Secure • Reliable. Contact us for instant support.',
    benefits: [
      'Instant transfers via IMPS — seconds',
      'Available 24×7 including holidays',
      'No bank queue waiting',
      'Lowest transaction charges',
      'All banks across India supported',
      'Secure & encrypted transactions',
    ],
    howItWorks: [
      'Contact us or visit our branch',
      'Provide sender & beneficiary details',
      'Enter transfer amount',
      'OTP verification',
      'Funds transferred instantly',
    ],
    requirements: [
      'Valid sender KYC documents',
      'Beneficiary bank account & IFSC',
      'Active mobile number for OTP',
      'Valid payment method',
    ],
  },
  {
    slug: 'aadhaar-withdrawal',
    Icon: FaFingerprint,
    title: 'Aadhaar Cash Withdrawal',
    tagline: 'Withdraw cash with just your Aadhaar',
    desc: 'No ATM card? No problem. Withdraw cash from your bank account using your Aadhaar number and biometric fingerprint — available at our nearest point.',
    features: [
      { Icon: FaFingerprint,  label: 'No ATM Card Needed' },
      { Icon: FaLock,         label: 'Biometric Authentication' },
      { Icon: FaBolt,         label: 'Instant Disbursement' },
      { Icon: FaMapMarkerAlt, label: 'Available Nearby' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_22_dxp4lv.png',
    gradient: 'linear-gradient(135deg,#060d1a,#7a3200 60%,#92400e)',
    accent: '#f59e0b',
    detailedDesc: 'Access your bank account without an ATM card using just your Aadhaar number and biometric authentication. This service is perfect for those who have lost their cards or prefer not to carry them. Available at all MoneySpot branches across Kadapa, Anantapur & Bangalore.',
    benefits: [
      'No ATM card required',
      'Biometric fingerprint authentication',
      'Instant cash disbursement',
      'Available at all our centers',
      'Secure Aadhaar-based verification',
      'No additional charges',
    ],
    howItWorks: [
      'Visit nearest MoneySpot center',
      'Provide Aadhaar number',
      'Biometric fingerprint verification',
      'Enter withdrawal amount',
      'Receive cash instantly',
    ],
    requirements: [
      'Valid Aadhaar card',
      'Biometric fingerprint registered with Aadhaar',
      'Active bank account linked to Aadhaar',
      'Sufficient account balance',
    ],
  },
  {
    slug: 'personal-loans',
    Icon: FaMoneyBillWave,
    title: 'Personal Loans',
    tagline: 'Instant Funds for Your Personal Needs',
    desc: 'Medical emergencies, travel, education, or lifestyle needs — get hassle-free personal loans with fast processing. Loan up to ₹40 Lakhs with flexible tenure up to 5 years.',
    features: [
      { Icon: FaBolt,         label: 'Loan up to ₹40 Lakhs' },
      { Icon: FaCheckCircle,  label: 'Instant Approval Process' },
      { Icon: FaChartLine,    label: 'Low Interest Rates' },
      { Icon: FaClock,        label: 'Flexible Tenure up to 5 Yrs' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/Layer_20_dpj7hw.png',
    gradient: 'linear-gradient(135deg,#060d1a,#3b1a7a 60%,#5b21b6)',
    accent: '#7c3aed',
    detailedDesc: 'Get instant funds for your personal needs — medical emergencies, travel, education, or lifestyle. MoneySpot offers hassle-free personal loans up to ₹40 Lakhs with instant approval, quick disbursal, flexible tenure up to 5 years, low interest rates, and 100% digital process available. We work with 120+ Bank & NBFC partners to get you the best deal.',
    benefits: [
      'Loan up to ₹40 Lakhs',
      'Instant Approval Process',
      'Quick Disbursal',
      'Flexible Tenure up to 5 Years',
      'Low Interest Rates',
      '100% Digital Process Available',
    ],
    howItWorks: [
      'Contact nearest branch or call us',
      'Submit required documents',
      'Eligibility check by our experts',
      'We select the best bank / NBFC for you',
      'Loan approved & disbursed fast',
    ],
    requirements: [
      'Aadhaar Card & PAN Card',
      'Passport Size Photo',
      'Mobile Number & Email ID',
      'Last 3 Months Payslips',
      'Last 6 Months Bank Statement',
      'Official Email ID',
    ],
  },
  {
    slug: 'business-loans',
    Icon: FaBuilding,
    title: 'Business Loans',
    tagline: 'Fuel Your Business Growth',
    desc: 'Expand your business, manage cash flow, or invest in new opportunities. Loan up to ₹70 Lakhs with fast approval & 120+ Bank & NBFC tie-ups.',
    features: [
      { Icon: FaMoneyBillWave, label: 'Loan up to ₹70 Lakhs' },
      { Icon: FaBolt,          label: 'Fast Approval & Disbursal' },
      { Icon: FaChartBar,      label: 'High Approval Chances' },
      { Icon: FaUniversity,    label: '120+ Bank & NBFC Tie-ups' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986810/Layer_21_rfhylr.png',
    gradient: 'linear-gradient(135deg,#060d1a,#7a3200 60%,#92400e)',
    accent: '#d97706',
    detailedDesc: 'Fuel your business growth with MoneySpot Business Loans (Proprietorship). Expand your business, manage cash flow, or invest in new opportunities. Loan up to ₹70 Lakhs with fast approval, high approval chances, competitive interest rates, and 120+ Bank & NBFC tie-ups. Our experts handle everything from document submission to bank selection.',
    benefits: [
      'Loan up to ₹70 Lakhs',
      'Fast Approval & Disbursal',
      'High Approval Chances',
      '120+ Bank & NBFC Tie-ups',
      'Competitive Interest Rates',
      'Expert guidance throughout',
    ],
    howItWorks: [
      'Connect with our team',
      'Submit business documents',
      'Business eligibility check',
      'Best bank selection by our experts',
      'Quick approval & disbursal',
    ],
    requirements: [
      'Aadhaar & PAN Card',
      'Labour License / Udyam / GST (if available)',
      'Shop Photos (Inside & Outside)',
      '12 Months Bank Statement (PDF)',
      'ITR (if available)',
      'House Proof / Rent Agreement',
      '2 References (Name & Contact)',
    ],
  },
  {
    slug: 'insurance',
    Icon: FaShieldAlt,
    title: 'Insurance Services',
    tagline: 'Protect What Matters Most',
    desc: 'Trusted insurance solutions through IRDA-certified providers. Health, Life, General & Term Insurance — tailored to your needs for financial protection & peace of mind.',
    features: [
      { Icon: FaShieldAlt,    label: 'Health Insurance' },
      { Icon: FaCheckCircle,  label: 'Life Insurance' },
      { Icon: FaStar,         label: 'Term Insurance' },
      { Icon: FaClock,        label: 'General Insurance' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_23_ebzlts.png',
    gradient: 'linear-gradient(135deg,#060d1a,#065f46 60%,#0d7a58)',
    accent: '#10b981',
    detailedDesc: 'MoneySpot helps you secure your future with trusted insurance solutions through partnerships with IRDA-certified insurance providers. We offer Health Insurance (cashless hospitalization, family & individual plans), Life Insurance (financial protection for loved ones), General Insurance (vehicle, property, travel, business), and Term Insurance (maximum protection at minimal cost). Partnered with IRDA Approved Companies. Your Safety. Your Future. Our Responsibility.',
    benefits: [
      'Partnered with IRDA Approved Companies',
      'Expert Guidance & Policy Comparison',
      'Hassle-Free Documentation',
      'Fast Processing & Support',
      'Customized Plans as per Your Needs',
      'Cashless Hospitalization (Health)',
      'Family & Individual Plans available',
      'Vehicle, Property & Travel Insurance',
    ],
    howItWorks: [
      'Discuss your insurance needs with our experts',
      'Compare plans from top IRDA-certified providers',
      'Choose the right policy for you',
      'Complete KYC and payment',
      'Receive policy documents instantly',
    ],
    requirements: [
      'Valid government ID (Aadhaar / PAN)',
      'Age proof',
      'Medical reports (if applicable)',
      'Vehicle RC (for vehicle insurance)',
      'Nominee details',
    ],
  },
  {
    slug: 'cash-deposit',
    Icon: FaUniversity,
    title: 'Cash Deposit',
    tagline: 'Quick & Secure Cash Deposits',
    desc: 'Quick and secure cash deposit services to any bank account across India with instant confirmation and real-time tracking.',
    features: [
      { Icon: FaBolt,          label: 'Instant Deposit' },
      { Icon: FaUniversity,    label: 'All Banks Supported' },
      { Icon: FaLock,          label: 'Secure Process' },
      { Icon: FaMoneyBillWave, label: 'Low Charges' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986807/Cash_Deposit_iqi1gr.png',
    gradient: 'linear-gradient(135deg,#060d1a,#1a365d 60%,#2b4a8a)',
    accent: '#2b77e6',
    detailedDesc: 'Deposit cash to any bank account across India quickly and securely. Our cash deposit service ensures your money reaches the destination account instantly with full transaction confirmation and digital receipt.',
    benefits: [
      'Instant deposit confirmation',
      'Support for all banks across India',
      'Secure and encrypted process',
      'Low transaction charges',
      'Real-time tracking',
      'Digital receipt provided',
    ],
    howItWorks: [
      'Visit our nearest center',
      'Provide beneficiary account details',
      'Hand over cash amount',
      'Complete verification',
      'Receive instant deposit confirmation',
    ],
    requirements: [
      'Beneficiary account number and IFSC',
      'Valid ID proof',
      'Cash amount to deposit',
      'Mobile number for OTP',
    ],
  },
  {
    slug: 'cibil-score',
    Icon: FaChartBar,
    title: 'CIBIL Score Check & Repair',
    tagline: 'Improve Your CIBIL Score with Experts',
    desc: 'Loan rejected? Low CIBIL score? Facing credit issues? Don\'t worry — we fix it professionally. Fast, transparent & result-oriented solutions.',
    features: [
      { Icon: FaBolt,        label: 'Multi-Bureau Analysis' },
      { Icon: FaGem,         label: 'Expert Guided Process' },
      { Icon: FaChartBar,    label: 'Quick Improvements' },
      { Icon: FaCheckCircle, label: 'Trusted Support' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986813/Layer_26_nxw11o.png',
    gradient: 'linear-gradient(135deg,#060d1a,#7a0a2a 60%,#9b1239)',
    accent: '#f43f5e',
    detailedDesc: 'Loan rejected? Low CIBIL score? Facing credit issues? Don\'t worry — MoneySpot fixes it professionally. We analyze all major credit bureaus: CIBIL (TransUnion), Experian, Equifax & CRIF High Mark for complete multi-bureau credit analysis. Fast • Transparent • Result-Oriented Solutions. Trusted Support. 100% Guided Process. Quick Improvements Possible.',
    benefits: [
      'CIBIL (TransUnion) Analysis',
      'Experian Credit Report Check',
      'Equifax Bureau Analysis',
      'CRIF High Mark Analysis',
      'Complete Multi-Bureau Credit Analysis',
      '100% Guided Process',
      'Quick Improvements Possible',
      'Trusted Expert Support',
    ],
    howItWorks: [
      'Contact us or visit nearest branch',
      'Submit details for credit check',
      'Receive detailed multi-bureau report',
      'Expert analysis of your score',
      'Get personalized improvement plan & follow-up',
    ],
    requirements: [
      'Valid Aadhaar or PAN card',
      'Registered mobile number',
      'Basic personal details',
      'Consent for credit check',
    ],
  },
  {
    slug: 'new-credit-card',
    Icon: FaCreditCard,
    title: 'New Credit Cards',
    tagline: 'Best Cards for Your Profile',
    desc: 'Apply for the best credit cards matching your spending profile and get instant approval from top banks.',
    features: [
      { Icon: FaUniversity,  label: 'All Major Banks' },
      { Icon: FaBolt,        label: 'Instant Approval' },
      { Icon: FaStar,        label: 'Best Rewards' },
      { Icon: FaCheckCircle, label: 'Zero Annual Fee Options' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/copy_8_khzlf7.png',
    gradient: 'linear-gradient(135deg,#060d1a,#1a365d 60%,#2b4a8a)',
    accent: '#2b77e6',
    detailedDesc: 'Find the perfect credit card for your lifestyle. We analyze your spending patterns and financial profile to recommend the best credit cards with maximum rewards, cashback, and benefits from all major banks.',
    benefits: [
      'Personalized card recommendations',
      'Instant online approval',
      'Best rewards and cashback',
      'Zero annual fee options available',
      'Lifetime free cards',
      'Welcome bonus offers',
    ],
    howItWorks: [
      'Share your spending profile',
      'Get personalized card recommendations',
      'Choose your preferred card',
      'Complete online application',
      'Receive card within 7 working days',
    ],
    requirements: [
      'Valid PAN card',
      'Aadhaar card',
      'Income proof',
      'Minimum age 21 years',
      'Good CIBIL score (700+)',
    ],
  },
  {
    slug: 'bank-account',
    Icon: FaIdCard,
    title: 'Bank Account Opening',
    tagline: 'Zero-Hassle Account Setup',
    desc: 'Open a savings or current account with leading banks hassle-free with minimal documentation and doorstep service.',
    features: [
      { Icon: FaCheckCircle,  label: 'Zero Balance Options' },
      { Icon: FaUniversity,   label: 'All Major Banks' },
      { Icon: FaBolt,         label: 'Quick Processing' },
      { Icon: FaMapMarkerAlt, label: 'Doorstep Service' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_25_z5scod.png',
    gradient: 'linear-gradient(135deg,#060d1a,#065f46 60%,#0d7a58)',
    accent: '#10b981',
    detailedDesc: 'Open a bank account with leading banks without the hassle of visiting a branch. Our doorstep service ensures your account is opened quickly with minimal documentation and digital KYC.',
    benefits: [
      'Doorstep account opening',
      'Zero balance account options',
      'All major banks available',
      'Quick processing within 24 hours',
      'Digital KYC process',
      'Instant debit card issuance',
    ],
    howItWorks: [
      'Choose your preferred bank',
      'Submit documents online or at center',
      'Complete video KYC',
      'Account activation within 24 hours',
      'Receive welcome kit and debit card',
    ],
    requirements: [
      'Valid Aadhaar card',
      'PAN card',
      'Passport size photograph',
      'Mobile number linked to Aadhaar',
      'Initial deposit (if applicable)',
    ],
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
              <a href="https://wa.me/919866440477?text=Hi%20MoneySpot%2C%20I%20need%20help%20with%20your%20services." target="_blank" rel="noopener noreferrer" className="btn-wa"><FaWhatsapp size={16} /> WhatsApp</a>
              <a href="tel:+919866440477" className="btn-call"><FaPhone size={14} /> Call Now</a>
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
                    <span className="check"><f.Icon size={11} /></span>{f.label}
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
              <a href="https://wa.me/919866440477?text=Hi%20MoneySpot%2C%20I%20need%20help%20with%20your%20services." target="_blank" rel="noopener noreferrer" className="btn-wa btn-wa-lg"><FaWhatsapp size={18} /> Chat on WhatsApp</a>
              <a href="tel:+919866440477" className="btn-call btn-call-lg"><FaPhone size={15} /> Call Us Now</a>
              <Link to="/what-we-do" className="btn-outline">View All Services</Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
