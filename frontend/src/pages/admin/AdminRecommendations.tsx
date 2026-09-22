import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  AlertTriangle,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileCheck,
  BookOpen
} from 'lucide-react'
import { LoadingState } from '../../components/common/LoadingState'
import { api } from '../../services/api'
import { SystemRecommendation } from '../../types'

export const AdminRecommendations: React.FC = () => {
  const [data, setData] = useState<{ total_students: number; recommendations: SystemRecommendation[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        setLoading(true)
        const res = await api.getAdminRecommendations()
        setData(res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchRecs()
  }, [])

  if (loading) return <LoadingState message="Formulating institutional system recommendations..." />
  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Institutional Academic Recommendations</h1>
        <p className="text-xs text-slate-500 mt-1">
          System-level strategic interventions generated from aggregate performance across all {data.total_students} student records
        </p>
      </div>

      {/* Recommendations Cards */}
      <div className="space-y-4">
        {data.recommendations.map((rec, index) => {
          const isHigh = rec.priority === 'HIGH'
          const isMed = rec.priority === 'MEDIUM'

          const badgeBg = isHigh
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : isMed
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-blue-50 text-blue-700 border-blue-200'

          return (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isHigh ? 'bg-rose-100 text-rose-700' : isMed ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{rec.title}</h3>
                    <span className="text-[11px] text-slate-400 font-semibold">{rec.category} Category</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {rec.impact_count} Students Affected
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${badgeBg}`}>
                    {rec.priority} PRIORITY
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pl-11">{rec.description}</p>

              <div className="pl-11 pt-2 border-t border-slate-100 flex items-start gap-2">
                <span className="text-xs font-bold text-blue-700 shrink-0">Strategic Action:</span>
                <span className="text-xs text-slate-700 font-medium">{rec.action}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
