import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Filter,
  CheckCheck,
  BellRing
} from 'lucide-react'
import { AlertCard } from '../../components/common/AlertCard'
import { LoadingState } from '../../components/common/LoadingState'
import { api } from '../../services/api'
import { Alert } from '../../types'

export const AlertsCenter: React.FC = () => {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [unreadHigh, setUnreadHigh] = useState(0)
  const [unreadMed, setUnreadMed] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const res = await api.getAlerts(priorityFilter)
      setAlerts(res.alerts || [])
      setUnreadHigh(res.unread_high)
      setUnreadMed(res.unread_medium)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [priorityFilter])

  const handleDismiss = async (id: number) => {
    try {
      await api.markAlertRead(id)
      fetchAlerts()
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await api.markAllAlertsRead()
      fetchAlerts()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BellRing className="w-5 h-5 text-rose-600" />
            <span>Early Warning & Intervention Alert Feed</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated alerts triggered dynamically from academic thresholds and attendance patterns
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Priority Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setPriorityFilter('HIGH')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            priorityFilter === 'HIGH'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-rose-700">High Priority</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">{unreadHigh} Active</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Critical final exam failure or attendance &lt; 50%</p>
        </div>

        <div
          onClick={() => setPriorityFilter('MEDIUM')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            priorityFilter === 'MEDIUM'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-amber-700">Medium Priority</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{unreadMed} Active</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Incomplete assignments or low quiz comprehension</p>
        </div>

        <div
          onClick={() => setPriorityFilter('ALL')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            priorityFilter === 'ALL'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-blue-700">All Alerts</span>
            <Filter className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{alerts.length} Total</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Viewing all active and acknowledged triggers</p>
        </div>
      </div>

      {/* Alerts Feed */}
      {loading ? (
        <LoadingState message="Scanning academic indicators for early warning triggers..." />
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">No active alerts in this category</h4>
          <p className="text-xs text-slate-500 mt-1">All student indicators within specified thresholds.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onDismiss={handleDismiss}
              onAction={(studentId) => navigate(`/admin/students/${studentId}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
