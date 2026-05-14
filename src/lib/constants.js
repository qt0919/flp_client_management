// ─── Lead Temperature ────────────────────────────────────────────────────────
export const LEAD_TEMPS = [
  { value: 'cold', label: 'Cold', className: 'badge-cold' },
  { value: 'warm', label: 'Warm', className: 'badge-warm' },
  { value: 'hot',  label: 'Hot',  className: 'badge-hot'  },
]

// ─── Market ───────────────────────────────────────────────────────────────────
export const MARKETS = [
  { value: 'sg',   label: 'Singapore', className: 'badge-sg' },
  { value: 'my',   label: 'Malaysia',  className: 'badge-my' },
  { value: 'both', label: 'Both',      className: 'badge-both' },
]

// ─── Ownership Type ──────────────────────────────────────────────────────────
export const OWNERSHIP_TYPES = [
  { value: 'bumi',       label: 'Bumi',       className: 'badge-bumi' },
  { value: 'non_bumi',   label: 'Non-Bumi',   className: 'badge-non_bumi' },
  { value: 'foreigner',  label: 'Foreigner',  className: 'badge-foreigner' },
]

// ─── Customer Type ───────────────────────────────────────────────────────────
export const CUSTOMER_TYPES = [
  { value: 'investor',    label: 'Investor' },
  { value: 'self_stay',   label: 'Self Stay' },
  { value: 'upgrader',    label: 'Upgrader' },
  { value: 'downgrader',  label: 'Downgrader' },
  { value: 'first_timer', label: 'First Timer' },
]

// ─── Pipeline Stages ─────────────────────────────────────────────────────────
export const PIPELINE_STAGES = [
  { value: 'new_lead',          label: 'New Lead',          color: 'bg-gray-100 text-gray-700' },
  { value: 'first_touch',       label: 'First Touch',       color: 'bg-blue-100 text-blue-700' },
  { value: 'engaged',           label: 'Engaged',           color: 'bg-indigo-100 text-indigo-700' },
  { value: 'qualified',         label: 'Qualified',         color: 'bg-purple-100 text-purple-700' },
  { value: 'listings_sent',     label: 'Listings Sent',     color: 'bg-yellow-100 text-yellow-700' },
  { value: 'appointment_set',   label: 'Appt Set',          color: 'bg-orange-100 text-orange-700' },
  { value: 'appointment_done',  label: 'Appt Done',         color: 'bg-pink-100 text-pink-700' },
  { value: 'offer_stage',       label: 'Offer Stage',       color: 'bg-rose-100 text-rose-700' },
  { value: 'closed_won',        label: 'Closed Won',        color: 'bg-green-100 text-green-700' },
  { value: 'closed_lost',       label: 'Closed Lost',       color: 'bg-red-100 text-red-700' },
  { value: 'nurture',           label: 'Nurture',           color: 'bg-teal-100 text-teal-700' },
]

// ─── Lead Sources ─────────────────────────────────────────────────────────────
export const LEAD_SOURCES = [
  { value: 'referral',       label: 'Referral' },
  { value: 'propertyguru',   label: 'PropertyGuru' },
  { value: '99co',           label: '99.co' },
  { value: 'iproperty',      label: 'iProperty' },
  { value: 'social_media',   label: 'Social Media' },
  { value: 'cold_call',      label: 'Cold Call' },
  { value: 'event',          label: 'Event / Exhibition' },
  { value: 'walk_in',        label: 'Walk-in' },
  { value: 'other',          label: 'Other' },
]

// ─── Property Types (SG) ─────────────────────────────────────────────────────
export const PROPERTY_TYPES_SG = [
  { value: 'hdb',           label: 'HDB' },
  { value: 'ec',            label: 'Executive Condo (EC)' },
  { value: 'condo',         label: 'Private Condo' },
  { value: 'landed',        label: 'Landed' },
  { value: 'commercial_sg', label: 'Commercial' },
]

// ─── Property Types (MY) ─────────────────────────────────────────────────────
export const PROPERTY_TYPES_MY = [
  { value: 'condo_my',         label: 'Condominium' },
  { value: 'serviced_apt',     label: 'Serviced Apartment' },
  { value: 'soho',             label: 'SOHO' },
  { value: 'terrace',          label: 'Terrace / Link House' },
  { value: 'semi_d',           label: 'Semi-D' },
  { value: 'bungalow',         label: 'Bungalow' },
  { value: 'commercial_my',    label: 'Commercial' },
  { value: 'industrial',       label: 'Industrial' },
]

