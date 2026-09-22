import React, { useState, useEffect } from 'react'
import {
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  PieChart,
  ShieldAlert,
  ArrowRight
} from 'lucide-react'
import { api } from '../../services/api'
import { LoadingState } from '../../components/common/LoadingState'

export const FacultyInsights: React.FC = () => {
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true)
        const res = await api.getAcademicInsights()
        setInsights(res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchInsights()
  }, [])

  if (loading || !insights) {
    return <LoadingState message="Computing cohort academic insights & bottleneck analysis..." />
  }

  const s = insights.summary
  const scoreDist = insights.score_distribution
  const genderComp = insights.gender_comparison
  const bottlenecks = insights.subject_bottlenecks
  const actions = insights.corrective_actions

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
              Faculty Academic Insights & Subject Bottlenecks
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Semester VI Analysis
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Predictive diagnostic evaluation across 300 engineering students, subject failure risk indicators, and class trends.
          </p>
        </div>
      </div>

      {/* Primary KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cohort Academic Average</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{s.overall_academic_average}%</div>
          <span className="text-[11px] text-slate-400">Class Composite Score</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600">Improving Trajectory</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{s.improving_students_count} Students</div>
          <span className="text-[11px] text-emerald-600/80 font-medium">Quiz 3 &gt; Quiz 1 positive trend</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600">Declining / Low Marks</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1">{s.declining_students_count} Students</div>
          <span className="text-[11px] text-rose-600/80 font-medium">Require immediate tutoring</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600">Average Attendance</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">{s.overall_attendance_average}%</div>
          <span className="text-[11px] text-slate-400">Lab average: {s.lab_attendance_average}%</span>
        </div>
      </div>

      {/* Middle Section: Score Distribution & Gender Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" />
              <span>Academic Performance Distribution</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">300 Total Students</span>
          </div>

          <div className="space-y-3">
            {Object.entries(scoreDist).map(([bracket, count]: any) => {
              const pct = ((count / s.total_cohort_size) * 100).toFixed(1)
              let color = 'bg-blue-600'
              if (bracket.includes('Distinction')) color = 'bg-emerald-600'
              else if (bracket.includes('First Class')) color = 'bg-blue-600'
              else if (bracket.includes('Second Class')) color = 'bg-indigo-600'
              else if (bracket.includes('Average')) color = 'bg-amber-500'
              else color = 'bg-rose-600'

              return (
                <div key={bracket} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{bracket}</span>
                    <span className="font-bold text-slate-900">{count} students ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Gender Breakdown Comparison */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Gender Academic Comparison</span>
            </h2>
            <span className="text-[11px] text-slate-400">Anna University Analytics</span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Male */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">Male Students</span>
                <span className="text-xs font-mono font-bold text-blue-700">{genderComp.male.count}</span>
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600">Avg Performance:</span>
                  <span className="font-bold text-slate-900">{genderComp.male.avg_performance}%</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600">Avg Attendance:</span>
                  <span className="font-bold text-slate-900">{genderComp.male.avg_attendance}%</span>
                </div>
              </div>
            </div>

            {/* Female */}
            <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-900">Female Students</span>
                <span className="text-xs font-mono font-bold text-pink-700">{genderComp.female.count}</span>
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600">Avg Performance:</span>
                  <span className="font-bold text-slate-900">{genderComp.female.avg_performance}%</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600">Avg Attendance:</span>
                  <span className="font-bold text-slate-900">{genderComp.female.avg_attendance}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Observation:</span> Female students demonstrate consistent attendance rates ({genderComp.female.avg_attendance}%), with high parity across core internal examination scores.
          </div>
        </div>
      </div>

      {/* Subject Bottlenecks & Critical Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bottleneck Subjects */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-600" />
              <span>Core Subject Bottleneck Areas</span>
            </h2>
            <span className="text-[11px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Exam Failure Risk
            </span>
          </div>

          <div className="space-y-3">
            {bottlenecks.map((b: any) => (
              <div key={b.code} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">{b.code}</span>
                    <span className="text-xs font-bold text-slate-900">{b.subject}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    b.failure_risk === 'High'
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : b.failure_risk === 'Moderate'
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    {b.failure_risk} Risk
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Critical Topic: <strong className="text-slate-800">{b.key_topic}</strong></span>
                  <span className="font-mono text-slate-500">Difficulty: {b.difficulty_index}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Corrective Action Plans */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <span>Recommended Departmental Actions</span>
            </h2>
            <span className="text-[11px] text-slate-400">Autonomous Council Actionable</span>
          </div>

          <div className="space-y-3">
            {actions.map((act: any, idx: number) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                    act.priority === 'URGENT'
                      ? 'bg-rose-600 text-white'
                      : act.priority === 'HIGH'
                      ? 'bg-amber-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}>
                    {act.priority}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{act.action}</span>
                </div>
                <p className="text-[11px] text-slate-600 pl-1">{act.impact}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
