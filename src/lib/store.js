/**
 * Local data store — stores all data in localStorage.
 * Swap the supabase.js client in when you have your Supabase credentials.
 */

const KEY_LEADS     = 'flp_leads'
const KEY_ACTIVITIES = 'flp_activities'
const KEY_FOLLOWUPS  = 'flp_followups'
const KEY_TEMPLATES  = 'flp_templates'
const KEY_FOLDERS    = 'flp_template_folders'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function uid() {
  return crypto.randomUUID()
}
function now() {
  return new Date().toISOString()
}
function load(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}
function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

// ─── LEADS ──────────────────────────────────────────────────────────────────
export function getLeads() {
  return load(KEY_LEADS).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}
export function getLead(id) {
  return load(KEY_LEADS).find(l => l.id === id) || null
}
export function createLead(data) {
  const leads = load(KEY_LEADS)
  const lead = { id: uid(), created_at: now(), updated_at: now(), ...data }
  save(KEY_LEADS, [lead, ...leads])
  return lead
}
export function updateLead(id, data) {
  const leads = load(KEY_LEADS).map(l =>
    l.id === id ? { ...l, ...data, updated_at: now() } : l
  )
  save(KEY_LEADS, leads)
  return leads.find(l => l.id === id)
}
export function deleteLead(id) {
  save(KEY_LEADS, load(KEY_LEADS).filter(l => l.id !== id))
  save(KEY_ACTIVITIES, load(KEY_ACTIVITIES).filter(a => a.lead_id !== id))
  save(KEY_FOLLOWUPS,  load(KEY_FOLLOWUPS).filter(f => f.lead_id !== id))
}

// ─── ACTIVITIES ─────────────────────────────────────────────────────────────
export function getActivities(lead_id) {
  return load(KEY_ACTIVITIES)
    .filter(a => a.lead_id === lead_id)
    .sort((a, b) => new Date(b.activity_date) - new Date(a.activity_date))
}
export function createActivity(data) {
  const items = load(KEY_ACTIVITIES)
  const item = { id: uid(), created_at: now(), activity_date: now(), ...data }
  save(KEY_ACTIVITIES, [item, ...items])
  // update lead last_contacted_at
  updateLead(data.lead_id, { last_contacted_at: item.activity_date })
  return item
}
export function deleteActivity(id) {
  save(KEY_ACTIVITIES, load(KEY_ACTIVITIES).filter(a => a.id !== id))
}

// ─── FOLLOWUPS ──────────────────────────────────────────────────────────────
export function getFollowUps(filters = {}) {
  let items = load(KEY_FOLLOWUPS)
  if (filters.lead_id) items = items.filter(f => f.lead_id === filters.lead_id)
  if (filters.status)  items = items.filter(f => f.status === filters.status)
  return items.sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
}
export function createFollowUp(data) {
  const items = load(KEY_FOLLOWUPS)
  const item = { id: uid(), created_at: now(), status: 'pending', ...data }
  save(KEY_FOLLOWUPS, [item, ...items])
  return item
}
export function updateFollowUp(id, data) {
  const items = load(KEY_FOLLOWUPS).map(f =>
    f.id === id ? { ...f, ...data } : f
  )
  save(KEY_FOLLOWUPS, items)
  return items.find(f => f.id === id)
}
export function deleteFollowUp(id) {
  save(KEY_FOLLOWUPS, load(KEY_FOLLOWUPS).filter(f => f.id !== id))
}

// ─── HOT LEAD AUTOPILOT ──────────────────────────────────────────────────────
// Returns how many hot follow-up cycles have been completed for this lead
export function getHotStreak(leadId) {
  return load(KEY_FOLLOWUPS).filter(
    f => f.lead_id === leadId && f.hot_auto === true && f.status === 'done'
  ).length
}

// Returns true if the lead already has a pending hot auto follow-up
export function hasPendingHotFollowUp(leadId) {
  return load(KEY_FOLLOWUPS).some(
    f => f.lead_id === leadId && f.hot_auto === true && f.status === 'pending'
  )
}

