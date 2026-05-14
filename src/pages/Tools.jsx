import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { Calculator } from 'lucide-react'

// ─── ABSD Calculator ─────────────────────────────────────────────────────────
const ABSD_RATES = {
  sc:       [0, 20, 30],   // 1st, 2nd, 3rd+
  spr:      [5, 30, 35],
  foreigner:[60, 60, 60],
}

function ABSDCalc() {
  const [profile, setProfile] = useState('sc')
  const [propCount, setPropCount] = useState(1)
  const [price, setPrice] = useState('')

  const idx = Math.min(propCount - 1, 2)
  const rate = ABSD_RATES[profile]?.[idx] ?? 0
  const absdAmt = price ? Math.round((Number(price) * rate) / 100) : null

  return (
    <div className="card p-6 space-y-5">
      <h2 className="font-bold text-gray-900 flex items-center gap-2">
        🇸🇬 ABSD Calculator
        <span className="text-xs font-normal text-gray-400">(Additional Buyer's Stamp Duty)</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Buyer Profile</label>
          <select className="input" value={profile} onChange={e => setProfile(e.target.value)}>
            <option value="sc">Singapore Citizen (SC)</option>
            <option value="spr">Singapore PR (SPR)</option>
            <option value="foreigner">Foreigner</option>
          </select>
        </div>
        <div>
          <label className="label">Property Count (after purchase)</label>
          <select className="input" value={propCount} onChange={e => setPropCount(Number(e.target.value))}>
            <option value={1}>1st Property</option>
            <option value={2}>2nd Property</option>
            <option value={3}>3rd+ Property</option>
          </select>
        </div>
        <div>
          <label className="label">Purchase Price (SGD)</label>
          <input
            type="number"
            className="input"
            placeholder="e.g. 1200000"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
        </div>
      </div>

      <div className={`rounded-xl p-5 text-center ${rate === 0 ? 'bg-green-50 border border-green-200' : rate >= 60 ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'}`}>
        <p className={`text-4xl font-black ${rate === 0 ? 'text-green-700' : rate >= 60 ? 'text-red-700' : 'text-orange-700'}`}>
          {rate}%
        </p>
        <p className="text-gray-600 text-sm mt-1">ABSD Rate</p>
        {absdAmt !== null && (
          <p className="text-xl font-bold text-gray-800 mt-2">
            SGD {absdAmt.toLocaleString()}
          </p>
        )}
        {absdAmt !== null && price && (
          <p className="text-xs text-gray-500 mt-1">
            Total cost: SGD {(Number(price) + absdAmt).toLocaleString()}
          </p>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">ABSD Rate Table (2024)</p>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500">
              <th className="text-left py-1">Profile</th>
              <th className="text-center py-1">1st</th>
              <th className="text-center py-1">2nd</th>
              <th className="text-center py-1">3rd+</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              { label: 'SC', rates: ABSD_RATES.sc },
              { label: 'SPR', rates: ABSD_RATES.spr },
              { label: 'Foreigner', rates: ABSD_RATES.foreigner },
            ].map(r => (
              <tr key={r.label}>
                <td className="py-1.5 font-medium text-gray-700">{r.label}</td>
                {r.rates.map((v, i) => (
                  <td key={i} className={`text-center py-1.5 font-semibold ${v === 0 ? 'text-green-600' : v >= 60 ? 'text-red-600' : 'text-orange-600'}`}>{v}%</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── RPGT Calculator ──────────────────────────────────────────────────────────
const RPGT_RATES = {
  citizen:  [30, 30, 20, 15, 10, 0],  // Year 1, 2, 3, 4, 5, 6+
  pr:       [30, 30, 20, 15, 10, 0],
  foreigner:[30, 30, 30, 30, 30, 30],
  company:  [30, 30, 20, 15, 10, 10],
}

function RPGTCalc() {
  const [profile, setProfile] = useState('citizen')
  const [holdingYears, setHoldingYears] = useState(1)
  const [gainAmt, setGainAmt] = useState('')

  const idx = Math.min(holdingYears - 1, 5)
  const rate = RPGT_RATES[profile]?.[idx] ?? 0
  const taxAmt = gainAmt ? Math.round((Number(gainAmt) * rate) / 100) : null

  return (
    <div className="card p-6 space-y-5">
      <h2 className="font-bold text-gray-900 flex items-center gap-2">
        🇲🇾 RPGT Calculator
        <span className="text-xs font-normal text-gray-400">(Real Property Gains Tax)</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Seller Profile</label>
          <select className="input" value={profile} onChange={e => setProfile(e.target.value)}>
            <option value="citizen">Malaysian Citizen</option>
            <option value="pr">Permanent Resident (PR)</option>
            <option value="foreigner">Foreigner</option>
            <option value="company">Company</option>
          </select>
        </div>
        <div>
          <label className="label">Holding Period (Years)</label>
          <select className="input" value={holdingYears} onChange={e => setHoldingYears(Number(e.target.value))}>
            {[1,2,3,4,5,6].map(y => <option key={y} value={y}>{y === 6 ? '6+ Years' : `${y} Year${y > 1 ? 's' : ''}`}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Chargeable Gain (MYR)</label>
          <input
            type="number"
            className="input"
            placeholder="e.g. 200000"
            value={gainAmt}
            onChange={e => setGainAmt(e.target.value)}
          />
        </div>
      </div>

      <div className={`rounded-xl p-5 text-center ${rate === 0 ? 'bg-green-50 border border-green-200' : rate >= 30 ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'}`}>
        <p className={`text-4xl font-black ${rate === 0 ? 'text-green-700' : rate >= 30 ? 'text-red-700' : 'text-orange-700'}`}>
          {rate}%
        </p>
        <p className="text-gray-600 text-sm mt-1">RPGT Rate</p>
        {taxAmt !== null && (
          <p className="text-xl font-bold text-gray-800 mt-2">
            RM {taxAmt.toLocaleString()}
          </p>
        )}
        {taxAmt !== null && gainAmt && (
          <p className="text-xs text-gray-500 mt-1">
            Net gain after tax: RM {(Number(gainAmt) - taxAmt).toLocaleString()}
          </p>
        )}
        {rate === 0 && profile !== 'foreigner' && (
          <p className="text-green-700 text-xs mt-2 font-medium">No RPGT payable — held 6+ years 🎉</p>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">RPGT Rate Table</p>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500">
              <th className="text-left py-1">Profile</th>
              <th className="text-center py-1">Y1</th>
              <th className="text-center py-1">Y2</th>
              <th className="text-center py-1">Y3</th>
              <th className="text-center py-1">Y4</th>
              <th className="text-center py-1">Y5</th>
              <th className="text-center py-1">Y6+</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              { label: 'Citizen/PR', rates: RPGT_RATES.citizen },
              { label: 'Foreigner', rates: RPGT_RATES.foreigner },
              { label: 'Company', rates: RPGT_RATES.company },
            ].map(r => (
              <tr key={r.label}>
                <td className="py-1.5 font-medium text-gray-700">{r.label}</td>
                {r.rates.map((v, i) => (
                  <td key={i} className={`text-center py-1.5 font-semibold ${v === 0 ? 'text-green-600' : v >= 30 ? 'text-red-600' : 'text-orange-600'}`}>{v}%</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-400 mt-2">* Malaysian citizens get 1 lifetime exemption on residential property gains.</p>
      </div>
    </div>
  )
}

// ─── Foreign Ownership Guide ──────────────────────────────────────────────────
function ForeignOwnershipGuide() {
  return (
    <div className="card p-6 space-y-4">
      <h2 className="font-bold text-gray-900">🌐 Foreign Ownership Quick Reference</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 space-y-2">
          <h3 className="font-semibold text-blue-800 text-sm">🇸🇬 Singapore — Foreigners</h3>
          <ul className="text-xs text-blue-900 space-y-1">
            <li>• Can buy private condo / commercial freely</li>
            <li>• Cannot buy HDB (resale/new) or EC</li>
            <li>• Landed: restricted to Sentosa Cove only</li>
            <li>• ABSD: <strong>60%</strong> on any residential property</li>
            <li>• TDSR applies: 55% of gross income</li>
          </ul>
        </div>
        <div className="bg-red-50 rounded-xl p-4 space-y-2">
          <h3 className="font-semibold text-red-800 text-sm">🇲🇾 Malaysia — Foreigners</h3>
          <ul className="text-xs text-red-900 space-y-1">
            <li>• Minimum purchase price: <strong>RM 1,000,000</strong></li>
            <li>• Cannot buy Bumiputera-reserved units</li>
            <li>• Cannot buy low/medium-cost housing</li>
            <li>• RPGT always 30% regardless of holding period</li>
            <li>• Max loan: 70% of property value</li>
            <li>• MM2H holders may have relaxed rules</li>
          </ul>
        </div>
        <div className="bg-green-50 rounded-xl p-4 space-y-2">
          <h3 className="font-semibold text-green-800 text-sm">🇲🇾 Bumi vs Non-Bumi Lots</h3>
          <ul className="text-xs text-green-900 space-y-1">
            <li>• Bumi lots: reserved for Bumiputera buyers only</li>
            <li>• Typically priced 5–15% lower than non-Bumi</li>
            <li>• Cannot be sold to non-Bumi without state approval</li>
            <li>• Non-Bumi lots: open to all Malaysian citizens</li>
            <li>• Foreign buyers: non-Bumi lots only, RM1M floor</li>
          </ul>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 space-y-2">
          <h3 className="font-semibold text-purple-800 text-sm">✈️ Cross-Border Tips</h3>
          <ul className="text-xs text-purple-900 space-y-1">
            <li>• SG buying MY: no ABSD, just RPGT on exit</li>
            <li>• MY buying SG: 60% ABSD — factor into ROI</li>
            <li>• Forest City: special financial zone, check latest rules</li>
            <li>• Currency risk: SGD/MYR exchange affects returns</li>
            <li>• Dual taxation agreements exist between SG & MY</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function Tools() {
  const [tab, setTab] = useState('absd')

  return (
    <div className="space-y-5">
      <PageHeader title="Property Tools" subtitle="Calculators and quick references for SG & MY markets" />

      <div className="flex gap-1 border-b border-gray-200 mb-2">
        {[
          { key: 'absd',    label: '🇸🇬 ABSD' },
          { key: 'rpgt',    label: '🇲🇾 RPGT' },
          { key: 'foreign', label: '🌐 Foreign Ownership' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors
              ${tab === t.key ? 'border-blue-700 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'absd'    && <ABSDCalc />}
      {tab === 'rpgt'    && <RPGTCalc />}
      {tab === 'foreign' && <ForeignOwnershipGuide />}
    </div>
  )
}
