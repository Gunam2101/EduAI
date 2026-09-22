import React from 'react'
import { CheckCircle2, Clock, Target, Calendar } from 'lucide-react'
import { StudyPlan } from '../../types'

interface StudyPlanCardProps {
  plan: StudyPlan
  onToggleItem?: (itemId: number) => void
  readOnly?: boolean
}

export const StudyPlanCard: React.FC<StudyPlanCardProps> = ({
  plan,
  onToggleItem,
  readOnly = false,
}) => {
  const completedCount = plan.items.filter((i) => i.is_completed).length
  const totalCount = plan.items.length
  const completionPct = Math.round((completedCount / Math.max(totalCount, 1)) * 100)

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">{plan.title}</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              <Target className="w-3 h-3" />
              Target: +{plan.target_score_improvement}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{plan.focus_summary}</p>
        </div>

        {/* Progress pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-700">
              {completedCount} of {totalCount} completed
            </span>
            <div className="w-28 bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
            {completionPct}%
          </span>
        </div>
      </div>

      {/* 7-Day Plan List */}
      <div className="space-y-2.5">
        {plan.items.map((item) => (
          <div
            key={item.id || item.day_of_week}
            onClick={() => {
              if (!readOnly && onToggleItem && item.id) {
                onToggleItem(item.id)
              }
            }}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
              item.is_completed
                ? 'bg-slate-50/80 border-slate-200 opacity-75'
                : 'bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-xs'
            } ${!readOnly ? 'cursor-pointer' : ''}`}
          >
            <div className="pt-0.5 shrink-0">
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  item.is_completed
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 bg-white hover:border-blue-500'
                }`}
              >
                {item.is_completed && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {item.day_of_week}
                  </span>
                  <h4
                    className={`text-xs font-semibold ${
                      item.is_completed ? 'line-through text-slate-500' : 'text-slate-800'
                    }`}
                  >
                    {item.focus_area}
                  </h4>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.time_slot} ({item.estimated_hours}h)
                  </span>
                </div>
              </div>

              <p
                className={`text-xs mt-1.5 leading-relaxed ${
                  item.is_completed ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {item.activity_description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