// Creates today's (or tomorrow's) hot follow-up for a lead.
// daysFromNow = 0 → today, 1 → tomorrow, etc.
export function scheduleHotFollowUp(leadId, daysFromNow = 0) {
  const streak = getHotStreak(leadId)
  const day = streak + 1
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  d.setHours(9, 0, 0, 0) // 9 AM
  const notes = day >= 7
    ? `🎯 Day ${day} — Push hard for appointment! Call if no reply to message.`
    : `🔥 Hot lead check-in (Day ${day}) — message or call to keep warm.`
  return createFollowUp({
    lead_id: leadId,
    type: 'whatsapp',
    due_date: d.toISOString(),
    notes,
    hot_auto: true,
    hot_day: day,
  })
}

// Auto-ensures all hot leads have a pending follow-up (call on app load)
export function ensureHotLeadFollowUps() {
  const leads = load(KEY_LEADS).filter(l => l.lead_temp === 'hot')
  leads.forEach(lead => {
    if (!hasPendingHotFollowUp(lead.id)) {
      scheduleHotFollowUp(lead.id, 0)
    }
  })
}

// Mark a hot follow-up done and handle the outcome:
// outcome: 'continue' | 'appointment' | 'cold'
export function resolveHotFollowUp(followUpId, outcome) {
  const f = load(KEY_FOLLOWUPS).find(x => x.id === followUpId)
  if (!f) return
  updateFollowUp(followUpId, { status: 'done', resolved_outcome: outcome, resolved_at: now() })
  if (outcome === 'continue') {
    scheduleHotFollowUp(f.lead_id, 1) // tomorrow
  } else if (outcome === 'appointment') {
    updateLead(f.lead_id, { pipeline_stage: 'appointment_set', lead_temp: 'warm' })
  } else if (outcome === 'cold') {
    updateLead(f.lead_id, { lead_temp: 'cold', went_cold_at: now() })
  }
}

// ─── TEMPLATES ──────────────────────────────────────────────────────────────
export function getTemplates(filters = {}) {
  let items = load(KEY_TEMPLATES)
  if (!items.length) {
    items = getDefaultTemplates()
    save(KEY_TEMPLATES, items)
  }
  if (filters.category) items = items.filter(t => t.category === filters.category)
  if (filters.market && filters.market !== 'all')
    items = items.filter(t => t.market === 'all' || t.market === filters.market)
  return items
}
export function createTemplate(data) {
  const items = load(KEY_TEMPLATES)
  const item = { id: uid(), created_at: now(), ...data }
  save(KEY_TEMPLATES, [item, ...items])
  return item
}
export function updateTemplate(id, data) {
  const items = load(KEY_TEMPLATES).map(t =>
    t.id === id ? { ...t, ...data } : t
  )
  save(KEY_TEMPLATES, items)
}
export function deleteTemplate(id) {
  save(KEY_TEMPLATES, load(KEY_TEMPLATES).filter(t => t.id !== id))
}

// ─── TEMPLATE FOLDERS ────────────────────────────────────────────────────────
export function getFolders() {
  return load(KEY_FOLDERS).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
}
export function createFolder(name) {
  const folders = load(KEY_FOLDERS)
  const folder = { id: uid(), created_at: now(), name }
  save(KEY_FOLDERS, [...folders, folder])
  return folder
}
export function updateFolder(id, name) {
  const folders = load(KEY_FOLDERS).map(f => f.id === id ? { ...f, name } : f)
  save(KEY_FOLDERS, folders)
}
export function deleteFolder(id) {
  save(KEY_FOLDERS, load(KEY_FOLDERS).filter(f => f.id !== id))
  // move templates in this folder back to General
  const templates = load(KEY_TEMPLATES).map(t =>
    t.folder_id === id ? { ...t, folder_id: null } : t
  )
  save(KEY_TEMPLATES, templates)
}

