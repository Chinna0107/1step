import { FaWhatsapp, FaPhone } from 'react-icons/fa'
import './FloatingContact.css'

const PHONE = '+919866440477'
const WA_LINK = `https://wa.me/${PHONE}?text=Hi%20MoneySpot%2C%20I%20need%20help%20with%20your%20services.`

export default function FloatingContact({ hidden }) {
  return (
    <div className={`floating-contact${hidden ? ' fc-hidden' : ''}`}>
      <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="fc-btn fc-whatsapp" aria-label="WhatsApp">
        <FaWhatsapp size={22} />
        <span>WhatsApp</span>
      </a>
      <a href={`tel:${PHONE}`} className="fc-btn fc-call" aria-label="Call Us">
        <FaPhone size={18} />
        <span>Call Us</span>
      </a>
    </div>
  )
}
