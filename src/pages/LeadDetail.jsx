import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getLead, updateLead, getActivities, createActivity, deleteActivity, getFollowUps, createFollowUp, updateFollowUp } from '../lib/store'
import { TempBadge, MarketBadge, OwnershipBadge, StageBadge } from '../components/Badges'
import { PIPELINE_STAGES, ACTIVITY_TYPES, FOLLOWUP_TYPES } from '../lib/constants'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import {
  Phone, MessageSquare, Calendar, FileText, Edit2, Trash2,
  Plus, Check, Clock, ChevronRight, ArrowLeft
} from 'lucide-react'

const ACTIVITY_ICONS = {
  whatsapp: MessageSquare,
  call: Phone,
  appointment: Calendar,
  listing_sent: FileText,
  note: FileText,
  blast: MessageSquare,
}

function waLink(phone, body = '') {
  const num = phone.replace(/\D/g, '')
  return `https://wa.me/${num}${body ? `?text=${encodeURIComponent(body)}` : ''}`
}

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState(() => getLead(id))
  const [activities, setActivities] = useState(() => getActivities(id))
  const [followups, setFollowups] = useState(() => getFollowUps({ lead_id: id }))

  // Activity log form
  const [actForm, setActForm] = useState({ type: 'whatsapp', content: '', outcome: '' })
  const [showActForm, setShowActForm] = useState(false)

  // Follow-up form
  const [fuForm, setFuForm] = useState({ type: 'whatsapp', due_date: '', notes: '' })
  const [showFuForm, setShowFuForm] = useState(false)

  if (!lead) return <div className="p-8 text-gray-500">Lead not found. <Link to="/leads" className="text-blue-600 underline">Back to leads</Link></div>

  const refreshAll = () => {
    setLead(getLead(id))
    setActivities(getActivities(id))
    setFollowups(getFollowUps({ lead_id: id }))
  }

  const changeStage = (stage) => {
    updateLead(id, { pipeline_stage: stage })
    setLead(prev => ({ ...prev, pipeline_stage: stage }))
  }

  const changeTemp = (temp) => {
    updateLead(id, { lead_temp: temp })
    setLead(prev => ({ ...prev, lead_temp: temp }))
  }

  const logActivity = () => {
    if (!actForm.content.trim()) return
    createActivity({ lead_id: id, ...actForm })
    setActForm({ type: 'whatsapp', content: '', outcome: '' })
    setShowActForm(false)
    refreshAll()
  }

  const addFollowUp = () => {
    if (!fuForm.due_date) return
    createFollowUp({ lead_id: id, ...fuForm })
    setFuForm({ type: 'whatsapp', due_date: '', notes: '' })
    setShowFuForm(false)
    setFollowups(getFollowUps({ lead_id: id }))
  }

  const markFuDone = (fuId) => {
    updateFollowUp(fuId, { status: 'done' })
    setFollowups(getFollowUps({ lead_id: id }))
  }

  const pendingFu = followups.filter(f => f.status === 'pending')

  return (
    <div className="max-w-5xl space-y-5">
      {/* Back */}
      <button onClick={() => navigate('/leads')} className="flex items-center gap-1 text-gray-500 hover:text-blue-700 text-sm mb-1">
        <ArrowLeft size={15} /> Back to Leads
      </button>

      {/* Header card */}
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <TempBadge value={lead.lead_temp} />
              <MarketBadge value={lead.market} />
              <OwnershipBadge value={lead.ownership_type} />
              <StageBadge value={lead.pipeline_stage} />
              {lead.customer_type && (
                <span className="badge bg-gray-100 text-gray-700 capitalize">{lead.customer_type.replace('_', ' ')}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <a href={waLink(lead.phone)} target="_blank" rel="noreferrer" className="btn-primary">
              <MessageSquare size={15} /> WhatsApp
            </a>
            <a href={`tel:${lead.phone}`} className="btn-secondary">
              <Phone size={15} /> Call
            </a>
            <Link to={`/leads/${id}/edit`} className="btn-secondary">
              <Edit2 size={15} /> Edit
            </Link>
          </div>
        </div>

        {/* Contact details */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-gray-400 text-xs uppercase font-semibold">Phone</p>
            <p className="font-medium">{lead.phone}</p>
          </div>
          {lead.email && (
            <div>
              <p className="text-gray-400 text-xs uppercase font-semibold">Email</p>
              <p className="font-medium">{lead.email}</p>
            </div>
          )}
          <div>
            <p className="text-gray-400 text-xs uppercase font-semibold">Source</p>
            <p className="font-medium capitalize">{lead.source?.replace('_', ' ')}</p>
          </div>
          {lead.assisted_by && (
            <div>
              <p className="text-gray-400 text-xs uppercase font-semibold">Assisted By</p>
              <p className="font-medium">{lead.assisted_by}</p>
            </div>
          )}
          <div>
            <p className="text-gray-400 text-xs uppercase font-semibold">Received</p>
            <p className="font-medium">{lead.date_received}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase font-semibold">Timeline</p>
            <p className="font-medium capitalize">{lead.timeline?.replace('_', ' ')}</p>
          </div>
          {lead.last_contacted_at && (
            <div>
              <p className="text-gray-400 text-xs uppercase font-semibold">Last Contact</p>
              <p className="font-medium">{formatDistanceToNow(new Date(lead.last_contacted_at), { addSuffix: true })}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Property interest + notes */}
        <div className="space-y-5">

          {/* SG interest */}
          {(lead.market === 'sg' || lead.market === 'both') && (
            <div className="card p-4 space-y-2">
              <h3 className="font-semibold text-blue-800 text-sm">🇸🇬 Singapore Interest</h3>
              {lead.property_type_sg?.length > 0 && <p className="text-xs text-gray-600">Types: {lead.property_type_sg.join(', ')}</p>}
              {lead.preferred_areas_sg?.length > 0 && <p className="text-xs text-gray-600">Districts: {lead.preferred_areas_sg.join(', ')}</p>}
              {(lead.budget_min_sgd || lead.budget_max_sgd) && (
                <p className="text-xs text-gray-600">
                  Budget: S${lead.budget_min_sgd?.toLocaleString() || '–'} – S${lead.budget_max_sgd?.toLocaleString() || '–'}
                </p>
              )}
              {lead.current_property_sg && <p className="text-xs text-gray-600">Current SG: {lead.current_property_sg}</p>}
            </div>
          )}

          {/* MY interest */}
          {(lead.market === 'my' || lead.market === 'both') && (
            <div className="card p-4 space-y-2">
              <h3 className="font-semibold text-red-800 text-sm">🇲🇾 Malaysia Interest</h3>
              {lead.property_type_my?.length > 0 && <p className="text-xs text-gray-600">Types: {lead.property_type_my.join(', ')}</p>}
              {lead.preferred_areas_my?.length > 0 && <p className="text-xs text-gray-600">Areas: {lead.preferred_areas_my.join(', ')}</p>}
              {(lead.budget_min_myr || lead.budget_max_myr) && (
                <p className="text-xs text-gray-600">
                  Budget: RM{lead.budget_min_myr?.toLocaleString() || '–'} – RM{lead.budget_max_myr?.toLocaleString() || '–'}
                </p>
              )}
              {lead.current_property_my && <p className="text-xs text-gray-600">Current MY: {lead.current_property_my}</p>}
            </div>
          )}

          {/* Notes */}
          {lead.notes && (
            <div className="card p-4">
              <h3 className="font-semibold text-gray-700 text-sm mb-2">Notes</h3>
              <p className="text-xs text-gray-600 whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}

          {/* Tags */}
          {lead.tags?.length > 0 && (
            <div className="card p-4">
              <h3 className="font-semibold text-gray-700 text-sm mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1">
                {lead.tags.map(t => (
                  <span key={t} className="badge bg-gray-100 text-gray-600">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Pipeline stage changer */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-700 text-sm mb-3">Pipeline Stage</h3>
            <div className="space-y-1">
              {PIPELINE_STAGES.map(s => (
                <button
                  key={s.value}
                  onClick={() => changeStage(s.value)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors
                    ${lead.pipeline_stage === s.value ? `${s.color} font-semibold` : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  {s.label}
                  {lead.pipeline_stage === s.value && <Check size={13} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle + Right: Follow-ups + Activity log */}
        <div className="lg:col-span-2 space-y-5">

          {/* Pending Follow-Ups */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <Clock size={15} className="text-orange-500" /> Pending Follow-Ups ({pendingFu.length})
              </h3>
              <button className="btn-secondary text-xs py-1 px-2" onClick={() => setShowFuForm(v => !v)}>
                <Plus size={13} /> Schedule
              </button>
            </div>

            {showFuForm && (
              <div className="bg-orange-50 rounded-lg p-3 mb-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label">Type</label>
                    <select className="input text-xs" value={fuForm.type} onChange={e => setFuForm(f => ({ ...f, type: e.target.value }))}>
                      {FOLLOWUP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Due Date & Time</label>
                    <input type="datetime-local" className="input text-xs" value={fuForm.due_date} onChange={e => setFuForm(f => ({ ...f, due_date: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">Notes</label>
                  <input className="input text-xs" value={fuForm.notes} placeholder="What to do / say…" onChange={e => setFuForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary text-xs py-1.5 px-3" onClick={addFollowUp}>Save</button>
                  <button className="btn-secondary text-xs py-1.5 px-3" onClick={() => setShowFuForm(false)}>Cancel</button>
                </div>
              </div>
            )}

            {pendingFu.length === 0 ? (
              <p className="text-xs text-gray-400">No pending follow-ups.</p>
            ) : (
              <div className="space-y-2">
                {pendingFu.map(f => (
                  <div key={f.id} className="flex items-start gap-3 p-2 rounded-lg bg-orange-50 border border-orange-100">
                    <div className="flex-1">
                      <p className="text-xs font-medium capitalize text-gray-700">{f.type}</p>
                      <p className="text-xs text-gray-500">{f.notes}</p>
                      <p className="text-xs text-orange-700 mt-0.5 font-medium">
                        {f.due_date ? format(new Date(f.due_date), 'dd MMM yyyy, h:mm a') : '—'}
                      </p>
                    </div>
                    <button onClick={() => markFuDone(f.id)} className="text-green-600 hover:text-green-800 mt-0.5">
                      <Check size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-sm">Activity Log ({activities.length})</h3>
              <button className="btn-secondary text-xs py-1 px-2" onClick={() => setShowActForm(v => !v)}>
                <Plus size={13} /> Log
              </button>
            </div>

            {showActForm && (
              <div className="bg-blue-50 rounded-lg p-3 mb-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label">Type</label>
                    <select className="input text-xs" value={actForm.type} onChange={e => setActForm(f => ({ ...f, type: e.target.value }))}>
                      {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Outcome</label>
                    <input className="input text-xs" value={actForm.outcome} placeholder="e.g. Interested, No reply…" onChange={e => setActForm(f => ({ ...f, outcome: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">Notes / Content</label>
                  <textarea className="input text-xs resize-none" rows={3} value={actForm.content} placeholder="What happened or what was sent…" onChange={e => setActForm(f => ({ ...f, content: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary text-xs py-1.5 px-3" onClick={logActivity}>Save</button>
                  <button className="btn-secondary text-xs py-1.5 px-3" onClick={() => setShowActForm(false)}>Cancel</button>
                </div>
              </div>
            )}

            {activities.length === 0 ? (
              <p className="text-xs text-gray-400">No activities logged yet.</p>
            ) : (
              <div className="space-y-3">
                {activities.map(a => {
                  const Icon = ACTIVITY_ICONS[a.type] || FileText
                  return (
                    <div key={a.id} className="flex gap-3">
                      <div className="mt-0.5 p-1.5 rounded-full bg-blue-100 text-blue-700 h-fit">
                        <Icon size={13} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold capitalize text-gray-700">{a.type.replace('_', ' ')}</span>
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(a.activity_date), { addSuffix: true })}
                          </span>
                          {a.outcome && <span className="badge bg-green-100 text-green-700">{a.outcome}</span>}
                        </div>
                        {a.content && <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-wrap">{a.content}</p>}
                      </div>
                      <button
                        onClick={() => { deleteActivity(a.id); refreshAll() }}
                        className="text-gray-300 hover:text-red-500 mt-0.5 flex-shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
