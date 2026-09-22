import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  GraduationCap,
  BookOpen,
  AlertTriangle,
  Award,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  AlertCircle,
  Eye,
  FileSpreadsheet
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { KpiCard } from '../../components/common/KpiCard'
import { ChartCard } from '../../components/common/ChartCard'
import { StatusBadge } from '../../components/common/StatusBadge'
import { LoadingState } from '../../components/common/LoadingState'
import { api } from '../../services/api'
import { AnalyticsOverview, StudentListItem, SystemRecommendation } from '../../types'

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [data, setData] = useState<AnalyticsOverview | null>(null)
  const [atRiskStudents, setAtRiskStudents] = useState<StudentListItem[]>([])
  const [systemRecs, setSystemRecs] = useState<SystemRecommendation[]>([])
  const [commonWeakTopics, setCommonWeakTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [overview, studentsRes, recsRes, weakTopicsRes] = await Promise.all([
          api.getAnalyticsOverview(),
          api.getStudents({ risk_level: 'AT_RISK', limit: 8 }),
          api.getAdminRecommendations(),
          api.getCommonWeakTopics().catch(() => ({ common_weak_topics: [] })),
        ])
        setData(overview)
        setAtRiskStudents(studentsRes.items || [])
        setSystemRecs(recsRes.recommendations || [])
        setCommonWeakTopics(weakTopicsRes.common_weak_topics || [])
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard statistics.')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) return <LoadingState message="Calculating analytics across 300 student records..." />
  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
        {error || 'Unable to load dataset analytics.'}
      </div>
    )
  }

  const { kpis, status_distribution, quiz_trends, exam_comparison, attendance_types, gpa_buckets } = data

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Institutional Executive View
              </span>
              <span className="text-xs text-slate-300">LearnTrack AI • Problem Statement PS52</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
              Student Learning Difficulty & Early Warning Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Dynamically analyzing 300 students across quizzes, examinations, assignments, GPA, and practical lab attendance.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/admin/students?risk_level=AT_RISK')}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/30"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Review {kpis.students_at_risk} At-Risk Students</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 6 KPI Cards dynamically derived from CSV */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Total Students"
          value={kpis.total_students}
          subtitle="Loaded from primary CSV"
          icon={Users}
          iconColor="text-blue-600 bg-blue-50"
          trend={{ value: '100%', isPositive: true, label: '300 Records' }}
        />
        <KpiCard
          title="Total Faculty"
          value={kpis.total_faculty}
          subtitle="Cohort Mentors"
          icon={GraduationCap}
          iconColor="text-indigo-600 bg-indigo-50"
        />
        <KpiCard
          title="Total Subjects"
          value={kpis.total_subjects}
          subtitle="Curriculum Catalog"
          icon={BookOpen}
          iconColor="text-purple-600 bg-purple-50"
        />
        <KpiCard
          title="Needs Attention"
          value={kpis.students_needing_attention}
          subtitle={`${kpis.students_at_risk} Critical / ${kpis.students_moderate} Moderate`}
          icon={AlertTriangle}
          iconColor="text-rose-600 bg-rose-50"
          trend={{ value: `${kpis.at_risk_percentage}%`, isPositive: false, label: 'At-Risk' }}
        />
        <KpiCard
          title="Avg Performance"
          value={`${kpis.average_performance}%`}
          subtitle="Composite Score"
          icon={Award}
          iconColor="text-emerald-600 bg-emerald-50"
          trend={{ value: '+2.4%', isPositive: true, label: 'Growth' }}
        />
        <KpiCard
          title="Avg Attendance"
          value={`${kpis.average_attendance}%`}
          subtitle="Lecture & Lab Rate"
          icon={CalendarCheck}
          iconColor="text-amber-600 bg-amber-50"
        />
      </div>

      {/* Section 18: System-Level Recommendations Prominent Widget */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="card-title text-slate-900">Institutional Recommendations & Insights</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Aggregate strategic interventions formulated from entire 300 student cohort
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/recommendations')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            View Full Action Plans →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {systemRecs.slice(0, 3).map((r, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    r.priority === 'HIGH'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {r.priority} PRIORITY
                </span>
                <span className="text-[11px] font-bold text-slate-700">{r.impact_count} Students</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">{r.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Curricular & Institutional Weak Topic Bottlenecks */}
      {commonWeakTopics.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="card-title text-slate-900">Institutional Weak Topic Bottlenecks</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-frequency difficulty areas across Continuous Internal Assessments requiring departmental intervention
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-400">Anna University Autonomous Syllabus</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {commonWeakTopics.slice(0, 4).map((t: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                    {t.subject_code}
                  </span>
                  <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    {t.student_count} Students
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{t.topic_name}</h4>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Cohort Average:</span>
                  <span className="font-bold text-slate-800">{t.average_score.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Learning Status Distribution */}
        <ChartCard
          title="Students by Learning Difficulty Status"
          subtitle="Transparent multi-factor rule-based risk classification"
          action={
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
              300 Students
            </span>
          }
        >
          <div className="h-64 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={status_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {status_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number, name: string) => [
                    `${val} students (${Math.round((val / 300) * 100)}%)`,
                    name,
                  ]}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-center gap-4 text-xs font-semibold mt-1">
              {status_distribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                  <span className="text-slate-900 font-bold">({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Quiz Performance Progression */}
        <ChartCard
          title="Continuous Quiz Performance"
          subtitle="Average scores across Quiz 1, Quiz 2, and Quiz 3 (scale 0-10)"
          action={
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              Avg: {kpis.average_quiz}/10
            </span>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quiz_trends} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="quiz" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: number) => [`${val} / 10 marks`, 'Class Average']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="average" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Examination Performance Comparison */}
        <ChartCard
          title="Midterm vs Final Exam Performance"
          subtitle="Average marks normalized to percentage scale"
          action={
            <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
              Final: {kpis.average_final}/50
            </span>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exam_comparison} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: number, _, props: any) => [
                    `${props.payload.average} / ${props.payload.maxMarks} marks (${val}%)`,
                    'Exam Score',
                  ]}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="pct" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Section 3: Dedicated At-Risk Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className="card-title text-slate-900">
              Struggling & At-Risk Students Requiring Priority Attention
            </h3>
          </div>
          <button
            onClick={() => navigate('/admin/students?risk_level=AT_RISK')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            View All {kpis.students_at_risk} At-Risk Students →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/60 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-3.5 px-4">Student ID</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Performance Score</th>
                <th className="py-3.5 px-4">Attendance</th>
                <th className="py-3.5 px-4">Difficulty Level</th>
                <th className="py-3.5 px-4">Primary Weak Indicator</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {atRiskStudents.map((s) => (
                <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">#{s.id}</td>
                  <td className="py-3.5 px-4">
                    <span
                      onClick={() => navigate(`/admin/students/${s.id}`)}
                      className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                    >
                      {s.name}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    {s.learning_performance_score.toFixed(1)}/100
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={s.overall_attendance_rate < 50 ? 'font-bold text-rose-600' : 'text-slate-700'}>
                      {s.overall_attendance_rate.toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={s.risk_level} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {s.overall_attendance_rate < 60
                      ? 'Attendance & Lab Deficit'
                      : s.final_marks < 25
                      ? 'Final Examination Score'
                      : 'Quiz Assessment Concept Retention'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => navigate(`/admin/students/${s.id}`)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <span>Inspect Dossier</span>
                      <Eye className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
