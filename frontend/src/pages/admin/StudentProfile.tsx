import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  GraduationCap,
  Calendar,
  Award,
  AlertTriangle,
  BrainCircuit,
  TrendingUp,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ChevronRight
} from 'lucide-react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { StatusBadge } from '../../components/common/StatusBadge'
import { ProgressBar } from '../../components/common/ProgressBar'
import { ChartCard } from '../../components/common/ChartCard'
import { StudyPlanCard } from '../../components/study/StudyPlanCard'
import { RecommendationCard } from '../../components/study/RecommendationCard'
import { LoadingState } from '../../components/common/LoadingState'
import { api } from '../../services/api'
import { StudentDetail } from '../../types'

export const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const studentId = Number(id) || 1
  const navigate = useNavigate()

  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      const [detailRes, analyticsRes] = await Promise.all([
        api.getStudent(studentId),
        api.getStudentAnalytics(studentId),
      ])
      setStudent(detailRes)
      setAnalytics(analyticsRes)
    } catch (err: any) {
      setError(err.message || 'Failed to load student dossier.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentData()
  }, [studentId])

  const handleTogglePlanItem = async (itemId: number) => {
    try {
      await api.toggleStudyPlanItem(itemId)
      fetchStudentData()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <LoadingState message={`Analyzing student #${studentId} metrics...`} />
  if (error || !student) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
        {error || 'Student record not found'}
      </div>
    )
  }

  const { metrics, difficulty, study_plan, recommendations } = student

  return (
    <div className="space-y-6">
      {/* Top back button and header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/students')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {student.name}
              </h1>
              <span className="text-xs font-semibold text-slate-500">ID #{student.id}</span>
              <StatusBadge status={difficulty.risk_level} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {student.age} Years Old • {student.gender} • Smart Education Dossier
            </p>
          </div>
        </div>

        {/* Quick Jump Buttons to Prev/Next student */}
        <div className="flex items-center gap-2">
          <button
            disabled={studentId <= 1}
            onClick={() => navigate(`/admin/students/${studentId - 1}`)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            ← Previous Student
          </button>
          <button
            disabled={studentId >= 300}
            onClick={() => navigate(`/admin/students/${studentId + 1}`)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Next Student →
          </button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Learning Score</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {metrics.learning_performance_score.toFixed(1)}
            <span className="text-xs font-normal text-slate-400">/100</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Multi-factor Composite</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Difficulty Index</span>
          <div className="text-xl font-extrabold text-rose-600 mt-1">
            {difficulty.difficulty_score.toFixed(1)}
            <span className="text-xs font-normal text-slate-400">/100</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Inverted Risk Score</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Overall Attendance</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {metrics.overall_attendance_rate.toFixed(0)}%
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {metrics.lectures_attended + metrics.labs_attended}/18 Total Sessions
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Quiz Average</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {metrics.quiz_average.toFixed(1)}
            <span className="text-xs font-normal text-slate-400">/10</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Across 3 Quizzes</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Final Exam</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {metrics.final_marks.toFixed(1)}
            <span className="text-xs font-normal text-slate-400">/50</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Semester Summative</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Prior GPA</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {metrics.previous_gpa.toFixed(2)}
            <span className="text-xs font-normal text-slate-400">/4.0</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Historical Baseline</p>
        </div>
      </div>

      {/* Explainable Diagnosis & Benchmark Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnosis & Contributing Risk Factors */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Explainable Difficulty Diagnosis</h3>
              <p className="text-xs text-slate-500">
                Transparent breakdown of exact reasons triggering {difficulty.risk_level} status
              </p>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">Identified Weak Areas:</span>
            <div className="flex flex-wrap gap-1.5">
              {difficulty.weak_indicators.map((ind, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
                >
                  ⚠ {ind}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">
              Rule-Based Trigger Factors:
            </span>
            <ul className="space-y-2">
              {difficulty.reasons.map((r, i) => (
                <li
                  key={i}
                  className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Academic Indicator Breakdown Bars */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <ProgressBar
              label={`Quiz Performance (${metrics.quiz_average.toFixed(1)}/10)`}
              value={metrics.quiz_average * 10}
            />
            <ProgressBar
              label={`Midterm Marks (${metrics.midterm_marks.toFixed(1)}/30)`}
              value={(metrics.midterm_marks / 30) * 100}
            />
            <ProgressBar
              label={`Final Exam Marks (${metrics.final_marks.toFixed(1)}/50)`}
              value={(metrics.final_marks / 50) * 100}
            />
            <ProgressBar
              label={`Lecture Attendance (${metrics.lectures_attended}/12)`}
              value={metrics.lecture_attendance_rate}
            />
            <ProgressBar
              label={`Lab Attendance (${metrics.labs_attended}/6)`}
              value={metrics.lab_attendance_rate}
            />
          </div>
        </div>

        {/* Radar Comparison Chart (Student vs Class Average) */}
        <ChartCard
          title="Multidimensional Academic Benchmark"
          subtitle="Comparing student competency profile against 300-student class average"
        >
          <div className="h-80">
            {analytics?.radar_comparison ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={analytics.radar_comparison}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar
                    name={student.name}
                    dataKey="student"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name="Class Average (300 Cohort)"
                    dataKey="class_avg"
                    stroke="#94a3b8"
                    fill="#cbd5e1"
                    fillOpacity={0.3}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading benchmark radar...
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Personalized Study Plan (Section 12 requirement) */}
      {study_plan && (
        <StudyPlanCard
          plan={study_plan}
          onToggleItem={handleTogglePlanItem}
        />
      )}

      {/* Personalized Action Recommendations (Section 11 requirement) */}
      <RecommendationCard
        recommendations={recommendations}
        title={`Personalized Recommendations for ${student.name}`}
      />
    </div>
  )
}
