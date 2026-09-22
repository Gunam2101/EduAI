import React, { useState, useEffect } from 'react'
import {
  ClipboardCheck,
  Award,
  CalendarCheck,
  CheckCircle2,
  TrendingUp,
  BarChart2,
  FileText,
  Clock,
  BookOpen
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts'
import { ChartCard } from '../../components/common/ChartCard'
import { ProgressBar } from '../../components/common/ProgressBar'
import { LoadingState } from '../../components/common/LoadingState'
import { useAuth } from '../../context/AuthContext'
import { useStudent } from '../../context/StudentContext'
import { api } from '../../services/api'
import { StudentDetail } from '../../types'

export const MyPerformance: React.FC = () => {
  const { selectedStudentId } = useStudent()
  const studentId = selectedStudentId || 1

  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [progressData, setProgressData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [det, anl, prog] = await Promise.all([
          api.getStudent(studentId),
          api.getStudentAnalytics(studentId),
          api.getStudentProgress(studentId),
        ])
        setStudent(det)
        setAnalytics(anl)
        setProgressData(prog)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [studentId])

  if (loading) return <LoadingState message="Loading your Continuous Internal Assessment scorecard..." />
  if (!student) return null

  const { metrics } = student

  // 9 Required Academic Indicators (Prompt Section 10)
  const performanceIndicators = [
    { name: 'Quiz 1', score: metrics.quiz1_marks, max: 10, unit: '/ 10', pct: (metrics.quiz1_marks / 10) * 100, subtitle: 'CIA Quiz I' },
    { name: 'Quiz 2', score: metrics.quiz2_marks, max: 10, unit: '/ 10', pct: (metrics.quiz2_marks / 10) * 100, subtitle: 'CIA Quiz II' },
    { name: 'Quiz 3', score: metrics.quiz3_marks, max: 10, unit: '/ 10', pct: (metrics.quiz3_marks / 10) * 100, subtitle: 'CIA Quiz III' },
    { name: 'Quiz Average', score: metrics.quiz_average, max: 10, unit: '/ 10', pct: (metrics.quiz_average / 10) * 100, subtitle: 'Quizzes 1-3 Mean' },
    { name: 'Midterm Examination', score: metrics.midterm_marks, max: 30, unit: '/ 30', pct: (metrics.midterm_marks / 30) * 100, subtitle: 'Internal Test (IA)' },
    { name: 'Final Examination', score: metrics.final_marks, max: 50, unit: '/ 50', pct: (metrics.final_marks / 50) * 100, subtitle: 'End Semester Exam' },
    { name: 'Previous GPA', score: metrics.previous_gpa, max: 4.0, unit: '/ 4.0', pct: (metrics.previous_gpa / 4.0) * 100, subtitle: 'Cumulative CGPA' },
    { name: 'Attendance Rate', score: metrics.overall_attendance_rate, max: 100, unit: '%', pct: metrics.overall_attendance_rate, subtitle: `${metrics.lectures_attended + metrics.labs_attended}/18 Theory + Lab` },
    { name: 'Assignment Completion', score: metrics.assignment_completion_rate, max: 100, unit: '%', pct: metrics.assignment_completion_rate, subtitle: `${metrics.assignments_submitted}/${metrics.total_assignments} Problem Sets` },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">
            Academic Performance Scorecard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous Internal Assessments (CIA) and End Semester Examination performance indicators for {student.name}
          </p>
        </div>
        <div className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold self-start">
          {student.department || 'AI & Data Science'} • {student.year || '3rd Year'} ({student.semester || 'Sem VI'})
        </div>
      </div>

      {/* 9 Required Performance Indicator Cards (Section 10) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        {performanceIndicators.map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{item.name}</span>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{item.subtitle}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{item.score.toFixed(1)}</span>
              <span className="text-xs font-semibold text-slate-400">{item.unit}</span>
              <span className="text-xs font-bold text-blue-600 ml-auto">{item.pct.toFixed(0)}%</span>
            </div>
            <ProgressBar value={item.pct} size="sm" />
          </div>
        ))}
      </div>

      {/* Performance Trends Section (Section 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continuous Assessment Trend */}
        <ChartCard
          title="Continuous Internal Assessment (CIA) Trajectory"
          subtitle="Sequential test trends across Quiz 1, Quiz 2, Quiz 3, Midterm, and Semester Exam"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { test: 'Quiz 1', score: metrics.quiz1_marks * 10, marks: `${metrics.quiz1_marks}/10` },
                  { test: 'Quiz 2', score: metrics.quiz2_marks * 10, marks: `${metrics.quiz2_marks}/10` },
                  { test: 'Quiz 3', score: metrics.quiz3_marks * 10, marks: `${metrics.quiz3_marks}/10` },
                  { test: 'Midterm IA', score: (metrics.midterm_marks / 30) * 100, marks: `${metrics.midterm_marks}/30` },
                  { test: 'End Semester', score: (metrics.final_marks / 50) * 100, marks: `${metrics.final_marks}/50` },
                ]}
                margin={{ top: 15, right: 20, left: -10, bottom: 15 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="test" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                <Tooltip
                  formatter={(val: any, name: string, item: any) => [`${val.toFixed(1)}% (${item.payload.marks})`, 'Score']}
                  contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#2563eb' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Competency Benchmark vs Class Average */}
        <ChartCard
          title="Multi-Dimensional Competency vs Department Average"
          subtitle="Benchmark of your academic metrics against the 300-student engineering cohort"
        >
          <div className="h-72">
            {analytics?.radar_comparison && (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={85} data={analytics.radar_comparison}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="My Performance" dataKey="student" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
                  <Radar name="Dept Average" dataKey="class_avg" stroke="#94a3b8" fill="#cbd5e1" fillOpacity={0.2} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
