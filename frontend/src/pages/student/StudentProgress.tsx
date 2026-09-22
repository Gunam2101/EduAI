import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  Award,
  CalendarCheck,
  CheckCircle2,
  Compass,
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
import { ChartCard } from '../../components/common/ChartCard'
import { LoadingState } from '../../components/common/LoadingState'
import { api } from '../../services/api'

export const StudentProgress: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProg = async () => {
      try {
        setLoading(true)
        const res = await api.getMyProgress()
        setData(res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProg()
  }, [])

  if (loading) return <LoadingState message="Loading your academic growth trajectory..." />
  if (!data) return null

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
            My Academic Growth & Trajectory
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Roadmap Impact
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Tracking your evolution from enrollment baseline to current performance across personalized roadmap milestones for {data.name}.
        </p>
      </div>

      {/* KPI Cards: Before vs Current */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Performance Before Roadmap
          </span>
          <div className="text-2xl font-black text-slate-800 mt-1">
            {data.baseline_score}%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Derived from prior semester CGPA</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Current Active Performance
          </span>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {data.current_score}%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Composite continuous assessment</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Net Roadmap Improvement
          </span>
          <div
            className={`text-2xl font-black mt-1 flex items-center gap-1 ${
              data.improvement_delta >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {data.improvement_delta > 0 ? `+${data.improvement_delta}%` : `${data.improvement_delta}%`}
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {data.improvement_percentage > 0 ? `+${data.improvement_percentage}% relative gain` : 'Requires recovery'}
          </p>
        </div>
      </div>

      {/* Trajectory Chart */}
      <ChartCard
        title="Continuous Assessment Trajectory vs Baseline"
        subtitle="Week-by-week performance progression under 5-stage personalized roadmap"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.weekly_metrics || []} margin={{ top: 15, right: 30, left: 0, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[30, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="baseline"
                name="Baseline Level"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual Score"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#2563eb' }}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Target Benchmark"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3, fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Domain Mastery Breakdown */}
      {data.domain_mastery && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            Domain Competency & Subject Mastery Breakdown
          </h2>

          <div className="space-y-3">
            {data.domain_mastery.map((dm: any) => (
              <div key={dm.domain} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">{dm.domain}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {dm.status}
                    </span>
                    <span className="font-mono font-bold text-slate-900">{dm.mastery}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${dm.mastery}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
