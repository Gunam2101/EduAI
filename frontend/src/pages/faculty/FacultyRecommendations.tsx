import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Users,
  AlertTriangle,
  School,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react'
import { LoadingState } from '../../components/common/LoadingState'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { FacultyCohortRecommendation } from '../../types'

export const FacultyRecommendations: React.FC = () => {
  const { user } = useAuth()
  const facultyId = user?.faculty_id || 1

  const [data, setData] = useState<{ faculty_id: number; cohort_size: number; recommendations: FacultyCohortRecommendation[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        setLoading(true)
        const res = await api.getFacultyRecommendations(facultyId)
        setData(res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchRecs()
  }, [facultyId])

  if (loading) return <LoadingState message="Formulating cohort recommendations..." />
  if (!data) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Faculty Cohort Recommendations</h1>
        <p className="text-xs text-slate-500 mt-1">
          Targeted intervention plans for your mentoring cohort of {data.cohort_size} assigned students
        </p>
      </div>

      <div className="space-y-4">
        {data.recommendations.map((rec, index) => {
          const isHigh = rec.priority === 'HIGH'
          const isMed = rec.priority === 'MEDIUM'

          const badgeBg = isHigh
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : isMed
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'

          return (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{rec.title}</h3>
                    <span className="text-[11px] text-slate-400 font-semibold">{rec.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {rec.student_count} Students
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${badgeBg}`}>
                    {rec.priority}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pl-11">{rec.description}</p>

              <div className="pl-11 pt-2 border-t border-slate-100 flex items-start gap-2">
                <span className="text-xs font-bold text-emerald-700 shrink-0">Suggested Mentor Action:</span>
                <span className="text-xs text-slate-700 font-medium">{rec.action}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
