import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Target,
  CheckSquare,
  Square,
  Activity,
  Award
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { LoadingState } from '../../components/common/LoadingState'
import { useAuth } from '../../context/AuthContext'
import { useStudent } from '../../context/StudentContext'
import { api } from '../../services/api'

interface EnrichedRecommendation {
  id: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  category: string
  title: string
  description: string
  action: string
  is_completed: boolean
}

export const StudentRecommendations: React.FC = () => {
  const { selectedStudentId } = useStudent()
  const studentId = selectedStudentId || 1

  const [recommendations, setRecommendations] = useState<EnrichedRecommendation[]>([])
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const fetchRecs = async () => {
    try {
      setLoading(true)
      const res = await api.getStudentRecommendations(studentId)
      setRecommendations(res.recommendations || [])
    } catch (err) {
      console.error('Error loading recommendations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecs()
  }, [studentId])

  const handleToggle = async (id: number) => {
    try {
      setTogglingId(id)
      const res = await api.toggleRecommendationItem(studentId, id)
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_completed: res.is_completed } : r))
      )
    } catch (err) {
      console.error('Error toggling recommendation:', err)
      // Fallback local toggle
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_completed: !r.is_completed } : r))
      )
    } finally {
      setTogglingId(null)
    }
  }

  // Filter recommendations
  const categories = ['ALL', 'Study', 'Practice', 'Attendance', 'Assignment', 'Exam Prep', 'Revision', 'General']

  const filtered = recommendations.filter((r) => {
    const matchCat =
      categoryFilter === 'ALL' || r.category.toLowerCase().includes(categoryFilter.toLowerCase())
    const matchPri = priorityFilter === 'ALL' || r.priority === priorityFilter
    return matchCat && matchPri
  })

  const completedCount = recommendations.filter((r) => r.is_completed).length
  const totalCount = recommendations.length
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  if (loading) return <LoadingState message="Analyzing your diagnostic indicators..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
            Personalized Smart Recommendations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data-driven strategic actions customized uniquely from your individual assessment marks and attendance values
          </p>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-700 shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority Only</option>
            <option value="MEDIUM">Medium Priority Only</option>
            <option value="LOW">Low Priority (Maintenance)</option>
          </select>
        </div>
      </div>

      {/* Completion Tracking Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Action &amp; Completion Tracking</h3>
          </div>
          <p className="text-xs text-blue-200 mt-1">
            Check off actions as you complete them to dynamically update your study focus and risk status
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <span className="text-xs text-blue-200 block">Actions Completed</span>
            <span className="text-xl font-black text-white">
              {completedCount} / {totalCount} ({completionPct}%)
            </span>
          </div>
          <div className="w-24 bg-white/20 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const count =
            cat === 'ALL'
              ? recommendations.length
              : recommendations.filter((r) => r.category.toLowerCase().includes(cat.toLowerCase())).length

          if (cat !== 'ALL' && count === 0) return null

          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat} ({count})
            </button>
          )
        })}
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            No recommendations in this category or priority bracket.
          </div>
        ) : (
          filtered.map((rec) => {
            const isHigh = rec.priority === 'HIGH'
            const isMed = rec.priority === 'MEDIUM'

            const badgeColor = isHigh
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : isMed
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'

            const iconBg = isHigh ? 'bg-rose-100 text-rose-600' : isMed ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'

            return (
              <div
                key={rec.id}
                className={`bg-white rounded-2xl border p-6 transition-all space-y-3 ${
                  rec.is_completed
                    ? 'border-slate-200 bg-slate-50/70 opacity-80'
                    : 'border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggle(rec.id)}
                      disabled={togglingId === rec.id}
                      className="cursor-pointer text-slate-400 hover:text-blue-600 transition-colors shrink-0"
                      title={rec.is_completed ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {rec.is_completed ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <div>
                      <h3
                        className={`text-sm font-bold ${
                          rec.is_completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {rec.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {rec.category} Focus
                        </span>
                        <span className="text-[10px] text-slate-400">• High Impact Area</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border self-start sm:self-center ${badgeColor}`}>
                    {rec.priority} PRIORITY
                  </span>
                </div>

                <p
                  className={`text-xs leading-relaxed pl-8 ${
                    rec.is_completed ? 'line-through text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {rec.description}
                </p>

                <div className="pl-8 pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-blue-700">Action Plan: </span>
                    <span>{rec.action}</span>
                  </div>

                  <Link
                    to="/student/roadmap"
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 shrink-0 cursor-pointer"
                  >
                    <span>Execute in Roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
