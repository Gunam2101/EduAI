import React from 'react'
import { Sparkles, ArrowRight, CheckCircle, AlertCircle, AlertTriangle, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StructuredRecommendation } from '../../types'

interface RecommendationWidgetProps {
  recommendations: StructuredRecommendation[]
  viewAllLink?: string
  title?: string
  subtitle?: string
  maxDisplay?: number
}

export const RecommendationWidget: React.FC<RecommendationWidgetProps> = ({
  recommendations,
  viewAllLink = '/student/recommendations',
  title = 'Personalized Recommendations',
  subtitle = 'Prioritized diagnostic action items formulated from your real academic indicators',
  maxDisplay = 3,
}) => {
  const displayed = recommendations.slice(0, maxDisplay)

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="card-title text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {displayed.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500">
          No specific recommendations for this record.
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((rec, idx) => {
            const isHigh = rec.priority === 'HIGH'
            const isMed = rec.priority === 'MEDIUM'

            const badgeColor = isHigh
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : isMed
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'

            const dotColor = isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'

            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                    <h4 className="text-xs font-bold text-slate-900">{rec.title}</h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                      {rec.category}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}
                    >
                      {rec.priority}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pl-4">{rec.description}</p>

                {rec.action && (
                  <div className="pl-4 pt-1 text-[11px] font-medium text-slate-500 flex items-start gap-1">
                    <span className="font-semibold text-blue-700">Action:</span>
                    <span className="text-slate-700">{rec.action}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
