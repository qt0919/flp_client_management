import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, isDefaultPassword } from '../lib/auth'
import { Building2, Lock, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // small delay so it doesn't feel instant (UX)
    setTimeout(() => {
      if (login(password)) {
        navigate('/dashboard', { replace: true })
      } else {
        setError('Incorrect password. Please try again.')
        setPassword('')
      }
      setLoading(false)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold">FLP Property</h1>
          <p className="text-blue-300 text-sm mt-1">Client Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={18} className="text-blue-700" />
            <h2 className="font-bold text-gray-900 text-lg">Sign In</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className={`input pr-10 ${error ? 'border-red-400 focus:ring-red-500' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  autoFocus
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="btn-primary w-full justify-center py-2.5 text-base"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {isDefaultPassword() && (
            <p className="mt-4 text-xs text-gray-400 text-center">
              Default password: <span className="font-mono text-gray-600 select-all">flp2024</span>
              <br />Change it after login via the sidebar.
            </p>
          )}
        </div>

        <p className="text-center text-blue-400 text-xs mt-6">
          Singapore + Malaysia Property CRM
        </p>
      </div>
    </div>
  )
}
