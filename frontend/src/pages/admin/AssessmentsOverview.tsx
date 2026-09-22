import React, { useState, useEffect } from 'react'
import {
  ClipboardCheck,
  Award,
  CheckCircle2,
  TrendingUp,
  BarChart2,
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
  Cell
} from 'recharts'
import { ChartCard } from '../../components/common/ChartCard'
import { ProgressBar } from '../../components/common/ProgressBar'
import { LoadingState } from '../../components/common/LoadingState'
import { api } from '../../services/api'

export const AssessmentsOverview: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true)
        const res = await api.getAssessmentsSummary()
        setData(res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  if (loading) return <LoadingState message="Analyzing assessment performance data..." />

  const assessments = data?.assessments || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Assessment Analytics & Grading Metrics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated performance metrics across Continuous Quizzes, Midterm, and Final Examinations
          </p>
        </div>
      </div>

      {/* Assessment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {assessments.map((item: any) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {item.type}
              </span>
              <span className="text-xs text-slate-400 font-semibold">{item.total_candidates} Students</span>
            </div>

            <h3 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h3>

            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{item.average}</span>
              <span className="text-xs font-semibold text-slate-400">/ {item.max_marks} marks</span>
            </div>

            <ProgressBar
              label={`Score (${item.percentage}%)`}
              value={item.percentage}
              size="sm"
            />

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Pass Rate:</span>
              <span className="font-bold text-emerald-600">{item.pass_rate}% Passed</span>
            </div>
          </div>
        ))}
      </div>

      {/* Comparative Chart */}
      <ChartCard
        title="Assessment Normalized Score Comparison (% vs Institutional Benchmark)"
        subtitle="Standardized percentage comparison across all 5 evaluation components (300 students)"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={assessments} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="title" tick={{ fontSize: 10, fill: '#64748b' }} angle={-10} textAnchor="end" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
              <Tooltip
                formatter={(val: number, _, props: any) => [
                  `${props.payload.average} / ${props.payload.maxMarks} marks (${val}%)`,
                  'Score',
                ]}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="percentage" radius={[6, 6, 0, 0]} barSize={45}>
                {assessments.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.percentage < 60 ? '#f43f5e' : entry.percentage < 75 ? '#3b82f6' : '#10b981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  )
}
