import React, { useState, useEffect } from 'react'
import {
  Clock,
  Compass,
  CheckCircle2,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  AlertTriangle,
  GraduationCap
} from 'lucide-react'
import { api } from '../../services/api'
import { LoadingState } from '../../components/common/LoadingState'

export const LearningHistory: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        const res = await api.getMyHistory()
        setData(res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  if (loading || !data) {
    return <LoadingState message="Reconstructing your learning journey timeline..." />
  }

  const { timeline, name, total_milestones } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
              My Learning Journey & Milestone History
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Audit Trail
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Chronological academic record of diagnostic evaluations, difficulty assessments, adaptive roadmap milestones, and exam results for {name}.
          </p>
        </div>

        <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs text-right">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Milestones</span>
          <div className="text-base font-black text-slate-900">{total_milestones} Recorded</div>
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-8">
          {timeline.map((item: any, idx: number) => {
            const isLast = idx === timeline.length - 1
            return (
              <div key={item.id} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 ${
                    isLast
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : item.type === 'difficulty_detection'
                      ? 'bg-amber-500 text-white'
                      : item.type === 'roadmap_event'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  {item.type === 'academic_milestone' ? (
                    <GraduationCap className="w-3.5 h-3.5" />
                  ) : item.type === 'difficulty_detection' ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : item.type === 'roadmap_event' ? (
                    <Compass className="w-3.5 h-3.5" />
                  ) : isLast ? (
                    <Sparkles className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Content Card */}
                <div className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-xl border border-slate-200/80 transition-colors space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold font-mono text-slate-500">
                      {item.timestamp}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      item.badge === 'AT_RISK'
                        ? 'bg-rose-100 text-rose-700'
                        : item.badge === 'Roadmap Activated'
                        ? 'bg-indigo-100 text-indigo-700'
                        : item.badge === 'In Progress'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
