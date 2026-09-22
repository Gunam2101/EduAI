import React, { useState } from 'react'
import {
  Settings,
  Bell,
  ShieldCheck,
  Mail,
  User,
  GraduationCap,
  Save,
  CheckCircle2
} from 'lucide-react'
import { useStudent } from '../../context/StudentContext'

export const StudentSettings: React.FC = () => {
  const { selectedStudent, studentName } = useStudent()

  const [emailAlerts, setEmailAlerts] = useState(true)
  const [attendanceAlerts, setAttendanceAlerts] = useState(true)
  const [ciaReminders, setCiaReminders] = useState(true)
  const [studyPlanAlerts, setStudyPlanAlerts] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
          Student Preferences &amp; Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Notification channels, academic alert sensitivities, and profile settings for {studentName}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card Summary */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 font-heading">Profile Identity</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-semibold text-slate-500 block">Student Name</span>
              <span className="font-bold text-slate-900 mt-1 block">{studentName}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500 block">Register Number</span>
              <span className="font-bold text-slate-900 mt-1 block font-mono">
                {selectedStudent?.register_no || `2022AD${selectedStudent?.id?.toString().padStart(4, '0') || '0001'}`}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-500 block">Department</span>
              <span className="font-bold text-slate-900 mt-1 block">
                {selectedStudent?.department || 'Artificial Intelligence & Data Science'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-500 block">Student ID / Roll No</span>
              <span className="font-bold text-slate-900 mt-1 block font-mono">#{selectedStudent?.id || 1}</span>
            </div>
          </div>
        </div>

        {/* Academic Notifications Settings */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 font-heading">Notification &amp; Early Alert Preferences</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={attendanceAlerts}
                onChange={(e) => setAttendanceAlerts(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Attendance Shortage Early Warning</span>
                <span className="text-[11px] text-slate-500">
                  Notify me immediately if lecture attendance falls below 75% or lab attendance falls below 80%.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={ciaReminders}
                onChange={(e) => setCiaReminders(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Continuous Assessment (CIA) Reminders</span>
                <span className="text-[11px] text-slate-500">
                  Receive alerts 48 hours prior to CIA Quiz and Midterm Internal Assessment test windows.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={studyPlanAlerts}
                onChange={(e) => setStudyPlanAlerts(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Daily Adaptive Study Plan Reminders</span>
                <span className="text-[11px] text-slate-500">
                  Deliver scheduled micro-tasks for your prioritized weak topics every morning.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Institutional Email Dispatch</span>
                <span className="text-[11px] text-slate-500">
                  Send high-priority academic warnings and advisor messages to college email address.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {saved && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings saved successfully!</span>
            </div>
          )}
          <button
            type="submit"
            className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  )
}
