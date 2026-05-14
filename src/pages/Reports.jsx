import { useMemo } from 'react'
import { getLeads } from '../lib/store'
import { PIPELINE_STAGES, LEAD_SOURCES, CUSTOMER_TYPES, MARKETS } from '../lib/constants'
import PageHeader from '../components/PageHeader'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, FunnelChart, Funnel, LabelList
} from 'recharts'

const COLORS = ['#3b82f6','#f97316','#ef4444','#8b5cf6','#10b981','#f59e0b','#06b6d4','#ec4899','#84cc16','#6366f1']

function ChartCard({ title, children }) {
  return (
    <div className="card p-5">
      <h2 className="font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  )
}

export default function Reports() {
  const leads = getLeads()

  const byTemp = useMemo(() => [
    { name: 'Cold', value: leads.filter(l => l.lead_temp === 'cold').length, fill: '#60a5fa' },
    { name: 'Warm', value: leads.filter(l => l.lead_temp === 'warm').length, fill: '#fb923c' },
    { name: 'Hot',  value: leads.filter(l => l.lead_temp === 'hot').length,  fill: '#ef4444' },
  ], [leads])

  const byMarket = useMemo(() => [
    { name: 'Singapore', value: leads.filter(l => l.market === 'sg').length,   fill: '#3b82f6' },
    { name: 'Malaysia',  value: leads.filter(l => l.market === 'my').length,   fill: '#ef4444' },
    { name: 'Both',      value: leads.filter(l => l.market === 'both').length, fill: '#8b5cf6' },
  ], [leads])

  const bySource = useMemo(() =>
    LEAD_SOURCES.map((s, i) => ({
      name: s.label,
      count: leads.filter(l => l.source === s.value).length,
      fill: COLORS[i % COLORS.length],
    })).filter(s => s.count > 0)
  , [leads])

  const byType = useMemo(() =>
    CUSTOMER_TYPES.map(t => ({
      name: t.label,
      count: leads.filter(l => l.customer_type === t.value).length,
    }))
  , [leads])

  const byStage = useMemo(() =>
    PIPELINE_STAGES.map(s => ({
      name: s.label,
      count: leads.filter(l => l.pipeline_stage === s.value).length,
    })).filter(s => s.count > 0)
  , [leads])

  const conversionRate = useMemo(() => {
    const won = leads.filter(l => l.pipeline_stage === 'closed_won').length
    return leads.length ? ((won / leads.length) * 100).toFixed(1) : 0
  }, [leads])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle={`Based on ${leads.length} total leads`}
      />

      {/* Summary numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: leads.length, color: 'text-blue-700' },
          { label: 'Hot Leads', value: leads.filter(l => l.lead_temp === 'hot').length, color: 'text-red-600' },
          { label: 'Closed Won', value: leads.filter(l => l.pipeline_stage === 'closed_won').length, color: 'text-green-600' },
          { label: 'Conversion Rate', value: `${conversionRate}%`, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Temperature */}
        <ChartCard title="Lead Temperature">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byTemp} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {byTemp.map(e => <Cell key={e.name} fill={e.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Market */}
        <ChartCard title="Market Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byMarket} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {byMarket.map(e => <Cell key={e.name} fill={e.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Source */}
        <ChartCard title="Lead Sources">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bySource} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {bySource.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Customer type */}
        <ChartCard title="Customer Type Breakdown">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byType} margin={{ left: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Pipeline */}
        <ChartCard title="Pipeline Stage Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byStage} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  )
}
