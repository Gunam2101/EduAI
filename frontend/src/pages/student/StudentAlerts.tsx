import React, { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  Filter
} from 'lucide-react'
import { LoadingState } from '../../components/common/LoadingState'
import { useStudent } from '../../context/StudentContext'
import { api } from '../../services/api'
import { Alert } from '../../types'

export const StudentAlerts: React.FC = () => {
  const { selectedStudentId, studentName } = useStudent()

  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [priorityFilter, setPriorityFilter] = useState('ALL')

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const res = await api.getStudentAlerts(selectedStudentId)
      if (res && res.alerts) {
        setAlerts(res.alerts)
      } else {
        const fallback = await api.getAlerts()
        const userAlerts = (fallback.alerts || []).filter((a: any) => a.student_id === selectedStudentId)
        setAlerts(userAlerts)
      }
    } catch (err) {
      console.error('Error loading alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [selectedStudentId])

  const handleMarkRead = async (id: number) => {
    try {
      await api.markAlertRead(id)
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_read: true } : a)))
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = alerts.filter((a) => {
    if (priorityFilter === 'ALL') return true
    return a.priority === priorityFilter
  })

  if (loading) return <LoadingState message="Loading early warning notifications..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
            Academic Alerts &amp; Early Warning Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active diagnostic notifications, CIA deadlines, and attendance advisories for {studentName}
          </p>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-700 shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Alerts ({alerts.length})</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No active early warning notifications for {studentName}. You are in good academic standing.
          </div>
        ) : (
          filtered.map((alert) => {
            const isHigh = alert.priority === 'HIGH'
            const isMed = alert.priority === 'MEDIUM'
            const badgeClass = isHigh
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : isMed
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border transition-all ${
                  alert.is_read
                    ? 'bg-slate-50/70 border-slate-200/80 opacity-75'
                    : 'bg-white border-slate-200/90 shadow-2xs hover:shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isHigh ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                      {alert.priority} PRIORITY
                    </span>
                    {!alert.is_read && (
                      <button
                        onClick={() => handleMarkRead(alert.id)}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full cursor-pointer"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed pl-10.5">
                  {alert.message}
                </p>

                {alert.trigger_reason && (
                  <div className="mt-2.5 pl-10.5 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Diagnostic Indicator: </span>
                    <span>{alert.trigger_reason}</span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
