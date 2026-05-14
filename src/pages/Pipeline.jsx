import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getLeads, updateLead } from '../lib/store'
import { PIPELINE_STAGES } from '../lib/constants'
import { TempBadge, MarketBadge } from '../components/Badges'
import PageHeader from '../components/PageHeader'
import { ChevronLeft, ChevronRight, ExternalLink, Phone, LayoutGrid, List } from 'lucide-react'

function fmtBudget(lead) {
  const parts = []
  if (lead.budget_max_sgd) parts.push(`S$${(lead.budget_max_sgd / 1000).toFixed(0)}k`)
  if (lead.budget_max_myr) parts.push(`RM${(lead.budget_max_myr / 1000).toFixed(0)}k`)
  return parts.join(' / ') || null
}

export default function Pipeline() {
  const [leads, setLeads] = useState(getLeads)
  const [activeStage, setActiveStage] = useState(PIPELINE_STAGES[0].value)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [dragOver, setDragOver] = useState(null)

  const refresh = () => setLeads(getLeads())

  const stageLeads = leads.filter(l => l.pipeline_stage === activeStage)
  const stageIndex = PIPELINE_STAGES.findIndex(s => s.value === activeStage)
  const currentStage = PIPELINE_STAGES[stageIndex]
  const prevStage = stageIndex > 0 ? PIPELINE_STAGES[stageIndex - 1] : null
  const nextStage = stageIndex < PIPELINE_STAGES.length - 1 ? PIPELINE_STAGES[stageIndex + 1] : null

  const moveToStage = (leadId, stageValue) => {
    updateLead(leadId, { pipeline_stage: stageValue })
    refresh()
  }

  // Drag and drop (desktop)
  const handleDragStart = (e, id) => e.dataTransfer.setData('leadId', id)
  const handleDrop = (e, stage) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('leadId')
    if (leadId) {
      updateLead(leadId, { pipeline_stage: stage })
      setActiveStage(stage)
      refresh()
    }
    setDragOver(null)
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Pipeline"
        subtitle={`${leads.length} leads across ${PIPELINE_STAGES.length} stages`}
        action={
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              title="List view"
            >
              <List size={16} />
            </button>
          </div>
        }
      />

      {/* ── Stage tab strip ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
        {PIPELINE_STAGES.map(stage => {
          const count = leads.filter(l => l.pipeline_stage === stage.value).length
          const isActive = activeStage === stage.value
          return (
            <button
              key={stage.value}
              onClick={() => setActiveStage(stage.value)}
              onDragOver={e => { e.preventDefault(); setDragOver(stage.value) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => handleDrop(e, stage.value)}
              className={`shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl border-2 transition-all text-center min-w-[80px]
                ${isActive
                  ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                  : dragOver === stage.value
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-transparent bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-200 shadow-sm'
                }`}
            >
              <span className={`text-xl font-bold leading-none ${isActive ? 'text-white' : 'text-gray-800'}`}>{count}</span>
              <span className={`text-xs mt-0.5 leading-tight font-medium ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>{stage.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── Stage header ── */}
      <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl mt-3 mb-3 ${currentStage.color}`}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">{currentStage.label}</span>
          <span className="text-xs opacity-70">— {stageLeads.length} lead{stageLeads.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {prevStage && (
            <button
              onClick={() => setActiveStage(prevStage.value)}
              className="flex items-center gap-1 text-xs px-2.5 py-1 bg-white/60 hover:bg-white/90 rounded-lg font-medium transition-colors"
            >
              <ChevronLeft size={13} /> {prevStage.label}
            </button>
          )}
          {nextStage && (
            <button
              onClick={() => setActiveStage(nextStage.value)}
              className="flex items-center gap-1 text-xs px-2.5 py-1 bg-white/60 hover:bg-white/90 rounded-lg font-medium transition-colors"
            >
              {nextStage.label} <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Lead cards / list ── */}
      {stageLeads.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-16">
          <div className="text-5xl mb-3">📭</div>
          <p className="font-medium text-gray-500">No leads in {currentStage.label}</p>
          <p className="text-sm mt-1">Drag a card here or move a lead from another stage.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {stageLeads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              stages={PIPELINE_STAGES}
              onMove={moveToStage}
              onDragStart={handleDragStart}
              prevStage={prevStage}
              nextStage={nextStage}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {stageLeads.map(lead => (
            <LeadRow
              key={lead.id}
              lead={lead}
              stages={PIPELINE_STAGES}
              onMove={moveToStage}
              prevStage={prevStage}
              nextStage={nextStage}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function LeadCard({ lead, stages, onMove, onDragStart, prevStage, nextStage }) {
  const budget = fmtBudget(lead)
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, lead.id)}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{lead.name}</p>
          <a href={`tel:${lead.phone}`} className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 hover:text-blue-600">
            <Phone size={11} /> {lead.phone}
          </a>
        </div>
        <Link to={`/leads/${lead.id}`} className="text-gray-300 hover:text-blue-600 shrink-0 mt-0.5">
          <ExternalLink size={14} />
        </Link>
      </div>

      <div className="flex flex-wrap gap-1">
        <TempBadge value={lead.lead_temp} />
        <MarketBadge value={lead.market} />
        {budget && <span className="badge bg-gray-100 text-gray-600 text-xs">{budget}</span>}
      </div>

      {/* Stage jump dropdown */}
      <select
        value={lead.pipeline_stage}
        onChange={e => onMove(lead.id, e.target.value)}
        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {stages.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {/* Prev / Next quick moves */}
      <div className="flex gap-1.5">
        {prevStage ? (
          <button
            onClick={() => onMove(lead.id, prevStage.value)}
            className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <ChevronLeft size={13} /> Back
          </button>
        ) : <div className="flex-1" />}
        {nextStage && (
          <button
            onClick={() => onMove(lead.id, nextStage.value)}
            className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Next <ChevronRight size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

function LeadRow({ lead, stages, onMove, prevStage, nextStage }) {
  const budget = fmtBudget(lead)
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-gray-900">{lead.name}</p>
          <TempBadge value={lead.lead_temp} />
          <MarketBadge value={lead.market} />
          {budget && <span className="badge bg-gray-100 text-gray-600 text-xs">{budget}</span>}
        </div>
        <a href={`tel:${lead.phone}`} className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1 mt-0.5">
          <Phone size={11} /> {lead.phone}
        </a>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {prevStage && (
          <button
            onClick={() => onMove(lead.id, prevStage.value)}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            title={`Move to ${prevStage.label}`}
          >
            <ChevronLeft size={15} />
          </button>
        )}
        <select
          value={lead.pipeline_stage}
          onChange={e => onMove(lead.id, e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[120px]"
        >
          {stages.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        {nextStage && (
          <button
            onClick={() => onMove(lead.id, nextStage.value)}
            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            title={`Move to ${nextStage.label}`}
          >
            <ChevronRight size={15} />
          </button>
        )}
        <Link to={`/leads/${lead.id}`} className="p-1.5 text-gray-400 hover:text-blue-600">
          <ExternalLink size={15} />
        </Link>
      </div>
    </div>
  )
}

