import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getLeads, deleteLead } from '../lib/store'
import { LEAD_TEMPS, MARKETS, CUSTOMER_TYPES, PIPELINE_STAGES } from '../lib/constants'
import { TempBadge, MarketBadge, OwnershipBadge, StageBadge } from '../components/Badges'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { Users, Plus, Search, Phone, Trash2, ExternalLink, ArrowUpDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

function fmtBudget(lead) {
  const parts = []
  if (lead.budget_min_sgd || lead.budget_max_sgd) {
    const lo = lead.budget_min_sgd ? `S$${(lead.budget_min_sgd/1000).toFixed(0)}k` : ''
    const hi = lead.budget_max_sgd ? `S$${(lead.budget_max_sgd/1000).toFixed(0)}k` : ''
    parts.push([lo, hi].filter(Boolean).join('–'))
  }
  if (lead.budget_min_myr || lead.budget_max_myr) {
    const lo = lead.budget_min_myr ? `RM${(lead.budget_min_myr/1000).toFixed(0)}k` : ''
    const hi = lead.budget_max_myr ? `RM${(lead.budget_max_myr/1000).toFixed(0)}k` : ''
    parts.push([lo, hi].filter(Boolean).join('–'))
  }
  return parts.join(' / ') || '—'
}

export default function Leads() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState(getLeads)
  const [search, setSearch] = useState('')
  const [filterTemp, setFilterTemp] = useState('')
  const [filterMarket, setFilterMarket] = useState('')
  const [filterStage, setFilterStage] = useState('')
  const [filterType, setFilterType] = useState('')
  const [sortBy, setSortBy] = useState('created_at')

  const refresh = () => setLeads(getLeads())

  const handleDelete = (e, id, name) => {
    e.stopPropagation()
    e.preventDefault()
    if (confirm(`Delete lead "${name}"? This cannot be undone.`)) {
      deleteLead(id)
      refresh()
    }
  }

  const filtered = useMemo(() => {
    let list = leads
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.email || '').toLowerCase().includes(q) ||
        (l.assisted_by || '').toLowerCase().includes(q)
      )
    }
    if (filterTemp)   list = list.filter(l => l.lead_temp === filterTemp)
    if (filterMarket) list = list.filter(l => l.market === filterMarket)
    if (filterStage)  list = list.filter(l => l.pipeline_stage === filterStage)
    if (filterType)   list = list.filter(l => l.customer_type === filterType)
    list = [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'last_contacted_at') {
        return new Date(b.last_contacted_at || 0) - new Date(a.last_contacted_at || 0)
      }
      return new Date(b.created_at) - new Date(a.created_at)
    })
    return list
  }, [leads, search, filterTemp, filterMarket, filterStage, filterType, sortBy])

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={`${leads.length} total contacts`}
        action={
          <Link to="/leads/new" className="btn-primary">
            <Plus size={16} /> Add Lead
          </Link>
        }
      />

      {/* Filters */}
      <div className="card p-3 mb-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-8"
            placeholder="Search name, phone, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-auto" value={filterTemp} onChange={e => setFilterTemp(e.target.value)}>
          <option value="">All Temps</option>
          {LEAD_TEMPS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select className="input w-auto" value={filterMarket} onChange={e => setFilterMarket(e.target.value)}>
          <option value="">All Markets</option>
          {MARKETS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select className="input w-auto" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {CUSTOMER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select className="input w-auto" value={filterStage} onChange={e => setFilterStage(e.target.value)}>
          <option value="">All Stages</option>
          {PIPELINE_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select className="input w-auto" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="created_at">Newest first</option>
          <option value="last_contacted_at">Last contacted</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads found"
          description="Add your first lead or adjust your filters."
          action={<Link to="/leads/new" className="btn-primary"><Plus size={16} />Add Lead</Link>}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Phone</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Temp</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Market</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Ownership</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Budget</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Assisted By</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Stage</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Received</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(lead => (
                <tr
                  key={lead.id}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  onClick={() => navigate(`/leads/${lead.id}`)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <a
                      href={`tel:${lead.phone}`}
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1 hover:text-blue-700"
                    >
                      <Phone size={13} />{lead.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3"><TempBadge value={lead.lead_temp} /></td>
                  <td className="px-4 py-3"><MarketBadge value={lead.market} /></td>
                  <td className="px-4 py-3"><OwnershipBadge value={lead.ownership_type} /></td>
                  <td className="px-4 py-3 capitalize text-gray-600">{lead.customer_type?.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtBudget(lead)}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.assisted_by || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3"><StageBadge value={lead.pipeline_stage} /></td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {lead.date_received || formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/leads/${lead.id}`}
                        onClick={e => e.stopPropagation()}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink size={15} />
                      </Link>
                      <button
                        onClick={e => handleDelete(e, lead.id, lead.name)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
            Showing {filtered.length} of {leads.length} leads
          </div>
        </div>
      )}
    </div>
  )
}