// ─── SG Districts ────────────────────────────────────────────────────────────
export const SG_DISTRICTS = [
  { value: 'D01', label: 'D01 – Raffles / Marina', zone: 'CCR' },
  { value: 'D02', label: 'D02 – Chinatown / Tanjong Pagar', zone: 'CCR' },
  { value: 'D03', label: 'D03 – Alexandra / Queenstown', zone: 'RCR' },
  { value: 'D04', label: 'D04 – Harbourfront / Telok Blangah', zone: 'RCR' },
  { value: 'D05', label: 'D05 – Buona Vista / West Coast', zone: 'RCR' },
  { value: 'D06', label: 'D06 – City Hall / Clarke Quay', zone: 'CCR' },
  { value: 'D07', label: 'D07 – Beach Road / Bugis', zone: 'CCR' },
  { value: 'D08', label: 'D08 – Little India / Farrer Park', zone: 'RCR' },
  { value: 'D09', label: 'D09 – Orchard / River Valley', zone: 'CCR' },
  { value: 'D10', label: 'D10 – Bukit Timah / Holland', zone: 'CCR' },
  { value: 'D11', label: 'D11 – Newton / Novena', zone: 'CCR' },
  { value: 'D12', label: 'D12 – Toa Payoh / Balestier', zone: 'RCR' },
  { value: 'D13', label: 'D13 – Macpherson / Potong Pasir', zone: 'RCR' },
  { value: 'D14', label: 'D14 – Geylang / Eunos', zone: 'RCR' },
  { value: 'D15', label: 'D15 – East Coast / Katong', zone: 'RCR' },
  { value: 'D16', label: 'D16 – Bedok / Upper East Coast', zone: 'OCR' },
  { value: 'D17', label: 'D17 – Changi / Loyang', zone: 'OCR' },
  { value: 'D18', label: 'D18 – Pasir Ris / Tampines', zone: 'OCR' },
  { value: 'D19', label: 'D19 – Hougang / Punggol / Sengkang', zone: 'OCR' },
  { value: 'D20', label: 'D20 – Ang Mo Kio / Bishan', zone: 'RCR' },
  { value: 'D21', label: 'D21 – Clementi / Upper Bukit Timah', zone: 'OCR' },
  { value: 'D22', label: 'D22 – Jurong West', zone: 'OCR' },
  { value: 'D23', label: 'D23 – Bukit Panjang / Choa Chu Kang', zone: 'OCR' },
  { value: 'D24', label: 'D24 – Lim Chu Kang / Tengah', zone: 'OCR' },
  { value: 'D25', label: 'D25 – Kranji / Woodlands', zone: 'OCR' },
  { value: 'D26', label: 'D26 – Upper Thomson / Springleaf', zone: 'OCR' },
  { value: 'D27', label: 'D27 – Yishun / Sembawang', zone: 'OCR' },
  { value: 'D28', label: 'D28 – Seletar / Yio Chu Kang', zone: 'OCR' },
]

// ─── MY Areas ────────────────────────────────────────────────────────────────
export const MY_AREAS = [
  // KL
  { value: 'klcc',         label: 'KLCC',              region: 'Kuala Lumpur' },
  { value: 'mont_kiara',   label: 'Mont Kiara',        region: 'Kuala Lumpur' },
  { value: 'bangsar',      label: 'Bangsar',            region: 'Kuala Lumpur' },
  { value: 'cheras',       label: 'Cheras',             region: 'Kuala Lumpur' },
  { value: 'kepong',       label: 'Kepong',             region: 'Kuala Lumpur' },
  { value: 'kl_others',    label: 'KL (Others)',        region: 'Kuala Lumpur' },
  // Johor
  { value: 'jb_city',      label: 'JB City Centre',    region: 'Johor' },
  { value: 'iskandar',     label: 'Iskandar Puteri',   region: 'Johor' },
  { value: 'forest_city',  label: 'Forest City',       region: 'Johor' },
  { value: 'medini',       label: 'Medini',             region: 'Johor' },
  { value: 'austin',       label: 'Mount Austin',       region: 'Johor' },
  { value: 'johor_others', label: 'Johor (Others)',     region: 'Johor' },
]

// ─── Timeline Options ─────────────────────────────────────────────────────────
export const TIMELINES = [
  { value: 'immediate', label: 'Immediate (< 1 month)' },
  { value: '3mo',       label: '1–3 Months' },
  { value: '6mo',       label: '3–6 Months' },
  { value: '1yr',       label: '6–12 Months' },
  { value: 'browsing',  label: 'Just Browsing' },
]

// ─── Activity Types ───────────────────────────────────────────────────────────
export const ACTIVITY_TYPES = [
  { value: 'whatsapp',      label: 'WhatsApp' },
  { value: 'call',          label: 'Phone Call' },
  { value: 'appointment',   label: 'Appointment' },
  { value: 'listing_sent',  label: 'Listing Sent' },
  { value: 'note',          label: 'Note' },
  { value: 'blast',         label: 'Mass Blast' },
]

// ─── Follow-up Types ─────────────────────────────────────────────────────────
export const FOLLOWUP_TYPES = [
  { value: 'whatsapp',    label: 'WhatsApp' },
  { value: 'call',        label: 'Phone Call' },
  { value: 'appointment', label: 'Appointment' },
]
