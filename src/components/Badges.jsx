import { LEAD_TEMPS, MARKETS, OWNERSHIP_TYPES, PIPELINE_STAGES } from '../lib/constants'

export function TempBadge({ value }) {
  const t = LEAD_TEMPS.find(x => x.value === value)
  if (!t) return null
  return <span className={t.className}>{t.label}</span>
}

export function MarketBadge({ value }) {
  const m = MARKETS.find(x => x.value === value)
  if (!m) return null
  return <span className={m.className}>{m.label}</span>
}

export function OwnershipBadge({ value }) {
  if (!value) return null
  const o = OWNERSHIP_TYPES.find(x => x.value === value)
  if (!o) return null
  return <span className={o.className}>{o.label}</span>
}

export function StageBadge({ value }) {
  const s = PIPELINE_STAGES.find(x => x.value === value)
  if (!s) return null
  return (
    <span className={`badge ${s.color}`}>{s.label}</span>
  )
}