// ─── Default template seed ───────────────────────────────────────────────────
function getDefaultTemplates() {
  return [
    {
      id: uid(), created_at: now(),
      name: 'Cold Intro – SG Investor', category: 'cold', market: 'sg',
      body: `Hi {name}! 👋 I'm from FLP, specialising in Singapore investment properties.

I noticed you may be looking for a strong investment opportunity. I currently have some high-yield condos in {area} with rental returns of 3–4% p.a. and good capital appreciation potential.

Would you be open to a quick 10-min chat this week? 😊`
    },
    {
      id: uid(), created_at: now(),
      name: 'Cold Intro – SG Self-Stay', category: 'cold', market: 'sg',
      body: `Hi {name}! 👋 My name is from FLP Property.

I have some great {property_type} units in {area} that might suit what you're looking for — great MRT access, good schools nearby and within your budget range.

Would love to share more details with you. Are you free for a quick chat? 🏠`
    },
    {
      id: uid(), created_at: now(),
      name: 'Cold Intro – MY Investor (JB/KL)', category: 'cold', market: 'my',
      body: `Hi {name}! 👋 I'm from FLP, covering investment properties in Malaysia — including Johor Bahru and KL.

With the RTS Link coming up and Iskandar development booming, there are some excellent early-mover opportunities right now.

Would you be keen to hear more? Happy to share details at your convenience 😊`
    },
    {
      id: uid(), created_at: now(),
      name: 'Cross-Border – SG Buying MY', category: 'cross_border', market: 'both',
      body: `Hi {name}! 👋 Thinking of investing in Malaysia?

Great news — as a Singapore resident, you can own Malaysian properties with zero ABSD! Properties in Johor Iskandar are currently priced from RM{price}, with strong rental demand and capital upside.

Shall I send you a curated shortlist? 😊`
    },
    {
      id: uid(), created_at: now(),
      name: 'Cross-Border – MY Buying SG', category: 'cross_border', market: 'both',
      body: `Hi {name}! 👋 Interested in Singapore property?

As a Malaysian investor, Singapore's market offers excellent stability and long-term growth. Key things to note: foreigners pay 60% ABSD, so we'll need to factor that into ROI calculations.

I have some options that still make strong financial sense — want me to walk you through the numbers? 📊`
    },
    {
      id: uid(), created_at: now(),
      name: 'Warm Follow-Up – Listings Ready', category: 'warm', market: 'all',
      body: `Hi {name}! 😊 Hope you're doing well!

I've shortlisted a few properties based on what you're looking for — {property_type} in {area}.

1️⃣ {listing_1}
2️⃣ {listing_2}
3️⃣ {listing_3}

Let me know which one catches your eye and we can arrange a viewing! 🏠`
    },
    {
      id: uid(), created_at: now(),
      name: 'Appointment Confirmation', category: 'appointment', market: 'all',
      body: `Hi {name}! ✅ Just confirming our viewing appointment:

📅 Date: {date}
⏰ Time: {time}
📍 Location: {location}

I'll be there 10 mins early to brief you before we go in. See you then! 😊`
    },
    {
      id: uid(), created_at: now(),
      name: 'Post-Viewing Follow-Up', category: 'post_viewing', market: 'all',
      body: `Hi {name}! Great to meet you today at {location} 😊

What did you think of the unit? I felt it ticked a lot of your boxes!

Are you keen to move forward, or would you like to see a few more options first? Happy to help either way!`
    },
    {
      id: uid(), created_at: now(),
      name: 'Investor – ROI Breakdown (SG)', category: 'investor', market: 'sg',
      body: `Hi {name}! 📊 Quick ROI snapshot for {property}:

💰 Purchase Price: SGD {price}
🏠 Est. Rental: SGD {rental}/mo
📈 Gross Yield: {yield}% p.a.
📊 ABSD (your profile): SGD {absd}

Want me to put together a full cash flow analysis? 🙌`
    },
    {
      id: uid(), created_at: now(),
      name: 'First Timer – SG Guide', category: 'cold', market: 'sg',
      body: `Hi {name}! Congrats on starting your property journey! 🎉

As a first-time buyer in Singapore:
✅ No ABSD on your first property
✅ CPF OA can be used for down payment
✅ HDB grants up to SGD 80,000
📊 TDSR limit: 55% of gross monthly income

I'd love to walk you through the full process! Want to set up a quick call? 😊`
    },
    {
      id: uid(), created_at: now(),
      name: 'Market Update – SG Monthly', category: 'market_update', market: 'sg',
      body: `Hi {name}! 👋 Your monthly Singapore property update:

📊 Private residential prices: {trend}
🏗️ New launches: {launches}
💡 District to watch: {district}
📉 Rental market: {rental_trend}

Anything you'd like me to keep an eye out for? 😊`
    },
    {
      id: uid(), created_at: now(),
      name: 'Market Update – JB/Iskandar', category: 'market_update', market: 'my',
      body: `Hi {name}! 👋 Johor/Iskandar market update:

🚇 RTS Link update: {rts_update}
🏗️ New launches: {launches}
📊 Price trend: {trend}
💡 Hotspot: {area}

Great time to revisit some options! Want fresh listings? 😊`
    },
  ]
}
