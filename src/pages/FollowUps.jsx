import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  getFollowUps, getLeads, updateFollowUp, createFollowUp,
  ensureHotLeadFollowUps, resolveHotFollowUp,
} from '../lib/store'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import {
  CalendarCheck, Check, Clock, AlertCircle, ExternalLink,
  Flame, Snowflake, Phone, Calendar, X, Bell,
} from 'lucide-react'
import { format, isToday, isPast, addDays } from 'date-fns'

function LeadName({ leadId, leads }) {
  const lead = leads.find(l => l.id === leadId)
  if (!lead) return <span className="text-gray-400">Unknown</span>
  return (
    <Link to={`/leads/${leadId}`} className="font-medium text-blue-700 hover:underline flex items-center gap-1">
      {lead.name} <ExternalLink size={11} />
    </Link>
  )
}

// ─── Outcome modal for hot follow-ups ────────────────────────────────────────
function HotOutcomeModal({ followUp, lead, onResolve, onClose }) {
  const day = followUp.hot_day || 1
  const isDay7Plus = day >= 7
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-orange-500" />
            <span className="font-bold text-gray-900">Hot Lead — Day {day}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-semibold text-gray-800">{lead?.name}</span>
          {lead?.phone && (
            <a href={`tel:${lead.phone}`} className="ml-2 text-blue-600 hover:underline text-xs">{lead.phone}</a>
          )}
        </p>
        <p className="text-xs text-gray-500 mb-5">{followUp.notes}</p>
        {isDay7Plus && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 text-sm text-orange-800">
            🎯 <strong>Day {day}!</strong> You've been following up for a week — push hard for an appointment now.
          </div>
        )}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">What happened?</p>
        <div className="space-y-2">
          <button
            onClick={() => onResolve('continue')}
            className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-blue-100 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition text-left"
          >
            <Phone size={18} className="text-blue-600 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-blue-800">Called / Messaged — keep chasing</div>
              <div className="text-xs text-blue-600">Auto-schedules tomorrow's follow-up (Day {day + 1})</div>
            </div>
          </button>
          <button
            onClick={() => onResolve('appointment')}
            className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-green-100 bg-green-50 hover:border-green-400 hover:bg-green-100 transition text-left"
          >
            <Calendar size={18} className="text-green-600 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-green-800">📅 Appointment Booked!</div>
              <div className="text-xs text-green-600">Moves lead to "Appt Set" stage — great job!</div>
            </div>
          </button>
          <button
            onClick={() => onResolve('cold')}
            className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-gray-100 transition text-left"
          >
            <Snowflake size={18} className="text-blue-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-gray-700">❄️ Not Interested — Going Cold</div>
              <div className="text-xs text-gray-500">Stops daily follow-ups. Re-engage when a new project launches.</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── New Project Alert modal ──────────────────────────────────────────────────
