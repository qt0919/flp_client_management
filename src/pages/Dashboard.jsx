import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getLeads, getFollowUps } from '../lib/store'
import { PIPELINE_STAGES } from '../lib/constants'
import { TempBadge, MarketBadge } from '../components/Badges'
import PageHeader from '../components/PageHeader'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Users, Flame, CalendarCheck, AlertCircle, TrendingUp, MessageSquare, ExternalLink } from 'lucide-react'
import { isToday, isPast, format, formatDistanceToNow } from 'date-fns'

function StatCard({ icon: Icon, label, value, sub, color = 'text-blue-700', bg = 'bg-blue-50' }) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`${bg} p-3 rounded-xl`}>
        <Icon size={22} className={color} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

const STAGE_COLORS = {
  new_lead: '#94a3b8', first_touch: '#60a5fa', engaged: '#818cf8',
  qualified: '#a78bfa', listings_sent: '#fbbf24', appointment_set: '#fb923c',
  appointment_done: '#f472b6', offer_stage: '#fb7185',
  closed_won: '#4ade80', closed_lost: '#f87171', nurture: '#2dd4bf',
}

export default function Dashboard() {
  const leads = getLeads()
  const allFu = getFollowUps()

  const stats = useMemo(() => {
    const total = leads.length
    const hot   = leads.filter(l => l.lead_temp === 'hot').length
    const warm  = leads.filter(l => l.lead_temp === 'warm').length
    const sg    = leads.filter(l => l.market === 'sg' || l.market === 'both').length
    const my    = leads.filter(l => l.market === 'my' || l.market === 'both').length
    const won   = leads.filter(l => l.pipeline_stage === 'closed_won').length

    const todayFu    = allFu.filter(f => f.status === 'pending' && f.due_date && isToday(new Date(f.due_date)))
    const overdueFu  = allFu.filter(f => f.status === 'pending' && f.due_date && isPast(new Date(f.due_date)) && !isToday(new Date(f.due_date)))

    const pipelineData = PIPELINE_STAGES.map(s => ({
      name: s.label,
      value: s.value,
      count: leads.filter(l => l.pipeline_stage === s.value).length,
    }))

    const hotLeads = leads.filter(l => l.lead_temp === 'hot').slice(0, 5)

    return { total, hot, warm, sg, my, won, todayFu, overdueFu, pipelineData, hotLeads }
  }, [leads, allFu])

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle={`Good morning! ${new Date().toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}         label="Total Leads"       value={stats.total}                      sub={`SG: ${stats.sg} · MY: ${stats.my}`} />
        <StatCard icon={Flame}         label="Hot Leads"         value={stats.hot}                        color="text-red-600" bg="bg-red-50"      sub={`${stats.warm} warm`} />
        <StatCard icon={CalendarCheck} label="Tasks Today"       value={stats.todayFu.length}             color="text-orange-600" bg="bg-orange-50" />
        <StatCard icon={TrendingUp}    label="Closed Won"        value={stats.won}                        color="text-green-600" bg="bg-green-50"  />
      </div>

      {/* Overdue alert */}
      {stats.overdueFu.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-800 text-sm">
              {stats.overdueFu.length} overdue follow-up{stats.overdueFu.length > 1 ? 's' : ''} need attention
            </p>
            <p className="text-red-600 text-xs mt-0.5">These were due in the past and are still pending.</p>
          </div>
          <Link to="/followups" className="btn-secondary text-xs ml-auto flex-shrink-0 border-red-300 text-red-700">
            View All
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Pipeline funnel chart */}
        <div className="card p-5 lg:col-span-3">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            Pipeline Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.pipelineData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v} leads`, '']} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {stats.pipelineData.map(entry => (
                  <Cell key={entry.value} fill={STAGE_COLORS[entry.value] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">

          {/* Today's tasks */}
          <div className="card p-4">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CalendarCheck size={16} className="text-orange-500" /> Today's Tasks ({stats.todayFu.length})
            </h2>
            {stats.todayFu.length === 0 ? (
              <p className="text-xs text-gray-400">No follow-ups due today 🎉</p>
            ) : (
              <div className="space-y-2">
                {stats.todayFu.slice(0, 5).map(f => {
                  const lead = leads.find(l => l.id === f.lead_id)
                  return (
                    <Link key={f.id} to={`/leads/${f.lead_id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 transition-colors">
                      <span className="text-base">{f.type === 'call' ? '📞' : f.type === 'appointment' ? '📅' : '💬'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{lead?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{f.notes || f.type}</p>
                      </div>
                      <span className="text-xs text-orange-600 font-medium flex-shrink-0">
                        {f.due_date ? format(new Date(f.due_date), 'h:mm a') : ''}
                      </span>
                    </Link>
                  )
                })}
                {stats.todayFu.length > 5 && (
                  <Link to="/followups" className="text-xs text-blue-600 hover:underline block text-center mt-1">
                    +{stats.todayFu.length - 5} more
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Hot leads */}
          <div className="card p-4">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Flame size={16} className="text-red-500" /> Hot Leads
            </h2>
            {stats.hotLeads.length === 0 ? (
              <p className="text-xs text-gray-400">No hot leads yet.</p>
            ) : (
              <div className="space-y-2">
                {stats.hotLeads.map(l => (
                  <Link key={l.id} to={`/leads/${l.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">{l.name}</p>
                        <MarketBadge value={l.market} />
                      </div>
                      <p className="text-xs text-gray-500">{l.phone}</p>
                    </div>
                    <ExternalLink size={12} className="text-gray-300 group-hover:text-red-500 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
