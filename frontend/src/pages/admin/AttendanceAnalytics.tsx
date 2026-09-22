import React, { useState, useEffect } from 'react'
import {
  CalendarCheck,
  AlertTriangle,
  Users,
  CheckCircle2,
  TrendingDown,
  Info
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell
} from 'recharts'
import { KpiCard } from '../../components/common/KpiCard'
import { ChartCard } from '../../components/common/ChartCard'
import { StatusBadge } from '../../components/common/StatusBadge'
import { LoadingState } from '../../components/common/LoadingState'
import { api } from '../../services/api'

export const AttendanceAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true)
        const res = await api.getAttendanceSummary()
        setData(res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAttendance()
  }, [])

  if (loading) return <LoadingState message="Calculating attendance analytics..." />
  if (!data) return null

  const { kpis, distribution_brackets, low_attendance_students, correlation_points } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Attendance Analytics & Compliance
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tracking 12 theory lectures and 6 practical lab sessions across 300 students
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Overall Attendance Rate"
          value={`${kpis.average_overall}%`}
          subtitle="Class average across all 18 sessions"
          icon={CalendarCheck}
          iconColor="text-blue-600 bg-blue-50"
        />
        <KpiCard
          title="Theory Lectures Avg"
          value={`${kpis.average_lectures}%`}
          subtitle="Out of 12 planned lectures"
          icon={CalendarCheck}
          iconColor="text-indigo-600 bg-indigo-50"
        />
        <KpiCard
          title="Practical Labs Avg"
          value={`${kpis.average_labs}%`}
          subtitle="Out of 6 lab sessions"
          icon={CalendarCheck}
          iconColor="text-purple-600 bg-purple-50"
        />
        <KpiCard
          title="Critical Attendance Flag"
          value={`${kpis.critical_count} Students`}
          subtitle="Severe risk: Attendance below 50%"
          icon={AlertTriangle}
          iconColor="text-rose-600 bg-rose-50"
          trend={{ value: `${((kpis.critical_count / 300) * 100).toFixed(1)}%`, isPositive: false }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Brackets */}
        <ChartCard
          title="Student Distribution by Attendance Bracket"
          subtitle="Institutional compliance thresholds (<50% Critical, 75% Passing Target)"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution_brackets} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: number) => [`${val} students`, 'Cohort Count']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {distribution_brackets.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Correlation: Attendance vs Academic Performance */}
        <ChartCard
          title="Correlation: Attendance % vs Learning Performance Score"
          subtitle="Direct empirical correlation observed across the 300-student dataset"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="attendance"
                  name="Attendance"
                  unit="%"
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  label={{ value: 'Attendance %', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#64748b' }}
                />
                <YAxis
                  type="number"
                  dataKey="performance"
                  name="Performance Score"
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  label={{ value: 'Performance Score', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(val: number, name: string) => [`${val}`, name]}
                  contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                />
                <Scatter name="Students" data={correlation_points} fill="#3b82f6" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Low Attendance Watchlist Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Low Attendance Watchlist (&lt; 60% Attendance)
            </h3>
          </div>
          <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            {low_attendance_students.length} High-Risk Cases
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/40 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Overall Attendance</th>
                <th className="py-3 px-4">Lectures Attended</th>
                <th className="py-3 px-4">Labs Attended</th>
                <th className="py-3 px-4">Performance Score</th>
                <th className="py-3 px-4">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {low_attendance_students.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-bold text-slate-900">#{s.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{s.name}</td>
                  <td className="py-3 px-4 font-extrabold text-rose-600">
                    {s.overall_attendance.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-slate-600">{s.lectures_attended}</td>
                  <td className="py-3 px-4 text-slate-600">{s.labs_attended}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{s.performance_score.toFixed(1)}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={s.risk_level} size="sm" />
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
