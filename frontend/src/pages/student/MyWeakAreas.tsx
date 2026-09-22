import React, { useState, useEffect } from 'react'
import {
  BrainCircuit,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
  Target,
  ShieldAlert
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LoadingState } from '../../components/common/LoadingState'
import { ProgressBar } from '../../components/common/ProgressBar'
import { useAuth } from '../../context/AuthContext'
import { useStudent } from '../../context/StudentContext'
import { api } from '../../services/api'
import { StudentDetail, TopicAnalysisResult, RiskAnalysis, TopicAnalysisItem } from '../../types'

export const MyWeakAreas: React.FC = () => {
  const { selectedStudentId } = useStudent()
  const studentId = selectedStudentId || 1
  const navigate = useNavigate()

  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [topicResult, setTopicResult] = useState<TopicAnalysisResult | null>(null)
  const [riskData, setRiskData] = useState<RiskAnalysis | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Weak' | 'Moderate' | 'Strong'>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [det, topics, risk] = await Promise.all([
          api.getStudent(studentId),
          api.getStudentWeakTopics(studentId).catch(() => null),
          api.getStudentRisk(studentId).catch(() => null),
        ])
        setStudent(det)
        setTopicResult(topics)
        setRiskData(risk)
      } catch (err) {
        console.error('Error fetching weak areas data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [studentId])

  if (loading) return <LoadingState message="Analyzing your diagnostic profile & weak topic taxonomy..." />
  if (!student) return null

  const { metrics, difficulty } = student

  // Filter topics
  const topics = topicResult?.topics || []
  const filteredTopics = topics.filter((t) => {
    const matchCategory = categoryFilter === 'ALL' || t.category === categoryFilter
    const matchPriority = priorityFilter === 'ALL' || t.priority_level === priorityFilter
    return matchCategory && matchPriority
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
            Diagnostic Analysis &amp; Weak Topic Taxonomy
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent breakdown of factors and syllabus topics mapped to your internal assessments and lab practicals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Early Risk Score:</span>
          <span className="text-base font-black px-3 py-1 rounded-xl bg-slate-900 text-white">
            {riskData ? riskData.risk_score.toFixed(0) : difficulty.difficulty_score.toFixed(0)}/100
          </span>
        </div>
      </div>

      {/* Measurable Risk Factor Breakdown (0-100 Score Architecture) */}
      {riskData && riskData.factors && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Risk Factor Composition (Measurable Breakdown)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
            {riskData.factors.map((f, i) => {
              const isCrit = f.status === 'Critical'
              const isWarn = f.status === 'Warning'
              const statusColor = isCrit
                ? 'text-rose-600 bg-rose-50 border-rose-200'
                : isWarn
                ? 'text-amber-600 bg-amber-50 border-amber-200'
                : 'text-emerald-600 bg-emerald-50 border-emerald-200'

              return (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{f.factor}</span>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${statusColor}`}>
                      {f.status}
                    </span>
                  </div>
                  <div className="text-lg font-black text-slate-900">
                    {f.score} <span className="text-[10px] font-normal text-slate-400">/ {f.max_score} pts</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug">{f.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Primary Weak Indicators Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <BrainCircuit className="w-5 h-5 text-rose-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Diagnosed Academic Vulnerabilities &amp; Triggers
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {difficulty.weak_indicators.map((wi, i) => (
            <div
              key={i}
              className="px-3 py-2 rounded-xl bg-rose-50/80 border border-rose-200/80 flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="text-xs font-bold text-rose-800">{wi}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-1">
          <span className="text-xs font-bold text-slate-700 block">AI Diagnostic Triggers:</span>
          {difficulty.reasons.map((r, i) => (
            <div
              key={i}
              className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Pills and Priority Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 mr-1">Mastery:</span>
          {(['ALL', 'Weak', 'Moderate', 'Strong'] as const).map((cat) => {
            const count =
              cat === 'ALL'
                ? topicResult?.total_analyzed || 0
                : cat === 'Weak'
                ? topicResult?.weak_count || 0
                : cat === 'Moderate'
                ? topicResult?.moderate_count || 0
                : topicResult?.strong_count || 0

            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            )
          })}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority Only</option>
            <option value="MEDIUM">Medium Priority Only</option>
            <option value="LOW">Low Priority (Maintenance)</option>
          </select>
        </div>
      </div>

      {/* Topic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            No topics matching the selected filters.
          </div>
        ) : (
          filteredTopics.map((topic, idx) => {
            const isWeak = topic.category === 'Weak'
            const isMod = topic.category === 'Moderate'
            const catBadge = isWeak
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : isMod
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'

            const priorityBadge =
              topic.priority_level === 'HIGH'
                ? 'bg-rose-100 text-rose-800'
                : topic.priority_level === 'MEDIUM'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-100 text-slate-700'

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {topic.subject_code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${catBadge}`}>
                        {topic.category}
                      </span>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${priorityBadge}`}>
                        {topic.priority_level}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{topic.topic_name}</h3>
                  <p className="text-[11px] text-slate-500 font-medium">{topic.subject_name}</p>

                  {/* Topic Mastery Progress Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-600">
                      <span>Calculated Mastery</span>
                      <span>{topic.topic_score.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isWeak ? 'bg-rose-500' : isMod ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${topic.topic_score}%` }}
                      />
                    </div>
                  </div>

                  {/* Diagnosis and Recommended Action */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1.5">
                    <div>
                      <span className="font-bold text-slate-700">Diagnosis: </span>
                      <span className="text-slate-600">{topic.reasons?.[0] || 'Score under required benchmark'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-indigo-700">Recommended Action: </span>
                      <span className="text-slate-600">{topic.recommended_actions?.[0] || 'Review concept and complete practice set'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Priority Score: {topic.priority_score.toFixed(0)}/100
                  </span>
                  <button
                    onClick={() => navigate('/student/roadmap')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Practice Topic</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Institutional Thresholds Reference */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">
          Continuous Assessment Performance vs 75% Institutional Proficiency Threshold
        </h3>

        <div className="space-y-4">
          <ProgressBar
            label={`Quiz Mastery (${metrics.quiz_average.toFixed(1)}/10)`}
            value={metrics.quiz_average * 10}
          />
          <ProgressBar
            label={`Midterm Internal Test (${metrics.midterm_marks.toFixed(1)}/30)`}
            value={(metrics.midterm_marks / 30) * 100}
          />
          <ProgressBar
            label={`End Semester Readiness (${metrics.final_marks.toFixed(1)}/50)`}
            value={(metrics.final_marks / 50) * 100}
          />
          <ProgressBar
            label={`Theory Lecture Attendance (${metrics.lectures_attended}/12 Lectures)`}
            value={metrics.lecture_attendance_rate}
          />
          <ProgressBar
            label={`Laboratory Practicals Attendance (${metrics.labs_attended}/6 Labs)`}
            value={metrics.lab_attendance_rate}
          />
          <ProgressBar
            label={`Assignment Submissions (${metrics.assignments_submitted}/5 Sets)`}
            value={metrics.assignment_completion_rate}
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => navigate('/student/roadmap')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <span>Open My Personalized Learning Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
