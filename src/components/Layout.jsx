import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Kanban, CalendarCheck,
  MessageSquare, BarChart2, Calculator, Menu, X, Building2,
  LogOut, KeyRound, Check,
} from 'lucide-react'
import { useState } from 'react'
import { logout, changePassword, isDefaultPassword } from '../lib/auth'

const nav = [
  { to: '/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/leads',     label: 'Leads',       icon: Users },
  { to: '/pipeline',  label: 'Pipeline',    icon: Kanban },
  { to: '/followups', label: 'Follow-Ups',  icon: CalendarCheck },
  { to: '/templates', label: 'Templates',   icon: MessageSquare },
  { to: '/reports',   label: 'Reports',     icon: BarChart2 },
  { to: '/tools',     label: 'Tools',       icon: Calculator },
]

function ChangePasswordModal({ onClose }) {
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSave = () => {
    setError('')
    if (!oldPw || !newPw || !confirmPw) { setError('All fields are required.'); return }
    if (newPw.length < 4) { setError('New password must be at least 4 characters.'); return }
    if (newPw !== confirmPw) { setError('New passwords do not match.'); return }
    if (changePassword(oldPw, newPw)) {
      setSuccess(true)
      setTimeout(onClose, 1500)
    } else {
      setError('Current password is incorrect.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <KeyRound size={17} className="text-blue-700" /> Change Password
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </div>

        {success ? (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-3">
            <Check size={18} /> Password updated!
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="label">Current Password</label>
              <input type="password" className="input" value={oldPw}
                onChange={e => { setOldPw(e.target.value); setError('') }}
                placeholder={isDefaultPassword() ? 'flp2024 (default)' : ''}
              />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input" value={newPw}
                onChange={e => { setNewPw(e.target.value); setError('') }}
                placeholder="Min 4 characters" />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" className="input" value={confirmPw}
                onChange={e => { setConfirmPw(e.target.value); setError('') }}
                placeholder="Repeat new password" />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button className="btn-primary flex-1 justify-center" onClick={handleSave}>Save Password</button>
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Layout() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [showChangePw, setShowChangePw] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-60 bg-blue-900 text-white flex flex-col
          transform transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-blue-800">
          <Building2 size={22} className="text-blue-300" />
          <div>
            <p className="font-bold text-sm leading-none">FLP Property</p>
            <p className="text-blue-400 text-xs mt-0.5">Client Management</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="px-3 py-3 border-t border-blue-800 space-y-0.5">
          <button
            onClick={() => setShowChangePw(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-300 hover:bg-blue-800 hover:text-white transition-colors"
          >
            <KeyRound size={15} />
            Change Password
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-300 hover:bg-red-700 hover:text-white transition-colors"
          >
            <LogOut size={15} />
            Logout
          </button>
          <p className="text-blue-500 text-xs px-3 pt-1">v0.1.0 · SG + MY</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold text-gray-800">FLP Property</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
    </div>
  )
}

