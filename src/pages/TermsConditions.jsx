import './TermsConditions.css'

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using MoneySpot's website and services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services. MoneySpot reserves the right to update these terms at any time without prior notice.`,
  },
  {
    title: '2. Services Offered',
    content: `MoneySpot provides the following financial services:
• Spot Cash on Credit Card — Instant cash against your credit card limit
• Credit Card Bill Payment — Pay any credit card bill instantly
• Domestic Money Transfer (DMT) — Send money to any bank account via IMPS
• Aadhaar Cash Withdrawal — Biometric-based cash withdrawal
• Personal & Business Loans — Through partner banks and NBFCs
• Insurance Services — Life, health, and vehicle insurance
• CIBIL Score Check & Repair — Credit score analysis and improvement
• Bank Account Opening — Savings and current account facilitation
• New Credit Card Applications — Card recommendations and applications`,
  },
  {
    title: '3. Eligibility',
    content: `To use MoneySpot services, you must:
• Be at least 18 years of age
• Be a resident of India
• Possess valid government-issued identification (Aadhaar, PAN, etc.)
• Have a valid and active bank account
• Provide accurate and truthful information during registration and transactions`,
  },
  {
    title: '4. User Responsibilities',
    content: `You agree to:
• Provide accurate, current, and complete information
• Maintain the confidentiality of your account credentials
• Not use our services for any illegal, fraudulent, or unauthorized purpose
• Not attempt to reverse-engineer, hack, or disrupt our systems
• Comply with all applicable laws and regulations
• Immediately notify us of any unauthorized use of your account`,
  },
  {
    title: '5. Fees & Charges',
    content: `MoneySpot charges service fees for certain transactions. All applicable fees are:
• Clearly communicated before you confirm any transaction
• Non-refundable once a transaction is successfully processed
• Subject to change with prior notice on our website
• Inclusive of applicable taxes as per government regulations

We do not charge any hidden fees. What you see is what you pay.`,
  },
  {
    title: '6. Transaction Processing',
    content: `All transactions are subject to:
• Verification and authentication procedures
• Availability of funds in the source account
• Compliance with RBI guidelines and applicable regulations
• Network availability and third-party service provider uptime

MoneySpot is not liable for delays caused by bank processing times, network outages, or force majeure events.`,
  },
  {
    title: '7. Privacy & Data Protection',
    content: `MoneySpot is committed to protecting your personal information. We:
• Collect only the data necessary to provide our services
• Do not sell or share your personal data with unauthorized third parties
• Use bank-grade SSL encryption for all data transmission
• Comply with applicable data protection laws
• Retain data only as long as required by law or business necessity

Please refer to our Privacy Policy for detailed information on data handling.`,
  },
  {
    title: '8. Limitation of Liability',
    content: `MoneySpot shall not be liable for:
• Any indirect, incidental, or consequential damages
• Loss of profits, data, or business opportunities
• Unauthorized access to your account due to your negligence
• Failures caused by third-party service providers (banks, payment gateways)
• Delays or failures due to circumstances beyond our reasonable control

Our total liability in any case shall not exceed the amount of the transaction in dispute.`,
  },
  {
    title: '9. Intellectual Property',
    content: `All content on the MoneySpot website including logos, text, graphics, and software is the exclusive property of MoneySpot and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.`,
  },
  {
    title: '10. Termination',
    content: `MoneySpot reserves the right to suspend or terminate your access to our services at any time, without notice, if:
• You violate these Terms and Conditions
• We suspect fraudulent or illegal activity
• Required by law or regulatory authorities
• You provide false or misleading information

Upon termination, all pending transactions will be processed or refunded as applicable.`,
  },
  {
    title: '11. Governing Law & Dispute Resolution',
    content: `These Terms and Conditions are governed by the laws of India. Any disputes arising from the use of MoneySpot services shall be subject to the exclusive jurisdiction of the courts in India. We encourage users to first contact our support team to resolve disputes amicably before pursuing legal action.`,
  },
  {
    title: '12. Contact Us',
    content: `For any questions, concerns, or complaints regarding these Terms and Conditions, please contact us:

Email: support@moneyspotfintech.com
Phone: Available on our Contact page
Address: As listed on our official website

We aim to respond to all queries within 2 business hours during working days.`,
  },
]

export default function TermsConditions() {
  return (
    <div className="tc-page">
      <div className="tc-hero">
        <div className="tc-orb tc-orb-1" />
        <div className="tc-orb tc-orb-2" />
        <div className="tc-hero-inner">
          <div className="tc-pill">Legal</div>
          <h1>Terms & <span className="tc-gold">Conditions</span></h1>
          <p>Last updated: June 2025 &nbsp;·&nbsp; Effective immediately</p>
        </div>
      </div>

      <div className="tc-content">
        <div className="tc-intro">
          Welcome to MoneySpot. Please read these Terms and Conditions carefully before using our services. These terms constitute a legally binding agreement between you and MoneySpot Fintech.
        </div>

        <div className="tc-sections">
          {sections.map((s) => (
            <div className="tc-section" key={s.title}>
              <h2>{s.title}</h2>
              <p>{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
