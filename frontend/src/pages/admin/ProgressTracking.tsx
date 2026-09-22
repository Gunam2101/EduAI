import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  Award,
  CalendarCheck,
  FileCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { KpiCard } from '../../components/common/KpiCard'
import { ChartCard } from '../../components/common/ChartCard'
import { LoadingState } from '../../components/common/LoadingState'
import { api } from '../../services/api'

export const ProgressTracking: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true)
        const res = await api.getProgressOverview()
        setData(res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProgress()
  }, [])

  if (loading) return <LoadingState message="Tracking longitudinal student progress..." />
  if (!data) return null

  const { summary, timeline, indicators } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Longitudinal Learning Progress Tracking
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Monitoring semester academic trajectory, milestone achievements, and improvement metrics
        </p>
      </div>

      {/* Improvement Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {indicators.map((ind: any, i: number) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-2"
          >
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {ind.metric}
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">{ind.current}</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  ind.positive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {ind.change}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Baseline was {ind.previous}</p>
          </div>
        ))}
      </div>

      {/* Learning Progress Timeline Line Chart */}
      <ChartCard
        title="Learning Progress Timeline (Week 1 to Week 8 Across Cohorts)"
        subtitle="Cohort trajectory following study plan intervention and regular assessment feedback"
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[30, 90]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', fontSize: '11px', border: '1px solid #e2e8f0' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line
                type="monotone"
                dataKey="normalCohort"
                name="Normal Cohort (On Track)"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="moderateCohort"
                name="Moderate Attention Cohort"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="atRiskCohort"
                name="At-Risk Intervention Cohort"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Milestone Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Curriculum Milestone Schedule</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {timeline.map((item: any, idx: number) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-600">{item.week}</span>
                <span className="text-[10px] text-slate-400">Milestone</span>
              </div>
              <h5 className="text-xs font-semibold text-slate-800">{item.milestone}</h5>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
