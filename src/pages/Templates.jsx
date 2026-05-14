import { useState, useMemo } from 'react'
import {
  getTemplates, createTemplate, updateTemplate, deleteTemplate,
  getFolders, createFolder, updateFolder, deleteFolder as deleteFolderStore,
} from '../lib/store'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import {
  MessageSquare, Plus, Copy, ExternalLink, Trash2, Edit2,
  Check, X, Folder, FolderOpen, FolderPlus, Search,
} from 'lucide-react'

const CATEGORIES = [
  { value: 'cold', label: '❄️ Cold' },
  { value: 'warm', label: '🌡️ Warm' },
  { value: 'appointment', label: '📅 Appointment' },
  { value: 'post_viewing', label: '🏠 Post-Viewing' },
  { value: 'investor', label: '📊 Investor' },
  { value: 'cross_border', label: '✈️ Cross-Border' },
  { value: 'market_update', label: '📰 Market Update' },
]

const MARKET_LABELS = { sg: '🇸🇬 SG', my: '🇲🇾 MY', both: '🌐 Both', all: 'All' }

function TemplateCard({ template, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(template.body)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openWa = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(template.body)}`, '_blank')
  }

  return (
    <div className="card p-4 space-y-3 group">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{template.name}</p>
          <div className="flex gap-1 mt-1">
            <span className="badge bg-gray-100 text-gray-600 text-xs capitalize">{template.category.replace('_', ' ')}</span>
            <span className="badge bg-blue-50 text-blue-700 text-xs">{MARKET_LABELS[template.market] || template.market}</span>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(template)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
            <Edit2 size={14} />
          </button>
          <button onClick={() => onDelete(template.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto border border-gray-100">
        {template.body}
      </pre>

      <div className="flex gap-2">
        <button onClick={copy} className="btn-secondary text-xs py-1.5 px-3 flex-1 justify-center">
          {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
        </button>
        <button onClick={openWa} className="btn-primary text-xs py-1.5 px-3 flex-1 justify-center">
          <ExternalLink size={13} /> Open in WhatsApp
        </button>
      </div>
    </div>
  )
}

function TemplateFormModal({ template, onSave, onClose, folders }) {
  const [form, setForm] = useState({
    name: template?.name || '',
    category: template?.category || 'cold',
    market: template?.market || 'all',
    folder_id: template?.folder_id || '',
    body: template?.body || '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">{template ? 'Edit Template' : 'New Template'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Cold Intro – Investor" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Market</label>
              <select className="input" value={form.market} onChange={e => set('market', e.target.value)}>
                <option value="all">All</option>
                <option value="sg">🇸🇬 Singapore</option>
                <option value="my">🇲🇾 Malaysia</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Project Folder</label>
            <select className="input" value={form.folder_id} onChange={e => set('folder_id', e.target.value)}>
              <option value="">General (no folder)</option>
              {folders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Message Body</label>
            <p className="text-xs text-gray-400 mb-1">Use {'{name}'}, {'{area}'}, {'{property_type}'}, {'{price}'}, {'{date}'}, {'{time}'}, {'{location}'} as placeholders</p>
            <textarea
              className="input resize-none"
              rows={8}
              value={form.body}
              onChange={e => set('body', e.target.value)}
              placeholder="Type your message here…"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button className="btn-primary flex-1 justify-center" onClick={() => onSave(form)}>
            {template ? 'Save Changes' : 'Create Template'}
          </button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function Templates() {
  const [templates, setTemplates] = useState(() => getTemplates())
  const [folders, setFolders] = useState(() => getFolders())
  const [selectedFolder, setSelectedFolder] = useState('all')
  const [search, setSearch] = useState('')
  const [editTarget, setEditTarget] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingFolder, setEditingFolder] = useState(null)
  const [editingFolderName, setEditingFolderName] = useState('')
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)

  const refreshAll = () => {
    setTemplates(getTemplates())
    setFolders(getFolders())
  }

  const handleSave = (form) => {
    if (editTarget) {
      updateTemplate(editTarget.id, form)
    } else {
      createTemplate(form)
    }
    setShowForm(false)
    setEditTarget(null)
    refreshAll()
  }

  const handleDelete = (id) => {
    if (confirm('Delete this template?')) {
      deleteTemplate(id)
      refreshAll()
    }
  }

  const handleEdit = (t) => {
    setEditTarget(t)
    setShowForm(true)
  }

  const handleCreateFolder = () => {
    const name = newFolderName.trim()
    if (!name) return
    createFolder(name)
    setNewFolderName('')
    setShowNewFolder(false)
    refreshAll()
  }

  const handleRenameFolder = () => {
    const name = editingFolderName.trim()
    if (!name || !editingFolder) return
    updateFolder(editingFolder.id, name)
    setEditingFolder(null)
    setEditingFolderName('')
    refreshAll()
  }

  const handleDeleteFolder = (id) => {
    if (confirm('Delete this folder? Templates inside will move to General.')) {
      deleteFolderStore(id)
      if (selectedFolder === id) setSelectedFolder('all')
      refreshAll()
    }
  }

  const filtered = useMemo(() => {
    let items = templates
    if (search) {
      const q = search.toLowerCase()
      return items.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.body.toLowerCase().includes(q)
      )
    }
    if (selectedFolder === 'general') return items.filter(t => !t.folder_id)
    if (selectedFolder !== 'all') return items.filter(t => t.folder_id === selectedFolder)
    return items
  }, [templates, search, selectedFolder])

  const folderCount = (folderId) => templates.filter(t => t.folder_id === folderId).length
  const generalCount = templates.filter(t => !t.folder_id).length

  const activeFolderName = search
    ? `Search results for "${search}"`
    : selectedFolder === 'all' ? 'All Templates'
    : selectedFolder === 'general' ? 'General'
    : (folders.find(f => f.id === selectedFolder)?.name || 'Templates')

  const navBtn = (key, icon, label, count) => {
    const active = selectedFolder === key && !search
    return (
      <button
        key={key}
        onClick={() => { setSelectedFolder(key); setSearch('') }}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
      >
        {icon}
        <span className="flex-1 text-left truncate">{label}</span>
        <span className={`text-xs tabular-nums ${active ? 'text-blue-200' : 'text-gray-400'}`}>{count}</span>
      </button>
    )
  }

  const chipClass = (key) => {
    const active = selectedFolder === key && !search
    return `shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
      active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`
  }

  return (
    <div>
      <PageHeader
        title="WhatsApp Templates"
        subtitle={`${templates.length} templates · copy or open directly in WhatsApp`}
      />

      {/* ── Mobile: search + horizontal folder chips ── */}
      <div className="lg:hidden mt-3 space-y-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            className="input pl-8 text-sm py-2"
            placeholder="Search templates…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <button className={chipClass('all')} onClick={() => { setSelectedFolder('all'); setSearch('') }}>
            All ({templates.length})
          </button>
          <button className={chipClass('general')} onClick={() => { setSelectedFolder('general'); setSearch('') }}>
            General ({generalCount})
          </button>
          {folders.map(f => (
            <button key={f.id} className={chipClass(f.id)} onClick={() => { setSelectedFolder(f.id); setSearch('') }}>
              📁 {f.name} ({folderCount(f.id)})
            </button>
          ))}
          <button
            onClick={() => setShowNewFolder(true)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-gray-300 text-gray-500 whitespace-nowrap"
          >
            + New Folder
          </button>
        </div>
        {showNewFolder && (
          <div className="flex gap-2">
            <input
              className="input text-sm py-1.5 flex-1"
              placeholder="Folder name…"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') { setShowNewFolder(false); setNewFolderName('') } }}
              autoFocus
            />
            <button onClick={handleCreateFolder} className="btn-primary text-xs py-1 px-3 justify-center">Create</button>
            <button onClick={() => { setShowNewFolder(false); setNewFolderName('') }} className="btn-secondary text-xs py-1 px-2 justify-center"><X size={13} /></button>
          </div>
        )}
      </div>

      <div className="flex gap-6 mt-4">
        {/* ── Left: Folder sidebar (desktop only) ── */}
        <div className="hidden lg:block w-52 shrink-0 space-y-1">

          {/* Search */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              className="input pl-8 text-sm py-2"
              placeholder="Search templates…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* All / General */}
          {navBtn('all', <Folder size={15} />, 'All Templates', templates.length)}
          {navBtn('general', <Folder size={15} />, 'General', generalCount)}

          {/* Project folders */}
          {folders.length > 0 && (
            <p className="text-xs text-gray-400 uppercase tracking-wide px-3 pt-3 pb-1">Projects</p>
          )}
          {folders.map(folder => {
            const active = selectedFolder === folder.id && !search
            return (
              <div key={folder.id} className="group relative">
                {editingFolder?.id === folder.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      className="input text-sm py-1.5 px-2 flex-1"
                      value={editingFolderName}
                      onChange={e => setEditingFolderName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleRenameFolder(); if (e.key === 'Escape') setEditingFolder(null) }}
                      autoFocus
                    />
                    <button onClick={handleRenameFolder} className="p-1 text-green-600 hover:text-green-700 shrink-0"><Check size={13} /></button>
                    <button onClick={() => setEditingFolder(null)} className="p-1 text-gray-400 hover:text-gray-600 shrink-0"><X size={13} /></button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => { setSelectedFolder(folder.id); setSearch('') }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors pr-14 ${active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {active ? <FolderOpen size={15} /> : <Folder size={15} />}
                      <span className="flex-1 text-left truncate">{folder.name}</span>
                      <span className={`text-xs tabular-nums ${active ? 'text-blue-200' : 'text-gray-400'}`}>{folderCount(folder.id)}</span>
                    </button>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-0.5">
                      <button
                        onClick={e => { e.stopPropagation(); setEditingFolder(folder); setEditingFolderName(folder.name) }}
                        className={`p-1 rounded ${active ? 'text-blue-200 hover:text-white' : 'text-gray-400 hover:text-blue-600'}`}
                      >
                        <Edit2 size={11} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteFolder(folder.id) }}
                        className={`p-1 rounded ${active ? 'text-blue-200 hover:text-white' : 'text-gray-400 hover:text-red-500'}`}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}

          {/* New Folder */}
          <div className="pt-2">
            {showNewFolder ? (
              <div className="space-y-1.5">
                <input
                  className="input text-sm py-1.5"
                  placeholder="Folder name…"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') { setShowNewFolder(false); setNewFolderName('') } }}
                  autoFocus
                />
                <div className="flex gap-1">
                  <button onClick={handleCreateFolder} className="btn-primary text-xs py-1 px-3 flex-1 justify-center">Create</button>
                  <button onClick={() => { setShowNewFolder(false); setNewFolderName('') }} className="btn-secondary text-xs py-1 px-2 justify-center"><X size={13} /></button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewFolder(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors border border-dashed border-gray-300"
              >
                <FolderPlus size={14} />
                New Folder
              </button>
            )}
          </div>
        </div>

        {/* ── Right: Template grid ── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">{activeFolderName}</h2>
              <p className="text-sm text-gray-500">
                {filtered.length} template{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button className="btn-primary" onClick={() => { setEditTarget(null); setShowForm(true) }}>
              <Plus size={16} /> New Template
            </button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title={search ? 'No templates match your search' : 'No templates here'}
              description={search ? 'Try a different keyword.' : 'Click "New Template" to add one to this folder.'}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(t => (
                <TemplateCard key={t.id} template={t} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <TemplateFormModal
          template={editTarget}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
          folders={folders}
        />
      )}
    </div>
  )
}

