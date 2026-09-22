import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  AlertTriangle,
  Award,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  BrainCircuit,
  Eye,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Target,
  ShieldAlert
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { KpiCard } from '../../components/common/KpiCard'
import { ChartCard } from '../../components/common/ChartCard'
import { StatusBadge } from '../../components/common/StatusBadge'
import { LoadingState } from '../../components/common/LoadingState'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { FacultyCohortRecommendation } from '../../types'

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth()
  const facultyId = user?.faculty_id || 1
  const navigate = useNavigate()

  const [cohortData, setCohortData] = useState<any>(null)
  const [facultyRecs, setFacultyRecs] = useState<FacultyCohortRecommendation[]>([])
  const [commonWeakTopics, setCommonWeakTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        setLoading(true)
        const [cohortRes, recsRes, weakTopicsRes] = await Promise.all([
          api.getFacultyStudents(facultyId),
          api.getFacultyRecommendations(facultyId).catch(() => ({ recommendations: [] })),
          api.getCommonWeakTopics().catch(() => ({ common_weak_topics: [] })),
        ])
        setCohortData(cohortRes)
        setFacultyRecs(recsRes.recommendations || [])
        setCommonWeakTopics(weakTopicsRes.common_weak_topics || [])
      } catch (err) {
        console.error('Error fetching faculty dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFacultyData()
  }, [facultyId])

  if (loading) return <LoadingState message="Analyzing your cohort analytics & academic diagnostics..." />
  if (!cohortData) return null

  const { total_assigned, at_risk_count, moderate_count, normal_count, students } = cohortData
  const atRiskStudents = students.filter((s: any) => s.risk_level === 'AT_RISK')
  const moderateStudents = students.filter((s: any) => s.risk_level === 'MODERATE')
  const needingAttention = [...atRiskStudents, ...moderateStudents]

  const avgCohortPerf = students.length
    ? (students.reduce((acc: number, s: any) => acc + s.learning_performance_score, 0) / students.length).toFixed(1)
    : '0.0'
  const avgCohortAtt = students.length
    ? (students.reduce((acc: number, s: any) => acc + s.overall_attendance_rate, 0) / students.length).toFixed(1)
    : '0.0'

  const statusPie = [
    { name: 'Normal', value: normal_count, color: '#10b981' },
    { name: 'Moderate', value: moderate_count, color: '#f59e0b' },
    { name: 'At Risk', value: at_risk_count, color: '#ef4444' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Faculty Portal
              </span>
              <span className="text-xs text-slate-300">Department of Data Science &amp; AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Welcome back, {user?.name || 'Prof. David Chen'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Active cohort: {total_assigned} assigned students under continuous mentorship &amp; academic evaluation
            </p>
          </div>

          <button
            onClick={() => navigate('/faculty/my-students')}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 shadow-md shadow-emerald-600/30 cursor-pointer"
          >
            <span>Review Cohort Roster</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cohort KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="My Students"
          value={total_assigned}
          subtitle="Assigned Cohort Group"
          icon={Users}
          iconColor="text-blue-600 bg-blue-50"
        />
        <KpiCard
          title="Average Class Performance"
          value={`${avgCohortPerf}%`}
          subtitle="Cohort Multi-Factor Score"
          icon={Award}
          iconColor="text-emerald-600 bg-emerald-50"
          trend={{ value: '+1.8%', isPositive: true }}
        />
        <KpiCard
          title="Average Attendance"
          value={`${avgCohortAtt}%`}
          subtitle="Lecture &amp; Lab Participation"
          icon={CalendarCheck}
          iconColor="text-indigo-600 bg-indigo-50"
        />
        <KpiCard
          title="Students Needing Attention"
          value={at_risk_count + moderate_count}
          subtitle={`${at_risk_count} At-Risk / ${moderate_count} Moderate`}
          icon={AlertTriangle}
          iconColor="text-rose-600 bg-rose-50"
          trend={{
            value: `${Math.round(((at_risk_count + moderate_count) / total_assigned) * 100)}%`,
            isPositive: false,
          }}
        />
      </div>

      {/* Common Weak Topics Bottlenecks Card */}
      {commonWeakTopics.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Cohort &amp; Institutional Weak Topic Bottlenecks
                </h3>
                <p className="text-[11px] text-slate-500">
                  Topics with the highest student struggle rates across Continuous Internal Assessments (CIA)
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-400">Curriculum Optimization</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {commonWeakTopics.slice(0, 4).map((t: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">
                    {t.subject_code}
                  </span>
                  <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    {t.student_count} Students Struggling
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{t.topic_name}</h4>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Class Average:</span>
                  <span className="font-bold text-slate-800">{t.average_score.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cohort Recommendations Widget */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="card-title text-slate-900">Faculty Cohort Actionable Recommendations</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Targeted interventions prioritized from your assigned mentees' performance patterns
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/faculty/recommendations')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            View All Cohort Actions →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {facultyRecs.slice(0, 3).map((r, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    r.priority === 'HIGH'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {r.priority}
                </span>
                <span className="text-[11px] font-bold text-slate-700">{r.student_count} Students</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">{r.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cohort Difficulty Distribution & Struggling Students Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Difficulty Distribution Donut */}
        <ChartCard
          title="Cohort Difficulty Distribution"
          subtitle={`Breakdown of your ${total_assigned} assigned students`}
        >
          <div className="h-64 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={statusPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number, name: string) => [
                    `${val} students (${Math.round((val / total_assigned) * 100)}%)`,
                    name,
                  ]}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-center gap-3 text-xs font-semibold mt-1">
              {statusPie.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                  <span className="text-slate-900 font-bold">({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Struggling Students Needing Attention Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="card-title text-slate-900">
                  Students Needing Immediate Attention ({needingAttention.length} Students)
                </h3>
              </div>
              <button
                onClick={() => navigate('/faculty/my-students')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                View Roster →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/60 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="py-3 px-4">Roll / ID</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Quiz Avg</th>
                    <th className="py-3 px-4">Final Marks</th>
                    <th className="py-3 px-4">Attendance</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {needingAttention.slice(0, 6).map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">#{s.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{s.name}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{s.quiz_average.toFixed(1)}/10</td>
                      <td className="py-3 px-4 font-semibold text-rose-600">{s.final_marks.toFixed(1)}/50</td>
                      <td className="py-3 px-4">{s.overall_attendance_rate.toFixed(0)}%</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={s.risk_level} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/admin/students/${s.id}`)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Dossier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
