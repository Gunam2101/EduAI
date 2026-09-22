import React, { useState, useEffect } from 'react'
import {
  ClipboardCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  BarChart2,
  BookOpen
} from 'lucide-react'
import { api } from '../../services/api'
import { LoadingState } from '../../components/common/LoadingState'

export const StudentAssessments: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true)
        const res = await api.getMyAssessments()
        setData(res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAssessments()
  }, [])

  if (loading || !data) {
    return <LoadingState message="Loading your assessment scorecards..." />
  }

  const { assessments, summary } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
            Continuous Internal Assessments & Examination Scorecard
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Anna University System
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Review your verified marks across internal tests (CIA-1 & 2), objective quizzes, practical lab continuous evaluations, and midterm exams.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Internal (CIA) Average</span>
          <div className="text-2xl font-black text-blue-700 mt-1">{summary.cia_average}%</div>
          <span className="text-[11px] text-slate-400">Continuous Assessment Weight</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Continuous Midterm Marks</span>
          <div className="text-2xl font-black text-indigo-700 mt-1">{summary.midterm_score} / 100</div>
          <span className="text-[11px] text-slate-400">Theory Exam Component</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Assignment Submissions</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">{summary.assignment_submissions}</div>
          <span className="text-[11px] text-emerald-600 font-medium">All Lab Manuals Verified</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Semester Exam Readiness</span>
          <div className="text-base font-black text-purple-700 mt-2">{summary.readiness_index}</div>
          <span className="text-[11px] text-slate-400">Board Exam Forecast</span>
        </div>
      </div>

      {/* Assessments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assessments.map((a: any) => {
          const isGood = a.percentage >= 60
          return (
            <div
              key={a.code}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {a.code}
                  </span>
                  <span className="text-[11px] text-slate-400">{a.date}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  {a.name}
                </h3>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500">Scored:</span>
                    <span className="text-base font-black text-slate-900">
                      {a.scored_marks} <span className="text-xs text-slate-400 font-normal">/ {a.max_marks}</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isGood ? 'bg-blue-600' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, a.percentage)}%` }}
                    />
                  </div>
                  <div className="text-right text-[10px] font-mono font-bold text-slate-500">
                    {a.percentage}%
                  </div>
                </div>

                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Faculty Review:</span>
                  <p className="text-slate-500 mt-0.5 leading-relaxed">{a.feedback}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-3 mt-4 border-t border-slate-100">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Verified & Signed
                </span>
                <span className="font-mono text-slate-400">Max: {a.max_marks} pts</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
