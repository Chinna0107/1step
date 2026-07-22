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
    tagline: 'Secure Capital Immediately – Fully Validated Operations',
    desc: 'Acquire liquid funds in moments via a protected, verified channel. Exclusively non-utility transfers with robust support against concealed banking fees.',
    features: [
      { Icon: FaCheckCircle,  label: 'Zero Hidden Costs' },
      { Icon: FaStar,         label: 'Earn Rewards & Cashback' },
      { Icon: FaLock,         label: 'Highly Encrypted & Safe' },
      { Icon: FaShieldAlt,    label: 'Hidden Fee Mitigation Support' },
    ],
    categories: ['Journeys', 'Provisions', 'Furnishings', 'Coverage'],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/copy_8_khzlf7.png',
    gradient: 'linear-gradient(135deg,#060d1a,#1a365d 60%,#2b4a8a)',
    accent: '#2b77e6',
    detailedDesc: 'Draw funds promptly via an established, secure mechanism. We deal strictly in non-utility transactions—no rent or education pseudo-payments. Benefit from complete fee transparency, continue earning card rewards, and rest easy with our secure processing. Transactions are categorized appropriately under travel or retail. Swift • Clear • Expert.',
    benefits: [
      'Complete cost transparency — no surprises',
      'Retain card rewards on all transfers',
      'End-to-end encrypted processing',
      'Authentic non-utility charge codes',
      'Assistance against bank surcharges',
      'Strict KYC for fraud mitigation',
      'Direct-to-owner account disbursements',
      'Strictly no third-party remittances',
    ],
    howItWorks: [
      'Reach out or visit our hub',
      'Provide necessary identity documents',
      'Approve the sum and destination account',
      'Authenticate via one-time password',
      'Receive capital instantaneously',
    ],
    requirements: [
      'Active credit card with sufficient balance',
      'Official government ID (PAN or Aadhaar)',
      'Matching bank account details',
      'Accessible mobile phone for OTP',
    ],
    trustPoints: [
      'Mandatory Identity Verification',
      'Owner-Only Fund Transfers',
      'Zero Third-Party Routing',
      'Absolute Operational Clarity',
      'Advanced Anti-Fraud Checks',
    ],
  },
  {
    slug: 'bill-payment',
    Icon: FaCreditCard,
    title: 'Credit Card Bill Payment',
    tagline: 'We Settle Your Invoices in Real-Time',
    desc: 'Lacking immediate liquidity? Prevent missed deadlines, preserve your credit rating, and avert monetary penalties. We clear any card balance smoothly.',
    features: [
      { Icon: FaBolt,          label: 'Real-Time Settlements' },
      { Icon: FaMoneyBillWave, label: 'Uncapped Payment Amounts' },
      { Icon: FaShieldAlt,     label: 'Zero Concealed Fees' },
      { Icon: FaStar,          label: 'Accrue Reward Points' },
    ],
    badge: 'Fully Encrypted | Reliable | Clear-Cut',
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/copy_8_khzlf7.png',
    gradient: 'linear-gradient(135deg,#060d1a,#065f46 60%,#0d7a58)',
    accent: '#10b981',
    detailedDesc: '1 Step Finance Care manages your credit invoices immediately—regardless of the bank or amount, without any friction. Ensure you never breach a payment deadline again. Shield your credit profile and dodge exorbitant late fines. We facilitate legitimate non-utility charges and offer backing against bank fees. Swift • Clear • Client-Trusted. Your dues are our priority.',
    benefits: [
      'Immediate invoice clearance of any size',
      'Compatible with all issuing banks',
      'Pledge of no hidden levies',
      'Benefit from card rewards',
      'Totally secure ecosystem',
      'Authentic non-utility operations',
      'Aid against concealed bank charges',
      'Safeguard your credit standing',
    ],
    howItWorks: [
      'Connect with us online or in-person',
      'Present your card and identity proof',
      'Share billing details and required sum',
      'Validate the transaction size',
      'We clear your outstanding balance immediately',
      'Funds are reconciled in your account',
      'Reap your card rewards',
    ],
    requirements: [
      'Current credit statement or invoice specifics',
      'Authorized payment mode (Card / UPI / NetBanking)',
      'Linked mobile device',
      'Stable network connection',
    ],
  },
  {
    slug: 'dmt',
    Icon: FaExchangeAlt,
    title: 'Instant Money Transfer (DMT)',
    tagline: 'Dispatch Capital Across the Nation Swiftly',
    desc: 'Bypass banking lines. Zero wait times. Immediate capital routing via IMPS — rapid, safe, and dependable. Accessible around the clock.',
    features: [
      { Icon: FaClock,         label: 'Always Accessible' },
      { Icon: FaBolt,          label: 'Swift IMPS Routing' },
      { Icon: FaUniversity,    label: 'Universal Bank Compatibility' },
      { Icon: FaMoneyBillWave, label: 'Minimal Tariffs' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986807/Cash_Deposit_iqi1gr.png',
    gradient: 'linear-gradient(135deg,#060d1a,#3b1a7a 60%,#5b21b6)',
    accent: '#8b5cf6',
    detailedDesc: 'Route funds anywhere nationwide instantly through our DMT solution. Forget about waiting in branch queues or dealing with processing lags—enjoy immediate capital transfer via IMPS. Operational every day of the week, holidays included. Rapid • Safe • Dependable. Reach out for prompt assistance.',
    benefits: [
      'Immediate routing via IMPS in moments',
      'Operational continuously, including holidays',
      'Eliminate physical banking queues',
      'Highly economical transaction tariffs',
      'Compatible with all Indian banking institutions',
      'Fully encrypted and secure transfers',
    ],
    howItWorks: [
      'Engage with our team or visit a branch',
      'Supply origin and recipient information',
      'Specify the routing amount',
      'Authenticate via OTP',
      'Capital is dispatched instantaneously',
    ],
    requirements: [
      'Legitimate sender identity documents',
      'Recipient account and IFSC specifics',
      'Functioning mobile device for authentication',
      'Acceptable payment mechanism',
    ],
  },
  {
    slug: 'aadhaar-withdrawal',
    Icon: FaFingerprint,
    title: 'Aadhaar Cash Withdrawal',
    tagline: 'Extract Funds Using Merely Your Biometrics',
    desc: 'Missing an ATM card? It’s not an issue. Pull cash directly from your account utilizing your Aadhaar digits and a fingerprint scan—accessible at our designated hubs.',
    features: [
      { Icon: FaFingerprint,  label: 'Cardless Withdrawals' },
      { Icon: FaLock,         label: 'Biometric Security' },
      { Icon: FaBolt,         label: 'Immediate Payouts' },
      { Icon: FaMapMarkerAlt, label: 'Convenient Locations' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_22_dxp4lv.png',
    gradient: 'linear-gradient(135deg,#060d1a,#7a3200 60%,#92400e)',
    accent: '#f59e0b',
    detailedDesc: 'Tap into your bank balance sans an ATM card, relying purely on your Aadhaar registration and a biometric thumbprint. This facility is ideal for individuals who misplace their cards or opt out of carrying them. Accessible at our hub in Kadapa.',
    benefits: [
      'Operates entirely without ATM cards',
      'Leverages highly secure biometric scans',
      'Capital is dispensed on the spot',
      'Present at all our physical branches',
      'Rooted in robust Aadhaar verification',
      'Free from supplementary withdrawal fees',
    ],
    howItWorks: [
      'Walk into an authorized 1 Step Finance Care hub',
      'Supply your unique Aadhaar digits',
      'Complete the biometric thumbprint scan',
      'Specify the desired cash amount',
      'Collect your funds on the spot',
    ],
    requirements: [
      'Active Aadhaar registration',
      'Thumbprint linked to the Aadhaar database',
      'Bank profile synchronized with Aadhaar',
      'Adequate balance for withdrawal',
    ],
  },
  {
    slug: 'personal-loans',
    Icon: FaMoneyBillWave,
    title: 'Personal Loans',
    tagline: 'Rapid Liquidity for Your Private Requirements',
    desc: 'Whether it is for healthcare crises, vacations, schooling, or upgrading your lifestyle—secure frictionless financing rapidly. Access up to ₹40 Lakhs with adaptable repayment windows spanning 5 years.',
    features: [
      { Icon: FaBolt,         label: 'Borrow up to ₹40 Lakhs' },
      { Icon: FaCheckCircle,  label: 'Swift Sanctioning' },
      { Icon: FaChartLine,    label: 'Competitive Rates' },
      { Icon: FaClock,        label: 'Repayment up to 5 Years' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/Layer_20_dpj7hw.png',
    gradient: 'linear-gradient(135deg,#060d1a,#3b1a7a 60%,#5b21b6)',
    accent: '#7c3aed',
    detailedDesc: 'Rapid. Uncomplicated. Dependable Monetary Aid. Obtain necessary liquidity with speedy clearances, minimal paperwork, and professional guidance sourced from over 120 partnered banks and NBFCs. Be it for medical emergencies, tuition, or travel—access up to ₹40 Lakhs seamlessly. Benefit from rapid disbursals, manageable 5-year tenures, economical interest rates, and an entirely digital application pathway.',
    benefits: [
      'Access limits up to ₹40 Lakhs',
      'Rapid sanctioning protocols',
      'Immediate fund disbursement',
      'Adaptable repayment windows reaching 5 years',
      'Highly competitive interest structures',
      'Fully digital processing available',
      'Backed by 120+ financial institutions',
      'Dedicated professional advisory',
    ],
    howItWorks: [
      'Reach out via phone or visit a location',
      'Furnish the required documentation',
      'Undergo a swift eligibility assessment',
      'We pinpoint the optimal lending partner',
      'Funds are sanctioned and routed quickly',
    ],
    requirements: [
      'Valid Aadhaar & PAN details',
      'Recent passport-sized photograph',
      'Active communication channels (Phone & Email)',
      'Salary slips from the preceding 3 months',
      'Bank records covering the last 6 months',
      'Corporate email address',
    ],
  },
  {
    slug: 'business-loans',
    Icon: FaBuilding,
    title: 'Business Loans (Proprietorship)',
    tagline: 'Catalyze Your Enterprise Expansion',
    desc: 'Scale your operations, balance cash reserves, or seize fresh market prospects with accessible commercial financing up to ₹70 Lakhs.',
    features: [
      { Icon: FaMoneyBillWave, label: 'Credit limits up to ₹70 Lakhs' },
      { Icon: FaBolt,          label: 'Rapid Clearance & Funding' },
      { Icon: FaChartBar,      label: 'Elevated Sanction Probabilities' },
      { Icon: FaUniversity,    label: 'Alliances with 120+ Lenders' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986810/Layer_21_rfhylr.png',
    gradient: 'linear-gradient(135deg,#060d1a,#7a3200 60%,#92400e)',
    accent: '#d97706',
    detailedDesc: 'Catalyze Your Enterprise Expansion. Whether you are scaling up, optimizing operational cash, or investing in new ventures, our commercial financing solutions provide the necessary leverage to succeed.',
    benefits: [
      'Acquire funding up to ₹70 Lakhs',
      'Expedited review and payout',
      'Optimized chances of approval',
      'Collaborations with 120+ banking entities',
      'Favorable interest structures',
      'Enhanced likelihood of sanctioning',
      'Intelligent lender matching algorithm',
      'Expert commercial advisory',
    ],
    howItWorks: [
      'Initiate contact with our specialists',
      'Supply the necessary commercial records',
      'Undergo professional eligibility screening',
      'Selection of the most suitable lender',
      'Swift sanction and fund transfer',
    ],
    requirements: [
      'Aadhaar & PAN identification',
      'Recent photograph and contact details',
      'Applicable licenses (Udyam / GST / Labour)',
      'Visuals of the commercial premises',
      'Full year of bank statements (Digital)',
      'Latest Tax Returns (if filed)',
      'Proof of residence or lease agreement',
      'Two professional references',
    ],
    branch: true,
  },
  {
    slug: 'insurance',
    Icon: FaShieldAlt,
    title: 'Insurance Services',
    tagline: 'Safeguard Your Most Valuable Assets',
    desc: 'We assist you in fortifying your future via dependable coverage solutions through our alliances with IRDA-certified entities. We provide an array of tailored policies—guaranteeing monetary safety, tranquility, and sustained security.',
    features: [
      { Icon: FaShieldAlt,    label: 'Medical Coverage' },
      { Icon: FaCheckCircle,  label: 'Life Assurance' },
      { Icon: FaStar,         label: 'Term Policies' },
      { Icon: FaClock,        label: 'Comprehensive Insurance' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_23_ebzlts.png',
    gradient: 'linear-gradient(135deg,#060d1a,#065f46 60%,#0d7a58)',
    accent: '#10b981',
    detailedDesc: 'We assist you in fortifying your future via dependable coverage solutions through our alliances with IRDA-certified entities. We provide an array of tailored policies—guaranteeing monetary safety, tranquility, and sustained security.\n\n🏥 Medical Coverage — Cash-free treatments, individual & family setups, severe illness inclusions, and budget-friendly premiums.\n\n❤️ Life Assurance — Monetary defense for dependents, sustained wealth safeguarding, adaptable terms, and credible plans from elite providers.\n\n🌐 Comprehensive Insurance — Automotive policies (Two/Four wheelers), property shielding, transit coverage, and enterprise risk solutions.\n\n📈 Term Policies — Peak coverage at the lowest expenditure, perfect for safeguarding income, straightforward and clear agreements.\n\nYour Security. Your Tomorrow. Our Commitment.',
    benefits: [
      'Collaborations with IRDA Vetted Institutions',
      'Specialized advisory and plan contrast',
      'Frictionless paperwork process',
      'Rapid issuance and ongoing support',
      'Policies tailored to exact requirements',
      'Cash-free medical admissions',
      'Automotive, real estate, and transit coverage',
      'Peak defense at minimal cost (Term)',
    ],
    howItWorks: [
      'Reach out or visit a location',
      'Consult with our coverage specialists',
      'Evaluate offerings from premier IRDA insurers',
      'Select the optimal protection tier',
      'Finalize KYC and premium payment',
      'Obtain policy credentials immediately',
    ],
    requirements: [
      'Legitimate state ID (PAN / Aadhaar)',
      'Verification of age',
      'Health assessments (if mandated)',
      'Vehicle registration (for auto policies)',
      'Beneficiary information',
    ],
    branch: true,
  },
  {
    slug: 'cash-deposit',
    Icon: FaUniversity,
    title: 'Cash Deposit',
    tagline: 'Rapid & Secure Bank Deposits',
    desc: 'Swift and safeguarded cash lodging services into any Indian bank account, complete with instant validation and live tracking.',
    features: [
      { Icon: FaBolt,          label: 'Immediate Lodgement' },
      { Icon: FaUniversity,    label: 'Universal Compatibility' },
      { Icon: FaLock,          label: 'Protected Mechanism' },
      { Icon: FaMoneyBillWave, label: 'Economical Tariffs' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986807/Cash_Deposit_iqi1gr.png',
    gradient: 'linear-gradient(135deg,#060d1a,#1a365d 60%,#2b4a8a)',
    accent: '#2b77e6',
    detailedDesc: 'Lodge physical currency into any nationwide bank account rapidly and securely. Our lodgement facility guarantees your funds arrive at their destination promptly, accompanied by a full digital receipt and confirmation.',
    benefits: [
      'Immediate validation of lodgement',
      'Compatible with all domestic banks',
      'Secure, encrypted transfer pipelines',
      'Highly economical transaction levies',
      'Live status monitoring',
      'Comprehensive digital receipts',
    ],
    howItWorks: [
      'Drop by our nearest hub',
      'Supply the destination account specifics',
      'Provide the physical currency',
      'Pass necessary verifications',
      'Obtain immediate deposit confirmation',
    ],
    requirements: [
      'Destination account digits and IFSC',
      'Legitimate identity document',
      'The physical cash to be lodged',
      'Mobile device for authentication',
    ],
  },
  {
    slug: 'cibil-score',
    Icon: FaChartBar,
    title: 'CIBIL Score Check & Repair',
    tagline: 'Elevate Your Credit Standing with Specialists',
    desc: 'Facing loan denials? Subpar credit rating? Encountering financial hurdles? Relax — we address it expertly with swift, clear, and effective strategies.',
    features: [
      { Icon: FaBolt,        label: 'Comprehensive Bureau Review' },
      { Icon: FaGem,         label: 'Specialist-Led Journey' },
      { Icon: FaChartBar,    label: 'Rapid Enhancements' },
      { Icon: FaCheckCircle, label: 'Dependable Assistance' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986813/Layer_26_nxw11o.png',
    gradient: 'linear-gradient(135deg,#060d1a,#7a0a2a 60%,#9b1239)',
    accent: '#f43f5e',
    detailedDesc: 'Struggling with loan rejections or a damaged credit rating? 1 Step Finance Care manages it with professional acumen. We evaluate data across all primary bureaus: CIBIL, Experian, Equifax, and CRIF for an exhaustive assessment. Rapid • Clear • Effective Strategies. We offer a fully supervised journey to facilitate quick rating enhancements.',
    benefits: [
      'In-depth CIBIL evaluation',
      'Experian standing assessment',
      'Equifax profile review',
      'CRIF High Mark examination',
      'All-encompassing multi-bureau check',
      'Fully supervised restoration journey',
      'Potential for rapid score elevation',
      'Dependable expert consultation',
    ],
    howItWorks: [
      'Connect with us online or at a hub',
      'Provide information for the initial pull',
      'Obtain a comprehensive multi-bureau diagnostic',
      'Receive professional insights on your standing',
      'Acquire a custom restoration roadmap',
    ],
    requirements: [
      'Valid PAN or Aadhaar documentation',
      'Active linked mobile device',
      'Fundamental personal information',
      'Explicit authorization for credit pulls',
    ],
  },
  {
    slug: 'new-credit-card',
    Icon: FaCreditCard,
    title: 'New Credit Cards',
    tagline: 'Optimal Cards Tailored to You',
    desc: 'File for premium credit cards that align with your expenditure habits, securing rapid approvals from elite banking institutions.',
    features: [
      { Icon: FaUniversity,  label: 'All Premier Banks' },
      { Icon: FaBolt,        label: 'Rapid Clearance' },
      { Icon: FaStar,        label: 'Superior Perks' },
      { Icon: FaCheckCircle, label: 'Zero-Fee Variants' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986809/copy_8_khzlf7.png',
    gradient: 'linear-gradient(135deg,#060d1a,#1a365d 60%,#2b4a8a)',
    accent: '#2b77e6',
    detailedDesc: 'Locate the ideal credit card for your daily life. We scrutinize your spending habits and financial standing to suggest top-tier cards boasting maximum rewards, rebates, and privileges across all major banks.',
    benefits: [
      'Customized card suggestions',
      'Rapid digital sanctioning',
      'Elite rewards and rebate structures',
      'Variants lacking annual charges',
      'Cards with lifetime validity',
      'Lucrative introductory bonuses',
    ],
    howItWorks: [
      'Detail your expenditure habits',
      'Review customized card suggestions',
      'Select your desired product',
      'Finalize the digital application',
      'Card delivered within 7 business days',
    ],
    requirements: [
      'Legitimate PAN documentation',
      'Aadhaar credentials',
      'Verification of income',
      'Minimum age threshold of 21',
      'Solid credit rating (700+)',
    ],
  },
  {
    slug: 'bank-account',
    Icon: FaIdCard,
    title: 'Bank Account Opening',
    tagline: 'Frictionless Account Establishment',
    desc: 'Establish a savings or checking account with prominent banks smoothly, requiring minimal paperwork and featuring doorstep facilitation.',
    features: [
      { Icon: FaCheckCircle,  label: 'Zero-Balance Variants' },
      { Icon: FaUniversity,   label: 'All Elite Banks' },
      { Icon: FaBolt,         label: 'Rapid Processing' },
      { Icon: FaMapMarkerAlt, label: 'At-Home Facilitation' },
    ],
    img: 'https://res.cloudinary.com/dgyykbmt6/image/upload/q_auto/f_auto/v1775986811/Layer_25_z5scod.png',
    gradient: 'linear-gradient(135deg,#060d1a,#065f46 60%,#0d7a58)',
    accent: '#10b981',
    detailedDesc: 'Launch an account with elite banks without the inconvenience of branch visits. Our at-home facilitation guarantees your account is activated swiftly utilizing minimal paperwork and digital verification.',
    benefits: [
      'At-home account establishment',
      'Availability of zero-balance accounts',
      'Access to all prominent banking entities',
      'Swift activation under 24 hours',
      'Entirely digital verification process',
      'Immediate issuance of debit credentials',
    ],
    howItWorks: [
      'Select your desired banking institution',
      'Provide documents digitally or in-person',
      'Conclude a video verification session',
      'Account goes live within a day',
      'Acquire your welcome package and card',
    ],
    requirements: [
      'Legitimate Aadhaar documentation',
      'PAN credentials',
      'Recent passport photograph',
      'Mobile device synced with Aadhaar',
      'Opening deposit (where mandated)',
    ],
  },
]

const stats = [
  { value: '2 Min', label: 'Processing Time' },
  { value: '5K+', label: 'Happy Customers' },
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
              <a href="https://wa.me/919581611711?text=Hi%201 Step Finance Care%2C%20I%20need%20help%20with%20your%20services." target="_blank" rel="noopener noreferrer" className="btn-wa"><FaWhatsapp size={16} /> WhatsApp</a>
              <a href="tel:+919581611711" className="btn-call"><FaPhone size={14} /> Call Now</a>
            </div>
          </div>

          <div className="product-hero-visual">
            <div className="product-hero-ring-wrap">
              {/* Outer ring — half purple half crimson with dots */}
              <svg className="product-hero-ring-svg" viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Half purple arc */}
                <path d="M 190 10 A 180 180 0 0 1 370 190" stroke="#0d1f3d" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9"/>
                <path d="M 370 190 A 180 180 0 0 1 190 370" stroke="#0d1f3d" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5"/>
                {/* Half crimson arc */}
                <path d="M 190 370 A 180 180 0 0 1 10 190" stroke="#1a365d" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9"/>
                <path d="M 10 190 A 180 180 0 0 1 190 10" stroke="#1a365d" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5"/>
                {/* Connecting dots */}
                {[0,30,60,90,120,150,180,210,240,270,300,330].map((angle, i) => {
                  const rad = (angle * Math.PI) / 180
                  const x = 190 + 180 * Math.cos(rad)
                  const y = 190 + 180 * Math.sin(rad)
                  const isPurple = angle >= 0 && angle < 180
                  return (
                    <circle key={i} cx={x} cy={y} r={angle % 90 === 0 ? 5 : 3}
                      fill={isPurple ? '#7c3aed' : '#254a7c'}
                      opacity={angle % 90 === 0 ? 1 : 0.7}
                    />
                  )
                })}
                {/* Glow dots at transition points */}
                <circle cx="190" cy="10" r="6" fill="#d4af37" opacity="0.9"/>
                <circle cx="190" cy="370" r="6" fill="#d4af37" opacity="0.9"/>
              </svg>
              {/* Inner reverse ring */}
              <svg className="product-hero-ring-svg-reverse" viewBox="0 0 364 364" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="182" cy="182" r="174" stroke="rgba(212,175,55,0.15)" strokeWidth="1" strokeDasharray="6 10"/>
              </svg>
              <div className="product-hero-image-wrap">
                <img src={product.img} alt={product.title} />
                <div className="product-hero-img-glow" />
              </div>
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
          {product.branch && (
            <div className="pd-branch-banner">
              <div className="pd-branch-glow" />
              <div className="pd-branch-content">
                <span className="pd-branch-icon">🏢</span>
                <div>
                  <h3>Visit Our Branch Today</h3>
                  <p>Kadapa, Andhra Pradesh</p>
                </div>
                <div className="pd-branch-actions">
                  <a href="https://wa.me/919581611711?text=Hi%201 Step Finance Care%2C%20I%20want%20to%20visit%20your%20branch." target="_blank" rel="noopener noreferrer" className="pd-branch-btn pd-branch-wa">💬 WhatsApp</a>
                  <a href="tel:+919581611711" className="pd-branch-btn pd-branch-call">📞 Call Now</a>
                </div>
              </div>
            </div>
          )}
          <div className="pd-cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Contact us today and experience the convenience of our services</p>
            <div className="cta-actions">
              <Link to="/contact" className="btn-primary">Contact Us Now</Link>
              <a href="https://wa.me/919581611711?text=Hi%201 Step Finance Care%2C%20I%20need%20help%20with%20your%20services." target="_blank" rel="noopener noreferrer" className="btn-wa btn-wa-lg"><FaWhatsapp size={18} /> Chat on WhatsApp</a>
              <a href="tel:+919581611711" className="btn-call btn-call-lg"><FaPhone size={15} /> Call Us Now</a>
              <Link to="/what-we-do" className="btn-outline">View All Services</Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
