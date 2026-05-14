import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createLead, getLead, updateLead, scheduleHotFollowUp, hasPendingHotFollowUp } from '../lib/store'
import {
  MARKETS, LEAD_TEMPS, CUSTOMER_TYPES, PIPELINE_STAGES, LEAD_SOURCES,
  PROPERTY_TYPES_SG, PROPERTY_TYPES_MY, SG_DISTRICTS, MY_AREAS,
  TIMELINES, OWNERSHIP_TYPES
} from '../lib/constants'
import PageHeader from '../components/PageHeader'

const BEDROOMS = ['Studio', '1', '2', '3', '4', '5+']

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select className="input" value={value} onChange={e => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function MultiCheck({ options, value = [], onChange }) {
  const toggle = (v) => {
    onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v])
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <label key={o.value} className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={value.includes(o.value)}
            onChange={() => toggle(o.value)}
            className="rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm">{o.label}</span>
        </label>
      ))}
    </div>
  )
}

export default function LeadForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const existing = id ? getLead(id) : null

  const [form, setForm] = useState({
    name: '', phone: '', email: '', source: 'referral',
    assisted_by: '',
    date_received: new Date().toISOString().split('T')[0],
    lead_temp: 'cold', customer_type: 'self_stay',
    market: 'sg', ownership_type: '',
    property_type_sg: [], property_type_my: [],
    bedrooms: '', budget_min_sgd: '', budget_max_sgd: '',
    budget_min_myr: '', budget_max_myr: '',
    preferred_areas_sg: [], preferred_areas_my: [],
    timeline: 'browsing',
    current_property_sg: 'none', current_property_my: 'none',
    pipeline_stage: 'new_lead', notes: '',
    ...existing,
    tags: existing?.tags?.join(', ') || '',
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const isSG = form.market === 'sg' || form.market === 'both'
  const isMY = form.market === 'my' || form.market === 'both'

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      budget_min_sgd: form.budget_min_sgd ? Number(form.budget_min_sgd) : null,
      budget_max_sgd: form.budget_max_sgd ? Number(form.budget_max_sgd) : null,
      budget_min_myr: form.budget_min_myr ? Number(form.budget_min_myr) : null,
      budget_max_myr: form.budget_max_myr ? Number(form.budget_max_myr) : null,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
    }
    if (existing) {
      updateLead(id, payload)
      // If they were just set to hot and have no pending follow-up, start the autopilot
      if (payload.lead_temp === 'hot' && !hasPendingHotFollowUp(id)) {
        scheduleHotFollowUp(id, 0)
      }
    } else {
      const newLead = createLead(payload)
      if (payload.lead_temp === 'hot') {
        scheduleHotFollowUp(newLead.id, 0)
      }
    }
    navigate('/leads')
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={existing ? 'Edit Lead' : 'Add New Lead'}
        subtitle={existing ? `Editing: ${existing.name}` : 'Fill in the contact details below'}
      />

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 border-b pb-2">Contact Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name *">
              <input required className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Ahmad Bin Ali" />
            </Field>
            <Field label="Phone *">
              <input required className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+65 9xxx xxxx" />
            </Field>
            <Field label="Email">
              <input type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="optional" />
            </Field>
            <Field label="Date Received">
              <input type="date" className="input" value={form.date_received} onChange={e => set('date_received', e.target.value)} />
            </Field>
            <Field label="Source">
              <Select value={form.source} onChange={v => set('source', v)} options={LEAD_SOURCES} />
            </Field>
            <Field label="Assisted By">
              <input className="input" value={form.assisted_by} onChange={e => set('assisted_by', e.target.value)} placeholder="e.g. Sarah, Team A (leave blank if solo)" />
            </Field>
          </div>
        </div>

        {/* Classification */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 border-b pb-2">Classification</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Temperature">
              <Select value={form.lead_temp} onChange={v => set('lead_temp', v)} options={LEAD_TEMPS} />
            </Field>
            <Field label="Customer Type">
              <Select value={form.customer_type} onChange={v => set('customer_type', v)} options={CUSTOMER_TYPES} />
            </Field>
            <Field label="Pipeline Stage">
              <Select value={form.pipeline_stage} onChange={v => set('pipeline_stage', v)} options={PIPELINE_STAGES} />
            </Field>
            <Field label="Market">
              <Select value={form.market} onChange={v => set('market', v)} options={MARKETS} />
            </Field>
            <Field label="Ownership Type">
              <Select value={form.ownership_type} onChange={v => set('ownership_type', v)} options={OWNERSHIP_TYPES} placeholder="Select…" />
            </Field>
            <Field label="Timeline">
              <Select value={form.timeline} onChange={v => set('timeline', v)} options={TIMELINES} />
            </Field>
          </div>
        </div>

        {/* SG Interest */}
        {isSG && (
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-blue-800 border-b pb-2">🇸🇬 Singapore Interest</h2>
            <Field label="Property Types">
              <MultiCheck options={PROPERTY_TYPES_SG} value={form.property_type_sg} onChange={v => set('property_type_sg', v)} />
            </Field>
            <Field label="Preferred Districts">
              <MultiCheck options={SG_DISTRICTS} value={form.preferred_areas_sg} onChange={v => set('preferred_areas_sg', v)} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Budget Min (SGD)">
                <input type="number" className="input" value={form.budget_min_sgd} onChange={e => set('budget_min_sgd', e.target.value)} placeholder="e.g. 800000" />
              </Field>
              <Field label="Budget Max (SGD)">
                <input type="number" className="input" value={form.budget_max_sgd} onChange={e => set('budget_max_sgd', e.target.value)} placeholder="e.g. 1500000" />
              </Field>
              <Field label="Current Property (SG)">
                <Select value={form.current_property_sg} onChange={v => set('current_property_sg', v)} options={[
                  { value: 'none', label: 'None' },
                  { value: 'hdb', label: 'HDB' },
                  { value: 'private', label: 'Private' },
                  { value: 'multiple', label: 'Multiple' },
                ]} />
              </Field>
            </div>
          </div>
        )}

        {/* MY Interest */}
        {isMY && (
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-red-800 border-b pb-2">🇲🇾 Malaysia Interest</h2>
            <Field label="Property Types">
              <MultiCheck options={PROPERTY_TYPES_MY} value={form.property_type_my} onChange={v => set('property_type_my', v)} />
            </Field>
            <Field label="Preferred Areas">
              <MultiCheck options={MY_AREAS} value={form.preferred_areas_my} onChange={v => set('preferred_areas_my', v)} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Budget Min (MYR)">
                <input type="number" className="input" value={form.budget_min_myr} onChange={e => set('budget_min_myr', e.target.value)} placeholder="e.g. 500000" />
              </Field>
              <Field label="Budget Max (MYR)">
                <input type="number" className="input" value={form.budget_max_myr} onChange={e => set('budget_max_myr', e.target.value)} placeholder="e.g. 1200000" />
              </Field>
              <Field label="Current Property (MY)">
                <Select value={form.current_property_my} onChange={v => set('current_property_my', v)} options={[
                  { value: 'none', label: 'None' },
                  { value: 'landed', label: 'Landed' },
                  { value: 'condo', label: 'Condo' },
                  { value: 'multiple', label: 'Multiple' },
                ]} />
              </Field>
            </div>
          </div>
        )}

        {/* Common */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 border-b pb-2">Other Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Bedrooms">
              <Select value={form.bedrooms} onChange={v => set('bedrooms', v)} options={BEDROOMS.map(b => ({ value: b, label: b }))} placeholder="Any" />
            </Field>
            <Field label="Tags (comma separated)">
              <input className="input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="e.g. vip, referral, high-budget" />
            </Field>
          </div>
          <Field label="Notes">
            <textarea className="input resize-none" rows={4} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional notes about this lead…" />
          </Field>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary">
            {existing ? 'Save Changes' : 'Add Lead'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
