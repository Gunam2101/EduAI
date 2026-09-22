import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock,
  Target,
  Users,
  CheckCircle2,
  Calendar,
  Eye,
  Filter
} from 'lucide-react'
import { StatusBadge } from '../../components/common/StatusBadge'
import { LoadingState } from '../../components/common/LoadingState'
import { api } from '../../services/api'
import { StudyPlan } from '../../types'

export const StudyPlansOverview: React.FC = () => {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<any[]>([])
  const [riskFilter, setRiskFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true)
        const data = await api.getStudyPlans(riskFilter)
        setPlans(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [riskFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Personalized Study Plans Repository
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic 7-day academic recovery plans customized uniquely for each student's weakest indicators
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter by Risk:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700"
          >
            <option value="ALL">All Risk Categories</option>
            <option value="AT_RISK">At Risk (+20% Target)</option>
            <option value="MODERATE">Moderate Difficulty (+12% Target)</option>
            <option value="NORMAL">Normal (Enrichment)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading synthesized study plans..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{p.student_name}</h3>
                    <span className="text-[11px] text-slate-400 font-semibold">Student ID #{p.student_id}</span>
                  </div>
                  <StatusBadge status={p.risk_level} size="sm" />
                </div>

                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 font-medium mb-3">
                  <div className="flex items-center gap-1 font-bold text-blue-800 mb-1">
                    <Target className="w-3.5 h-3.5" />
                    Target: +{p.target_score_improvement}% Academic Growth
                  </div>
                  <p className="text-[11px] text-blue-700 leading-snug">{p.focus_summary}</p>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Scheduled Milestones:</span>
                    <span className="font-semibold text-slate-800">{p.total_items} Weekly Modules</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tasks Completed:</span>
                    <span className="font-bold text-emerald-600">
                      {p.completed_items} of {p.total_items} ({p.completion_percentage}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{ width: `${p.completion_percentage}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  7-Day Schedule
                </span>
                <button
                  onClick={() => navigate(`/admin/students/${p.student_id}`)}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  <span>Open Dossier</span>
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
