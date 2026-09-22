import React, { useState, useEffect } from 'react'
import {
  Menu,
  Bell,
  LogOut,
  Database,
  Shield,
  Search,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  User
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useStudent } from '../context/StudentContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../services/api'
import { Alert, Role } from '../types'

interface TopNavbarProps {
  onOpenMobile: () => void
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenMobile }) => {
  const { user, role, logout, switchRole } = useAuth()
  const { selectedStudentId, selectedStudent, studentName, allStudents, setSelectedStudentId } = useStudent()
  const navigate = useNavigate()
  const location = useLocation()

  const displayName = role === 'Student' ? (studentName || user?.name || 'Student') : (user?.name || 'User')

  const [alerts, setAlerts] = useState<Alert[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showAlertMenu, setShowAlertMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.getAlerts()
        setAlerts(res.alerts ? res.alerts.slice(0, 5) : [])
        setUnreadCount(res.unread_high + res.unread_medium)
      } catch (e) {
        // quiet
      }
    }
    fetchAlerts()
  }, [])

  // Derive human-readable page title from current route
  const getPageTitle = () => {
    const p = location.pathname.split('/').filter(Boolean)
    if (p.length === 0) return 'Dashboard'
    const last = p[p.length - 1]
    const titleMap: Record<string, string> = {
      dashboard: `${role} Dashboard`,
      students: 'Student Directory & Records',
      faculty: 'Faculty Mentors Directory',
      subjects: 'Curriculum & Topic Mapping',
      assessments: 'Continuous Internal Assessments (CIA)',
      attendance: 'Theory & Laboratory Attendance',
      difficulty: 'Learning Difficulty Diagnostics',
      'study-plans': 'Personalized Learning Roadmaps',
      roadmaps: 'Learning Roadmaps',
      roadmap: 'Personalized Learning Roadmap',
      progress: 'Academic Progress Trajectory',
      recommendations: 'Cohort Interventions',
      alerts: 'Early Warning Alerts Center',
      reports: 'Accreditation & Academic Reports',
      settings: 'Diagnostic Calibration & Weights',
      'my-students': 'Mentored Student Cohort',
      performance: 'Academic Performance Scorecard',
      'weak-areas': 'Diagnostic Weak Areas',
      profile: 'Student Profile & Roll Details',
    }
    return titleMap[last] || last.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-heading">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Student Switcher in Student Mode */}
        {role === 'Student' && allStudents.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-indigo-50/80 border border-indigo-200/80 rounded-full text-indigo-900">
            <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="text-[11px] font-semibold text-indigo-700 shrink-0">Student:</span>
            <select
              value={selectedStudentId || ''}
              onChange={(e) => setSelectedStudentId(Number(e.target.value))}
              aria-label="Active Student Selector"
              className="bg-transparent text-xs font-bold text-indigo-950 focus:outline-none cursor-pointer max-w-[150px] truncate"
            >
              {allStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.roll_number || `#${s.id}`})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dataset Live Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-mono text-[11px]">300 Students Loaded</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowAlertMenu(!showAlertMenu)
              setShowProfileMenu(false)
            }}
            className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            title="Early Warning Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showAlertMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-900">Early Warning Alerts</span>
                </div>
                <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  {unreadCount} Active
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No unread alerts.</p>
                ) : (
                  alerts.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => {
                        setShowAlertMenu(false)
                        navigate(role === 'Admin' ? '/admin/alerts' : '/student/dashboard')
                      }}
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">{a.title}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            a.priority === 'HIGH'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {a.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{a.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setShowAlertMenu(false)
                    navigate(role === 'Admin' ? '/admin/alerts' : '/student/dashboard')
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  View All Early Warning Alerts →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu)
              setShowAlertMenu(false)
            }}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {displayName.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]" title={displayName}>
                {displayName}
              </span>
              <span className="block text-[10px] text-slate-500">{role}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <span className="block text-xs font-bold text-slate-900 truncate">{displayName}</span>
                <span className="block text-[10px] text-slate-500 truncate">
                  {role === 'Student' && selectedStudent ? `${selectedStudent.roll_number || ''} • ${selectedStudent.department || 'B.Tech'}` : user?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
