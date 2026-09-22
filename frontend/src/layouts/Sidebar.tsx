import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  CalendarCheck,
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  TrendingUp,
  BrainCircuit,
  Lightbulb,
  UserCheck,
  Clock,
  X,
  ShieldCheck,
  UserCircle2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  School,
  Compass,
  Calendar,
  History,
  ShieldAlert,
  BarChart3
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useStudent } from '../context/StudentContext'
import { Role } from '../types'

interface SidebarProps {
  mobileOpen: boolean
  onCloseMobile: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { role, switchRole, user, logout } = useAuth()
  const { studentName } = useStudent()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  // Admin Portal Navigation (14 items)
  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/faculty', label: 'Faculty', icon: UserCheck },
    { to: '/admin/subjects', label: 'Subjects & Topics', icon: BookOpen },
    { to: '/admin/assessments', label: 'Assessments', icon: ClipboardCheck },
    { to: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/admin/difficulty', label: 'Difficulty Analytics', icon: BrainCircuit },
    { to: '/admin/roadmaps', label: 'Learning Roadmaps', icon: Compass },
    { to: '/admin/progress', label: 'Progress', icon: TrendingUp },
    { to: '/admin/alerts', label: 'Alerts', icon: AlertTriangle },
    { to: '/admin/reports', label: 'Reports', icon: FileSpreadsheet },
    { to: '/admin/insights', label: 'Academic Insights', icon: Sparkles },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
    { to: '/admin/profile', label: 'Profile', icon: UserCircle2 },
  ]

  // Faculty Portal Navigation (12 items)
  const facultyLinks = [
    { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/faculty/my-students', label: 'My Students', icon: Users },
    { to: '/faculty/performance', label: 'Performance', icon: BarChart3 },
    { to: '/faculty/difficulty', label: 'Difficulty Analysis', icon: BrainCircuit },
    { to: '/faculty/roadmaps', label: 'Learning Roadmaps', icon: Compass },
    { to: '/faculty/interventions', label: 'Interventions', icon: ShieldAlert },
    { to: '/faculty/assessments', label: 'Assessments', icon: ClipboardCheck },
    { to: '/faculty/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/faculty/progress', label: 'Progress', icon: TrendingUp },
    { to: '/faculty/reports', label: 'Reports', icon: FileSpreadsheet },
    { to: '/faculty/insights', label: 'Academic Insights', icon: Sparkles },
    { to: '/faculty/profile', label: 'Profile', icon: UserCircle2 },
  ]

  // Student Portal Navigation (Full suite)
  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/profile', label: 'Profile', icon: UserCircle2 },
    { to: '/student/performance', label: 'My Performance', icon: ClipboardCheck },
    { to: '/student/roadmap', label: 'Learning Roadmap', icon: Compass },
    { to: '/student/weak-areas', label: 'Weak Areas', icon: BrainCircuit },
    { to: '/student/study-plan', label: 'Study Plan', icon: BookOpen },
    { to: '/student/recommendations', label: 'Recommendations', icon: Sparkles },
    { to: '/student/progress', label: 'My Progress', icon: TrendingUp },
    { to: '/student/alerts', label: 'Alerts', icon: AlertTriangle },
    { to: '/student/reports', label: 'Reports', icon: FileSpreadsheet },
    { to: '/student/settings', label: 'Settings', icon: Settings },
    { to: '/student/calendar', label: 'Academic Calendar', icon: Calendar },
    { to: '/student/assessments', label: 'Assessments', icon: BookOpen },
    { to: '/student/history', label: 'Learning History', icon: History },
  ]

  const links = role === 'Admin' ? adminLinks : role === 'Faculty' ? facultyLinks : studentLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-slate-950 text-slate-200 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 shadow-2xl lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-white tracking-tight font-heading">
                    LearnTrack
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">Understand & Personalize</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Role badge pill */}
        {!collapsed && (
          <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  role === 'Admin'
                    ? 'bg-blue-400'
                    : role === 'Faculty'
                    ? 'bg-emerald-400'
                    : 'bg-indigo-400'
                }`}
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                {role} Portal
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">PS52 v1.0</span>
          </div>
        )}

        {/* Navigation links list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  } ${collapsed ? 'justify-center' : ''}`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            )
          })}
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t border-slate-800 bg-slate-950">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                {(role === 'Student' ? (studentName || user?.name || 'S') : (user?.name || 'U')).charAt(0)}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-white truncate" title={role === 'Student' ? (studentName || user?.name) : user?.name}>
                    {role === 'Student' ? (studentName || user?.name || 'Student') : (user?.name || 'Academic User')}
                  </h5>
                  <p className="text-[10px] text-slate-400 truncate">{role}</p>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
