import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
  Sparkles,
  BookOpen,
  School
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Role } from '../../types'

export const Login: React.FC = () => {
  const [role, setRole] = useState<Role>('Admin')
  const [email, setEmail] = useState('admin@ps52.edu')
  const [password, setPassword] = useState('admin123')
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole)
    if (selectedRole === 'Admin') {
      setEmail('admin@ps52.edu')
      setPassword('admin123')
    } else if (selectedRole === 'Faculty') {
      setEmail('faculty@ps52.edu')
      setPassword('faculty123')
    } else {
      setEmail('student@ps52.edu')
      setPassword('student123')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password, role)
      if (role === 'Admin') navigate('/admin/dashboard')
      else if (role === 'Faculty') navigate('/faculty/dashboard')
      else navigate('/student/dashboard')
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  const roleCards = [
    {
      id: 'Admin' as Role,
      title: 'Admin',
      subtitle: 'Institution & Leadership',
      description: 'System administration, student analytics, faculty management and reports.',
      icon: ShieldCheck,
      color: 'blue',
      glowClass: 'border-blue-600 shadow-md shadow-blue-500/20 ring-2 ring-blue-500/20 bg-blue-50/40',
      iconBg: 'bg-blue-600 text-white',
      badge: 'Executive View',
    },
    {
      id: 'Faculty' as Role,
      title: 'Faculty',
      subtitle: 'Mentors & Evaluators',
      description: 'Monitor students, assessments, attendance, learning difficulties and recommendations.',
      icon: School,
      color: 'emerald',
      glowClass: 'border-emerald-600 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/20 bg-emerald-50/40',
      iconBg: 'bg-emerald-600 text-white',
      badge: 'Cohort Mentorship',
    },
    {
      id: 'Student' as Role,
      title: 'Student',
      subtitle: 'Learners & Scholars',
      description: 'View personal performance, weak areas, personalized learning roadmaps and progress.',
      icon: GraduationCap,
      color: 'indigo',
      glowClass: 'border-indigo-600 shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/20 bg-indigo-50/40',
      iconBg: 'bg-indigo-600 text-white',
      badge: 'Student Journey',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl text-center relative z-10 mb-6">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-blue-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart Education & Student Analytics • Problem Statement PS52</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
          LearnTrack <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">AI</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1.5 font-medium">
          "Understand Learning. Personalize Growth."
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-3xl relative z-10">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-100">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
              Welcome Back
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your role to access your personalized educational portal
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Section 1: 3 Attractive Role Cards */}
          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 text-center sm:text-left">
              Select Your Role
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roleCards.map((c) => {
                const Icon = c.icon
                const isSelected = role === c.id

                return (
                  <div
                    key={c.id}
                    onClick={() => handleRoleSelect(c.id)}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? c.glowClass
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2.5 rounded-xl ${c.iconBg} shadow-xs`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {c.badge}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                      <p className="text-[11px] font-semibold text-slate-500 mb-2">{c.subtitle}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{c.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold">
                      <span className={isSelected ? 'text-blue-700 font-bold' : 'text-slate-400'}>
                        {isSelected ? '✓ Selected' : 'Click to select'}
                      </span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-700 translate-x-0.5' : 'text-slate-400'}`} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section 2: Role-based Credentials Form */}
          <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto pt-4 border-t border-slate-100">
            <div className="text-center pb-2">
              <span className="text-xs font-semibold text-slate-500">
                Signing in as <span className="font-bold text-slate-900">{role}</span>
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Email
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-900"
                  placeholder="name@ps52.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-600 font-medium">Remember me</span>
              </label>
              <a href="#" className="font-semibold text-blue-600 hover:text-blue-800">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-sm text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : `Enter ${role} Portal`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Footer */}
          <div className="mt-8 pt-5 border-t border-slate-100 max-w-md mx-auto">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              1-Click Demo Quick-Fill
            </p>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleRoleSelect('Admin')}
                className={`p-2 rounded-xl border text-center transition-all ${
                  role === 'Admin' ? 'bg-blue-50 border-blue-300 font-bold text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                admin@ps52.edu
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('Faculty')}
                className={`p-2 rounded-xl border text-center transition-all ${
                  role === 'Faculty' ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                faculty@ps52.edu
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('Student')}
                className={`p-2 rounded-xl border text-center transition-all ${
                  role === 'Student' ? 'bg-indigo-50 border-indigo-300 font-bold text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                student@ps52.edu
              </button>
            </div>
          </div>
        </div>

        {/* Real dataset guarantee footer */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Powered by authentic 300-student benchmark dataset (<code>student_dropout_behavior_dataset.csv</code>)
          </p>
        </div>
      </div>
    </div>
  )
}