function NewProjectModal({ coldLeads, onSchedule, onClose }) {
  const [project, setProject] = useState('')
  const [selected, setSelected] = useState(coldLeads.map(l => l.id))
  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  const submit = () => {
    if (!project.trim() || selected.length === 0) return
    const d = addDays(new Date(), 1)
    d.setHours(9, 0, 0, 0)
    onSchedule(selected, project.trim(), d.toISOString())
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-blue-500" />
            <span className="font-bold text-gray-900">New Project Alert</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="mb-4">
          <label className="label">Project / Launch Name</label>
          <input
            className="input"
            placeholder="e.g. The Arden, Jurong Lake District"
            value={project}
            onChange={e => setProject(e.target.value)}
          />
        </div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Select cold leads to re-engage</p>
        <div className="space-y-1 mb-5 max-h-48 overflow-y-auto">
          {coldLeads.map(lead => (
            <label key={lead.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(lead.id)}
                onChange={() => toggle(lead.id)}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-800">{lead.name}</span>
              {lead.phone && <span className="text-xs text-gray-400">{lead.phone}</span>}
            </label>
          ))}
        </div>
        <button
          onClick={submit}
          disabled={!project.trim() || selected.length === 0}
          className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Schedule for {selected.length} lead{selected.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function FollowUps() {
  const [leads, setLeads] = useState(() => getLeads())
  const [followups, setFollowups] = useState(() => getFollowUps({ status: 'pending' }))
  const [tab, setTab] = useState('today')
  const [hotModal, setHotModal] = useState(null)
  const [coldModal, setColdModal] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    ensureHotLeadFollowUps()
    refresh()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = () => {
    setFollowups(getFollowUps({ status: 'pending' }))
    setLeads(getLeads())
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const markDone = (f) => {
    if (f.hot_auto) {
      const lead = leads.find(l => l.id === f.lead_id)
      setHotModal({ followUp: f, lead })
    } else {
      updateFollowUp(f.id, { status: 'done' })
      refresh()
    }
  }

  const snooze = (id) => {
    updateFollowUp(id, { status: 'snoozed' })
    refresh()
  }

  const resolveHot = (outcome) => {
    if (!hotModal) return
    resolveHotFollowUp(hotModal.followUp.id, outcome)
    setHotModal(null)
    refresh()
    if (outcome === 'continue')    showToast("✅ Tomorrow's follow-up scheduled!")
    if (outcome === 'appointment') showToast('🎉 Moved to Appt Set — great work!')
    if (outcome === 'cold')        showToast("❄️ Lead marked cold. Re-engage from the Cold tab.")
  }

  const scheduleNewProject = (leadIds, projectName, dueDate) => {
    leadIds.forEach(lid => {
      createFollowUp({
        lead_id: lid,
        type: 'whatsapp',
        due_date: dueDate,
        notes: `🏗️ New project launch: ${projectName} — re-engage cold lead.`,
        hot_auto: false,
      })
    })
    setColdModal(false)
    refresh()
    showToast(`📬 Follow-ups scheduled for ${leadIds.length} cold lead${leadIds.length !== 1 ? 's' : ''}!`)
  }

  const categorized = useMemo(() => {
    const today = [], overdue = [], upcoming = []
    followups.forEach(f => {
      if (!f.due_date) { upcoming.push(f); return }
      const d = new Date(f.due_date)
      if (isToday(d)) today.push(f)
      else if (isPast(d)) overdue.push(f)
      else upcoming.push(f)
    })
    return { today, overdue, upcoming }
  }, [followups])

  const coldLeads = useMemo(() => leads.filter(l => l.lead_temp === 'cold'), [leads])
  const hotLeads  = useMemo(() => leads.filter(l => l.lead_temp === 'hot'),  [leads])

  const tabs = [
    { key: 'today',    label: `Today (${categorized.today.length})`,      icon: CalendarCheck, urgent: false },
    { key: 'overdue',  label: `Overdue (${categorized.overdue.length})`,  icon: AlertCircle,   urgent: categorized.overdue.length > 0 },
    { key: 'upcoming', label: `Upcoming (${categorized.upcoming.length})`, icon: Clock,         urgent: false },
    { key: 'cold',     label: `Cold (${coldLeads.length})`,                icon: Snowflake,     urgent: false },
  ]

  const current = tab === 'cold' ? [] : (categorized[tab] || [])
  const typeIcon = { whatsapp: '💬', call: '📞', appointment: '📅' }

  return (
    <div>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      {hotModal && (
        <HotOutcomeModal
          followUp={hotModal.followUp}
          lead={hotModal.lead}
          onResolve={resolveHot}
          onClose={() => setHotModal(null)}
        />
      )}

      {coldModal && (
        <NewProjectModal
          coldLeads={coldLeads}
          onSchedule={scheduleNewProject}
          onClose={() => setColdModal(false)}
        />
      )}

      <PageHeader
        title="Follow-Ups"
        subtitle={`${hotLeads.length} hot lead${hotLeads.length !== 1 ? 's' : ''} on autopilot · ${coldLeads.length} cold`}
      />

      {hotLeads.length > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
          <Flame size={18} className="text-orange-500 flex-shrink-0" />
          <p className="text-sm text-orange-800 flex-1">
            <strong>{hotLeads.length} hot lead{hotLeads.length !== 1 ? 's' : ''}</strong> on daily autopilot.
            After 7 days you'll be prompted to book an appointment.
          </p>
        </div>
      )}

      <div className="flex gap-1 mb-4 border-b border-gray-200 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap
              ${tab === t.key ? 'border-blue-700 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}
              ${t.urgent && tab !== t.key ? 'text-red-600' : ''}`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Cold tab */}
      {tab === 'cold' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">Cold leads are paused — only follow up when something new launches.</p>
            {coldLeads.length > 0 && (
              <button onClick={() => setColdModal(true)} className="btn-primary text-sm flex items-center gap-2">
                <Bell size={14} /> New Project Alert
              </button>
            )}
          </div>
          {coldLeads.length === 0 ? (
            <EmptyState
              icon={Snowflake}
              title="No cold leads"
              description="When you mark a hot lead as 'Going Cold', they'll appear here."
            />
          ) : (
            <div className="space-y-2">
              {coldLeads.map(lead => (
                <div key={lead.id} className="card p-4 flex items-center gap-4">
                  <Snowflake size={20} className="text-blue-300 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/leads/${lead.id}`} className="font-medium text-blue-700 hover:underline flex items-center gap-1">
                      {lead.name} <ExternalLink size={11} />
                    </Link>
                    {lead.phone && <p className="text-xs text-gray-500">{lead.phone}</p>}
                    {lead.went_cold_at && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Went cold {format(new Date(lead.went_cold_at), 'dd MMM yyyy')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setColdModal(true)}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Bell size={12} /> Alert
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Regular tabs */}
      {tab !== 'cold' && (
        <>
          {current.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title={
                tab === 'today' ? 'Nothing due today — nice!' :
                tab === 'overdue' ? 'No overdue follow-ups' : 'No upcoming follow-ups'
              }
              description="Hot lead follow-ups auto-appear every morning. Add manual ones from a lead's detail page."
            />
          ) : (
            <div className="space-y-3">
              {current.map(f => {
                const isHot = !!f.hot_auto
                return (
                  <div
                    key={f.id}
                    className={`card p-4 flex items-start gap-4
                      ${isHot ? 'border-orange-200 bg-orange-50' :
                        tab === 'overdue' ? 'border-red-200 bg-red-50' :
                        tab === 'today' ? 'border-yellow-100 bg-yellow-50' : ''}`}
                  >
                    <div className="text-2xl flex-shrink-0">{isHot ? '🔥' : (typeIcon[f.type] || '🔔')}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <LeadName leadId={f.lead_id} leads={leads} />
                        {isHot ? (
                          <span className="badge bg-orange-100 text-orange-700 flex items-center gap-1">
                            <Flame size={10} /> Day {f.hot_day}
                          </span>
                        ) : (
                          <span className="badge bg-gray-100 text-gray-600 capitalize">{f.type}</span>
                        )}
                        {tab === 'overdue' && <span className="badge bg-red-100 text-red-700">Overdue</span>}
                      </div>
                      {f.notes && <p className="text-sm text-gray-600 mt-1">{f.notes}</p>}
                      {f.due_date && (
                        <p className={`text-xs mt-1 font-medium ${tab === 'overdue' ? 'text-red-700' : 'text-gray-500'}`}>
                          {format(new Date(f.due_date), 'EEEE, dd MMM yyyy, h:mm a')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => markDone(f)}
                        className={`text-xs py-1.5 px-3 flex items-center gap-1.5 rounded-lg font-medium transition
                          ${isHot ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'btn-primary'}`}
                      >
                        <Check size={13} /> Done
                      </button>
                      {!isHot && (
                        <button onClick={() => snooze(f.id)} className="btn-secondary text-xs py-1.5 px-3">
                          Snooze
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
